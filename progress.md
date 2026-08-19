# 進捗: Web Worker 経由の表記ゆれチェック

## 現在の状態（2026-07-17 時点）

| 項目       | 状態                                                                       |
| ---------- | -------------------------------------------------------------------------- |
| main       | `0a444b6`                                                                  |
| ブランチ   | リモートは `main` のみ（マージ済みブランチは全て削除）                     |
| PR         | open なし                                                                  |
| open Issue | #15（JTF全ルール）、#16（prh辞書）、#27（ファジー精度）                    |
| 動作形態   | フロント単体（`js/app.js` の `API_BASE` は空。backend は任意構成で未接続） |
| テスト     | `npm test` 9件、`npm run validate:rules` 5パック179ルール、backend pytest  |
| Tailwind   | 4.3.2（`style.dist.css` はコミット管理。CI無しのため手動再生成が必要）     |

古いコミット履歴表（`ff48812` 等）は情報が古くなったため削除した。履歴は `git log` を参照。

## 現在のアーキテクチャ

| ファイル             | 役割                                                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `index.html`         | UIシェル（マークアップのみ、defer スクリプト読込）                                                                           |
| `js/app.js`          | **新規** UIロジック全体：Worker通信・イベント登録・描画関数・初期化（DOMContentLoaded）                                      |
| `js/worker.js`       | Worker: `ANALYZE` / `FUZZY` / `INIT_KUROMOJI` / `KUROMOJI_ANALYZE` を処理                                                    |
| `js/analyzer.js`     | `analyze` / `analyzeAsync` / `fuzzyAnalyze` / `kuromojiAnalyze` / `buildHighlightedHTML` / `escapeHTML`                      |
| `js/defaultDict.js`  | **生成ファイル**（`GENERATED_RULES`／5パック179ルール）。原本は `rules/packs/`、`npm run build:rules` で生成。直接編集しない |
| `js/dictManager.js`  | カスタム辞書管理（localStorage + JSON/TSV/CSV import、パックON/OFF）                                                         |
| `js/documentText.js` | PDF.js の断片から改行・語間を復元してテキスト化                                                                              |

**削除済:**

- `js/main.js` — 旧アーキテクチャ用（コミット `ff48812` で削除）

---

## Worker プロトコル

送信: `{ id, type, payload }`
受信: `{ id, type: 'RESULT', results }` または `{ id, type: 'ERROR', message }`

| type               | payload                       | 戻り値                                         |
| ------------------ | ----------------------------- | ---------------------------------------------- |
| `ANALYZE`          | `{ text, dict }`              | `[{ group, recommended, counts[], others[] }]` |
| `FUZZY`            | `{ text, dict, maxDistance }` | `[{ dictWord, group, candidates[] }]`          |
| `INIT_KUROMOJI`    | `{}`                          | `true`                                         |
| `KUROMOJI_ANALYZE` | `{ text, dict }`              | `[{ group, recommendedWord, foundBases[] }]`   |

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

---

# セッション別の経緯（履歴）

ここから下は時系列の作業記録。**冒頭の「現在の状態」が最新**であり、以下に含まれる
「未解決」「予定」の記述は後のセッションで解消されている場合がある（解消済みのものには
取り消し線と注記を付けている）。

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

