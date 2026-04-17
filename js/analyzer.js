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

// フェーズ2: Kuromoji フック（将来的に品詞フィルタリングを挿入する口）
// let _tokenizer = null;
// async function initKuromoji(dictPath) { ... }
// function filterByPos(tokens, targetPos) { ... }
