/**
 * app.js - メインスレッド UIコントローラ
 * defer で読み込まれ、DOMContentLoaded で初期化する。
 */

// ---- グローバル状態 ----
const dictManager = new DictionaryManager();
let currentText = "";
let replacementLog = [];
let _lastResults = [];
let ignoredGroups = new Set();
let _checkVersion = 0;
let _kuromojiInitialized = false;
const occurrenceCursor = new Map();

// ---- バックエンドAPI設定 ----
const API_BASE = ""; // デプロイ時に 'https://your-api.fly.dev' を設定
const BACKEND_THRESHOLD = 5000; // この文字数超でバックエンドを使用

async function fetchBackendAnalyze(text) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.results;
}

// ---- Worker 通信 ----
// JSを更新したら APP_VERSION を変更し、worker/importScripts のキャッシュを破棄する
// （index.html のローカル<script>の ?v= とも揃えること）
const APP_VERSION = "20260714d";
const worker = new Worker(`js/worker.js?v=${APP_VERSION}`);
const workerCallbackMap = new Map();
let messageIdCounter = 0;

function postToWorker(type, payload) {
  return new Promise((resolve, reject) => {
    const id = ++messageIdCounter;
    workerCallbackMap.set(id, { resolve, reject });
    worker.postMessage({ id, type, payload });
  });
}

worker.onmessage = function (e) {
  const { id, type, results, message } = e.data;
  const callbacks = workerCallbackMap.get(id);
  if (!callbacks) return;
  if (type === "ERROR") callbacks.reject(new Error(message));
  else callbacks.resolve(results);
  workerCallbackMap.delete(id);
};

// ---- UI ヘルパー ----
function setLoading(isLoading) {
  const el = document.getElementById("loading");
  if (!el) return;
  el.classList.toggle("hidden", !isLoading);
}

function switchTab(tabId) {
  document
    .querySelectorAll(".tab-pane")
    .forEach((el) => el.classList.add("hidden"));
  document
    .querySelectorAll(".tab-btn")
    .forEach((el) => el.classList.remove("active"));
  document.getElementById(`tab-${tabId}`).classList.remove("hidden");
  document.getElementById(`tabBtn-${tabId}`).classList.add("active");
  if (tabId === "dict") renderCustomDictList();
}

// ---- ファイル処理（Word/PDF/TXT）----
async function handleFile(file) {
  setLoading(true);
  await new Promise((resolve) => setTimeout(resolve, 50));
  try {
    const name = file.name.toLowerCase();
    let text = "";
    let detail = "";

    if (name.endsWith(".pdf") || file.type === "application/pdf") {
      if (typeof pdfjsLib === "undefined") {
        alert(
          "PDF ライブラリ (pdf.js) が読み込まれていません。ネットワーク接続を確認してください。",
        );
        return;
      }
      const arrayBuffer = await file.arrayBuffer();
      const extracted = await extractPDF(arrayBuffer);
      text = extracted.text;
      detail = `${extracted.pages}ページ（文字を取得できたページ: ${extracted.textPages}）`;
      if (!text.trim()) {
        alert(
          "このPDFから文字を取得できませんでした。画像だけのスキャンPDFにはOCR処理が必要です。",
        );
      }
    } else if (name.endsWith(".docx")) {
      if (typeof mammoth === "undefined") {
        alert(
          "DOCX ライブラリ (mammoth) が読み込まれていません。ネットワーク接続を確認してください。",
        );
        return;
      }
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      text = result.value;
      detail = result.messages?.length
        ? `Word（読込時の注意: ${result.messages.length}件）`
        : "Word";
    } else if (name.endsWith(".txt")) {
      text = await file.text();
    } else {
      alert("対応形式: .pdf / .docx / .txt");
      return;
    }

    replacementLog = [];
    ignoredGroups.clear();
    occurrenceCursor.clear();
    document.getElementById("inputText").value = text;
    showDocumentMeta(
      `${file.name} ・ ${detail} ・ ${text.length.toLocaleString()}文字`,
    );
    await runCheck();
  } catch (e) {
    console.error(e);
    alert("読み込みエラー: " + (e.message || e));
  } finally {
    setLoading(false);
    const fileInput = document.getElementById("fileInput");
    if (fileInput) fileInput.value = "";
  }
}

