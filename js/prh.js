/**
 * prh (proofread-helper) YAML 互換レイヤー。
 *
 * textlint-rule-prh / JTF日本語標準スタイルガイド辞書などの公開ルール資産を
 * 読み込み、hyoki-checker の構造化ルールへ変換する。逆方向（書き出し）も行う。
 *
 * 対応キー: version / imports（記録のみ）/ rules[].expected /
 * rules[].pattern | patterns / rules[].options.wordBoundary /
 * rules[].regexpMustEmpty / rules[].specs（検証用に保持）
 *
 * 外部依存を持たないため、YAML は prh 辞書で使われる範囲の部分集合のみを解釈する
 * （マップ・シーケンス・引用符付き/なしスカラー・コメント・アンカー無し）。
 */

/** prh YAML を素朴なJSオブジェクトへ変換する（部分集合パーサ）。 */
function parseYAML(text) {
  const lines = String(text)
    .replace(/^﻿/, "")
    .replace(/\t/g, "  ")
    .split(/\r?\n/);
  const rows = [];
  for (const raw of lines) {
    const stripped = stripComment(raw);
    if (!stripped.trim()) continue;
    if (/^\s*---\s*$/.test(stripped)) continue;
    rows.push({
      indent: stripped.match(/^ */)[0].length,
      text: stripped.trim(),
    });
  }
  const [value] = parseBlock(rows, 0, rows.length ? rows[0].indent : 0);
  return value ?? {};
}

/** 引用符の外側にある `#` 以降をコメントとして除去する。 */
function stripComment(line) {
  let quote = null;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (quote) {
      if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === "#" && (i === 0 || /\s/.test(line[i - 1]))) {
      return line.slice(0, i);
    }
  }
  return line;
}

/** rows[start] 以降のうち indent 以上のブロックを解析し [値, 次の位置] を返す。 */
function parseBlock(rows, start, indent) {
  if (start >= rows.length) return [null, start];
  if (rows[start].text.startsWith("- ") || rows[start].text === "-") {
    return parseSequence(rows, start, indent);
  }
  return parseMapping(rows, start, indent);
}

function parseSequence(rows, start, indent) {
  const list = [];
  let i = start;
  while (i < rows.length && rows[i].indent >= indent) {
    const row = rows[i];
    if (row.indent > indent) break;
    if (!row.text.startsWith("-")) break;
    const inline = row.text === "-" ? "" : row.text.slice(1).trim();
    if (!inline) {
      const [value, next] = parseBlock(
        rows,
        i + 1,
        childIndent(rows, i + 1, indent),
      );
      list.push(value);
      i = next;
      continue;
    }
    if (isMappingEntry(inline)) {
      // "- key: value" は、後続の同一インデント配下と合わせて1つのマップになる
      const virtual = [{ indent: indent + 2, text: inline }];
      let j = i + 1;
      while (j < rows.length && rows[j].indent > indent) {
        virtual.push(rows[j]);
        j++;
      }
      const [value] = parseMapping(virtual, 0, indent + 2);
      list.push(value);
      i = j;
      continue;
    }
    list.push(parseScalar(inline));
    i++;
  }
  return [list, i];
}

function parseMapping(rows, start, indent) {
  const map = {};
  let i = start;
  while (i < rows.length && rows[i].indent >= indent) {
    const row = rows[i];
    if (row.indent > indent) break;
    if (row.text.startsWith("- ")) break;
    const entry = splitMappingEntry(row.text);
    if (!entry) {
      i++;
      continue;
    }
    const [key, rest] = entry;
    if (rest) {
      map[key] = parseScalar(rest);
      i++;
      continue;
    }
    const nested = childIndent(rows, i + 1, indent);
    if (i + 1 < rows.length && rows[i + 1].indent > indent) {
      const [value, next] = parseBlock(rows, i + 1, nested);
      map[key] = value;
      i = next;
    } else {
      map[key] = null;
      i++;
    }
  }
  return [map, i];
}

function childIndent(rows, index, fallback) {
  return index < rows.length ? rows[index].indent : fallback + 2;
}

function isMappingEntry(text) {
  return Boolean(splitMappingEntry(text));
}

