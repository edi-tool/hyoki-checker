/**
 * worker.js - バックグラウンドスレッドコントローラー
 * ドキュメントのバイナリ解析と、アナライザー（Aho-Corasickエンジン）への処理委譲を行う。
 */

// GitHub Pages等の静的ホスティングで安定稼働させるため、CDNからライブラリをロード [47]
importScripts('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js');
importScripts('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.21/mammoth.browser.min.js');

// 独自実装の解析エンジン（Aho-Corasickおよび正規化ロジック）をロード
importScripts('analyzer.js');

// pdf.jsの内部Worker設定（同じくCDNを指定）
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

self.onmessage = async function(e) {
    if (e.data.type === 'START') {
        const { fileType, buffer, dictionary, options } = e.data;
        
        try {
            self.postMessage({ type: 'STATUS', text: `ドキュメントの解析を開始...` });
            
            let extractedText = "";
            const startTime = performance.now();

            if (fileType === 'pdf') {
                extractedText = await extractTextFromPDF(buffer);
            } else if (fileType === 'docx') {
                extractedText = await extractTextFromDocx(buffer);
            }

            const extractionTime = ((performance.now() - startTime) / 1000).toFixed(2);
            self.postMessage({ 
                type: 'STATUS', 
                text: `テキスト抽出完了 (${extractedText.length.toLocaleString()}文字 / ${extractionTime}秒)。解析エンジンを構築中...` 
            });
            
            // Aho-Corasickエンジンのインスタンス化（Trieの構築）
            const analyzer = new DocumentAnalyzer(dictionary, options);
            
            self.postMessage({ type: 'STATUS', text: 'テキスト全体をスキャン中...' });
            
            // テキストの走査とバッチ結果のストリーミング送信 [42]
            analyzer.analyze(extractedText, (batchResults) => {
                // チャンク化された結果をメインスレッドに送信
                self.postMessage({ type: 'RESULTS_BATCH', data: batchResults });
            });

            self.postMessage({ type: 'COMPLETE' });

        } catch (error) {
            self.postMessage({ type: 'ERROR', text: error.message || error.toString() });
        }
    }
};

/**
 * PDFからのテキスト抽出処理
 * メモリリーク（OOM）を防ぐため、ページごとに逐次的に処理し、プロミスを解決する 
 */
async function extractTextFromPDF(arrayBuffer) {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // ページ内の全テキストアイテムを抽出して結合
        const pageText = textContent.items.map(item => item.str).join(" ");
        fullText += pageText + "\n";
        
        // メインスレッドのUIを更新するための進捗通知
        if (i % 5 === 0 || i === pdf.numPages) {
            self.postMessage({ 
                type: 'STATUS', 
                text: `PDF読み込み中: ${i} / ${pdf.numPages} ページ` 
            });
        }
    }
    return fullText;
}

/**
 * Word (.docx) からのテキスト抽出処理
 * Mammoth.jsを使用してXMLから純粋なテキストのみを高速に抽出 
 */
async function extractTextFromDocx(arrayBuffer) {
    self.postMessage({ type: 'STATUS', text: `DOCXのXML構造を展開中...` });
    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
    return result.value;
}
