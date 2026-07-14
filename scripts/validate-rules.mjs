import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

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
    const expandedRules = rules.map((rule) => ({
      reason:
        rule.type === "contextual"
          ? "語の意味・対象範囲が異なる可能性があり、機械的に統一できない。"
          : "旧辞書から移行したルール。自動置換せず確認を要する。",
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
  console.log(`Validated ${generated.packs.length} packs / ${ruleCount} rules`);
}
