#!/usr/bin/env node
// package.json の pdfjs-dist のバージョンを、ブラウザが実際に読む側へそろえる。
//   - index.html の CDN URL（本体と worker）
//   - README の「データの扱い」に書いたバージョン
//   - 同梱している CMap（cmaps/）
// Dependabot は package.json しか上げないため、その PR ではこのスクリプトを実行して結果をコミットする。
// 使い方: npm run sync:pdfjs
import { readFileSync, writeFileSync, rmSync, cpSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const version = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).dependencies["pdfjs-dist"];
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(`pdfjs-dist はバージョンを固定してください（現在: ${version}）`);
  process.exit(1);
}

const replaceIn = (file, pattern, replacement) => {
  const path = join(ROOT, file);
  const before = readFileSync(path, "utf8");
  const after = before.replace(pattern, replacement);
  if (after !== before) writeFileSync(path, after);
  console.log(`${after !== before ? "更新" : "変更なし"}: ${file}`);
};

replaceIn("index.html", /pdfjs-dist@\d+\.\d+\.\d+/g, `pdfjs-dist@${version}`);
replaceIn("README.md", /pdfjs-dist \d+\.\d+\.\d+/g, `pdfjs-dist ${version}`);

const source = join(ROOT, "node_modules", "pdfjs-dist");
const installed = existsSync(source) ? JSON.parse(readFileSync(join(source, "package.json"), "utf8")).version : null;
if (installed !== version) {
  console.error(`node_modules の pdfjs-dist が ${installed ?? "未インストール"} です。先に npm ci を実行してください。`);
  process.exit(1);
}
rmSync(join(ROOT, "cmaps"), { recursive: true, force: true });
cpSync(join(source, "cmaps"), join(ROOT, "cmaps"), { recursive: true });
console.log(`更新: cmaps/（pdfjs-dist ${version} から複製）`);