/** "key: value" を分割する。引用符・正規表現リテラル内のコロンは無視する。 */
function splitMappingEntry(text) {
  let quote = null;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quote) {
      if (char === "\\") i++;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === ":" && (i === text.length - 1 || /\s/.test(text[i + 1]))) {
      const key = text.slice(0, i).trim();
      if (!key || /^[/[{]/.test(key)) return null;
      return [unquote(key), text.slice(i + 1).trim()];
    }
  }
  return null;
}

function parseScalar(value) {
  if (value === "" || value === "~" || value === "null") return null;
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+$/.test(value)) return Number(value);
  if (/^\[.*\]$/.test(value)) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((item) => parseScalar(item.trim()));
  }
  return unquote(value);
}

function unquote(value) {
  if (/^"(.*)"$/s.test(value)) {
    return value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  if (/^'(.*)'$/s.test(value)) return value.slice(1, -1).replace(/''/g, "'");
  return value;
}

/** `/pattern/flags` 形式の正規表現リテラルなら {source, flags} を返す。 */
function parseRegexLiteral(value) {
  if (typeof value !== "string") return null;
  const match = /^\/(.*)\/([gimsuy]*)$/s.exec(value.trim());
  if (!match || !match[1]) return null;
  return { source: match[1], flags: match[2] };
}

function toArray(value) {
  if (value === null || value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/** prh の `$1` 参照を含むか（＝置換にキャプチャを使うか）。 */
function hasCaptureRef(value) {
  return typeof value === "string" && /\$\d/.test(value);
}

/** `regexpMustEmpty: $1` からグループ番号を取り出す。 */
function mustEmptyIndex(value) {
  const match = /^\$(\d+)$/.exec(String(value ?? "").trim());
  return match ? Number(match[1]) : null;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const PRH_SOURCE_DEFAULTS = {
  title: "prh 形式辞書",
  url: "",
  license: "unknown",
  attribution: "prh dictionary author",
  modified: true,
};

/**
 * prh ドキュメント（parseYAML の結果）を hyoki-checker の構造化ルールへ変換する。
 * @returns {{rules: object[], imports: string[], skipped: {index:number, reason:string}[]}}
 */
function prhToRules(doc, options = {}) {
  const pack = options.pack || "prh";
  const idPrefix = options.idPrefix || pack;
  const source = {
    pack,
    ...PRH_SOURCE_DEFAULTS,
    ...(options.source || {}),
    retrievedAt:
      (options.source && options.source.retrievedAt) ||
      new Date().toISOString().slice(0, 10),
  };
  const rules = [];
  const skipped = [];
  const entries = toArray(doc && doc.rules);
  entries.forEach((entry, index) => {
    if (!entry || typeof entry !== "object") {
      skipped.push({ index, reason: "ルールオブジェクトではありません" });
      return;
    }
    const expected = typeof entry.expected === "string" ? entry.expected : "";
    if (!expected) {
      skipped.push({ index, reason: "expected がありません" });
      return;
    }
    const patterns = [
      ...toArray(entry.pattern),
      ...toArray(entry.patterns),
    ].filter((value) => typeof value === "string" && value.trim());
    const specs = toArray(entry.specs).filter(
      (spec) => spec && typeof spec === "object",
    );
    const wordBoundary = Boolean(entry.options && entry.options.wordBoundary);
    const mustEmpty = mustEmptyIndex(entry.regexpMustEmpty);
    const baseId = `${idPrefix}.${index + 1}`;

    const literals = patterns.map((value) => ({
      raw: value,
      regex: parseRegexLiteral(value),
    }));
    const needsPattern =
      mustEmpty !== null ||
      hasCaptureRef(expected) ||
      wordBoundary ||
      literals.some((item) => item.regex);

    if (!patterns.length) {
      // patterns 省略時は specs の from を候補として使う（prh の慣習）
      const fromWords = specs
        .map((spec) => spec.from)
        .filter((word) => typeof word === "string" && word);
      if (!fromWords.length) {
        skipped.push({
          index,
          reason:
            "expected のみのルール（prh によるパターン自動生成）は未対応です",
        });
        return;
      }
      patterns.push(...fromWords);
      literals.push(...fromWords.map((raw) => ({ raw, regex: null })));
    }

    if (!needsPattern) {
      const variants = [...new Set([expected, ...patterns])];
      if (variants.length < 2) {
        skipped.push({
          index,
          reason: "expected と同一の表記しかなく、指摘対象がありません",
        });
        return;
      }
      rules.push({
        id: baseId,
        type: "preferred",
        preferred: expected,
        variants,
        category: "prh",
        severity: "warning",
        fixMode: "confirm",
        reason: entry.reason || `prh 辞書の推奨表記「${expected}」`,
        source,
      });
      return;
    }

    literals.forEach((item, subIndex) => {
      const body = item.regex ? item.regex.source : escapeRegExp(item.raw);
      const pattern = wordBoundary ? `\\b(?:${body})\\b` : body;
      let compiled = null;
      try {
        compiled = new RegExp(pattern, "u");
      } catch {
        skipped.push({
          index,
          reason: `正規表現として解釈できません: ${item.raw}`,
        });
        return;
      }
      if (mustEmpty !== null && mustEmpty > countGroups(compiled)) {
        skipped.push({
          index,
          reason: `regexpMustEmpty が参照するグループがありません: $${mustEmpty}`,
        });
        return;
      }
      rules.push({
        id: literals.length > 1 ? `${baseId}.${subIndex + 1}` : baseId,
        type: "pattern",
        preferred: hasCaptureRef(expected) ? null : expected,
        variants: [item.raw],
        category: "prh",
        severity: "warning",
        fixMode: "confirm",
        reason: entry.reason || `prh 辞書の推奨表記「${expected}」`,
        source,
        pattern,
        replacement: expected,
        ...(mustEmpty !== null ? { mustEmpty } : {}),
      });
    });
  });
  return {
    rules,
    imports: toArray(doc && doc.imports).filter(
      (value) => typeof value === "string",
    ),
    skipped,
  };
}

/** 正規表現のキャプチャグループ数を数える。 */
function countGroups(regex) {
  return new RegExp(`${regex.source}|`).exec("").length - 1;
}

/** prh YAML テキストを直接ルール配列へ変換するショートカット。 */
function importPrhYAML(text, options = {}) {
  return prhToRules(parseYAML(text), options);
}

/** hyoki-checker のルール配列を prh YAML テキストへ書き出す。 */
function rulesToPrhYAML(rules, options = {}) {
  const header = options.header ?? "# hyoki-checker が書き出した prh 互換辞書";
  const lines = [];
  if (header) lines.push(header);
  lines.push("version: 1", "rules:");
  let count = 0;
  for (const rule of rules || []) {
    if (!rule || typeof rule !== "object") continue;
    if (rule.type === "pattern" && rule.pattern) {
      const expected = rule.replacement || rule.preferred;
      if (!expected) continue;
      lines.push(`  - expected: ${quoteYAML(expected)}`);
      lines.push(`    pattern: ${quoteYAML(`/${rule.pattern}/`)}`);
      if (rule.mustEmpty)
        lines.push(`    regexpMustEmpty: ${quoteYAML(`$${rule.mustEmpty}`)}`);
    } else {
      const expected = rule.preferred || (rule.variants || [])[0];
      const patterns = (rule.variants || []).filter(
        (word) => word !== expected,
      );
      if (!expected || !patterns.length) continue;
      lines.push(`  - expected: ${quoteYAML(expected)}`);
      lines.push("    patterns:");
      for (const word of patterns) lines.push(`      - ${quoteYAML(word)}`);
    }
    if (rule.reason) lines.push(`    # ${rule.reason.replace(/\s+/g, " ")}`);
    count++;
  }
  if (!count) lines.push("  []");
  return `${lines.join("\n")}\n`;
}

/** YAML スカラーとして安全になるよう必要な場合のみ引用符を付ける。 */
function quoteYAML(value) {
  const text = String(value);
  if (/^[^\s#&*!|>'"%@`[\]{},:-][^#:]*$/.test(text) && !/\s$/.test(text)) {
    return text;
  }
  return `"${text.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

const PRH = {
  parseYAML,
  parseRegexLiteral,
  prhToRules,
  importPrhYAML,
  rulesToPrhYAML,
};

if (typeof globalThis !== "undefined") globalThis.PRH = PRH;

if (typeof module !== "undefined" && module.exports) {
  module.exports = PRH;
}
