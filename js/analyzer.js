const RULE_TYPES = new Set([
  "preferred",
  "consistency",
  "contextual",
  "forbidden",
  "pattern",
  "spelling",
]);

/** 旧 string[] を構造化ルールへ読み替える互換アダプター。 */
function normalizeAnalysisRule(input, index = 0) {
  if (Array.isArray(input)) {
    return {
      id: `legacy.${index}`,
      type: "preferred",
      preferred: input[0] || null,
      variants: input,
      category: "legacy",
      severity: "warning",
      fixMode: "confirm",
      reason: "旧配列形式のルール",
      source: { pack: "legacy", title: "旧辞書" },
    };
  }
  if (!input || typeof input !== "object") return null;
  return {
    ...input,
    type: RULE_TYPES.has(input.type) ? input.type : "preferred",
    variants: Array.isArray(input.variants) ? input.variants : [],
    fixMode: ["auto", "confirm", "none"].includes(input.fixMode)
      ? input.fixMode
      : "none",
  };
}

function ruleVariants(input) {
  return normalizeAnalysisRule(input)?.variants || [];
}

/**
 * テキストを辞書グループで解析し、表記ゆれを検出する
 * @param {string} text - 解析対象テキスト
 * @param {string[][]} dict - 辞書グループ配列
 * @returns {{ group: string[], recommended: string, counts: {word:string, count:number}[], others: string[] }[]}
 */
function analyze(text, dict) {
  return analyzeText(text, dict);
}

/**
 * analyze / analyzeAsync 共通の本体。行末で切れた語をつないだ解析用テキストで照合し、
 * 検出位置は元テキストの位置へ戻して返す。
 * @param {string} text
 * @param {object[]} dict
 * @param {Set<number>|null} [boundarySet] 解析用テキスト上の形態素境界
 */
function analyzeText(text, dict, boundarySet = null) {
  const view = buildAnalysisView(text);
  const results = [];
  for (const group of dict) {
    const r = analyzeGroup(view.text, group, boundarySet);
    if (r) results.push(remapResult(r, view));
  }
  return results;
}

// ---- 行またぎの連結 ----

// 和文の途中に入った改行（PDF の行末・固定幅で折り返したテキスト）。前後がどちらも
// 漢字・かな・長音のときだけ「語の途中かもしれない改行」とみなす。句読点やかっこで
// 終わる行、空行（段落の区切り）、欧文の行は対象外。
const _LINE_JOIN =
  /(?<=[\p{sc=Han}\p{sc=Hiragana}\p{sc=Katakana}ー々])\r?\n(?=[\p{sc=Han}\p{sc=Hiragana}\p{sc=Katakana}ー々])/gu;

/**
 * 行末で切れた語（例「気づ⏎いた」）も照合できるよう、和文中の改行を取り除いた
 * 解析用テキストを作る。cuts は「解析用テキストのどの位置で何文字取り除いたか」。
 * @param {string} text
 * @returns {{text: string, cutAt: number[], cutTotal: number[]}}
 */
function buildAnalysisView(text) {
  const cutAt = []; // 解析用テキスト上の位置（この位置の直前で改行を取り除いた）
  const cutTotal = []; // その時点までに取り除いた文字数の累計
  if (!text.includes("\n")) return { text, cutAt, cutTotal };
  let flat = "";
  let last = 0;
  let removed = 0;
  _LINE_JOIN.lastIndex = 0;
  let m;
  while ((m = _LINE_JOIN.exec(text)) !== null) {
    flat += text.slice(last, m.index);
    removed += m[0].length;
    cutAt.push(flat.length);
    cutTotal.push(removed);
    last = m.index + m[0].length;
  }
  flat += text.slice(last);
  return { text: flat, cutAt, cutTotal };
}

