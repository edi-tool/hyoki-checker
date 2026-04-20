# 進捗: Web Worker 経由の表記ゆれチェック ✅

## 現在のアーキテクチャ

| ファイル | 役割 |
|---|---|
| `index.html` | UIシェル・Worker通信・タブ切替・ハイライト描画 |
| `js/worker.js` | Worker: `ANALYZE` / `FUZZY` / `INIT_KUROMOJI` / `KUROMOJI_ANALYZE` を処理 |
| `js/analyzer.js` | `analyze` / `analyzeAsync` / `fuzzyAnalyze` / `kuromojiAnalyze` / `buildHighlightedHTML` / `escapeHTML` |
| `js/defaultDict.js` | 同義語グループ辞書（492エントリ） |
| `js/dictManager.js` | カスタム辞書管理（localStorage + JSON/TSV/CSV import） |

※ `js/main.js` は旧アーキテクチャ用で現在 index.html からは参照されない（将来削除候補）。

---

## Worker プロトコル

送信: `{ id, type, payload }`
受信: `{ id, type: 'RESULT', results }` または `{ id, type: 'ERROR', message }`

| type | payload | 戻り値 |
|---|---|---|
| `ANALYZE` | `{ text, dict }` | `[{ group, recommended, counts[], others[] }]` |
| `FUZZY` | `{ text, dict, maxDistance }` | `[{ dictWord, group, candidates[] }]` |
| `INIT_KUROMOJI` | `{}` | `true` |
| `KUROMOJI_ANALYZE` | `{ text, dict }` | `[{ group, recommendedWord, foundBases[] }]` |

kuromoji は `INIT_KUROMOJI`/`KUROMOJI_ANALYZE` 呼び出し時に遅延 importScripts（CDN失敗時も ANALYZE/FUZZY は継続動作）。

---

## 表示フォーマット（検知結果タブ）

グループ内の各バリアント＋出現件数を並べる形式:

```
ウェブ・web・ウエブ
  ウェブ   2件
  web     2件
  ウエブ   1件
```

---

## 検証済み

- ✅ `analyze()` が `{group, recommended, counts, others}` を正しく返却（Node実測）
- ✅ Worker プロトコルとの整合（index.html `postToWorker` ↔ worker.js `onmessage`）
- ✅ kuromoji 遅延ロード（起動時 CDN 失敗でも通常解析は動作）

## 保留事項

- [ ] ブラウザ実機で全タブ（通常/活用形/ファジー/辞書管理）動作確認
- [ ] `js/main.js` 削除（未使用）
