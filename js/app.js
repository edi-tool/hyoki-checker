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
let _kuromojiResults = [];
const occurrenceCursor = new Map();
// 形態素解析（Beta）で扱う本文の上限。Worker 内で動くため画面は固まらないが、
// 極端に長い文書で待ち時間が延びすぎないようにする
const KUROMOJI_LIMIT = 200000;
// 「次回から自動で読み込む」の設定（この端末の localStorage にだけ保存する）
const KUROMOJI_AUTO_KEY = "hyoki_kuromoji_auto";

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
const APP_VERSION = "20261013a";
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
  const pdfjsLib = await window.pdfjsReady;
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    cMapUrl: new URL("./cmaps/", document.baseURI).href,
    cMapPacked: true,
    isEvalSupported: false,
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

  if (previewCountEl) previewCountEl.textContent = "解析中...";

  try {
    let results;
    if (API_BASE && currentText.length > BACKEND_THRESHOLD) {
      results = await fetchBackendAnalyze(currentText);
    } else {
      results = await postToWorker("ANALYZE", {
        text: currentText,
        dict: dictManager.getAll(),
        // 形態素解析を読み込み済みで、利用者が切っていなければ、語の区切りに
        // 合わない部分一致を除外する
        boundaryAware: isBoundaryAwareEnabled(),
      });
    }
    results = results.filter((r) => !ignoredGroups.has(resultKey(r)));
    // 原文で先に出てくる指摘から順に並べる（読み進めながら確認しやすいように）
    const firstFlagged = (r) => {
      const others = new Set(r.others || []);
      const hit = (r.occurrences || []).find((item) => others.has(item.word));
      return hit ? hit.start : Infinity;
    };
    results.sort((a, b) => firstFlagged(a) - firstFlagged(b));
    if (version !== _checkVersion) return;
    renderResults(results);
    renderPreview(results);
    // 活用形タブ（Beta）も、本文が変わるたびに自動で更新する
    if (_kuromojiInitialized) runKuromojiAnalysis();
  } catch (e) {
    console.error("解析エラー:", e);
    if (previewCountEl) previewCountEl.textContent = "エラー";
  }
}

/** 指摘を隠す・戻すときの目印（ルール ID。無い場合は表記の並び）。 */
function resultKey(result) {
  return result.ruleId || result.group.join(",");
}

/** この指摘を、本文を読み込み直すまで一覧とハイライトから外す。 */
function ignoreResult(resultIndex) {
  const result = _lastResults[resultIndex];
  if (!result) return;
  ignoredGroups.add(resultKey(result));
  runCheck();
}

function restoreIgnored() {
  ignoredGroups.clear();
  runCheck();
}

function isBoundaryAwareEnabled() {
  const toggle = document.getElementById("kuromojiBoundary");
  return _kuromojiInitialized && (!toggle || toggle.checked);
}

/** 原文（textarea）上の範囲を選択し、見える位置までスクロールする。 */
function selectRangeInInput(start, end) {
  const input = document.getElementById("inputText");
  input.focus();
  input.setSelectionRange(start, end);
  const lineHeight = parseFloat(getComputedStyle(input).lineHeight) || 24;
  const linesBefore = currentText.slice(0, start).split("\n").length - 1;
  input.scrollTop = Math.max(
    0,
    linesBefore * lineHeight - input.clientHeight / 3,
  );
}