/** 解析用テキスト上の位置 index より前（index を含む）で取り除いた文字数。 */
function _removedUpTo(view, index) {
  let lo = 0;
  let hi = view.cutAt.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (view.cutAt[mid] <= index) lo = mid + 1;
    else hi = mid;
  }
  return lo === 0 ? 0 : view.cutTotal[lo - 1];
}

/** 検出位置を元テキストの位置へ戻す（語の途中の改行は範囲に含める）。 */
function remapResult(result, view) {
  if (view.cutAt.length === 0) return result;
  for (const occurrence of result.occurrences) {
    const lastChar = occurrence.end - 1;
    occurrence.start += _removedUpTo(view, occurrence.start);
    occurrence.end = lastChar + _removedUpTo(view, lastChar) + 1;
  }
  return result;
}

// ---- 活用語尾 ----

// inflect を指定したルールは、辞書形（variants）から語幹を取り、語幹 + 下の語尾で照合する。
// これにより「気づく」のルールで「気づいた・気づき・気づかない」も検出できる。
const INFLECTION_ENDINGS = {
  "godan-ku": ["か", "き", "く", "け", "こ", "い"],
  "godan-gu": ["が", "ぎ", "ぐ", "げ", "ご", "い"],
  "godan-su": ["さ", "し", "す", "せ", "そ"],
  "godan-tsu": ["た", "ち", "つ", "て", "と", "っ"],
  "godan-bu": ["ば", "び", "ぶ", "べ", "ぼ", "ん"],
  "godan-mu": ["ま", "み", "む", "め", "も", "ん"],
  "godan-ru": ["ら", "り", "る", "れ", "ろ", "っ"],
  "godan-u": ["わ", "い", "う", "え", "お", "っ"],
  // 一段: 語幹の直後に来る主な形だけ（「出来事」のような別語を拾わないため）
  ichidan: [
    "る",
    "れ",
    "ろ",
    "よ",
    "た",
    "て",
    "な",
    "ま",
    "ず",
    "ぬ",
    "ら",
    "さ",
  ],
  // 一段のうち、語幹だけで別語と紛れないもの（「現われ」「ふまえ」など）。後続を問わない
  "ichidan-any": [""],
  "i-adj": ["い", "く", "かっ", "けれ", "かろ"],
};

// 各活用型の辞書形の語尾（ルール検証で variants の末尾と突き合わせる）
const INFLECTION_DICT_ENDING = {
  "godan-ku": "く",
  "godan-gu": "ぐ",
  "godan-su": "す",
  "godan-tsu": "つ",
  "godan-bu": "ぶ",
  "godan-mu": "む",
  "godan-ru": "る",
  "godan-u": "う",
  ichidan: "る",
  "ichidan-any": "る",
  "i-adj": "い",
};

const _HAN_CHAR = /^[\p{sc=Han}々]$/u;

function _escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function _isLatinLetter(ch) {
  return /^[A-Za-z\uFF21-\uFF3A\uFF41-\uFF5A]$/.test(ch || "");
}

/** 置換文字列中の $1〜$99・$&・$$ を、一致結果から展開する。 */
function _expandReplacement(template, match) {
  return template.replace(/\$(\$|&|\d{1,2})/g, (_, key) => {
    if (key === "$") return "$";
    if (key === "&") return match[0];
    return match[Number(key)] ?? "";
  });
}

/**
 * 1グループ分の表記ゆれを解析する（analyze / analyzeAsync で共有）
 *
 * - 高精度：長い語を優先する交替パターンで1パス走査し一致文字を消費するため、
 *   部分文字列の二重計上を防ぐ（例「サーバー」が「サーバ」に加算されない）。
 * - 方針準拠：出現数にかかわらず辞書の先頭（＝基準表記）を統一先にする。
 *
 * @param {string} text - 解析対象テキスト
 * @param {string[]} group - 辞書の1グループ
 * @param {Set<number>|null} [boundarySet] - 形態素境界の文字オフセット集合。
 *   渡された場合、語の前後が境界に整合する一致のみ数える（例「本州」内の「本」を除外）。
 * @returns {null | { group: string[], recommended: string, counts: {word:string, count:number}[], others: string[], occurrences: {word:string,start:number,end:number}[], isInconsistent:boolean }}
 */
