/**
 * テキストを辞書グループで解析し、表記ゆれを検出する
 * @param {string} text - 解析対象テキスト
 * @param {string[][]} dict - 辞書グループ配列
 * @returns {{ group: string[], recommended: string, counts: {word:string, count:number}[], others: string[] }[]}
 */
function analyze(text, dict) {
  const results = [];
  for (const group of dict) {
    const r = analyzeGroup(text, group);
    if (r) results.push(r);
  }
  return results;
}

/**
 * 1グループ分の表記ゆれを解析する（analyze / analyzeAsync で共有）
 *
 * - 高精度：長い語を優先する交替パターンで1パス走査し一致文字を消費するため、
 *   部分文字列の二重計上を防ぐ（例「サーバー」が「サーバ」に加算されない）。
 * - 安定：出現数が同数の場合は辞書の先頭（＝正規表記）を推奨形に固定するので、
 *   同じ入力に対して常に同じ結果を返す。
 *
 * @param {string} text - 解析対象テキスト
 * @param {string[]} group - 辞書の1グループ
 * @param {Set<number>|null} [boundarySet] - 形態素境界の文字オフセット集合。
 *   渡された場合、語の前後が境界に整合する一致のみ数える（例「本州」内の「本」を除外）。
 * @returns {null | { group: string[], recommended: string, counts: {word:string, count:number}[], others: string[] }}
 */
function analyzeGroup(text, group, boundarySet = null) {
  if (!Array.isArray(group)) return null;

  // 空文字・空白のみの単語を除外（正規表現の暴走を防止）
  const validGroup = group.filter(w => typeof w === 'string' && w.trim().length > 0);
  if (validGroup.length < 2) return null;

  // 長い語を優先する交替パターンで1パス走査してカウント
  const countMap = new Map(validGroup.map(w => [w, 0]));
  const sortedWords = [...validGroup].sort((a, b) => b.length - a.length);
  const escapedWords = sortedWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const scanRegex = new RegExp(`(${escapedWords.join('|')})`, 'g');
  let m;
  while ((m = scanRegex.exec(text)) !== null) {
    // 形態素境界が与えられた場合、語境界に整合しない部分一致を除外
    if (boundarySet && !(boundarySet.has(m.index) && boundarySet.has(m.index + m[0].length))) continue;
    countMap.set(m[0], countMap.get(m[0]) + 1);
  }

  // 辞書順インデックス（同数時の決定的なタイブレークに使用）
  const orderIndex = new Map(validGroup.map((w, i) => [w, i]));
  const found = validGroup
    .map(word => ({ word, count: countMap.get(word) }))
    .filter(c => c.count > 0);
  if (found.length < 2) return null;

  // 出現数の多い順。同数なら辞書の先頭（正規表記）を優先して安定化
  found.sort((a, b) => b.count - a.count || orderIndex.get(a.word) - orderIndex.get(b.word));
  const recommended = found[0].word;
  const others = found.slice(1).map(c => c.word);

  return { group: validGroup, recommended, counts: found, others };
}

/**
 * テキスト中の非推奨単語をHTMLハイライトに変換する
 * 【修正】HTMLタグ自身の置換による表示崩れを防ぐため、1パスで処理
 * @param {string} text
 * @param {{ others: string[] }[]} analysisResults
 * @returns {string} - ハイライト済みHTML文字列
 */