async function extractPDF(arrayBuffer) {
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    cMapUrl: new URL("./cmaps/", document.baseURI).href,
    cMapPacked: true,
  }).promise;
  const pages = [];
  let textPages = 0;
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText =
      typeof reconstructPDFPage === "function"
        ? reconstructPDFPage(content.items)
        : content.items.map((item) => item.str || "").join("");
    if (pageText.trim()) textPages++;
    pages.push(pageText);
  }
  return { text: pages.join("\n\n"), pages: pdf.numPages, textPages };
}

function showDocumentMeta(text) {
  const el = document.getElementById("documentMeta");
  if (!el) return;
  el.textContent = text;
  el.classList.toggle("hidden", !text);
}

// ---- 解析・描画 ----
async function runCheck() {
  const version = ++_checkVersion;
  currentText = document.getElementById("inputText").value;
  const previewCountEl = document.getElementById("previewCount");

  // 【修正】テキストが空の場合は早期リターンして無駄な処理を省く
  if (!currentText.trim()) {
    if (previewCountEl) previewCountEl.textContent = "";
    renderResults([]);
    renderPreview([]);
    return;
  }

  if (previewCountEl) previewCountEl.textContent = "⏳ 解析中...";

  try {
    let results;
    if (API_BASE && currentText.length > BACKEND_THRESHOLD) {
      results = await fetchBackendAnalyze(currentText);
    } else {
      results = await postToWorker("ANALYZE", {
        text: currentText,
        dict: dictManager.getAll(),
        // Kuromoji初期化済みなら形態素境界で部分一致を除外し高精度化
        boundaryAware: _kuromojiInitialized,
      });
    }
    results = results.filter((r) => !ignoredGroups.has(r.group.join(",")));
    if (version !== _checkVersion) return;
    renderResults(results);
    renderPreview(results);
  } catch (e) {
    console.error("解析エラー:", e);
    if (previewCountEl) previewCountEl.textContent = "⚠ エラー";
  }
}

function renderResults(results) {
  const resultsEl = document.getElementById("results");
  const countEl = document.getElementById("resultCount");
  // 出力時に参照する最新の検出結果を保持し、エクスポートボタンの表示を切り替える
  _lastResults = results || [];
  updateExportButton();
  if (!results || results.length === 0) {
    resultsEl.innerHTML =
      '<p class="text-sm text-gray-400 text-center py-10 font-medium">ゆらぎは検知されていません</p>';
    countEl.textContent = "0 件";
    return;
  }
  countEl.textContent = `${results.length} 件`;

  const esc = typeof escapeHTML === "function" ? escapeHTML : (s) => s;
  let html = "";
  results.forEach((r, resultIndex) => {
    const groupLabel = r.group.map(esc).join(" ・ ");
    const typeLabels = {
      preferred: "基準表記",
      consistency: "文書内統一",
      contextual: "文脈確認",
      forbidden: "使用禁止",
      pattern: "パターン",
      spelling: "スペル",
    };
    const statusLabel = typeLabels[r.type] || "表記ルール";
    const statusClass = r.isInconsistent
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-yellow-50 text-yellow-800 border-yellow-200";
    const preferredLabel = r.recommended || "指定なし（文脈確認）";
    const sourceLabel = r.source?.title || r.source?.pack || "出典不明";
    const fixLabel =
      r.fixMode === "auto"
        ? "自動修正可"
        : r.fixMode === "confirm"
          ? "要確認"
          : "自動修正なし";
    let countsHtml = "";
    if (r.counts && r.counts.length > 0) {
      countsHtml = r.counts
        .map(
          ({ word, count }, countIndex) =>
            `<button type="button" onclick="focusOccurrence(${resultIndex}, ${countIndex})"
                 class="flex justify-between text-xs py-1 px-1 -mx-1 rounded hover:bg-white text-left"
                 title="原文の次の出現箇所へ移動">
          <span class="${word === r.recommended ? "text-[#f28c06] font-bold" : "text-gray-700"}">${esc(word)}${word === r.recommended ? "（基準）" : ""}</span>
          <span class="font-bold text-gray-500 ml-4">${count}件 ↗</span>
        </button>`,
        )
        .join("");
    } else {
      countsHtml = r.group
        .map((w) => `<div class="text-xs text-gray-700 py-0.5">${esc(w)}</div>`)
        .join("");
    }
    html += `<div class="p-3 border border-[#e0e0e0] bg-white rounded-xl shadow-sm flex flex-col gap-1.5">
      <div class="flex items-start justify-between gap-2">
        <div class="text-sm font-bold text-[#0f0f0f]">${groupLabel}</div>
        <span class="text-[10px] whitespace-nowrap border rounded-full px-2 py-0.5 font-bold ${statusClass}">${statusLabel}</span>
      </div>
      <div class="text-xs text-gray-500">推奨表記: <strong class="text-[#d97706]">${esc(preferredLabel)}</strong></div>
      ${r.type === "consistency" ? `<div class="text-xs text-gray-500">原稿内最多: <strong>${esc(r.observedMajority || "-")}</strong></div>` : ""}
      <div class="text-xs text-gray-500">出典: ${esc(sourceLabel)}</div>
      <div class="text-xs text-gray-500">修正: <strong>${fixLabel}</strong></div>
      ${r.reason ? `<div class="text-xs text-gray-600 bg-gray-50 rounded p-2">${esc(r.reason)}</div>` : ""}
      <div class="bg-gray-50 border border-gray-200 rounded p-2 flex flex-col">${countsHtml}</div>
    </div>`;
  });
  resultsEl.innerHTML = html;
}

