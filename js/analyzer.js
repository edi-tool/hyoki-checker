/**
 * テキストを辞書グループで解析し、表記ゆれを検出する
 * @param {string} text - 解析対象テキスト
 * @param {string[][]} dict - 辞書グループ配列
 * @returns {{ group: string[], recommended: string, counts: {word:string, count:number}[], others: string[] }[]}
 */
function analyze(text, dict) {
  const results = [];

  for (const group of dict) {
    if (!Array.isArray(group) || group.length < 2) continue;
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
    if (!Array.isArray(group) || group.length < 2) continue;
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

// ---- Kuromoji 形態素解析 ----

let _tokenizer = null;

/**
 * Kuromoji トークナイザーを初期化する（CDNから辞書を取得、約7MB）
 * @returns {Promise<void>}
 */
function initKuromoji() {
  return new Promise((resolve, reject) => {
    kuromoji
      .builder({ dicPath: 'https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict/' })
      .build((err, tokenizer) => {
        if (err) reject(err);
        else { _tokenizer = tokenizer; resolve(); }
      });
  });
}

/** @returns {boolean} Kuromoji が使用可能か */
function isKuromojiReady() { return _tokenizer !== null; }

/**
 * 形態素解析を用いて活用形を含む表記ゆれを検出する
 * 辞書グループ内の各単語を基本形で照合し、複数の書き方が混在していれば検出する
 * @param {string} text
 * @param {string[][]} dict
 * @returns {{
 *   group: string[],
 *   recommendedWord: string,
 *   foundBases: { base: string, word: string, count: number, surfaces: string[] }[]
 * }[]}
 */
function kuromojiAnalyze(text, dict) {
  if (!_tokenizer) return [];

  const tokens = _tokenizer.tokenize(text);

  const results = [];

  for (const group of dict) {
    if (!Array.isArray(group) || group.length < 2) continue;

    // グループ内の各単語を形態素解析し、basic_form → 単語 のマップを作成
    const baseToWord = new Map();
    for (const word of group) {
      const wt = _tokenizer.tokenize(word);
      const bf = wt[0]?.basic_form;
      if (bf && bf !== '*' && !baseToWord.has(bf)) {
        baseToWord.set(bf, word);
      }
    }

    // basic_form が2種類以上ないグループはスキップ（例：異なる語幹を持たない）
    if (baseToWord.size < 2) continue;

    // テキストのトークンをスキャンしてbasic_formで照合
    const foundBases = new Map(); // basic_form → { count, surfaces: Set }
    for (const token of tokens) {
      const bf = token.basic_form;
      if (!bf || bf === '*' || !baseToWord.has(bf)) continue;
      if (!foundBases.has(bf)) foundBases.set(bf, { count: 0, surfaces: new Set() });
      foundBases.get(bf).count++;
      foundBases.get(bf).surfaces.add(token.surface_form);
    }

    // 2種類以上のbasic_formが出現している場合のみゆれと判定
    if (foundBases.size < 2) continue;

    const sorted = [...foundBases.entries()].sort((a, b) => b[1].count - a[1].count);

    results.push({
      group,
      recommendedWord: baseToWord.get(sorted[0][0]),
      foundBases: sorted.map(([bf, data]) => ({
        base: bf,
        word: baseToWord.get(bf),
        count: data.count,
        surfaces: [...data.surfaces],
      })),
    });
  }

  return results;
}