function analyzeGroup(text, group, boundarySet = null) {
  const rule = normalizeAnalysisRule(group);
  if (!rule) return null;

  if (rule.type === "pattern" && rule.pattern) {
    let regex;
    try {
      regex = new RegExp(rule.pattern, "gu");
    } catch {
      return null;
    }
    const occurrences = [];
    const countMap = new Map();
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (!match[0]) {
        regex.lastIndex++;
        continue;
      }
      // prh の regexpMustEmpty 相当：指定グループが空のときだけ指摘する
      if (rule.mustEmpty && match[rule.mustEmpty]) continue;
      // 一致した文字列だけで正規表現をかけ直すと、前後を見る条件（後読み・先読み）が
      // 成り立たなくなるため、一致結果から置換文字列を組み立てる
      const replacement = rule.replacement
        ? _expandReplacement(rule.replacement, match)
        : rule.preferred;
      occurrences.push({
        word: match[0],
        start: match.index,
        end: match.index + match[0].length,
        replacement,
      });
      countMap.set(match[0], (countMap.get(match[0]) || 0) + 1);
    }
    if (occurrences.length === 0) return null;
    const counts = [...countMap].map(([word, count]) => ({ word, count }));
    counts.sort((a, b) => b.count - a.count);
    return buildRuleResult(
      rule,
      counts,
      occurrences,
      counts.map((item) => item.word),
    );
  }

  // 空文字・空白のみの単語を除外（正規表現の暴走を防止）
  const validGroup = rule.variants.filter(
    (w) => typeof w === "string" && w.trim().length > 0,
  );
  if (validGroup.length < 2) return null;

  // 活用するルールは語幹 + 活用語尾、しないルールは語そのもので照合する
  const inflect = INFLECTION_ENDINGS[rule.inflect] ? rule.inflect : null;
  const alternatives = validGroup.map((word) => {
    if (!inflect || word.length < 2) {
      return {
        word,
        stem: null,
        length: word.length,
        source: _escapeRegExp(word),
      };
    }
    const stem = word.slice(0, -1);
    const endings = [...INFLECTION_ENDINGS[inflect]]
      .sort((a, b) => b.length - a.length)
      .map(_escapeRegExp)
      .join("|");
    return {
      word,
      stem,
      length: stem.length,
      source: _escapeRegExp(stem) + (endings ? `(?:${endings})` : ""),
      singleKanjiVerbStem: inflect.startsWith("godan-") && _HAN_CHAR.test(stem),
    };
  });
  // 長い語（語幹）を優先する交替パターンで1パス走査してカウント
  alternatives.sort((a, b) => b.length - a.length);
  // 例外語（別の語として読み飛ばすもの。例「プレゼン」のルールに対する「プレゼント」）は
  // 先頭に置き、一致しても数えずに文字だけ消費する
  const exceptions = (rule.exceptions || [])
    .filter((w) => typeof w === "string" && w.trim().length > 0)
    .sort((a, b) => b.length - a.length)
    .map(_escapeRegExp);
  const scanRegex = new RegExp(
    [
      ...(exceptions.length ? [`(?:${exceptions.join("|")})`] : []),
      ...alternatives.map((item) => `(${item.source})`),
    ].join("|"),
    "g",
  );
  const preferredStem =
    inflect && rule.preferred && validGroup.includes(rule.preferred)
      ? rule.preferred.slice(0, -1)
      : null;

  const countMap = new Map(validGroup.map((w) => [w, 0]));
  const formsMap = new Map();
  const occurrences = [];
  let m;
  while ((m = scanRegex.exec(text)) !== null) {
    if (!m[0]) {
      scanRegex.lastIndex++;
      continue;
    }
    const alternative = alternatives.find((_, i) => m[i + 1] !== undefined);
    if (!alternative) continue; // 例外語
    const start = m.index;
    const end = start + m[0].length;
    // 英字で始まる・終わる語は、英単語の途中に一致したものを除外（例「g」と Google）
    if (
      (_isLatinLetter(m[0][0]) && _isLatinLetter(text[start - 1])) ||
      (_isLatinLetter(m[0][m[0].length - 1]) && _isLatinLetter(text[end]))
    )
      continue;
    // 語幹が漢字 1 字の五段動詞（落す・分る・持つ など）は、直前も漢字なら
    // 熟語＋語尾（欠落し・自分ら・気持ち）とみなして除外する
    if (
      alternative.singleKanjiVerbStem &&
      _HAN_CHAR.test(text[start - 1] || "")
    )
      continue;
    // 形態素境界が与えられた場合、語境界に整合しない部分一致を除外。
    // 活用形は語尾の途中で終わることがあるため、開始位置だけを確かめる
    if (
      boundarySet &&
      !(
        boundarySet.has(start) &&
        (alternative.stem !== null || boundarySet.has(end))
      )
    )
      continue;
    const word = alternative.word;
    countMap.set(word, countMap.get(word) + 1);
    const occurrence = { word, start, end };
    if (alternative.stem !== null) {
      occurrence.surface = m[0];
      if (!formsMap.has(word)) formsMap.set(word, new Set());
      formsMap.get(word).add(m[0]);
      // 語幹だけを基準表記のものへ差し替える（例「気づいた」→「気付いた」）
      if (preferredStem !== null && word !== rule.preferred) {
        occurrence.replacement =
          preferredStem + m[0].slice(alternative.stem.length);
      }
    }
    occurrences.push(occurrence);
  }

  // 辞書順インデックス（同数時の決定的なタイブレークに使用）
  const orderIndex = new Map(validGroup.map((w, i) => [w, i]));
  const found = validGroup
    .map((word) => ({
      word,
      count: countMap.get(word),
      // 活用するルールでは、実際に出てきた形を添える（辞書形だけでは原文と対応しないため）
      ...(formsMap.has(word) ? { forms: [...formsMap.get(word)] } : {}),
    }))
    .filter((c) => c.count > 0);
  if (found.length === 0) return null;

  // 辞書の先頭を編集方針上の基準表記とする。最多表記は「多数派」であって
  // 「正しい表記」とは限らないため、推奨判定には使わない。
  found.sort(
    (a, b) =>
      b.count - a.count || orderIndex.get(a.word) - orderIndex.get(b.word),
  );
  const preferred = rule.preferred || null;
  let others;
  if (["consistency", "contextual"].includes(rule.type)) {
    if (found.length < 2) return null;
    others = found.map((item) => item.word);
  } else if (rule.type === "forbidden") {
    others = found.map((item) => item.word);
  } else {
    others = found
      .filter((item) => item.word !== preferred)
      .map((item) => item.word);
    if (others.length === 0) return null;
  }

  return buildRuleResult(rule, found, occurrences, others);
}

