import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

// 検証には、ブラウザで動かすのと同じ解析エンジンを使う
const require = createRequire(import.meta.url);
const { analyzeText, INFLECTION_DICT_ENDING } = require("../js/analyzer.js");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TYPES = new Set([
  "preferred",
  "consistency",
  "contextual",
  "forbidden",
  "pattern",
  "spelling",
]);
const SEVERITIES = new Set(["info", "warning", "error"]);
const FIX_MODES = new Set(["auto", "confirm", "none"]);

export function validateRule(rule, location = "rule") {
  const errors = [];
  const required = [
    "id",
    "type",
    "preferred",
    "variants",
    "category",
    "severity",
    "fixMode",
    "source",
  ];
  for (const key of required) {
    if (!(key in (rule || {}))) errors.push(`${location}: ${key} is required`);
  }
  if (!rule || typeof rule !== "object" || Array.isArray(rule)) return errors;
  if (!/^[a-z0-9][a-z0-9._-]+$/.test(rule.id || ""))
    errors.push(`${location}: invalid id`);
  if (!TYPES.has(rule.type))
    errors.push(`${location}: unsupported type ${rule.type}`);
  if (!Array.isArray(rule.variants) || rule.variants.length === 0)
    errors.push(`${location}: variants must be a non-empty array`);
  else if (new Set(rule.variants).size !== rule.variants.length)
    errors.push(`${location}: variants must be unique`);
  if (!SEVERITIES.has(rule.severity))
    errors.push(`${location}: invalid severity`);
  if (!FIX_MODES.has(rule.fixMode)) errors.push(`${location}: invalid fixMode`);
  if (rule.fixMode === "auto" && !rule.preferred)
    errors.push(`${location}: auto requires preferred`);
  if (
    ["consistency", "contextual"].includes(rule.type) &&
    rule.fixMode === "auto"
  )
    errors.push(`${location}: ${rule.type} cannot use auto`);
  if (rule.type === "pattern" && !rule.pattern)
    errors.push(`${location}: pattern type requires pattern`);
  if (rule.pattern) {
    try {
      // 置換文字列の $1 などが、実在するキャプチャグループを指していること
      const groups = new RegExp(`${rule.pattern}|`, "u").exec("").length - 1;
      for (const [, ref] of (rule.replacement || "").matchAll(/$(d{1,2})/g)) {
        if (Number(ref) > groups)
          errors.push(
            `${location}: replacement の $${ref} に対応するグループがない`,
          );
      }
    } catch (error) {
      errors.push(`${location}: invalid pattern (${error.message})`);
    }
  }
  if ("inflect" in rule) {
    const ending = INFLECTION_DICT_ENDING[rule.inflect];
    if (!ending)
      errors.push(`${location}: unsupported inflect ${rule.inflect}`);
    else if (rule.type === "pattern")
      errors.push(`${location}: inflect cannot be used with pattern type`);
    else
      for (const word of rule.variants || []) {
        // 辞書形で書く。語幹（末尾 1 字を除いた部分）が空になる語は活用させられない
        if (word.length < 2 || !word.endsWith(ending))
          errors.push(
            `${location}: ${rule.inflect} の variants は「${ending}」で終わる辞書形にする（${word}）`,
          );
      }
  }
  for (const key of ["exceptions", "hit", "miss"]) {
    if (!(key in rule)) continue;
    if (
      !Array.isArray(rule[key]) ||
      rule[key].some((value) => typeof value !== "string" || !value.trim())
    )
      errors.push(`${location}: ${key} must be an array of non-empty strings`);
  }
  const source = rule.source;
  if (typeof source !== "string") {
    for (const key of [
      "pack",
      "title",
      "url",
      "license",
      "attribution",
      "retrievedAt",
      "modified",
    ]) {
      if (!source || !(key in source))
        errors.push(`${location}: source.${key} is required`);
    }
  }
  return errors;
}

