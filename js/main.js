/**
 * main.js - メインスレッドコントローラー
 * UIの更新とWeb Workerとの安全な非同期通信を担当する。
 */
document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("file-upload");
    const fileNameDisplay = document.getElementById("file-name");
    const startButton = document.getElementById("start-analysis");
    const resultsBody = document.getElementById("results-body");
    const matchCountDisplay = document.getElementById("match-count");
    const loadingIndicator = document.getElementById("loading-indicator");
    const statusText = document.getElementById("status-text");
    
    let selectedFile = null;
    let worker = null;
    let totalMatches = 0;

    // 検索対象の辞書定義（実際の運用では外部JSONファイルからの読み込みを推奨）
    // [45, 46] のような外部JSON読み込みアーキテクチャに容易に拡張可能。
    const dictionaryDefinition = {
        // 基本となる完全一致のターゲット
        exact: ["サーバ", "サーバー", "コンピュータ", "コンピューター", "ユーザー", "ユーザ", "行う", "行なう"],
        // 活用形展開アルゴリズムのトリガーとなる動詞の基本形
        verbs: ["行う", "認める", "分かる"], 
        // 正規化レイヤーでファジーマッチングを試行するベース単語
        fuzzy: ["シミュレーション", "インターフェース", "コミュニケーション"]
    };

    // ファイル選択イベント
    fileInput.addEventListener("change", (event) => {
        if (event.target.files.length > 0) {
            selectedFile = event.target.files;
            fileNameDisplay.textContent = `${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`;
            startButton.disabled = false;
        }
    });

    // 解析開始イベント
    startButton.addEventListener("click", () => {
        if (!selectedFile) return;

        // UIリセット
        resultsBody.innerHTML = "";
        totalMatches = 0;
        matchCountDisplay.textContent = "0";
        startButton.disabled = true;
        loadingIndicator.classList.remove("hidden");
        statusText.textContent = "ファイルのメモリ転送を準備中...";

        // ファイルをArrayBufferとして読み込む
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const arrayBuffer = e.target.result;
            const fileType = selectedFile.name.toLowerCase().endsWith('.pdf')? 'pdf' : 'docx';
            
            // 開発中（Beta）機能の有効化状態を取得
            const enableInflection = document.getElementById("enable-inflection").checked;
            const enableFuzzy = document.getElementById("enable-fuzzy").checked;

            // Workerを起動し、処理を移譲する
            initiateOffMainThreadProcessing(arrayBuffer, fileType, enableInflection, enableFuzzy);
        };

        reader.onerror = () => {
            alert("ファイルのローカル読み込みに失敗しました。");
            resetUI();
        };

        reader.readAsArrayBuffer(selectedFile);
    });

    /**
     * Web Workerを初期化し、Transferable Objectsを用いてデータを転送する
     */
    function initiateOffMainThreadProcessing(arrayBuffer, fileType, enableInflection, enableFuzzy) {
        // 以前のWorkerが存在する場合は安全に破棄し、メモリリークを防ぐ
        if (worker) worker.terminate();

        worker = new Worker("worker.js");

        // Workerからのメッセージ受信ハンドラ
        worker.onmessage = (e) => {
            const message = e.data;

            switch (message.type) {
                case 'STATUS':
                    // 進捗状況の更新
                    statusText.textContent = message.text;
                    break;
                case 'RESULTS_BATCH':
                    // 送られてきたチャンク（バッチ）をDOMに効率よくレンダリング
                    renderResultsBatch(message.data);
                    break;
                case 'COMPLETE':
                    statusText.textContent = "すべての解析が完了しました";
                    setTimeout(() => loadingIndicator.classList.add("hidden"), 1500);
                    startButton.disabled = false;
                    break;
                case 'ERROR':
                    alert("解析エンジンでエラーが発生しました: " + message.text);
                    resetUI();
                    break;
            }
        };

        // Transferable Objectsを利用したメッセージ送信
        // arrayBufferを配列に含めて第二引数に渡すことで、ポインタの移動のみで転送を完了させる 
        worker.postMessage({
            type: 'START',
            fileType: fileType,
            buffer: arrayBuffer,
            dictionary: dictionaryDefinition,
            options: {
                inflection: enableInflection,
                fuzzy: enableFuzzy
            }
        },); 
    }

    /**
     * Workerから送られてきたマッチ結果の配列を安全かつ高速にDOMに挿入する
     * @param {Array} matches - 検知結果の配列
     */
    function renderResultsBatch(matches) {
        if (!matches |

| matches.length === 0) return;

        // DocumentFragmentを利用して、DOMへのアクセスを1回にまとめる（Reflowの最小化） [41]
        const fragment = document.createDocumentFragment();

        matches.forEach(match => {
            const tr = document.createElement("tr");
            
            // 検知タイプセル
            const typeTd = document.createElement("td");
            const typeSpan = document.createElement("span");
            if (match.type === 'exact') {
                typeSpan.className = "tag tag-exact";
                typeSpan.textContent = "完全一致";
            } else if (match.type === 'inflection') {
                typeSpan.className = "tag tag-inflection";
                typeSpan.textContent = "活用形 (Beta)";
            } else {
                typeSpan.className = "tag tag-fuzzy";
                typeSpan.textContent = "ファジー (Beta)";
            }
            typeTd.appendChild(typeSpan);
            
            // 対象キーワードセル
            const targetTd = document.createElement("td");
            targetTd.style.fontWeight = "bold";
            targetTd.textContent = match.keyword;

            // コンテキスト（周辺テキスト）セル
            const contextTd = document.createElement("td");
            // XSS攻撃を防ぐためのHTMLエスケープ
            const safeContext = escapeHTML(match.context);
            const safeKeyword = escapeHTML(match.keyword);
            
            // ハイライト処理: 正規表現を動的生成し、安全にラップする
            try {
                // 特殊文字をエスケープして正規表現のクラッシュを防ぐ
                const escapedKeywordForRegex = safeKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`(${escapedKeywordForRegex})`, 'gi');
                const highlighted = safeContext.replace(regex, `<span class="context-highlight">$1</span>`);
                contextTd.innerHTML = highlighted;
            } catch (err) {
                // フォールバック
                contextTd.textContent = safeContext;
            }

            // 文字位置インデックスセル
            const positionTd = document.createElement("td");
            positionTd.textContent = `文字位置: ${match.index.toLocaleString()}`;

            // 行の組み立て
            tr.appendChild(typeTd);
            tr.appendChild(targetTd);
            tr.appendChild(contextTd);
            tr.appendChild(positionTd);
            
            fragment.appendChild(tr);
            totalMatches++;
        });

        // 構築したFragmentを一度にDOMに追加
        resultsBody.appendChild(fragment);
        matchCountDisplay.textContent = totalMatches.toLocaleString();
    }

    function resetUI() {
        loadingIndicator.classList.add("hidden");
        startButton.disabled = false;
        totalMatches = 0;
        matchCountDisplay.textContent = "0";
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] |

| tag)
        );
    }
});
