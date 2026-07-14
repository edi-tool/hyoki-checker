const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const {
  analyzeGroup,
  buildHighlightedHTML,
  applyRecommendedReplacements,
} = require("../js/analyzer.js");
const { DictionaryManager } = require("../js/dictManager.js");
const { reconstructPDFPage } = require("../js/documentText.js");

const source = (pack = "test") => ({
  pack,
  title: `${pack} source`,
  url: "https://example.test/",
  license: "test",
  attribution: "test",
  retrievedAt: "2026-07-14",
  modified: true,
});

function rule(overrides = {}) {
  return {
    id: "test.rule",
    type: "preferred",
    preferred: "Web",
    variants: ["Web", "ウェブ"],
    category: "test",
    severity: "warning",
    fixMode: "auto",
    reason: "test",
    source: source(),
    ...overrides,
  };
}

test("preferredは原稿内の少数派でも常に推奨され、最多表記は別フィールドになる", () => {
  const result = analyzeGroup("Webとウェブとウェブ", rule());
  assert.equal(result.recommended, "Web");
  assert.equal(result.observedMajority, "ウェブ");
});

test("consistencyルールは最多表記を示すが自動置換しない", () => {
  const result = analyzeGroup(
    "Webとウェブとウェブ",
    rule({ type: "consistency", preferred: null, fixMode: "none" }),
  );
  assert.equal(result.observedMajority, "ウェブ");
  assert.equal(result.recommended, null);
  assert.equal(result.fixMode, "none");
  assert.deepEqual(
    applyRecommendedReplacements("Webとウェブとウェブ", [result]),
    {
      text: "Webとウェブとウェブ",
      log: [],
    },
  );
});

test("contextualルールと意味の異なる『児童／子ども』は自動置換しない", () => {
  const contextual = rule({
    id: "company.child-context",
    type: "contextual",
    preferred: null,
    variants: ["子ども", "子供", "児童"],
    fixMode: "none",
  });
  const result = analyzeGroup(
    "子どもと児童では制度上の範囲が異なる。",
    contextual,
  );
  assert.equal(result.fixMode, "none");
  assert.equal(result.recommended, null);
  assert.equal(
    applyRecommendedReplacements("子どもと児童では制度上の範囲が異なる。", [
      result,
    ]).text,
    "子どもと児童では制度上の範囲が異なる。",
  );
});

test("Sudachi由来の結果はfixMode noneなら置換されない", () => {
  const result = analyzeGroup(
    "アイデアとアイディア",
    rule({
      id: "sudachi.synonym.idea",
      type: "contextual",
      preferred: null,
      variants: ["アイデア", "アイディア"],
      fixMode: "none",
      source: source("sudachi"),
    }),
  );
  assert.equal(result.source.pack, "sudachi");
  assert.equal(
    applyRecommendedReplacements("アイデアとアイディア", [result]).text,
    "アイデアとアイディア",
  );
});

test("JTFルールの出典情報が結果に保持される", () => {
  const jtfSource = {
    ...source("jtf-3.0"),
    title: "JTF日本語標準スタイルガイド 第3.0版",
    license: "CC BY 4.0",
  };
  const result = analyzeGroup(
    "サーバを使う",
    rule({
      id: "jtf.server",
      preferred: "サーバー",
      variants: ["サーバー", "サーバ"],
      source: jtfSource,
    }),
  );
  assert.deepEqual(result.source, jtfSource);
  assert.equal(result.fixMode, "auto");
});

test("検出した位置だけをハイライト・自動置換する", () => {
  const result = analyzeGroup(
    "子供会館と子供",
    rule({ preferred: "子ども", variants: ["子ども", "子供"] }),
  );
  result.occurrences = result.occurrences.filter((item) => item.start === 5);
  assert.equal(
    buildHighlightedHTML("子供会館と子供", [result]),
    '子供会館と<mark class="bg-yellow-200 rounded px-0.5">子供</mark>',
  );
  assert.equal(
    applyRecommendedReplacements("子供会館と子供", [result]).text,
    "子供会館と子ども",
  );
});

test("旧カスタム辞書JSON配列をconfirmの構造化ルールへ移行する", () => {
  const values = new Map([
    ["hyoki_custom_dict", JSON.stringify([["Web", "ウェブ"]])],
  ]);
  global.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  const manager = new DictionaryManager();
  const migrated = manager.getCustom();
  assert.equal(migrated[0].preferred, "Web");
  assert.equal(migrated[0].fixMode, "confirm");
  assert.deepEqual(migrated[0].variants, ["Web", "ウェブ"]);
  delete global.localStorage;
});

test("フロントとバックエンドが同一の生成ルールを使用する", () => {
  const root = path.resolve(__dirname, "..");
  const backend = JSON.parse(
    fs.readFileSync(path.join(root, "backend/dicts/default_dict.json"), "utf8"),
  );
  const frontendSource = fs.readFileSync(
    path.join(root, "js/defaultDict.js"),
    "utf8",
  );
  const frontend = vm.runInNewContext(`${frontendSource}\nGENERATED_RULES;`);
  assert.deepEqual(JSON.parse(JSON.stringify(frontend)), backend);
});

test("PDF断片は改行を保ち、日本語は直結、欧文の座標ギャップは空白にする", () => {
  const text = reconstructPDFPage([
    { str: "表記", transform: [1, 0, 0, 10, 0, 100], width: 20, height: 10 },
    {
      str: "ゆれ",
      transform: [1, 0, 0, 10, 20, 100],
      width: 20,
      height: 10,
      hasEOL: true,
    },
    { str: "OpenAI", transform: [1, 0, 0, 10, 0, 80], width: 34, height: 10 },
    { str: "API", transform: [1, 0, 0, 10, 40, 80], width: 18, height: 10 },
  ]);
  assert.equal(text, "表記ゆれ\nOpenAI API");
});
