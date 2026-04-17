/**
 * テキストを辞書グループで解析し、表記ゆれを検出する
 * @param {string} text - 解析対象テキスト
 * @param {string[][]} dict - 辞書グループ配列
 * @returns {{ group: string[], recommended: string, counts: {word:string, count:number}[], others: string[] }[]}
 */
function analyze(text, dict) {
  const results = [];

  for (const group of dict) {
    const counts = group.map(word => {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matches = text.match(new RegExp(escaped, 'g'));
      return { word, count: matches ? matches.length : 0 };
    });

    const found = counts.filter(c => c.count > 0);
    if (found.length < 2) continue;

    found.sort((a, b) => b.count - a.count);
    const recommended = found[0].word;
    const others = found.slice(1).map(c => c.word);

    results.push({ group, recommended, counts: found, others });
  }

  return results;
}

/**
 * テキスト中の非推奨単語をHTMLハイライトに変換する
 * @param {string} text
 * @param {{ others: string[] }[]} analysisResults
 * @returns {string} - ハイライト済みHTML文字列
 */
function buildHighlightedHTML(text, analysisResults) {
  let escaped = escapeHTML(text);

  for (const { others } of analysisResults) {
    for (const word of others) {
      const escapedWord = escapeHTML(word).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      escaped = escaped.replace(
        new RegExp(escapedWord, 'g'),
        `<mark class="bg-yellow-200 rounded px-0.5">${escapeHTML(word)}</mark>`
      );
    }
  }

  return escaped.replace(/\n/g, '<br>');
}

/**
 * テキスト内のグループ全単語を推奨単語に一括置換する
 * @param {string} text
 * @param {string[]} group
 * @param {string} recommended
 * @returns {string}
 */
function replaceGroup(text, group, recommended) {
  let result = text;
  for (const word of group) {
    if (word === recommended) continue;
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    result = result.replace(new RegExp(escaped, 'g'), recommended);
  }
  return result;
}

/** @param {string} str */
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---- Fuzzy マッチング ----

/**
 * Levenshtein 編集距離（1次元DP、短い文字列向け最適化済み）
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function levenshtein(a, b) {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = temp;
    }
  }
  return dp[b.length];
}

// 句読点・空白のみの文字列を判定
const _PUNCT_RE = /^[\s\n\r、。，．！？「」【】（）〔〕『』〈〉・…‥]+$/;

/**
 * テキストをスキャンして辞書単語に近い（ただし完全一致しない）文字列を検出する
 * @param {string} text - 解析対象テキスト
 * @param {string[][]} dict - 辞書グループ配列
 * @param {number} maxDistance - 許容編集距離（1 or 2）
 * @returns {{ dictWord: string, group: string[], candidates: string[] }[]}
 */
function fuzzyAnalyze(text, dict, maxDistance = 1) {
  // 辞書内の全単語セット（完全一致は除外するため）
  const exactSet = new Set(dict.flat());

  // candidate → 最初にマッチした辞書単語
  const candidateMap = new Map();

  for (const group of dict) {
    for (const word of group) {
      const wlen = word.length;
      const minL = Math.max(1, wlen - maxDistance);
      const maxL = wlen + maxDistance;

      for (let i = 0; i < text.length; i++) {
        for (let l = minL; l <= maxL; l++) {
          if (i + l > text.length) continue;
          const candidate = text.slice(i, i + l);
          if (candidate === word) continue;
          if (exactSet.has(candidate)) continue;
          if (_PUNCT_RE.test(candidate)) continue;
          if (candidateMap.has(candidate)) continue;

          // 先頭または末尾が一致しない場合は計算スキップ（高速化）
          if (wlen > 2 && candidate[0] !== word[0] && candidate[candidate.length - 1] !== word[word.length - 1]) continue;

          const d = levenshtein(candidate, word);
          if (d > 0 && d <= maxDistance) {
            candidateMap.set(candidate, { dictWord: word, group });
          }
        }
      }
    }
  }

  // dictWord ごとにグルーピング
  const resultMap = new Map();
  for (const [candidate, { dictWord, group }] of candidateMap) {
    if (!resultMap.has(dictWord)) {
      resultMap.set(dictWord, { dictWord, group, candidates: [] });
    }
    resultMap.get(dictWord).candidates.push(candidate);
  }

  return [...resultMap.values()];
}

// フェーズ2: Kuromoji フック（将来的に品詞フィルタリングを挿入する口）
// let _tokenizer = null;
// async function initKuromoji(dictPath) { ... }
// function filterByPos(tokens, targetPos) { ... }
