import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadAndValidatePacks } from "./validate-rules.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const generated = loadAndValidatePacks(ROOT);
const json = `${JSON.stringify(generated, null, 2)}\n`;

fs.mkdirSync(path.join(ROOT, "rules", "generated"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "rules", "generated", "rules.json"), json);
fs.writeFileSync(
  path.join(ROOT, "backend", "dicts", "default_dict.json"),
  json,
);

const js =
  `/** GENERATED FILE. Edit rule pack sources and run npm run build:rules. */\n` +
  `const GENERATED_RULES = ${JSON.stringify(generated, null, 2)};\n` +
  `const DEFAULT_RULE_PACKS = GENERATED_RULES.packs;\n` +
  `const DEFAULT_DICT = DEFAULT_RULE_PACKS.flatMap(pack => pack.rules);\n`;
fs.writeFileSync(path.join(ROOT, "js", "defaultDict.js"), js);

console.log(
  `Generated ${generated.packs.length} packs for frontend and backend`,
);