/** 結果カードで選んだ表記の次の出現位置を textarea 上で選択する。 */
function focusOccurrence(resultIndex, countIndex) {
  const result = _lastResults[resultIndex];
  const word = result?.counts?.[countIndex]?.word;
  if (!word) return;
  const matches = (result.occurrences || []).filter(
    (item) => item.word === word,
  );
  if (matches.length === 0) return;
  const key = `${resultIndex}:${word}`;
  const nextIndex = occurrenceCursor.get(key) || 0;
  const match = matches[nextIndex % matches.length];
  occurrenceCursor.set(key, nextIndex + 1);

  const input = document.getElementById("inputText");
  input.focus();
  input.setSelectionRange(match.start, match.end);
  const lineHeight = parseFloat(getComputedStyle(input).lineHeight) || 24;
  const linesBefore = currentText.slice(0, match.start).split("\n").length - 1;
  input.scrollTop = Math.max(
    0,
    linesBefore * lineHeight - input.clientHeight / 3,
  );
}

function renderPreview(results) {
  const previewEl = document.getElementById("preview");
  const countEl = document.getElementById("previewCount");
  if (!previewEl) return;

  if (!currentText) {
    previewEl.innerHTML =
      '<span class="text-gray-400">ここにハイライト表示されます</span>';
    if (countEl) countEl.textContent = "";
    return;
  }
  if (!results || results.length === 0) {
    previewEl.innerHTML =
      typeof escapeHTML === "function"
        ? escapeHTML(currentText).replace(/\n/g, "<br>")
        : currentText;
    if (countEl) countEl.textContent = "ゆらぎなし";
    return;
  }
  if (typeof buildHighlightedHTML === "function") {
    previewEl.innerHTML = buildHighlightedHTML(currentText, results);
  } else {
    previewEl.textContent = currentText;
  }
  if (countEl) countEl.textContent = `${results.length}件のグループ`;
}

// ---- Kuromoji 活用形解析 ----
async function initAndRunKuromoji() {
  const btn = document.getElementById("kuromojiInitBtn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "読み込み中...";
  }
  setKuromojiStatus("loading", "辞書ファイルを取得中...");
  try {
    await postToWorker("INIT_KUROMOJI", {});
    _kuromojiInitialized = true;
    setKuromojiStatus("ready", "準備完了");
    if (btn) btn.classList.add("hidden");
    const runBtn = document.getElementById("kuromojiRunBtn");
    if (runBtn) runBtn.classList.remove("hidden");
    runKuromojiAnalysis();
    // 形態素境界が使えるようになったので本体の検知結果を高精度で再解析
    runCheck();
  } catch (e) {
    setKuromojiStatus("error", "初期化失敗: " + e.message);
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Kuromoji を初期化して解析";
    }
  }
}