function buildHighlightedHTML(text, analysisResults) {
  const words = [];
  for (const { others } of analysisResults) {
    words.push(...others);
  }

  // ゆらぎ対象がない場合は、そのままエスケープして返す
  if (words.length === 0) {
    return escapeHTML(text).replace(/\n/g, '<br>');
  }

  // 短い単語の誤爆を防ぐため、文字数の長い順にソート
  words.sort((a, b) => b.length - a.length);

  // 正規表現を構築（重複を排除）
  const uniqueWords = [...new Set(words)];
  const escapedWords = uniqueWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedWords.join('|')})`, 'g');

  let result = '';
  let lastIndex = 0;
  let match;

  // テキストを先頭から走査し、マッチした部分だけをタグで囲む
  while ((match = regex.exec(text)) !== null) {
    result += escapeHTML(text.substring(lastIndex, match.index));
    result += `<mark class="bg-yellow-200 rounded px-0.5">${escapeHTML(match[0])}</mark>`;
    lastIndex = regex.lastIndex;
  }
  
  // 残りのテキストを追加
  result += escapeHTML(text.substring(lastIndex));

  return result.replace(/\n/g, '<br>');
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
    if (word === recommended || !word.trim()) continue;
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

// ---- Fuzzy マッチング (Beta) ----

/**
 * Levenshtein 編集距離
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

/**
 * 文字の種別を返す（セグメント分割用）。
 * 句読点・空白・記号は 'sep'（語境界）として扱う。
 * @param {string} ch - 1文字
 * @returns {'kanji'|'hira'|'kata'|'latin'|'sep'}
 */
function _charClass(ch) {
  const c = ch.codePointAt(0);
  if ((c >= 0x4e00 && c <= 0x9faf) || (c >= 0x3400 && c <= 0x4dbf) || ch === '々') return 'kanji';
  if (c >= 0x3040 && c <= 0x309f) return 'hira';
  if ((c >= 0x30a0 && c <= 0x30ff) || c === 0xff70) return 'kata'; // 長音符ーを含む
  if ((c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a) || (c >= 0x30 && c <= 0x39) ||
      (c >= 0xff21 && c <= 0xff3a) || (c >= 0xff41 && c <= 0xff5a) || (c >= 0xff10 && c <= 0xff19)) return 'latin';
  return 'sep';
}

// 単独で語境界となりやすい1字ひらがな助詞（送り仮名と区別するため1字に限定）
const _PARTICLE_SET = new Set(['を', 'は', 'が', 'に', 'へ', 'と', 'も', 'の', 'や', 'で', 'か', 'ね', 'よ', 'さ']);

/**
 * セグメントが単独1字の助詞かどうかを返す。
 * @param {string} seg
 * @returns {boolean}
 */
function _isParticle(seg) {
  return seg.length === 1 && _PARTICLE_SET.has(seg);
}

/**
 * テキストを文字種の連続（セグメント）に分割する。
 * 句読点・空白・記号は語境界マーカー(sep)とし、語をまたぐ連結を防ぐ。
 * @param {string} text
 * @returns {{ text?: string, sep: boolean }[]}
 */
function _segmentText(text) {
  const segs = [];
  let cur = '', curClass = null;
  const flush = () => { if (cur) { segs.push({ text: cur, sep: false }); cur = ''; curClass = null; } };
  for (const ch of text) {
    const cls = _charClass(ch);
    if (cls === 'sep') { flush(); segs.push({ sep: true }); continue; }
    if (cls === curClass) cur += ch;
    else { flush(); cur = ch; curClass = cls; }
  }
  flush();
  return segs;
}

/**
 * ファジー解析（語境界対応版）
 *
 * 文字種・句読点で区切ったセグメントの連結のみを候補とするため、
 * 語の途中を切り出した断片（例「授業づくり」→「業づく」）が生成されず、
 * 高精度に誤字・異体字だけを指摘できる。
 *
 * @param {string} text
 * @param {string[][]} dict
 * @param {number} maxDistance - 許容する編集距離
 * @returns {{ dictWord: string, group: string[], candidates: string[] }[]}
 */
function fuzzyAnalyze(text, dict, maxDistance = 1) {
  const exactSet = new Set(dict.flat().filter(w => typeof w === 'string' && w.trim().length > 0));

  const dictData = [];
  let minLen = Infinity, maxLen = 0;
  for (const group of dict) {
    if (!Array.isArray(group)) continue;
    for (const word of group) {
      if (typeof word !== 'string' || word.length < 2) continue;
      dictData.push({ word, group, chars: new Set(word), len: word.length });
      if (word.length < minLen) minLen = word.length;
      if (word.length > maxLen) maxLen = word.length;
    }
  }
  if (dictData.length === 0) return [];

  const segs = _segmentText(text);
  const MAX_MERGE = 6; // 連結する隣接セグメント数の上限（計算量抑制）

  const candidateMap = new Map();
  for (let i = 0; i < segs.length; i++) {
    if (segs[i].sep) continue;
    let combined = '';
    for (let j = i; j < segs.length && j < i + MAX_MERGE; j++) {
      if (segs[j].sep) break; // 句読点を越えて連結しない
      // 末尾の単独ひらがな助詞は語境界とみなし、連結を打ち切る
      // （例「指導を」を生成せず、助詞付着の誤検知を防ぐ。複数字の送り仮名「づく」は対象外）
      if (j > i && _isParticle(segs[j].text)) break;
      combined += segs[j].text;
      if (combined.length > maxLen) break;
      if (combined.length < minLen) continue;
      if (exactSet.has(combined) || candidateMap.has(combined)) continue;

      const candChars = new Set(combined);
      for (const item of dictData) {
        // 誤字は実務上ほぼ同字数の置換。字数違い（挿入/削除）は別語・助詞付着の
        // ノイズが多いため同字数のみ照合し、高精度に誤字だけを指摘する
        if (item.len !== combined.length) continue;

        let common = 0;
        for (const c of candChars) if (item.chars.has(c)) common++;
        if (common < combined.length - maxDistance) continue;

        const d = levenshtein(combined, item.word);
        if (d > 0 && d <= maxDistance) {
          candidateMap.set(combined, { dictWord: item.word, group: item.group });
          break;
        }
      }
    }
  }

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
async function analyzeAsync(text, dict, chunkSize = 50, boundarySet = null) {
  const results = [];
  for (let i = 0; i < dict.length; i += chunkSize) {
    const chunk = dict.slice(i, i + chunkSize);
    for (const group of chunk) {
      // analyze() と同一ロジックを共有し、結果のブレを防ぐ
      const r = analyzeGroup(text, group, boundarySet);
      if (r) results.push(r);
    }
    await new Promise(r => setTimeout(r, 0));
  }
  return results;
}

/**
 * 形態素境界の文字オフセット集合を構築する（Kuromoji初期化済みのときのみ）。
 * 各トークンの開始・終了位置を境界として登録し、語境界に整合しない
 * 部分一致（例「本州」内の「本」）を analyzeGroup 側で除外できるようにする。
 * @param {string} text
 * @returns {Set<number>|null} - トークナイザー未準備なら null
 */
function buildBoundarySet(text) {
  if (!_tokenizer) return null;
  const tokens = _tokenizer.tokenize(text);
  const boundarySet = new Set([0]);
  for (const t of tokens) {
    // word_position は1始まり。欠落時は surface 長で補う
    const start = (typeof t.word_position === 'number' ? t.word_position - 1 : null);
    if (start === null) continue;
    boundarySet.add(start);
    boundarySet.add(start + t.surface_form.length);
  }
  return boundarySet;
}

// ---- Kuromoji 形態素解析 (Beta) ----

let _tokenizer = null;

/**
 * Kuromoji トークナイザーを初期化する
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
    if (!Array.isArray(group)) continue;
    
    // 【追加】安全対策：空文字を除外
    const validGroup = group.filter(w => typeof w === 'string' && w.trim().length > 0);
    if (validGroup.length < 2) continue;

    const baseToWord = new Map();
    for (const word of validGroup) {
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
      group: validGroup,
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
