// 検出ロジック（活用・例外語・語境界・行またぎ）と、既定辞書の検出精度を固定するテスト
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const {
  analyzeText,
  analyzeGroup,
  applyRecommendedReplacements,
  buildAnalysisView,
  buildHighlightedHTML,
} = require("../js/analyzer.js");
const corpus = require("./detection-corpus.js");

const root = path.resolve(__dirname, "..");

function rule(overrides = {}) {
  return {
    id: "test.rule",
    type: "preferred",
    preferred: "気付く",
    variants: ["気付く", "気づく"],
    category: "test",
    severity: "warning",
    fixMode: "auto",
    reason: "test",
    source: "test",
    ...overrides,
  };
}

/** 基準表記以外として指摘された箇所を、原文の文字列で返す。 */
function flagged(text, rules) {
  return analyzeText(text, rules).flatMap((result) => {
    const others = new Set(result.others);
    return result.occurrences
      .filter((item) => others.has(item.word))
      .map((item) => ({
        surface: text.slice(item.start, item.end),
        start: item.start,
        end: item.end,
        ruleId: result.ruleId,
      }));
  });
}

function defaultRules() {
  const source = fs.readFileSync(path.join(root, "js/defaultDict.js"), "utf8");
  const generated = vm.runInNewContext(`${source}\nGENERATED_RULES;`);
  return generated.packs
    .filter((pack) => pack.defaultEnabled)
    .flatMap((pack) => pack.rules);
}

test("inflect: 辞書形のルールで活用形を検出し、語幹だけを基準表記へ置き換える", () => {
  const text = "間違いに気づいた。気づかない。よさに気づき、気付く。";
  const [result] = analyzeText(text, [rule({ inflect: "godan-ku" })]);
  assert.deepEqual(
    result.counts.map(({ word, count }) => [word, count]),
    [
      ["気づく", 3],
      ["気付く", 1],
    ],
  );
  assert.deepEqual(result.counts[0].forms, ["気づい", "気づか", "気づき"]);
  assert.equal(
    applyRecommendedReplacements(text, [result]).text,
    "間違いに気付いた。気付かない。よさに気付き、気付く。",
  );
});

test("inflect を指定しないルールは、これまでどおり辞書形だけに一致する", () => {
  assert.equal(analyzeText("間違いに気づいた。", [rule()]).length, 0);
});

test("inflect: 語幹が漢字 1 字の五段動詞は、熟語＋語尾（欠落し・自分ら）を拾わない", () => {
  const otosu = rule({
    preferred: "落とす",
    variants: ["落とす", "落す"],
    inflect: "godan-su",
  });
  assert.deepEqual(
    flagged("データが欠落した。ペンを落した。", [otosu]).map((x) => x.surface),
    ["落し"],
  );
  const wakaru = rule({
    preferred: "わかる",
    variants: ["わかる", "分る"],
    inflect: "godan-ru",
  });
  assert.deepEqual(
    flagged("自分らしい考え。意味が分らない。", [wakaru]).map((x) => x.surface),
    ["分ら"],
  );
});

test("exceptions: 別の語として読み飛ばし、指摘も置換もしない", () => {
  const presen = rule({
    preferred: "プレゼンテーション",
    variants: ["プレゼンテーション", "プレゼン"],
    exceptions: ["プレゼント"],
  });
  const text = "プレゼントを渡す。プレゼンを行う。";
  const [result] = analyzeText(text, [presen]);
  assert.equal(result.counts[0].count, 1);
  assert.equal(
    applyRecommendedReplacements(text, [result]).text,
    "プレゼントを渡す。プレゼンテーションを行う。",
  );
});

test("英字の語は、英単語の途中に一致させない", () => {
  const web = rule({ preferred: "ウェブ", variants: ["ウェブ", "Web"] });
  assert.deepEqual(
    flagged("WebSocket と Webサイト、Web の話", [web]).map((x) => x.start),
    [12, 19],
  );
});