function buildRuleResult(rule, counts, occurrences, others) {
  return {
    ruleId: rule.id,
    group: rule.variants,
    type: rule.type,
    preferred: rule.preferred || null,
    recommended: rule.preferred || null,
    observedMajority: counts[0]?.word || null,
    counts,
    others,
    occurrences,
    isInconsistent: counts.length >= 2,
    category: rule.category,
    severity: rule.severity,
    fixMode: ["consistency", "contextual"].includes(rule.type)
      ? "none"
      : rule.fixMode,
    source: rule.source,
    reason: rule.reason || "",
  };
}

/**
 * テキスト中の非推奨単語をHTMLハイライトに変換する
 * 【修正】HTMLタグ自身の置換による表示崩れを防ぐため、1パスで処理
 * @param {string} text
 * @param {{ others: string[] }[]} analysisResults
 * @returns {string} - ハイライト済みHTML文字列
 */
function buildHighlightedHTML(text, analysisResults) {
  const ranges = [];
  for (const result of analysisResults || []) {
    const nonPreferred = new Set(result.others || []);
    for (const occurrence of result.occurrences || []) {
      if (nonPreferred.has(occurrence.word)) ranges.push(occurrence);
    }
  }

  if (ranges.length === 0) {
    return escapeHTML(text).replace(/\n/g, "<br>");
  }
  ranges.sort(
    (a, b) => a.start - b.start || b.end - b.start - (a.end - a.start),
  );
  let result = "";
  let lastIndex = 0;
  for (const range of ranges) {
    if (range.start < lastIndex) continue;
    result += escapeHTML(text.substring(lastIndex, range.start));
    result += `<mark class="bg-yellow-200 rounded px-0.5">${escapeHTML(text.substring(range.start, range.end))}</mark>`;
    lastIndex = range.end;
  }
  result += escapeHTML(text.substring(lastIndex));

  return result.replace(/\n/g, "<br>");
}