async function runKuromojiAnalysis() {
  if (!_kuromojiInitialized) return;

  // 【修正】安全装置：文字数制限（形態素解析の負荷軽減）
  if (currentText.length > 10000) {
    alert(
      "【Beta機能制限】\n活用形解析は処理負荷が高いため、現在は10,000文字以下のテキストのみ対応しています。（現在の文字数: " +
        currentText.length +
        "文字）",
    );
    const el = document.getElementById("kuromojiResults");
    if (el)
      el.innerHTML =
        '<p class="text-sm text-red-500 text-center py-4 font-bold">文字数制限を超過したため解析をスキップしました。</p>';
    return;
  }

  try {
    const results = await postToWorker("KUROMOJI_ANALYZE", {
      text: currentText,
      dict: dictManager.getAll(),
    });
    renderKuromojiResults(results);
  } catch (e) {
    console.error(e);
    const el = document.getElementById("kuromojiResults");
    if (el)
      el.innerHTML =
        '<p class="text-sm text-red-500 text-center py-4 font-bold">解析中にエラーが発生しました。</p>';
  }
}

function setKuromojiStatus(status, text) {
  const el = document.getElementById("kuromojiStatus");
  if (!el) return;
  let colorClass =
    status === "ready"
      ? "bg-[#43a047]"
      : status === "error"
        ? "bg-red-500"
        : "bg-gray-300";
  if (status === "loading") colorClass = "bg-yellow-400 animate-pulse";
  el.innerHTML = `<span class="inline-block w-3 h-3 rounded-full ${colorClass}"></span>${text}`;
}

function renderKuromojiResults(results) {
  const el = document.getElementById("kuromojiResults");
  if (!el) return;
  if (!results || results.length === 0) {
    el.innerHTML =
      '<p class="text-sm text-gray-400 text-center py-4">活用形のゆらぎは検知されませんでした</p>';
    return;
  }
  const esc = typeof escapeHTML === "function" ? escapeHTML : (s) => s;
  let html = "";
  results.forEach((r) => {
    html += `<div class="p-3 border border-[#ffe0b2] bg-white rounded-xl shadow-sm flex flex-col gap-1.5">
      <div class="text-sm font-bold text-[#0f0f0f]">基本形: <span class="text-[#d97706]">${esc(r.recommendedWord)}</span></div>
    </div>`;
  });
  el.innerHTML = html;
}

// ---- ファジー検索 ----
async function runFuzzyCheck(event) {
  const loadingEl = document.getElementById("fuzzyLoading");
  const resultsEl = document.getElementById("fuzzyResults");
  const btn = event ? event.currentTarget : null;
  const maxDist = parseInt(document.getElementById("fuzzyThreshold").value);

  if (!currentText.trim()) {
    resultsEl.innerHTML =
      '<p class="text-sm text-gray-400 text-center py-4 font-medium">テキストを入力してください</p>';
    return;
  }

  // 【修正】安全装置：文字数制限（計算量爆発を防ぐ）
  if (currentText.length > 5000) {
    alert(
      "【Beta機能制限】\nファジーチェックは計算量が大きいため、現在は5,000文字以下のテキストのみ対応しています。（現在の文字数: " +
        currentText.length +
        "文字）",
    );
    resultsEl.innerHTML =
      '<p class="text-sm text-red-500 text-center py-4 font-bold">文字数制限を超過したため解析をスキップしました。</p>';
    return;
  }

  if (btn) btn.disabled = true;
  loadingEl.classList.remove("hidden");
  resultsEl.innerHTML = "";

  try {
    const fuzzResults = await postToWorker("FUZZY", {
      text: currentText,
      dict: dictManager.getAll(),
      maxDistance: maxDist,
    });

    if (fuzzResults.length === 0) {
      resultsEl.innerHTML =
        '<p class="text-sm text-gray-400 text-center py-4 font-medium">ファジーマッチは検出されませんでした</p>';
    } else {
      const esc = typeof escapeHTML === "function" ? escapeHTML : (s) => s;
      fuzzResults.forEach(({ dictWord, candidates }) => {
        const card = document.createElement("div");
        card.className =
          "p-3 border border-[#e0e0e0] bg-white rounded-xl shadow-sm flex flex-col gap-1.5";
        card.innerHTML = `
          <div class="text-sm font-bold text-[#0f0f0f]">「${esc(dictWord)}」に類似</div>
          <div class="text-sm text-gray-600 flex flex-wrap gap-1.5 mt-1">
            ${candidates.map((c) => `<code class="bg-yellow-50 text-red-600 rounded px-1.5 py-0.5 border border-red-100 font-bold">${esc(c)}</code>`).join("")}
          </div>`;
        resultsEl.appendChild(card);
      });
    }
  } catch (e) {
    console.error(e);
    alert("解析中にエラーが発生しました。");
    resultsEl.innerHTML =
      '<p class="text-sm text-red-500 text-center py-4 font-bold">解析中にエラーが発生しました。</p>';
  } finally {
    loadingEl.classList.add("hidden");
    if (btn) btn.disabled = false;
  }
}

