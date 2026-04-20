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
 * 高速化版ファジー解析
 * テキストをスキャンして辞書単語に近い（ただし完全一致しない）文字列を検出する
 * @param {string} text - 解析対象テキスト
 * @param {string[][]} dict - 辞書グループ配列
 * @param {number} maxDistance - 許容編集距離（1 or 2）
 * @returns {{ dictWord: string, group: string[], candidates: string[] }[]}
 */
function fuzzyAnalyze(text, dict, maxDistance = 1) {
  const exactSet = new Set(dict.flat());
  const candidateMap = new Map();
  
  // 1. 辞書の最適化：3文字未満の短い単語はノイズが多いため除外
  // また、高速化のために辞書語を文字セット(Set)化しておく
  const dictData = [];
  for (const group of dict) {
    for (const word of group) {
      if (word.length < 3) continue; // 短い単語はスキップ
      dictData.push({
        word,
        group,
        chars: new Set(word.split('')),
        len: word.length
      });
    }
  }

  const textLen = text.length;
  
  // 2. テキストのスキャン
  for (let i = 0; i < textLen; i++) {
    // 単語の長さは辞書にあるものの範囲（概ね3〜15文字程度）に限定
    for (let l = 3 - maxDistance; l <= 15; l++) { 
      if (i + l > textLen) break;
      
      const candidate = text.slice(i, i + l);
      
      // 完全一致するもの、記号のみ、既に検知済みはスキップ
      if (exactSet.has(candidate) || _PUNCT_RE.test(candidate)) continue;
      if (candidateMap.has(candidate)) continue;

      const candidateChars = new Set(candidate.split(''));
      
      for (const item of dictData) {
        // 長さの差が編集距離を超えていたら即座にスキップ
        if (Math.abs(item.len - l) > maxDistance) continue;

        // 【高速化の要】文字セットによる事前フィルタ
        // 共通する文字が少なすぎる場合は、Levenshtein距離を計算するまでもなく不一致
        let commonCount = 0;
        for (let char of candidateChars) {
          if (item.chars.has(char)) commonCount++;
        }
        if (commonCount < Math.min(l, item.len) - maxDistance) continue;

        // ここまで残った候補のみ精密な計算を行う
        const d = levenshtein(candidate, item.word);
        if (d > 0 && d <= maxDistance) {
          candidateMap.set(candidate, { dictWord: item.word, group: item.group });
          break; // 1つの箇所に対して1つ見つかれば十分
        }
      }
    }
  }

  // 結果の整形（dictWordごとにまとめる）
  const resultMap = new Map();
  for (const [candidate, { dictWord, group }] of candidateMap) {
    if (!resultMap.has(dictWord)) {
      resultMap.set(dictWord, { dictWord, group, candidates: [] });
    }
    resultMap.get(dictWord).candidates.push(candidate);
  }

  return [...resultMap.values()];
}

/**
 * analyze() の非同期版。chunkSize グループごとに setTimeout(0) でUIスレッドを解放する
 * @param {string} text
 * @param {string[][]} dict
 * @param {number} chunkSize
 * @returns {Promise<{ group: string[], recommended: string, counts: {word:string, count:number}[], others: string[] }[]>}
 */
async function analyzeAsync(text, dict, chunkSize = 50) {
  const results = [];
  for (let i = 0; i < dict.length; i += chunkSize) {
    const chunk = dict.slice(i, i + chunkSize);
    for (const group of chunk) {
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
    await new Promise(r => setTimeout(r, 0));
  }
  return results;
}

// ---- Kuromoji 形態素解析 ----

let _tokenizer = null;

/**
 * Kuromoji トークナイザーを初期化する（CDNから辞書を取得、約7MB）
 * @returns {Promise<void>}
 */
function initKuromoji(dicPath) {
  const path = dicPath || (typeof self !== 'undefined' && self.KUROMOJI_DIC_PATH) || './dict/';
  return new Promise((resolve, reject) => {
    kuromoji
      .builder({ dicPath: path })
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
 * @param {string} text
 * @param {string[][]} dict
 * @returns {{ group: string[], recommendedWord: string, foundBases: { base: string, word: string, count: number, surfaces: string[] }[] }[]}
 */
function kuromojiAnalyze(text, dict) {
  if (!_tokenizer) return [];

  const tokens = _tokenizer.tokenize(text);
  const results = [];

  for (const group of dict) {
    if (!Array.isArray(group) || group.length < 2) continue;

    const baseToWord = new Map();
    for (const word of group) {
      const wt = _tokenizer.tokenize(word);
      const bf = wt[0]?.basic_form;
      if (bf && bf !== '*' && !baseToWord.has(bf)) {
        baseToWord.set(bf, word);
      }
    }

    if (baseToWord.size < 2) continue;

    const foundBases = new Map();
    for (const token of tokens) {
      const bf = token.basic_form;
      if (!bf || bf === '*' || !baseToWord.has(bf)) continue;
      if (!foundBases.has(bf)) foundBases.set(bf, { count: 0, surfaces: new Set() });
      foundBases.get(bf).count++;
      foundBases.get(bf).surfaces.add(token.surface_form);
    }

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
