# 進捗: Web Worker 経由の表記ゆれチェック

## コミット履歴（最新）

| コミット | 内容 |
|---|---|
| `ff48812` | Refactor: extract inline scripts from index.html into js/app.js, fix DOMContentLoaded execution order bug |
| `25674a4` | Lazy-load kuromoji in worker + update progress.md to match current architecture |
| `72b5a28` | Fix: restore working analyzer/worker for ANALYZE protocol and renderResults counts display |

## 現在のアーキテクチャ

| ファイル | 役割 |
|---|---|
| `index.html` | UIシェル（マークアップのみ、defer スクリプト読込） |
| `js/app.js` | **新規** UIロジック全体：Worker通信・イベント登録・描画関数・初期化（DOMContentLoaded） |
| `js/worker.js` | Worker: `ANALYZE` / `FUZZY` / `INIT_KUROMOJI` / `KUROMOJI_ANALYZE` を処理 |
| `js/analyzer.js` | `analyze` / `analyzeAsync` / `fuzzyAnalyze` / `kuromojiAnalyze` / `buildHighlightedHTML` / `escapeHTML` |
| `js/defaultDict.js` | 同義語グループ辞書（492エントリ） |
| `js/dictManager.js` | カスタム辞書管理（localStorage + JSON/TSV/CSV import） |

**削除済:**
- `js/main.js` — 旧アーキテクチャ用（コミット `ff48812` で削除）

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

## リファクタリング内容（コミット `ff48812`）

**問題の根本原因:**
- index.html 行353の inline script（defer 無し）が、`new DictionaryManager()` を呼び出していた。
- `DictionaryManager` は `js/dictManager.js` 由来で `<script defer>` で読み込まれるため、
  HTML パース中には未定義 → ReferenceError → 以降の関数定義・イベントリスナーが走らない。

**解決方法:**
1. index.html の inline script（17-31行, 353-779行）を全て `js/app.js` に移動。
2. `js/app.js` を `<script defer src="js/app.js">` で読込（defer により依存スクリプト完全ロード後に実行）。
3. 初期化を `DOMContentLoaded` で一元化（`setTimeout` 遅延ハック廃止）。
4. Word/PDF 読込時にライブラリ存在チェック追加（pdfjsLib, mammoth）。
5. `.txt` ファイル対応追加。
6. `js/main.js` 削除（未使用）。

**構文検査:** `node --check js/app.js` 通過済み。

## 整合性修正（2026-04-21）