test("pattern: 前後を見る条件があっても、置換文字列を正しく組み立てる", () => {
  const tame = rule({
    type: "pattern",
    preferred: "ため",
    variants: ["ため", "為"],
    pattern: "(?<=\\p{sc=Hiragana})為(?![すしさせ替る])",
    replacement: "ため",
  });
  const text = "理解を深める為に、行為を振り返る。";
  const [result] = analyzeText(text, [tame]);
  assert.equal(result.occurrences.length, 1);
  assert.equal(
    applyRecommendedReplacements(text, [result]).text,
    "理解を深めるために、行為を振り返る。",
  );
  const kasho = rule({
    type: "pattern",
    preferred: "か所",
    variants: ["か所", "箇所"],
    pattern: "([0-9])箇(所)",
    replacement: "$1か$2",
  });
  assert.equal(
    applyRecommendedReplacements("5箇所", analyzeText("5箇所", [kasho])).text,
    "5か所",
  );
});

test("行末で切れた語も検出し、位置は元テキストのものを返す", () => {
  const text = "よさに気づ\nいた。\n\n子供\n達が集まる。";
  const rules = [
    rule({ inflect: "godan-ku" }),
    rule({
      id: "test.kodomo",
      preferred: "子どもたち",
      variants: ["子どもたち", "子供達"],
    }),
  ];
  const found = flagged(text, rules);
  assert.deepEqual(
    found.map((x) => x.surface),
    ["気づ\nい", "子供\n達"],
  );
  // ハイライトと置換も元テキストの位置で行われる
  const results = analyzeText(text, rules);
  assert.match(
    buildHighlightedHTML(text, results),
    /<mark[^>]*>気づ<br>い<\/mark>/,
  );
  assert.equal(
    applyRecommendedReplacements(text, results).text,
    "よさに気付いた。\n\n子どもたちが集まる。",
  );
});

test("行の連結は和文どうしの改行だけ。空行（段落）や句読点の後ろはつながない", () => {
  assert.equal(buildAnalysisView("気づ\nいた").text, "気づいた");
  assert.equal(buildAnalysisView("気づ\n\nいた").text, "気づ\n\nいた");
  assert.equal(buildAnalysisView("終わる。\n次の").text, "終わる。\n次の");
  assert.equal(buildAnalysisView("Web\nサイト").text, "Web\nサイト");
  // 段落をまたいで別の語と結び付けない
  assert.equal(
    analyzeGroup(
      buildAnalysisView("子供\n\n達").text,
      rule({
        preferred: "子どもたち",
        variants: ["子どもたち", "子供達"],
      }),
    ),
    null,
  );
});

test("既定辞書: 検証コーパスの「指摘すべき表記」をすべて検出し、誤検知しやすい語を指摘しない", () => {
  const rules = defaultRules();
  const problems = [];
  for (const { text, must = [], mustNot = [] } of corpus) {
    const found = flagged(text, rules);
    for (const expected of must) {
      const index = text.indexOf(expected);
      const hit = found.some(
        (x) =>
          x.surface.includes(expected) ||
          (index <= x.start && x.end <= index + expected.length),
      );
      if (!hit) problems.push(`見逃し「${expected}」: ${text}`);
    }
    for (const forbidden of mustNot) {
      let index = -1;
      while ((index = text.indexOf(forbidden, index + 1)) !== -1) {
        const bad = found.find(
          (x) => x.start < index + forbidden.length && index < x.end,
        );
        if (bad) {
          problems.push(`誤検知「${bad.surface}」(${bad.ruleId}): ${text}`);
          break;
        }
      }
    }
  }
  assert.deepEqual(problems, []);
});

test("ルールに添えた hit / miss の例がすべて成り立ち、生成物には含まれない", async () => {
  const { loadAndValidatePacks } =
    await import("../scripts/validate-rules.mjs");
  const generated = loadAndValidatePacks(root);
  const rules = generated.packs.flatMap((pack) => pack.rules);
  assert.ok(rules.length > 200);
  assert.ok(rules.every((item) => !("hit" in item) && !("miss" in item)));
});