/**
 * 解析時に数えた非推奨表記だけを、記録済み位置に基づいて置換する。
 * @param {string} text
 * @param {Array<object>} analysisResults
 * @returns {{text:string, log:{group:string[],recommended:string,count:number}[]}}
 */
function applyRecommendedReplacements(text, analysisResults) {
  const candidates = [];
  const countByResult = new Map();
  (analysisResults || []).forEach((result, resultIndex) => {
    if (result.fixMode !== "auto" || !result.recommended) return;
    const nonPreferred = new Set(result.others || []);
    for (const occurrence of result.occurrences || []) {
      if (!nonPreferred.has(occurrence.word)) continue;
      candidates.push({
        ...occurrence,
        recommended: occurrence.replacement || result.recommended,
        resultIndex,
      });
    }
  });

  candidates.sort(
    (a, b) => a.start - b.start || b.end - b.start - (a.end - a.start),
  );
  const accepted = [];
  let lastEnd = -1;
  for (const candidate of candidates) {
    if (candidate.start < lastEnd) continue;
    accepted.push(candidate);
    lastEnd = candidate.end;
    countByResult.set(
      candidate.resultIndex,
      (countByResult.get(candidate.resultIndex) || 0) + 1,
    );
  }

  let corrected = text;
  for (const candidate of accepted.reverse()) {
    corrected =
      corrected.slice(0, candidate.start) +
      candidate.recommended +
      corrected.slice(candidate.end);
  }

  const log = [...countByResult.entries()].map(([resultIndex, count]) => ({
    group: analysisResults[resultIndex].group,
    recommended: analysisResults[resultIndex].recommended,
    count,
  }));
  return { text: corrected, log };
}

/**
 * テキスト内のグループ全単語を推奨単語に一括置換する
 * @param {string} text
 * @param {string[]} group
 * @param {string} recommended
 * @returns {string}
 */
function replaceGroup(text, group, recommended) {
  // 既存の推奨表記を一時退避し、短い非推奨語が推奨表記の部分文字列を
  // 二重置換するのを防ぐ（例:「サーバ」が既存「サーバー」内を壊さない）。
  const PLACEHOLDER = "\uE000REC\uE001";
  let result = text.split(recommended).join(PLACEHOLDER);
  // 長い語から置換し、非推奨語同士の包含関係による誤置換も防ぐ
  const targets = group
    .filter((word) => word !== recommended && word.trim())
    .sort((a, b) => b.length - a.length);
  for (const word of targets) {
    result = result.split(word).join(recommended);
  }
  return result.split(PLACEHOLDER).join(recommended);
}

