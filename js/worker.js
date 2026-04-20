/**
 * worker.js - Web Worker: 表記ゆれ/ファジー/活用形解析をオフスレッドで実行
 * プロトコル: メインから {id, type, payload} を受信し {id, type, results} を返す
 */

importScripts('https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/build/kuromoji.js');
importScripts('analyzer.js');

self.KUROMOJI_DIC_PATH = 'https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict/';

function send(id, results) {
  self.postMessage({ id, type: 'RESULT', results });
}
function sendError(id, err) {
  self.postMessage({ id, type: 'ERROR', message: err && err.message ? err.message : String(err) });
}

self.onmessage = async function (e) {
  const { id, type, payload } = e.data || {};
  try {
    switch (type) {
      case 'ANALYZE': {
        const results = await analyzeAsync(payload.text || '', payload.dict || []);
        send(id, results);
        break;
      }
      case 'FUZZY': {
        const results = fuzzyAnalyze(payload.text || '', payload.dict || [], payload.maxDistance || 1);
        send(id, results);
        break;
      }
      case 'INIT_KUROMOJI': {
        await initKuromoji(self.KUROMOJI_DIC_PATH);
        send(id, true);
        break;
      }
      case 'KUROMOJI_ANALYZE': {
        const results = kuromojiAnalyze(payload.text || '', payload.dict || []);
        send(id, results);
        break;
      }
      default:
        sendError(id, new Error('Unknown message type: ' + type));
    }
  } catch (err) {
    sendError(id, err);
  }
};