| コミット | 内容 |
|---|---|
| `fix: align primary color with DESIGN.md and remove stale SW registration` | PR [#9](https://github.com/edi-tool/hyoki-checker/pull/9) → main マージ済み |

**修正内容:**
- `style.css`: `.btn-primary`・`.tab-btn.active`・`.drop-zone:hover` の色 #118e9e（青）→ #f28c06（オレンジ）に統一（DESIGN.md 準拠）
- `index.html`: インライン Tailwind クラスの色参照を一括置換（#118e9e/#0e7784/#f0fbfc/#b2ebf2 → オレンジ系）
- `js/app.js`: 旧 Service Worker 登録コード3行削除（sw.js は削除専用スクリプトのため不要）

## バックエンド実装（PR #10、2026-04-21）

| ファイル | 内容 |
|---|---|
| `backend/main.py` | FastAPI v2（lifespan, CORS, /analyze, /dict/custom, /dict/info） |
| `backend/analyzer.py` | Aho-Corasick + SudachiPy 自動検知 |
| `backend/chunker.py` | テキスト分割 |
| `backend/dict_manager.py` | 階層辞書管理 |
| `backend/models.py` | Pydantic モデル |
| `Dockerfile` | ルートに配置、絶対パス指定 |
| `render.yaml` | `env: docker` で Render Blueprint 設定 |

### Render デプロイ状況
- Render サービス名: `hyoki-checker-api`
- 3度のビルド失敗（requirements.txt パス問題）→ `env: docker` + 絶対パス指定で修正済み（コミット `f36ee65`）
- ✅ デプロイ成功後に `js/app.js` の `API_BASE` を Render URL に更新予定

### フロントエンド修正（2026-04-21）

| 対応 | 内容 |
|---|---|
| favicon | `favicon.png` を `index.html` で参照（`<link rel="icon">`） |
| PDF.js cMapUrl | `pdfjsLib.getDocument()` に `cMapUrl` / `cMapPacked` 追加（日本語PDF文字化け防止） |
| Tailwind | CDN スクリプト除去 → CLI ビルド済み `style.dist.css` に移行 |

## 現在の状態

✅ main ブランチ最新・PR #9・#10 マージ済み
⏳ Render デプロイ確認待ち（コミット `f36ee65`）

## 実用性検証（2026-06-12）

テスト用docx（表記揺れ混入575字）をローカルで投入し全機能を検証。

### 動作OK
- docx読込（mammoth、表内テキストも抽出）／基本検出7グループ（再現率良好）
- プレビューハイライト（非推奨形を<mark>表示）
- カスタム辞書追加→即時再解析OK（localStorage）
- 5万字でも解析12ms（フロントのみで書籍1章は十分高速）

### バグ・重大課題
1. **Kuromoji活用形が動作不能**: `worker.js` L10 の絶対URLがkuromoji内部で壊れ `GET /localhost:8000/dict/...` 404。`KUROMOJI_DIC_PATH` を `'/dict/'` 等に修正要
2. **「修正済みWord出力」が未修正のまま出力**: 置換機能が未実装（`replacementLog` は宣言のみ）。原文を書式なしdocx化するだけでボタン名と乖離
3. **部分文字列の重複カウント**: `analyzer.js` analyze() が単純match()のため「サーバー」が「サーバ」にも加算→出現数逆転し推奨形が誤る
4. **推奨形=最多出現**: 出版社の表記基準と無関係。基準側を「正」と指定する仕組みなし
5. **ファジー検出はノイズ過多**: 「子ど」「業づく」等の断片が大量、実用困難
6. **API_BASE未設定**: バックエンドは未接続（>5,000字でもフロント処理）

### 実務判定
「揺れの気づき」用途なら現状でも可。Word校閲フロー（変更履歴・書式保持）には未対応のため、修正はWord側で手動が前提。優先度: 3→1→2。

## 高精度・安定化対応（2026-06-12 続き）

### タスクA: ファジー検出のノイズ除去（js/analyzer.js, 既存JSのみ）
- 全位置×全長の窓走査 → 文字種・句読点で区切ったセグメント連結のみを候補化（断片「業づく」等が原理的に消滅）。
- 包含関係（接頭/接尾/助詞付着）を除外、同字数の置換のみ照合、末尾1字ひらがな助詞を境界扱い。
- 結果：ノイズ7件→0、真の誤字（子とも/サーパ/基づつ）のみ検出。31k字47ms。
- 追加関数: _charClass / _segmentText / _isParticle、fuzzyAnalyze 全面改訂。

### タスクB: 語境界の誤検知抑制（Kuromoji連携）
- analyzeGroup に boundarySet 引数追加（トークン境界に整合する一致のみ計上）。
- buildBoundarySet(text)：word_position からトークン境界集合を構築。
- worker ANALYZE に boundaryAware フラグ、app は _kuromojiInitialized 時に付与＋init後 runCheck 再実行。
- 効果：「本州」内の「本」を除外（2→1）。ただし未知の固有名詞「子供会館」はKuromojiが子供|会館に分割するため対象外（限界）。

### 共通基盤の修正（先行）
- analyzeAsync(本番経路) が旧二重計上のままだった点を analyzeGroup 共有で解消。
- 同数時は辞書先頭（正規表記）を推奨する決定的タイブレークで結果を安定化。