| コミット                                                                   | 内容                                                                        |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `fix: align primary color with DESIGN.md and remove stale SW registration` | PR [#9](https://github.com/edi-tool/hyoki-checker/pull/9) → main マージ済み |

**修正内容:**

- `style.css`: `.btn-primary`・`.tab-btn.active`・`.drop-zone:hover` の色 #118e9e（青）→ #f28c06（オレンジ）に統一（DESIGN.md 準拠）
- `index.html`: インライン Tailwind クラスの色参照を一括置換（#118e9e/#0e7784/#f0fbfc/#b2ebf2 → オレンジ系）
- `js/app.js`: 旧 Service Worker 登録コード3行削除（sw.js は削除専用スクリプトのため不要）

## バックエンド実装（PR #10、2026-04-21）

| ファイル                  | 内容                                                             |
| ------------------------- | ---------------------------------------------------------------- |
| `backend/main.py`         | FastAPI v2（lifespan, CORS, /analyze, /dict/custom, /dict/info） |
| `backend/analyzer.py`     | Aho-Corasick + SudachiPy 自動検知                                |
| `backend/chunker.py`      | テキスト分割                                                     |
| `backend/dict_manager.py` | 階層辞書管理                                                     |
| `backend/models.py`       | Pydantic モデル                                                  |
| `Dockerfile`              | ルートに配置、絶対パス指定                                       |
| `render.yaml`             | `env: docker` で Render Blueprint 設定                           |

### Render デプロイ状況

- Render サービス名: `hyoki-checker-api`
- 3度のビルド失敗（requirements.txt パス問題）→ `env: docker` + 絶対パス指定で修正済み（コミット `f36ee65`）
- ✅ デプロイ成功後に `js/app.js` の `API_BASE` を Render URL に更新予定

### フロントエンド修正（2026-04-21）

| 対応           | 内容                                                                               |
| -------------- | ---------------------------------------------------------------------------------- |
| favicon        | `favicon.png` を `index.html` で参照（`<link rel="icon">`）                        |
| PDF.js cMapUrl | `pdfjsLib.getDocument()` に `cMapUrl` / `cMapPacked` 追加（日本語PDF文字化け防止） |
| Tailwind       | CDN スクリプト除去 → CLI ビルド済み `style.dist.css` に移行                        |

### 当時の状態（2026-04-21 時点・履歴）

✅ PR #9・#10 マージ済み / ⏳ Render デプロイ確認待ち（コミット `f36ee65`）

> その後 PR #22（`fix: render.yaml を Docker 構成に戻しデプロイ失敗を解消`）で解消。
> ただし `js/app.js` の `API_BASE` は空のままで、backend は接続していない（フロント単体で動作）。

## 実用性検証（2026-06-12）

テスト用docx（表記揺れ混入575字）をローカルで投入し全機能を検証。

### 動作OK

- docx読込（mammoth、表内テキストも抽出）／基本検出7グループ（再現率良好）
- プレビューハイライト（非推奨形を<mark>表示）
- カスタム辞書追加→即時再解析OK（localStorage）
- 5万字でも解析12ms（フロントのみで書籍1章は十分高速）

### バグ・重大課題

1. ~~**Kuromoji活用形が動作不能**: `worker.js` L10 の絶対URLがkuromoji内部で壊れ `GET /localhost:8000/dict/...` 404~~ → **解消済み**（PR #5。現在 `js/worker.js:16` は `self.KUROMOJI_DIC_PATH = '../dict/'`）
2. ~~**「修正済みWord出力」が未修正のまま出力**: 置換機能が未実装（`replacementLog` は宣言のみ）~~ → **解消済み（2026-06-17、本ファイル参照）**
3. ~~**部分文字列の重複カウント**: `analyzer.js` analyze() が単純match()のため「サーバー」が「サーバ」にも加算~~ → **解消済み**（2026-06-12「共通基盤の修正」で `analyzeGroup` を共有化、形態素境界フィルタを追加）
4. ~~**推奨形=最多出現**: 出版社の表記基準と無関係~~ → **解消済み**（2026-07-14「基準表記の固定」。`recommended` は常にルールの `preferred`、最多表記は `observedMajority` として分離）
5. **ファジー検出はノイズ過多**: 「子ど」「業づく」等の断片が大量、実用困難
   → 2026-06-12 のタスクAで一度は改善したが、**2026-07-17 の再実測で依然として実用水準になし**。
   非表示化（課題#12 / `a48b647`）のうえ課題#27として再設計待ち。本ファイル後半を参照。
6. **API_BASE未設定**: バックエンドは未接続（>5,000字でもフロント処理）。2026-07-17 時点も `API_BASE = ""` のまま

### 実務判定

「揺れの気づき」用途なら現状でも可。Word校閲フロー（変更履歴・書式保持）には未対応のため、修正はWord側で手動が前提。優先度: 3→1→2。

## 高精度・安定化対応（2026-06-12 続き）

### タスクA: ファジー検出のノイズ除去（js/analyzer.js, 既存JSのみ）

- 全位置×全長の窓走査 → 文字種・句読点で区切ったセグメント連結のみを候補化（断片「業づく」等が原理的に消滅）。
- 包含関係（接頭/接尾/助詞付着）を除外、同字数の置換のみ照合、末尾1字ひらがな助詞を境界扱い。
- 結果：ノイズ7件→0、真の誤字（子とも/サーパ/基づつ）のみ検出。31k字47ms。
- 追加関数: \_charClass / \_segmentText / \_isParticle、fuzzyAnalyze 全面改訂。

> **注記（2026-07-17）**: 上記「ノイズ0」は限られたテスト文での結果であり、**一般の文章では再現しない**。
> 誤字を含まない教育書ふうの文章で13件の誤検知が出るうえ、`common` の数え方の不整合により
> 長音を含むカタカナ語の誤字を構造的に見逃す。詳細は本ファイル後半および課題#27。

### タスクB: 語境界の誤検知抑制（Kuromoji連携）

- analyzeGroup に boundarySet 引数追加（トークン境界に整合する一致のみ計上）。
- buildBoundarySet(text)：word_position からトークン境界集合を構築。
- worker ANALYZE に boundaryAware フラグ、app は \_kuromojiInitialized 時に付与＋init後 runCheck 再実行。
- 効果：「本州」内の「本」を除外（2→1）。ただし未知の固有名詞「子供会館」はKuromojiが子供|会館に分割するため対象外（限界）。

### 共通基盤の修正（先行）

- analyzeAsync(本番経路) が旧二重計上のままだった点を analyzeGroup 共有で解消。
- 同数時は辞書先頭（正規表記）を推奨する決定的タイブレークで結果を安定化。

## 置換機能・テスト環境（2026-06-17）

### 置換機能の実装（progress重大課題#2を解消）

- 課題: 「修正済みWord出力」が置換せず原文をdocx化するだけだった（replacementLog宣言のみ）。
- 対応: downloadCorrectedDocx を改修し、検出結果(\_lastResults)の各グループの非推奨表記を推奨表記へ一括置換して出力。
- replaceGroup(js/analyzer.js): プレースホルダ方式に修正。推奨表記を退避→非推奨語を長さ降順で置換→復元。「サーバ」が既存「サーバー」内を二重置換する不具合を解消。
- ボタン: id=exportDocxBtn、検出>0かつ本文ありで表示。出力後 replacementBadge に統一箇所数を表示。
- ボタン名: 「修正済みWordを出力」→「推奨表記に統一してWord出力」。
- キャッシュ破棄: APP_VERSION/index.html ?v= を 20260617 に更新。

### テスト環境

- neologdn 未インストールで pytest collection 失敗していた → インストールで解消（requirements.txt には既出）。backend/tests 12件パス。

---

## 2026-07-14 セッション

- **バグ修正**: 左カラムに右パネルと同じタブバーが重複し、`tabBtn-results`/`resultCount` が
  ID二重定義になっていた。`getElementById` が左の未使用要素を拾い、タブのアクティブ表示と
  「○件」バッジが更新されない不具合。重複タブバーを削除し、Betaバッジを右パネルへ移設。
  （JS未変更のため `?v=` の更新は不要）
- **デザイン統一**: `style.css` / `style.dist.css` 末尾にプレーンCSSで共通ブロックを追記
  （フォント実効スタック・`:focus-visible`・`prefers-reduced-motion`・ヘッダー色/フッター背景の統一）。
  CSSキャッシュ対策で index.html の stylesheet 参照に `?v=20260714` を付与。`theme-color` 追加。
- **SEO**: index.html がフロントマター無しの静的ファイルで description/OGP/canonical が欠落し
  sitemap にも載らなかったため、`layout: null` フロントマターを付与し description・robots・canonical・
  OGP一式・`twitter:card`・JSON-LD(WebApplication) を追加。`_config.yml` に `url`/`baseurl` と
  `jekyll-sitemap` プラグインを追加。

### Word/PDF 実用性改善

- **基準表記の固定**: 辞書グループ先頭を基準表記として扱うよう変更。従来の「最多出現を推奨」では、
  誤表記が多数派の文書で誤った統一先になっていた。基準外表記しか存在しない文書も指摘対象にした。
- **検出位置の一貫利用**: analyzer が occurrence（word/start/end）を返し、プレビューとWord置換は
  実際に数えた位置だけを使用。形態素境界で除外した語まで置換する不整合を解消した。
- **結果から原文へ移動**: 結果カード内の表記・件数をクリックすると、textarea の該当箇所を順番に選択。
  「表記ゆれ」と「基準外表記」をバッジで区別し、基準表記を明示した。
- **PDF文字復元**: `js/documentText.js` を追加。PDF.js の `TextItem.hasEOL`・座標・幅を使い、
  改行を保持しつつ、日本語断片は直結、欧文の離れた断片には空白を補う。ページ間は空行で分離。
- **入力状態の可視化**: ファイル名、PDFページ数、文字取得ページ数、抽出文字数を表示。
  文字を取得できないスキャンPDFにはOCRが必要であることを案内。
- **Word出力の限界を明示**: 出力は書式・画像・変更履歴を保持しない新規Wordである旨をボタンとREADMEに追記。
- **テスト**: Node標準テストを追加（基準表記、単独違反、包含語、位置連動置換、PDF復元の5件）。
  `npm test` は5件成功。初回のバックエンドpytestは実行環境に `pyahocorasick` / `neologdn` がなく収集失敗。
- **実画面検証**: ローカルサーバーはHTTP 200を確認したが、アプリ内ブラウザ隔離環境からホスト側
  localhostへ到達できず未実施。JS構文検査とフロント自動テストで代替。
- **調査**: PDF.js、Mammoth.js、kuromoji.js、textlint の公式リポジトリを比較。
  新規の大型依存は追加せず、導入済みPDF.jsの情報を活用する実装を採用。

### 構造化ルール基盤・安全な外部基準追加

- **批判的検証**: JTF第3.0版がCC BY 4.0であることは公式ページと原文で確認できた。一方、
  文化庁資料について資料固有のオープンライセンス表示を確認できなかったため、原文転載はせず、
  出典付きの事実記述・検出パターンだけを収録。文化庁パックは初期OFF・`fixMode:none` とした。
- **構造化ルール**: `id/type/preferred/variants/category/severity/fixMode/source` を必須化。
  `preferred/consistency/contextual/forbidden/pattern/spelling` を検証スクリプトと解析器で受理する。
  `recommended` は常にルールの `preferred`、原稿内最多表記は `observedMajority` として分離。
- **安全な置換**: Word一括置換は `fixMode:auto` の検出位置だけが対象。`confirm/none`、
  `consistency/contextual`、Sudachi同義語・正規化候補は置換しない。実行前に対象・対象外件数を確認表示。
- **旧辞書移行**: 現行デフォルト170群をcompanyパックへ移行し、未再監査ルールは一律`confirm`。
  旧カスタム`string[][]`も読み込み時に構造化して`confirm`に移行する。
- **意味語監査**: 「子ども/児童」「教師/先生/教員」「保育所/保育園」「諸感覚/五感」
  「見取り/評価/アセスメント」に加え、教育分野の同義とは限らない複数群を`contextual/none`へ移行。
- **パック**: company、jtf-3.0、bunka-official、consistency-onlyを独立ON/OFF可能にした。
  優先順位は custom > company > 外部基準（manifest順でJTF→文化庁） > consistency-only。
- **単一生成元**: `rules/packs/`を原本とし、`scripts/build-rules.mjs`からフロントとバックエンドへ
  同一データを生成。旧`backend/convert_dict.py`は削除。`validate-rules.mjs`とJSON Schemaを追加。
- **ライセンス**: `NOTICE`と`THIRD_PARTY_LICENSES`にJTFのCC BY 4.0帰属・加工表示、文化庁資料名・
  取得日・加工方針を追記。コードのMITと外部由来ルールデータの条件を分離し、package.jsonもMITへ統一。
- **検証**: ルール179件を検証・生成。フロント9テスト、バックエンド14テスト、JS/Python構文検査が成功。

#### 未解決事項

- JTFパックは機械判定が安全な少数ルールのみ。全項目の追加には例外条件の人手レビューが必要。
- 文化庁パック拡張前に、追加する各資料の最新利用条件を個別確認する。
- companyの旧ルールは`confirm`から開始しており、`auto`昇格には語境界・文脈・置換テストが必要。
- 同順位の外部パック同士はmanifest順で解決する。将来、競合内容をUIで可視化する余地がある。

## 2026-07-17 セッション

### リポジトリ整理（ブランチ・PR）

- **ブランチ削除**: リモート8本・ローカル6本を削除し、リモートは`main`のみに整理。
  削除前に全ブランチの差分を検証し、mainに未取り込みの固有変更が無いことを確認した。
  このリポジトリはsquashマージのため`git branch --no-merged`に大量のブランチが残るが、
  実体はmainが先行している。唯一mainに存在しない`backend/convert_dict.py`も、
  `1a94ab3`で意図的に削除済みであることを確認（本ファイル「単一生成元」項に記載のとおり）。
- **Dependabot PR統合**: #24（`@tailwindcss/cli`）と#25（`tailwindcss`）は片方ずつの更新のため、
  個別マージでは`@tailwindcss/cli`配下に`tailwindcss@4.2.3`が入れ子で残る。
  両方を同時に4.3.2へ上げてdedupeし、PR #26として統合・マージ。#24/#25はクローズ済み。

### style.dist.css のソース同期ずれを修正（PR #26）

- Tailwind 4.3.2 での再生成時に、**コミット済みの`style.dist.css`がソースに対して古い**ことが判明。
  以下は実際に使用されているのに生成物へ含まれておらず、本番でスタイルが当たっていなかった。
  - `text-yellow-800` / `border-yellow-200`（`js/app.js:235`）
  - `whitespace-nowrap`（`js/app.js:265`）、`text-left` / `-mx-1`（`js/app.js:250`）
  - `grid-cols-1`（`index.html:380`）
- 削除されたクラス（`.transition`、`.truncate`、`.mx-1`、`.text-4xl`等）はいずれも未使用と確認。
  `transition-colors`等の実使用バリアントは維持されている。
- **検証**: `npm test` 9件、`npm run validate:rules` 179ルール、ローカルサーバーでの表示確認。

### 課題#13（検出件数）の再現確認

- 再現せず。デバウンスより速い連続入力でレースを誘発しても`resultCount`は常に正確だった
  （`サーバ/サーバー`＋`ユーザ/ユーザー`→「2 件」、3グループ入力→「3 件」）。PR #11の修正が有効。

### ファジー検出を非表示化（課題#12 → `a48b647`）

- `tabBtn-fuzzy`に`hidden`を付与。実行導線がタブ内のボタンのみのため機能ごと停止する。
  既存tab-paneと同様`flex`を残して`hidden`を重ねており、再開時は`hidden`を外すだけでよい
  （生成CSSで`.hidden`は`.flex`より後に定義されるため打ち勝つ）。実装は`js/analyzer.js`に維持。
- 隠した機能を宣伝しないよう`index.html`のdescriptionとREADMEの機能一覧を実態に合わせた。
- 副次的にタブバーが1行に収まった（従来は「辞書設定」が2行目へ折り返していた）。

#### 再表示可否の実測（課題#27として記録）

「ある程度機能していれば再表示」の方針で精度を実測したが、**再表示できる水準になかった**。

- **誤検知**: 誤字を含まない教育書ふう文章（6行）で13件すべて誤検知
  （本時→本案、では/には→又は、対話→お話、整合→割合、育成→育む、き出→届出 等）。
  `き出`のような語断片が出る点は`js/analyzer.js:430`のdocstringの主張と矛盾する。
- **見逃し**: 意図的な誤字「サーハー」「コンヒューター」を両方とも検出できず（正解0件）。
- **原因**: `js/analyzer.js:482-490`の事前枝刈りが不整合。`common`はSetで重複排除した
  ユニーク文字数なのに、閾値は文字列長基準（`combined.length - maxDistance`）。
  長音「ー」等の重複文字を含む語はユニーク文字数が閾値に届かず**構造的に必ず枝刈りされる**。
  カタカナ語の大半が長音を含むため、最も有用なはずの領域が丸ごと機能していない。
- 枝刈りの修正自体は小さいが、直すと誤検知が表に出るため断片抑制と併せた再設計が必要。

#### キャッシュバスター（`f8d3e5a`）

- `style.dist.css`を2度変更したが`?v=20260714`のままで、既存訪問者に旧CSSが配信される
  状態だった。`20260717a`へ更新。CSS変更時は`index.html`の`?v=`更新を必ず伴わせること。

#### 未解決事項

- **`style.dist.css`の同期を保証するCIが無い**。`.github/`は`dependabot.yml`のみで、
  ワークフローが存在しないため、クラス追加時の再生成漏れを検出できない（今回の欠落の原因）。
  マークアップ変更時は`npm run build:css`を同一コミットに含めること。
  トリガを絞ったビルド検証CIの追加を検討中（Actions実行回数の節約方針との両立が前提）。
- 課題#27（ファジー検出の精度不足）は再設計待ち。非表示のまま維持する。
- 課題#15（JTF全ルール取り込み）は例外条件の人手レビューが必要で機械的に進められない。
  現在は機械判定が安全な3ルールのみ収録。ライセンス面の障壁はない。
- 課題#16（prh辞書）は 2026-08-19 に対応（下記）。

### 2026-08-19 prh (textlint-rule-prh) YAML 互換対応（課題#16）

- `js/prh.js` を追加。外部依存なしで prh 辞書の YAML 部分集合を解析し、
  `expected` / `pattern` / `patterns` / `options.wordBoundary` / `regexpMustEmpty` /
  `specs` を構造化ルールへ変換する。逆変換（prh YAML 書き出し）も同ファイル。
- `js/analyzer.js` に `mustEmpty`（prh の `regexpMustEmpty` 相当）を追加。
  指定キャプチャグループが空の一致だけを指摘する。
- `js/dictManager.js` に `importPRH()` / `exportPRH()` を追加。取り込みルールは
  カスタム辞書（最優先）へ入り、`fixMode: confirm`（安全側）で固定。
- UI（辞書設定 > 一括データ操作）に「prh YAML 読込 / 書き出し」を追加。
  `index.html` の `?v=` と `APP_VERSION` を `20260819a` へ更新。
- 実資産での確認: prh/rules `media/WEB+DB_PRESS.yml` は 1296 ルール中 1298 件へ変換
  （スキップ3件）、`media/techbooster.yml` は 54 件すべて変換。
- 判断: textlint 本体の Worker 実行はバンドラ導入が必要なため見送り、辞書互換に留める。
  詳細と対応表は `docs/prh-compat.md`。
- テスト: `tests/prh.test.js` を追加（全15件パス）。Chromium 実機で読込→解析→
  書き出しまで動作確認済み。

#### 未解決事項（prh）

- `expected` のみのルール（prh 側でパターンを自動生成するもの）は未対応。取り込み時に
  スキップ件数として通知する。
- `imports` の再帰読み込みは行わない（任意 URL を取得しない方針）。参照先は個別に読み込む。

## 関連

### 2026-07-15 セキュリティ更新

- PDF.jsを脆弱性修正版の`pdfjs-dist 6.1.200`へ更新し、CDN・worker・npm依存を同一バージョンに固定。
- PDF解析時に`isEvalSupported: false`を指定し、多層防御を追加。
- `.claude/`をGit追跡対象から除外し、Dependabotの週次npm更新を追加。
- `npm audit`で既知の脆弱性0件を確認。

- 組織ハブ: https://edi-tool.github.io/ （`edi-tool/edi-tool.github.io` リポジトリ）