function renderResults(results) {
  const resultsEl = document.getElementById("results");
  const countEl = document.getElementById("resultCount");
  // 出力時に参照する最新の検出結果を保持し、エクスポートボタンの表示を切り替える
  _lastResults = results || [];
  updateExportButton();
  // 隠した指摘があるときは、戻すための行を先頭に出す
  const restoreHtml = ignoredGroups.size
    ? `<button type="button" onclick="restoreIgnored()" class="text-xs text-[#b35f00] font-bold text-left hover:bg-gray-50 rounded px-1 py-1">隠した指摘を戻す（${ignoredGroups.size}件）</button>`
    : "";
  if (!results || results.length === 0) {
    resultsEl.innerHTML =
      restoreHtml +
      '<p class="text-sm text-gray-500 text-center py-10 font-medium">ゆらぎは検知されていません</p>';
    countEl.textContent = "0 件";
    return;
  }
  countEl.textContent = `${results.length} 件`;

  const esc = typeof escapeHTML === "function" ? escapeHTML : (s) => s;
  let html = restoreHtml;
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
    // 正規表現で書いたルールも、利用者から見れば「基準表記」か「文脈確認」のどちらか
    const statusLabel =
      r.type === "pattern"
        ? r.recommended
          ? typeLabels.preferred
          : typeLabels.contextual
        : typeLabels[r.type] || "表記ルール";
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
          <span class="${word === r.recommended ? "text-[#b35f00] font-bold" : "text-gray-700"}">${esc(word)}${word === r.recommended ? "（基準）" : ""}${formsLabel(r.counts[countIndex], esc)}</span>
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
      <button type="button" onclick="ignoreResult(${resultIndex})" class="text-xs text-gray-500 text-left hover:bg-gray-50 rounded px-1 py-1" title="本文を読み込み直すまで、この指摘を一覧とハイライトから外します">この指摘を隠す</button>
    </div>`;
  });
  resultsEl.innerHTML = html;
}

/** 活用するルールで実際に出てきた形（例: 気づい・気づき）。辞書形だけでは原文と対応しないため添える。 */
function formsLabel(countItem, esc) {
  const forms = (countItem?.forms || []).filter(
    (form) => form !== countItem.word,
  );
  if (forms.length === 0) return "";
  const shown = forms.slice(0, 4).map(esc).join("・");
  return `<span class="block text-[11px] text-gray-500 font-medium">原文: ${shown}${forms.length > 4 ? " ほか" : ""}</span>`;
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
  selectRangeInInput(match.start, match.end);
}

/** 活用形タブ（Beta）の表記をクリックしたとき、原文の次の出現位置へ移動する。 */
function focusKuromojiOccurrence(resultIndex, baseIndex) {
  const item = _kuromojiResults[resultIndex]?.foundBases?.[baseIndex];
  if (!item?.occurrences?.length) return;
  const key = `kuromoji:${resultIndex}:${baseIndex}`;
  const nextIndex = occurrenceCursor.get(key) || 0;
  const match = item.occurrences[nextIndex % item.occurrences.length];
  occurrenceCursor.set(key, nextIndex + 1);
  selectRangeInInput(match.start, match.end);
}

function renderPreview(results) {
  const previewEl = document.getElementById("preview");
  const countEl = document.getElementById("previewCount");
  if (!previewEl) return;

  if (!currentText) {
    previewEl.innerHTML =
      '<span class="text-gray-500">ここにハイライト表示されます</span>';
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
  setKuromojiStatus(
    "loading",
    "解析用の辞書（約7MB）を読み込んでいます。10〜30秒ほどかかります",
  );
  try {
    await postToWorker("INIT_KUROMOJI", {});
    _kuromojiInitialized = true;
    setKuromojiStatus(
      "ready",
      "読み込み済み。本文を変えると自動で解析し直します",
    );
    if (btn) btn.classList.add("hidden");
    const options = document.getElementById("kuromojiOptions");
    if (options) options.classList.remove("hidden");
    // 語の区切りが使えるようになったので、検知結果も解析し直す
    // （runCheck の最後で活用形タブも更新される）
    runCheck();
  } catch (e) {
    setKuromojiStatus(
      "error",
      "読み込みに失敗しました。通信状態を確かめて、もう一度お試しください（" +
        e.message +
        "）",
    );
    if (btn) {
      btn.disabled = false;
      btn.textContent = "もう一度読み込む";
    }
  }
}

/** 「次回から自動で読み込む」の切り替え（設定はこの端末にだけ保存）。 */
function setKuromojiAutoLoad(enabled) {
  try {
    if (enabled) localStorage.setItem(KUROMOJI_AUTO_KEY, "1");
    else localStorage.removeItem(KUROMOJI_AUTO_KEY);
  } catch {
    // 保存できない環境（プライベートブラウズなど）では、今回だけ有効にする
  }
}

function isKuromojiAutoLoad() {
  try {
    return localStorage.getItem(KUROMOJI_AUTO_KEY) === "1";
  } catch {
    return false;
  }
}

function setKuromojiMessage(text, isError = false) {
  const el = document.getElementById("kuromojiResults");
  if (!el) return;
  _kuromojiResults = [];
  el.innerHTML = `<p class="text-sm ${isError ? "text-red-500 font-bold" : "text-gray-500"} text-center py-4">${text}</p>`;
}

async function runKuromojiAnalysis() {
  if (!_kuromojiInitialized) return;
  const text = currentText;

  if (!text.trim()) {
    setKuromojiMessage("本文を入力すると、ここに結果が出ます");
    return;
  }
  // 長すぎる文書は、ポップアップで止めずにタブ内で知らせる
  if (text.length > KUROMOJI_LIMIT) {
    setKuromojiMessage(
      `本文が長いため、このタブの解析は行っていません（${text.length.toLocaleString()}文字。上限は${KUROMOJI_LIMIT.toLocaleString()}文字）。章ごとに分けてお試しください。検知結果タブはそのまま使えます。`,
      true,
    );
    return;
  }

  try {
    const results = await postToWorker("KUROMOJI_ANALYZE", {
      text,
      dict: dictManager.getAll(),
    });
    // 解析中に本文が変わっていたら、古い結果は捨てる（位置がずれるため）
    if (text !== currentText) return;
    renderKuromojiResults(results);
  } catch (e) {
    console.error(e);
    setKuromojiMessage("解析中にエラーが発生しました。", true);
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
    setKuromojiMessage(
      "活用した形を含めても、表記の混在は見つかりませんでした",
    );
    return;
  }
  _kuromojiResults = results;
  const esc = typeof escapeHTML === "function" ? escapeHTML : (s) => s;
  // 検知結果タブと同じ見た目・同じ操作（表記を押すと原文の出現箇所へ移動）にそろえる
  let html = `<p class="text-xs text-gray-500">${results.length}件の語で表記が混在しています。表記を押すと原文の出現箇所へ移動します。</p>`;
  results.forEach((r, resultIndex) => {
    const rows = r.foundBases
      .map((item, baseIndex) => {
        const isPreferred = item.word === r.preferred;
        const surfaces = item.surfaces.slice(0, 4).map(esc).join("・");
        return `<button type="button" onclick="focusKuromojiOccurrence(${resultIndex}, ${baseIndex})"
                 class="flex justify-between text-xs py-1 px-1 -mx-1 rounded hover:bg-white text-left"
                 title="原文の次の出現箇所へ移動">
          <span class="${isPreferred ? "text-[#b35f00] font-bold" : "text-gray-700"}">${esc(item.word)}${isPreferred ? "（基準）" : ""}<span class="block text-[11px] text-gray-500 font-medium">原文: ${surfaces}${item.surfaces.length > 4 ? " ほか" : ""}</span></span>
          <span class="font-bold text-gray-500 ml-4">${item.count}件 ↗</span>
        </button>`;
      })
      .join("");
    html += `<div class="p-3 border border-[#ffe0b2] bg-white rounded-xl shadow-sm flex flex-col gap-1.5">
      <div class="text-sm font-bold text-[#0f0f0f]">${r.group.map(esc).join(" ・ ")}</div>
      <div class="text-xs text-gray-500">推奨表記: <strong class="text-[#d97706]">${esc(r.preferred || "指定なし（文書内で統一）")}</strong></div>
      ${r.reason ? `<div class="text-xs text-gray-600 bg-gray-50 rounded p-2">${esc(r.reason)}</div>` : ""}
      <div class="bg-gray-50 border border-gray-200 rounded p-2 flex flex-col">${rows}</div>
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
      '<p class="text-sm text-gray-500 text-center py-4 font-medium">テキストを入力してください</p>';
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
        '<p class="text-sm text-gray-500 text-center py-4 font-medium">ファジーマッチは検出されませんでした</p>';
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
  _kuromojiResults = [];
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

/** 辞書設定タブの操作結果を、ポップアップではなくタブ内に表示する。 */
function setDictStatus(text, isError = false) {
  const el = document.getElementById("dictStatus");
  if (!el) {
    if (isError) alert(text);
    return;
  }
  el.textContent = text;
  el.classList.toggle("hidden", !text);
  el.classList.toggle("text-red-500", isError);
  el.classList.toggle("text-gray-600", !isError);
}

function addCustomRule() {
  const input = document.getElementById("newRuleInput");
  // 日本語入力のままでも登録できるよう、全角カンマ・読点・タブも区切りとして受け付ける
  const words = [
    ...new Set(
      input.value
        .split(/[,，、\t]/)
        .map((s) => s.trim())
        .filter((s) => s),
    ),
  ];
  if (words.length >= 2) {
    dictManager.addCustomGroup(words);
    input.value = "";
    renderCustomDictList();
    runCheck();
    setDictStatus(
      `「${words[0]}」を基準表記として登録しました（${words.slice(1).join("・")} を指摘します）`,
    );
  } else {
    setDictStatus(
      "基準表記と、指摘したい表記を、カンマか読点で区切って2語以上入力してください（例: Web、ウェブ）",
      true,
    );
    input.focus();
  }
}

function renderCustomDictList() {
  const el = document.getElementById("customDictList");
  if (!el) return;
  const custom = dictManager.getCustom();
  if (custom.length === 0) {
    el.innerHTML =
      '<p class="text-xs text-gray-500 p-2">カスタム辞書はありません</p>';
    return;
  }
  const esc = typeof escapeHTML === "function" ? escapeHTML : (s) => s;
  const fixLabels = {
    auto: "自動修正可",
    confirm: "要確認",
    none: "自動修正なし",
  };
  el.innerHTML = custom
    .map(
      (rule, i) =>
        `<div class="flex justify-between items-center text-sm p-2 border-b border-gray-100 hover:bg-gray-50">
      <span class="text-gray-700 font-medium">${esc(rule.variants.join("、"))}<small class="block text-gray-500">基準: ${esc(rule.preferred || "なし")} ／ ${fixLabels[rule.fixMode] || "要確認"}</small></span>
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
        <span><strong>${pack.label}</strong><small class="block text-gray-500">${pack.description ? `${pack.description}（${pack.ruleCount}ルール）` : `${pack.ruleCount}ルール`}</small></span>
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
    setDictStatus(
      `JSON を読み込み、カスタム辞書を${dictManager.getCustom().length}件に置き換えました`,
    );
  } catch (err) {
    setDictStatus("読み込めませんでした: " + err.message, true);
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
    const added = dictManager.importDelimited(text, separator);
    renderCustomDictList();
    runCheck();
    setDictStatus(
      added > 0
        ? `${added}件を追加しました（各行の先頭が基準表記です）`
        : "追加できる行がありませんでした。1行に2語以上を、タブ（.tsv）またはカンマ（.csv）で区切ってください",
      added === 0,
    );
  } catch (err) {
    setDictStatus("読み込めませんでした: " + err.message, true);
  } finally {
    e.target.value = "";
  }
}

async function importPrhDict(e) {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const pack = file.name.replace(/\.(ya?ml)$/i, "");
    const result = dictManager.importPRH(await file.text(), { pack });
    renderCustomDictList();
    runDictValidation();
    runCheck();
    const notes = [`${result.added}件のprhルールを取り込みました`];
    if (result.skipped.length)
      notes.push(`未対応のため${result.skipped.length}件をスキップしました`);
    if (result.imports.length)
      notes.push(
        `imports（${result.imports.join(", ")}）は参照先ファイルを個別に読み込んでください`,
      );
    setDictStatus(notes.join("。"));
  } catch (err) {
    setDictStatus("読み込めませんでした: " + err.message, true);
  } finally {
    e.target.value = "";
  }
}

function exportPrhDict() {
  try {
    dictManager.exportPRH();
  } catch (err) {
    alert("書き出し失敗: " + err.message);
  }
}

// ---- 初期化 ----
document.addEventListener("DOMContentLoaded", () => {
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

  // 前回「次回から自動で読み込む」を選んでいれば、形態素解析を先に読み込んでおく
  if (isKuromojiAutoLoad()) {
    const autoLoad = document.getElementById("kuromojiAutoLoad");
    if (autoLoad) autoLoad.checked = true;
    initAndRunKuromoji();
  }
});