/** ルールが指摘した（基準表記以外の）箇所を、原文の文字列で返す。 */
function flaggedSurfaces(rule, text) {
  const results = analyzeText(text, [rule]);
  return results.flatMap((result) => {
    const others = new Set(result.others || []);
    return (result.occurrences || [])
      .filter((item) => others.has(item.word))
      .map((item) => text.slice(item.start, item.end));
  });
}

/**
 * ルールに添えた例で、そのルール自身を検証する。
 * hit: 指摘が 1 件以上出るはずの例 / miss: 指摘が出てはいけない例（誤検知の再発防止）。
 * consistency・contextual は 2 種類以上の表記がそろって初めて指摘するため、hit には
 * 混在した例を書く。
 */
export function checkRuleExamples(rule, location = "rule") {
  const errors = [];
  for (const text of rule.hit || []) {
    if (flaggedSurfaces(rule, text).length === 0)
      errors.push(`${location}: ${rule.id} hit の例を検出できない「${text}」`);
  }
  for (const text of rule.miss || []) {
    const found = flaggedSurfaces(rule, text);
    if (found.length > 0)
      errors.push(
        `${location}: ${rule.id} miss の例を誤検知した「${text}」→「${found.join("・")}」`,
      );
  }
  return errors;
}

export function loadAndValidatePacks(root = ROOT) {
  const manifestPath = path.join(root, "rules", "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const ids = new Set();
  const packs = manifest.packs.map((entry) => {
    const paths = entry.paths || [entry.path];
    const rules = paths.flatMap((relativePath) => {
      const rulesPath = path.join(root, "rules", relativePath);
      const loaded = JSON.parse(fs.readFileSync(rulesPath, "utf8"));
      if (!Array.isArray(loaded))
        throw new Error(`${relativePath}: root must be an array`);
      return loaded.map((rule) => ({ ...rule, _location: relativePath }));
    });
    const errors = rules.flatMap((rule, index) => {
      const location = `${rule._location}[${index}]`;
      delete rule._location;
      const result = validateRule(rule, location);
      if (result.length === 0)
        result.push(...checkRuleExamples(rule, location));
      if (ids.has(rule.id)) result.push(`${location}: duplicate id ${rule.id}`);
      ids.add(rule.id);
      if (typeof rule.source === "string" && rule.source !== entry.id)
        result.push(`${location}: source reference must equal ${entry.id}`);
      if (typeof rule.source === "string" && !entry.source)
        result.push(`${location}: referenced pack source is missing`);
      else if (
        typeof rule.source !== "string" &&
        rule.source?.pack !== entry.id
      )
        result.push(`${location}: source.pack must equal ${entry.id}`);
      return result;
    });
    if (errors.length) throw new Error(errors.join("\n"));
    // hit / miss は検証専用。ブラウザへ配る生成物には含めない
    const expandedRules = rules.map(({ hit, miss, ...rule }) => ({
      // 理由を書いていないルールは、結果カードに理由欄を出さない
      reason:
        rule.type === "contextual"
          ? "語の意味・対象範囲が異なる可能性があり、機械的に統一できない。"
          : "",
      ...rule,
      source: typeof rule.source === "string" ? entry.source : rule.source,
    }));
    return { ...entry, rules: expandedRules };
  });
  return { version: manifest.version, packs };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const generated = loadAndValidatePacks();
  const ruleCount = generated.packs.reduce(
    (sum, pack) => sum + pack.rules.length,
    0,
  );
  const exampleCount = JSON.parse(
    fs.readFileSync(path.join(ROOT, "rules", "manifest.json"), "utf8"),
  ).packs.reduce(
    (sum, entry) =>
      sum +
      (entry.paths || [entry.path])
        .flatMap((file) =>
          JSON.parse(fs.readFileSync(path.join(ROOT, "rules", file), "utf8")),
        )
        .reduce(
          (n, rule) => n + (rule.hit?.length || 0) + (rule.miss?.length || 0),
          0,
        ),
    0,
  );
  console.log(
    `Validated ${generated.packs.length} packs / ${ruleCount} rules / ${exampleCount} examples`,
  );
}