/** @param {string} str */
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
      dp[j] =
        a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
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
  if (
    (c >= 0x4e00 && c <= 0x9faf) ||
    (c >= 0x3400 && c <= 0x4dbf) ||
    ch === "々"
  )
    return "kanji";
  if (c >= 0x3040 && c <= 0x309f) return "hira";
  if ((c >= 0x30a0 && c <= 0x30ff) || c === 0xff70) return "kata"; // 長音符ーを含む
  if (
    (c >= 0x41 && c <= 0x5a) ||
    (c >= 0x61 && c <= 0x7a) ||
    (c >= 0x30 && c <= 0x39) ||
    (c >= 0xff21 && c <= 0xff3a) ||
    (c >= 0xff41 && c <= 0xff5a) ||
    (c >= 0xff10 && c <= 0xff19)
  )
    return "latin";
  return "sep";
}

// 単独で語境界となりやすい1字ひらがな助詞（送り仮名と区別するため1字に限定）
const _PARTICLE_SET = new Set([
  "を",
  "は",
  "が",
  "に",
  "へ",
  "と",
  "も",
  "の",
  "や",
  "で",
  "か",
  "ね",
  "よ",
  "さ",
]);

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
  let cur = "",
    curClass = null;
  const flush = () => {
    if (cur) {
      segs.push({ text: cur, sep: false });
      cur = "";
      curClass = null;
    }
  };
  for (const ch of text) {
    const cls = _charClass(ch);
    if (cls === "sep") {
      flush();
      segs.push({ sep: true });
      continue;
    }
    if (cls === curClass) cur += ch;
    else {
      flush();
      cur = ch;
      curClass = cls;
    }
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
  const exactSet = new Set(
    dict
      .flatMap((rule) => ruleVariants(rule))
      .filter((w) => typeof w === "string" && w.trim().length > 0),
  );

  const dictData = [];
  let minLen = Infinity,
    maxLen = 0;
  for (const group of dict) {
    const words = ruleVariants(group);
    if (words.length === 0) continue;
    for (const word of words) {
      if (typeof word !== "string" || word.length < 2) continue;
      dictData.push({
        word,
        group: words,
        chars: new Set(word),
        len: word.length,
      });
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
    let combined = "";
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
          candidateMap.set(combined, {
            dictWord: item.word,
            group: item.group,
          });
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
async function analyzeAsync(text, dict, chunkSize = 50, boundaryAware = false) {
  // analyzeText() と同じ解析用テキスト（行またぎを連結したもの）を使う
  const view = buildAnalysisView(text);
  const boundarySet = boundaryAware ? buildBoundarySet(view.text) : null;
  const results = [];
  for (let i = 0; i < dict.length; i += chunkSize) {
    const chunk = dict.slice(i, i + chunkSize);
    for (const group of chunk) {
      // analyze() と同一ロジックを共有し、結果のブレを防ぐ
      const r = analyzeGroup(view.text, group, boundarySet);
      if (r) results.push(remapResult(r, view));
    }
    await new Promise((r) => setTimeout(r, 0));
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
    const start =
      typeof t.word_position === "number" ? t.word_position - 1 : null;
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
  const path =
    dicPath ||
    (typeof self !== "undefined" && self.KUROMOJI_DIC_PATH) ||
    "./dict/";
  return new Promise((resolve, reject) => {
    kuromoji.builder({ dicPath: path }).build((err, tokenizer) => {
      if (err) reject(err);
      else {
        _tokenizer = tokenizer;
        resolve();
      }
    });
  });
}

/** @returns {boolean} Kuromoji が使用可能か */
function isKuromojiReady() {
  return _tokenizer !== null;
}

/**
 * 形態素解析を用いて活用形を含む表記ゆれを検出する
 * @param {string} text
 * @param {string[][]} dict
 * @returns {{ group: string[], recommendedWord: string, foundBases: { base: string, word: string, count: number, surfaces: string[] }[] }[]}
 */
// 辞書の語 → 基本形（同じ語を解析のたびに形態素解析し直さないためのキャッシュ）
const _baseFormCache = new Map();

/** 1 形態素の語なら基本形を、複数形態素に分かれる語なら null を返す。 */
function _singleTokenBaseForm(word) {
  if (!_baseFormCache.has(word)) {
    const wt = _tokenizer.tokenize(word);
    const bf = wt.length === 1 ? wt[0].basic_form : null;
    _baseFormCache.set(word, bf && bf !== "*" ? bf : null);
  }
  return _baseFormCache.get(word);
}

function kuromojiAnalyze(text, dict) {
  if (!_tokenizer) return [];

  // 1. ルールごとに「基本形 → 辞書の語」を作り、基本形から引ける索引にまとめる
  const entries = [];
  const baseIndex = new Map();
  for (const group of dict) {
    const rule = normalizeAnalysisRule(group);
    // 正規表現ルールの variants は表示用の代表例で、語そのものではない
    if (!rule || rule.type === "pattern") continue;
    const validGroup = rule.variants.filter(
      (w) => typeof w === "string" && w.trim().length > 0,
    );
    if (validGroup.length < 2) continue;
    const baseToWord = new Map();
    for (const word of validGroup) {
      // 1 形態素の語だけを対象にする。「身に付ける」のような複数形態素の語を先頭の
      // 「身」で代表させると、無関係な「身」をすべて数えてしまう
      const bf = _singleTokenBaseForm(word);
      if (bf && !baseToWord.has(bf)) baseToWord.set(bf, word);
    }
    if (baseToWord.size < 2) continue;
    const index =
      entries.push({ rule, validGroup, baseToWord, found: new Map() }) - 1;
    for (const bf of baseToWord.keys()) {
      if (!baseIndex.has(bf)) baseIndex.set(bf, []);
      baseIndex.get(bf).push(index);
    }
  }
  if (entries.length === 0) return [];

  // 2. 本文を 1 回だけ走査し、該当する基本形の出現位置を集める
  for (const token of _tokenizer.tokenize(text)) {
    const targets = baseIndex.get(token.basic_form);
    if (!targets || typeof token.word_position !== "number") continue;
    const start = token.word_position - 1; // word_position は 1 始まり
    const end = start + token.surface_form.length;
    for (const index of targets) {
      const found = entries[index].found;
      if (!found.has(token.basic_form))
        found.set(token.basic_form, {
          count: 0,
          surfaces: new Set(),
          occurrences: [],
        });
      const data = found.get(token.basic_form);
      data.count++;
      data.surfaces.add(token.surface_form);
      data.occurrences.push({ start, end });
    }
  }

  // 3. 2 種類以上の表記が混在しているルールだけを結果にする
  const results = [];
  for (const { rule, validGroup, baseToWord, found } of entries) {
    if (found.size < 2) continue;
    const sorted = [...found.entries()].sort((a, b) => b[1].count - a[1].count);
    results.push({
      ruleId: rule.id,
      group: validGroup,
      // 基準表記（辞書の先頭）があればそれを、なければ最多の表記を示す
      preferred: rule.preferred || null,
      recommendedWord: rule.preferred || baseToWord.get(sorted[0][0]),
      reason: rule.reason || "",
      foundBases: sorted.map(([bf, data]) => ({
        base: bf,
        word: baseToWord.get(bf),
        count: data.count,
        surfaces: [...data.surfaces],
        occurrences: data.occurrences,
      })),
    });
  }
  return results;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    analyze,
    analyzeText,
    analyzeGroup,
    buildAnalysisView,
    INFLECTION_ENDINGS,
    INFLECTION_DICT_ENDING,
    normalizeAnalysisRule,
    ruleVariants,
    buildHighlightedHTML,
    applyRecommendedReplacements,
    replaceGroup,
    fuzzyAnalyze,
    levenshtein,
  };
}
