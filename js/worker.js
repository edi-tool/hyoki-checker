// CDNや別ファイルの読み込み（パスは環境に合わせて調整してください）
importScripts('https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/build/kuromoji.js');
importScripts('analyzer.js'); // ロジックが書かれたファイル

self.onmessage = async function(e) {
  const { id, type, payload } = e.data;

  try {
    switch (type) {
      case 'ANALYZE':
        // analyzer.js の同期版 analyze 関数を使用
        const analyzeResults = analyze(payload.text, payload.dict);
        self.postMessage({ id, type: 'ANALYZE_DONE', results: analyzeResults });
        break;

      case 'FUZZY':
        const fuzzyResults = fuzzyAnalyze(payload.text, payload.dict, payload.maxDistance);
        self.postMessage({ id, type: 'FUZZY_DONE', results: fuzzyResults });
        break;

      case 'INIT_KUROMOJI':
        await initKuromoji();
        self.postMessage({ id, type: 'KUROMOJI_READY' });
        break;

      case 'KUROMOJI_ANALYZE':
        const kuromojiResults = kuromojiAnalyze(payload.text, payload.dict);
        self.postMessage({ id, type: 'KUROMOJI_DONE', results: kuromojiResults });
        break;
    }
  } catch (error) {
    self.postMessage({ id, type: 'ERROR', message: error.message });
  }
};