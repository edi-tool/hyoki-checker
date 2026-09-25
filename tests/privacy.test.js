// 公開ビルドで文書本文を外部送信しないことを固定する（edi-tool 開発原則 4）
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = (f) => fs.readFileSync(path.join(__dirname, "..", f), "utf8");

test("公開ビルドではバックエンド API を無効にしている（API_BASE が空）", () => {
  const app = read("js/app.js");
  assert.match(app, /^const API_BASE = "";/m, "API_BASE を設定すると 5,000 字超の本文がサーバーへ送られる。README「データの扱い」を更新すること");
  assert.match(app, /if \(API_BASE && currentText\.length > BACKEND_THRESHOLD\)/);
});

test("fetch はバックエンド API の 1 か所だけで、ほかに送信手段がない", () => {
  for (const f of ["js/app.js", "js/worker.js", "js/analyzer.js", "js/dictManager.js", "js/documentText.js", "js/prh.js"]) {
    const src = read(f);
    const count = (src.match(/\bfetch\(/g) || []).length;
    assert.equal(count, f === "js/app.js" ? 1 : 0, f);
    assert.doesNotMatch(src, /sendBeacon|XMLHttpRequest|WebSocket/, f);
  }
});

test("CDN から読むライブラリはバージョンを固定している", () => {
  const html = read("index.html");
  const cdn = [...html.matchAll(/https:\/\/cdn\.jsdelivr\.net\/npm\/([^"'\s]+)/g)].map((m) => m[1]);
  assert.ok(cdn.length >= 3);
  for (const p of cdn) assert.match(p, /^(@[^/]+\/)?[^/@]+@\d+\.\d+\.\d+\//, p);
});
