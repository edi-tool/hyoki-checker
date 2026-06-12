/**
 * worker.js - Web Worker: 表記ゆれ/ファジー/活用形解析をオフスレッドで実行
 * プロトコル: メインから {id, type, payload} を受信し {id, type, results} を返す
 */

// 自身のURLのバージョンクエリ(?v=...)を取り込んだ各スクリプトへ伝播させ、
// デプロイ後に旧キャッシュが読まれるのを防ぐ
const _VER = self.location.search; // 例 '?v=20260612'（無ければ空文字）

// GitHub Pages環境でのパス解決を安定させるため ./ を付与
importScripts('./analyzer.js' + _VER);

// kuromoji内部の path.join は "//" を潰すため絶対URL(http://)を渡すと壊れる。
// Worker位置(js/worker.js)基準の相対パスを渡し、XHR解決に委ねる。
// これによりローカルでもGitHub Pagesのサブパス(/hyoki-checker/)でも正しく解決される。
self.KUROMOJI_DIC_PATH = '../dict/';
let _kuromojiLoaded = false;

function ensureKuromojiLoaded() {
  if (_kuromojiLoaded) return;
  importScripts(new URL('./kuromoji.js' + _VER, self.location.href).href);
  _kuromojiLoaded = true;
}

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
        // Kuromoji初期化済み かつ 高精度モード要求時のみ形態素境界で部分一致を除外
        const boundarySet = (payload.boundaryAware && isKuromojiReady())
          ? buildBoundarySet(payload.text || '')
          : null;
        const results = await analyzeAsync(payload.text || '', payload.dict || [], 50, boundarySet);
        send(id, results);
        break;
      }
      case 'FUZZY': {
        const results = fuzzyAnalyze(payload.text || '', payload.dict || [], payload.maxDistance || 1);
        send(id, results);
        break;
      }
      case 'INIT_KUROMOJI': {
        ensureKuromojiLoaded();
        await initKuromoji(self.KUROMOJI_DIC_PATH);
        send(id, true);
        break;
      }
      case 'KUROMOJI_ANALYZE': {
        ensureKuromojiLoaded();
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