// ---- ユーティリティ ----
function clearAll() {
  document.getElementById("inputText").value = "";
  currentText = "";
  ignoredGroups.clear();
  occurrenceCursor.clear();
  showDocumentMeta("");
  const fi = document.getElementById("fileInput");
  if (fi) fi.value = "";
  renderResults([]);
  renderPreview([]);
  const fuzzResults = document.getElementById("fuzzyResults");
  if (fuzzResults) fuzzResults.innerHTML = "";
  const kuroResults = document.getElementById("kuromojiResults");
  if (kuroResults) kuroResults.innerHTML = "";
}

/** 検出グループが存在する時のみエクスポートボタンを表示する。 */
function updateExportButton() {
  const btn = document.getElementById("exportDocxBtn");
  if (!btn) return;
  btn.classList.toggle("hidden", !(currentText && _lastResults.length > 0));
}

/**
 * 各検出グループの非推奨表記を推奨表記へ一括置換した本文を生成する。
 * @param {string} text 元テキスト。
 * @returns {{ text: string, log: {group: string[], recommended: string, count: number}[] }}
 *   置換後テキストと、グループ別の置換件数ログ。
 */
function buildCorrectedText(text) {
  if (typeof applyRecommendedReplacements === "function") {
    return applyRecommendedReplacements(text, _lastResults);
  }
  return { text, log: [] };
}

function downloadCorrectedDocx() {
  if (!currentText) return alert("テキストがありません");
  if (typeof htmlDocx === "undefined")
    return alert("Word生成ライブラリが読み込まれていません");
  if (typeof applyRecommendedReplacements !== "function")
    return alert("置換処理が読み込まれていません");

  const autoCount = _lastResults
    .filter((result) => result.fixMode === "auto")
    .reduce(
      (sum, result) =>
        sum +
        (result.occurrences || []).filter((item) =>
          (result.others || []).includes(item.word),
        ).length,
      0,
    );
  const excludedCount = _lastResults
    .filter((result) => result.fixMode !== "auto")
    .reduce(
      (sum, result) =>
        sum +
        (result.occurrences || []).filter((item) =>
          (result.others || []).includes(item.word),
        ).length,
      0,
    );
  if (autoCount === 0) {
    alert(
      `自動置換できる指摘はありません。要確認・対象外: ${excludedCount}箇所`,
    );
    return;
  }
  if (
    !confirm(
      `自動置換対象: ${autoCount}箇所\n自動置換しない指摘: ${excludedCount}箇所\n\n新しいWord文書を作成しますか？`,
    )
  )
    return;

  const { text: corrected, log } = buildCorrectedText(currentText);
  replacementLog = log;

  const esc = typeof escapeHTML === "function" ? escapeHTML : (s) => s;
  const htmlContent = `<!DOCTYPE html><html><body><p>${esc(corrected).replace(/\n/g, "<br>")}</p></body></html>`;
  const converted = htmlDocx.asBlob(htmlContent);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(converted);
  a.download = "corrected.docx";
  a.click();
  URL.revokeObjectURL(a.href);

  // 置換結果バッジを更新（推奨表記へ統一した語の総数）
  const total = log.reduce((sum, l) => sum + l.count, 0);
  const badge = document.getElementById("replacementBadge");
  if (badge) {
    badge.textContent = `✓ ${total}箇所を推奨表記に統一`;
    badge.classList.toggle("hidden", total === 0);
  }
}

function runDictValidation() {
  if (!dictManager || typeof dictManager.validateDict !== "function") return;
  const validation = dictManager.validateDict(dictManager.getAll());
  const banner = document.getElementById("dictErrorBanner");
  const summary = document.getElementById("dictErrorSummary");
  const list = document.getElementById("dictErrorList");
  if (!banner) return;
  if (!validation.valid) {
    banner.classList.remove("hidden");
    if (summary) summary.textContent = `エラー ${validation.errors.length} 件`;
    if (list)
      list.innerHTML = validation.errors
        .map((err) => `<li>インデックス ${err.index}: ${err.reason}</li>`)
        .join("");
  } else {
    banner.classList.add("hidden");
  }
}

