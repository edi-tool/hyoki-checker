const test = require("node:test");
const assert = require("node:assert/strict");

const PRH = require("../js/prh.js");
globalThis.PRH = PRH;
const { DictionaryManager } = require("../js/dictManager.js");
const { analyzeGroup } = require("../js/analyzer.js");

const SAMPLE = `# prh 互換辞書のサンプル
version: 1
imports:
  - ./media/techbooster.yml
rules:
  - expected: ソフトウェア
    patterns:
      - ソフトウエア
      - ソフトゥエア
  - expected: $1コンピューター
    pattern: /(.)コンピュータ(?!ー)/
    regexpMustEmpty: $1
  - expected: JavaScript
    patterns: /[jJ]ava\\s?[sS]cript/
    options:
      wordBoundary: true
  - expected: サーバー
    specs:
      - from: サーバ
        to: サーバー
`;

test("prh YAML のマップ・シーケンス・コメントを解釈できる", () => {
  const doc = PRH.parseYAML(SAMPLE);
  assert.equal(doc.version, 1);
  assert.deepEqual(doc.imports, ["./media/techbooster.yml"]);
  assert.equal(doc.rules.length, 4);
  assert.deepEqual(doc.rules[0].patterns, ["ソフトウエア", "ソフトゥエア"]);
  assert.equal(doc.rules[2].options.wordBoundary, true);
  assert.deepEqual(doc.rules[3].specs, [{ from: "サーバ", to: "サーバー" }]);
});

test("文字列パターンは preferred ルール、正規表現は pattern ルールへ変換される", () => {
  const { rules, imports, skipped } = PRH.importPrhYAML(SAMPLE, {
    pack: "jtf",
  });
  assert.deepEqual(skipped, []);
  assert.deepEqual(imports, ["./media/techbooster.yml"]);
  assert.deepEqual(rules[0].variants, [
    "ソフトウェア",
    "ソフトウエア",
    "ソフトゥエア",
  ]);
  assert.equal(rules[0].type, "preferred");
  assert.equal(rules[0].fixMode, "confirm");
  assert.equal(rules[1].type, "pattern");
  assert.equal(rules[1].mustEmpty, 1);
  assert.equal(rules[2].pattern, "\\b(?:[jJ]ava\\s?[sS]cript)\\b");
  // specs だけのルールは from を候補として拾う
  assert.deepEqual(rules[3].variants, ["サーバー", "サーバ"]);
});

test("regexpMustEmpty はグループが空の一致だけを指摘する", () => {
  const rule = PRH.importPrhYAML(
    `rules:\n  - expected: $1コンピューター\n    pattern: /(ー?)コンピュータ(?!ー)/\n    regexpMustEmpty: $1\n`,
  ).rules[0];
  const hit = analyzeGroup("このコンピュータは速い", rule);
  assert.equal(hit.counts[0].word, "コンピュータ");
  assert.equal(analyzeGroup("スーパーコンピューター", rule), null);
});

test("prh の expected 内 $1 は置換に反映される", () => {
  const rule = PRH.importPrhYAML(
    `rules:\n  - expected: $1コンピューター\n    pattern: /(.)コンピュータ(?!ー)/\n`,
  ).rules[0];
  const hit = analyzeGroup("そのコンピュータ", rule);
  assert.equal(hit.occurrences[0].replacement, "のコンピューター");
});

test("書き出した prh YAML を読み戻すと同じ表記集合になる", () => {
  const original = PRH.importPrhYAML(SAMPLE, { pack: "jtf" }).rules;
  const yaml = PRH.rulesToPrhYAML(original);
  const roundTrip = PRH.importPrhYAML(yaml, { pack: "jtf" }).rules;
  assert.deepEqual(
    roundTrip.map((r) => r.preferred ?? r.replacement),
    original.map((r) => r.preferred ?? r.replacement),
  );
  assert.deepEqual(roundTrip[0].variants, original[0].variants);
  assert.equal(roundTrip[1].mustEmpty, 1);
});

test("DictionaryManager が prh YAML をカスタム辞書へ取り込む", () => {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
  };
  const manager = new DictionaryManager("t_dict", "t_packs");
  const result = manager.importPRH(SAMPLE, { pack: "jtf" });
  assert.equal(result.added, 4);
  assert.deepEqual(result.imports, ["./media/techbooster.yml"]);
  const custom = manager.getCustom();
  assert.equal(custom.length, 4);
  assert.equal(custom[1].mustEmpty, 1);
  assert.ok(manager.validateDict(custom).valid);
  delete globalThis.localStorage;
});