function toggleDictErrorDetail() {
  const list = document.getElementById("dictErrorList");
  if (list) list.classList.toggle("hidden");
}

function addCustomRule() {
  const input = document.getElementById("newRuleInput");
  const words = input.value
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s);
  if (words.length >= 2) {
    dictManager.addCustomGroup(words);
    input.value = "";
    renderCustomDictList();
    runCheck();
  } else {
    alert("カンマ区切りで2語以上入力してください（例: Web,ウェブ）");
  }
}

function renderCustomDictList() {
  const el = document.getElementById("customDictList");
  if (!el) return;
  const custom = dictManager.getCustom();
  if (custom.length === 0) {
    el.innerHTML =
      '<p class="text-xs text-gray-400 p-2">カスタム辞書はありません</p>';
    return;
  }
  const esc = typeof escapeHTML === "function" ? escapeHTML : (s) => s;
  el.innerHTML = custom
    .map(
      (rule, i) =>
        `<div class="flex justify-between items-center text-sm p-2 border-b border-gray-100 hover:bg-gray-50">
      <span class="text-gray-700 font-medium">${esc(rule.variants.join(", "))}<small class="block text-gray-400">基準: ${esc(rule.preferred || "なし")} / ${esc(rule.fixMode)}</small></span>
      <button onclick="dictManager.removeCustomGroup(${i}); renderCustomDictList(); runCheck();" class="text-red-400 hover:text-red-600 font-bold px-2 py-1 bg-red-50 rounded">削除</button>
    </div>`,
    )
    .join("");
}

function renderRulePackControls() {
  const el = document.getElementById("rulePackControls");
  if (!el) return;
  el.innerHTML = dictManager
    .getPackStates()
    .map(
      (
        pack,
      ) => `<label class="flex items-center justify-between gap-3 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white">
        <span><strong>${pack.label}</strong><small class="block text-gray-400">${pack.ruleCount}ルール</small></span>
        <input type="checkbox" ${pack.enabled ? "checked" : ""} onchange="toggleRulePack('${pack.id}', this.checked)" class="accent-[#f28c06]">
      </label>`,
    )
    .join("");
}

function toggleRulePack(id, enabled) {
  dictManager.setPackEnabled(id, enabled);
  runDictValidation();
  runCheck();
}

async function importCustomDict(e) {
  if (!e.target.files[0]) return;
  try {
    await dictManager.importJSON(e.target.files[0]);
    renderCustomDictList();
    runCheck();
  } catch (err) {
    alert("読み込み失敗: " + err.message);
  } finally {
    e.target.value = "";
  }
}

async function importTSVCSV(e) {
  if (!e.target.files[0]) return;
  try {
    const text = await e.target.files[0].text();
    const separator = e.target.files[0].name.toLowerCase().endsWith(".csv")
      ? ","
      : "\t";
    dictManager.importDelimited(text, separator);
    renderCustomDictList();
    runCheck();
  } catch (err) {
    alert("読み込み失敗: " + err.message);
  } finally {
    e.target.value = "";
  }
}

// ---- 初期化 ----
document.addEventListener("DOMContentLoaded", () => {
  if (typeof pdfjsLib !== "undefined") {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
  }

  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");
  if (dropZone) {
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("dragover");
    });
    dropZone.addEventListener("dragleave", () =>
      dropZone.classList.remove("dragover"),
    );
    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
      if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
  }
  if (fileInput) {
    fileInput.addEventListener("change", () => {
      if (fileInput.files[0]) handleFile(fileInput.files[0]);
    });
  }

  const inputText = document.getElementById("inputText");
  if (inputText) {
    let checkTimeout;
    inputText.addEventListener("input", () => {
      const countEl = document.getElementById("previewCount");
      if (countEl) countEl.textContent = "入力待機中...";
      clearTimeout(checkTimeout);
      checkTimeout = setTimeout(runCheck, 500);
    });
  }

  runDictValidation();
  renderRulePackControls();
  renderCustomDictList();
  runCheck();
});
