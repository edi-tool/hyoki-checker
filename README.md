# hyoki-checker

ブラウザ完結型の表記ゆれ検出ツール

🔗 https://edi-tool.github.io/hyoki-checker/

## 特徴

- **ブラウザ完結**: テキストは外部送信されず、解析はすべてブラウザ内（Web Worker）で実行
- **多様な入力**: `.docx` / `.pdf` / `.txt` 読込・直接貼り付けに対応
- **活用形も検出**: 「気付く」のルールで「気づいた・気づき・気づかない」まで指摘（形態素解析の読み込みは不要）
- **行末で切れた語も検出**: PDF の行末で「気づ／いた」と分かれた語もつないで照合
- **2種の検出**: 辞書ベース／Kuromoji 活用形解析（Beta）
  （ファジー（近似一致）は精度不足のため非表示。実装は維持。[#12](https://github.com/edi-tool/hyoki-checker/issues/12) / [#27](https://github.com/edi-tool/hyoki-checker/issues/27)）
- **カスタム辞書**: 自社の表記基準を追加（localStorage 保存、JSON/TSV/CSV インポート）
- **基準表記を明示**: 辞書グループの先頭を基準とし、多数派に流されず判定
- **原文位置へ移動**: 結果の表記をクリックすると該当箇所を順番に選択。不要な指摘は「この指摘を隠す」で一覧から外せる
- **基準表記へ統一**: 実際に検出した位置だけを一括置換し、新しい `.docx` を出力

## 使い方

1. テキストを貼り付け、またはファイルをドラッグ＆ドロップ
2. 検知結果タブで表記ゆれグループと出現数を確認
3. プレビュータブで非推奨表記のハイライトを確認
4. 必要なら「基準表記に統一したWordを作成」で統一済み `.docx` をダウンロード

辞書では各グループの先頭が基準表記です（例: `Web,ウェブ,ウエブ`）。基準外の表記しか
文書にない場合も指摘します。生成する Word はプレーンテキストの新規文書であり、元文書の
書式・画像・脚注・変更履歴は引き継ぎません。実務で書式を保つ場合は、結果カードから原文位置へ
移動して Word 側で修正してください。

## データの扱い

- 貼り付けた文章・読み込んだファイルは、**ブラウザ内（Web Worker）で解析し、外部へ送信しません**。
- 外部から読み込むライブラリ（cdn.jsdelivr.net、バージョン固定）：pdf.js（pdfjs-dist 6.4.299）、Mammoth.js 1.13.0、html-docx-js 0.3.1。Kuromoji.js と辞書（`dict/`）、PDF 用 CMap（`cmaps/`）はリポジトリに同梱しています。
- カスタム辞書はブラウザの localStorage に保存します（端末の外には出ません）。
- 下記の FastAPI バックエンドは任意機能で、公開版では無効です（`js/app.js` の `API_BASE` が空）。有効にすると 5,000 字を超える本文がそのサーバーへ送られるため、有効にする場合はこの節を更新してください。無効であることはテスト（`tests/privacy.test.js`）で確認しています。

## 技術構成

| 区分                 | 内容                                                                                |
| -------------------- | ----------------------------------------------------------------------------------- |
| フロント             | バニラ JS（Web Worker）、Tailwind（ビルド済み CSS）                                 |
| 形態素解析           | Kuromoji.js（Beta、遅延ロード）                                                     |
| 文書入出力           | mammoth（docx 読込）、pdf.js（PDF 読込）、html-docx-js（docx 出力）                 |
| バックエンド（任意） | FastAPI + SudachiPy + Aho-Corasick（大容量テキスト向け、`API_BASE` 設定時のみ使用） |

## ルールパックと安全な修正

ルールの原本は `rules/packs/` にあり、`npm run build:rules` でフロント用
`js/defaultDict.js` とバックエンド用 `backend/dicts/default_dict.json` を同時生成します。
生成ファイルは直接編集しません。

- `company`（画面上の名前は「新聞表記」）: 既定の辞書。初期ON、安全のため原則 `confirm`（要確認）。
  平仮名で書く語・補助動詞・形式名詞、送り仮名、単位、教育用語など 212 ルール
- `jtf-3.0`: JTF 3.0から加工した少数ルール。初期OFF
- `bunka-official`: 文化審議会資料を参照した少数ルール。初期OFF、自動修正なし
- `consistency-only`: 正誤を決めず、文書内の混在だけを通知。初期OFF

`fixMode: auto` のルールだけが一括Word出力の置換対象です。`confirm`、`none`、
文脈依存、Sudachi・ファジー由来の候補は自動置換しません。旧カスタム辞書の
`string[][]` は読み込み時に構造化し、`confirm` として移行します。

### ルールの書き方

`rules/packs/<パック>/*.json` に、次の形で書きます（必須項目は `rules/schema/rule.schema.json`）。

```json
{
  "id": "company.0069",
  "type": "preferred",
  "preferred": "気付く",
  "variants": ["気付く", "気づく"],
  "inflect": "godan-ku",
  "category": "legacy",
  "severity": "warning",
  "fixMode": "confirm",
  "source": "company",
  "hit": ["間違いに気づいた", "よさに気づき"],
  "miss": ["気付いた"]
}
```

| 項目                     | 用途                                                                                                                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `inflect`                | 活用させて照合する。`variants` は辞書形で書く。`godan-ku`（書く）・`godan-gu`・`godan-su`・`godan-tsu`・`godan-bu`・`godan-mu`・`godan-ru`・`godan-u`・`ichidan`・`ichidan-any`・`i-adj` |
| `exceptions`             | 別の語として読み飛ばす文字列（「プレゼン」のルールに対する「プレゼント」）                                                                                                                           |
| `type: "pattern"`        | 前後の条件が必要なとき。`pattern` に正規表現（`u` フラグ。後読み・`\p{sc=Han}` 可）、`replacement` に置換文字列（`$1` 可）。`variants` は画面に出す代表例                                         |
| `type: "consistency"`    | 統一先を決めず、2 種類以上が混在したときだけ知らせる                                                                                                                                                 |
| `type: "contextual"`     | 意味や場面で使い分ける語。混在したときだけ知らせ、置換しない                                                                                                                                         |
| `hit` / `miss`           | そのルールの自己テスト。`hit` は指摘が出るはずの例、`miss` は出てはいけない例。`npm run validate:rules` が検証し、配布物（`js/defaultDict.js`）には含めない                                         |

`ichidan` は語幹の直後に来る主な形（る・た・て・ない・ます…）だけに一致し、`ichidan-any` は後続を問いません
（「出来る」は「出来事」を拾わないよう前者、「現われる」「ふまえる」は後者）。
語幹が漢字 1 字の五段動詞（落す・分る・持つ）は、直前が漢字のとき熟語＋語尾（欠落し・自分ら・気持ち）とみなして除外します。

検出精度は `tests/detection-corpus.js`（指摘すべき表記と、誤検知しやすい語を集めた例文）で固定しています。

## prh 形式辞書の読み書き

[textlint-rule-prh](https://github.com/textlint-ja/textlint-rule-prh) が使う prh 形式
YAML を読み込めます（辞書設定パネルの「📥 prh YAML 読込」）。
[prh/rules](https://github.com/prh/rules) の公開辞書や JTF日本語標準スタイルガイド系の
prh 辞書をそのまま利用できます。逆に「📤 prh YAML 書き出し」でカスタム辞書を prh 形式へ
書き出し、VS Code や CI の textlint へ持ち出せます。

対応キー（`expected` / `pattern` / `patterns` / `options.wordBoundary` /
`regexpMustEmpty` / `specs`）と未対応項目は [docs/prh-compat.md](docs/prh-compat.md)
を参照してください。

コードはMITライセンスです。外部資料由来のルールデータには各ルールの `source`、
`NOTICE`、`THIRD_PARTY_LICENSES` に記載した個別条件が適用されます。

## 採用・参考にした技術

- [PDF.js](https://github.com/mozilla/pdf.js) の `TextItem.hasEOL` と座標を利用し、PDFの改行と欧文の語間を復元
- [Mammoth.js](https://github.com/mwilliamson/mammoth.js) のブラウザ版で `.docx` をプレーンテキスト化
- [kuromoji.js](https://github.com/takuyaa/kuromoji.js) を Web Worker で遅延読込し、形態素境界と活用形を補助判定
- [textlint](https://github.com/textlint/textlint) は日本語校正の参考実装として調査。汎用ルールエンジンのため、現状は軽量な辞書ベース処理を維持
  （2026-10-13 再確認: textlint 15.8.0 / prh 6.1.0。ルールごとの例で辞書を検証する考え方は prh の `specs` を参考に、`hit`／`miss` として取り入れた）

いずれも文書本文を外部APIへ送らず、ブラウザ内で処理します。CDNからライブラリ本体を取得する
場合はありますが、読み込んだ文書データは送信しません。

詳細な開発経緯は [progress.md](progress.md) を参照。

## ローカル実行

```sh
python3 -m http.server 8000
```

バックエンドのテスト:

```sh
pip install -r backend/requirements.txt
python -m pytest backend/tests
```

## 開発時の注意

### CSS を変更したら再生成と `?v=` 更新が必要

`style.dist.css` は Tailwind の生成物ですが**リポジトリにコミットしています**。CI が無いため、
再生成を忘れてもエラーになりません（実際に、使用中のクラスが生成物から欠落したまま
本番に出ていたことがあります）。マークアップのクラスを変更したら必ず以下を同じコミットに含めてください。

```sh
npm run build:css                       # style.dist.css を再生成
# さらに index.html の <link rel="stylesheet" href="style.dist.css?v=...">
# の ?v= を更新する（更新しないと既存訪問者に旧CSSがキャッシュ配信される）
```

JS を変更した場合は `js/app.js` の `APP_VERSION` と `index.html` の各 `?v=` を揃えて更新します。

### ルールは生成ファイルを直接編集しない

`js/defaultDict.js` と `backend/dicts/default_dict.json` は生成物です。原本の `rules/packs/` を
編集し、`npm run build:rules` で再生成、`npm run validate:rules` で検証してください。

### 検証コマンド

```sh
npm test                # フロントのテスト（検出精度の回帰テストを含む）
npm run validate:rules  # ルールパックの検証（各ルールの hit / miss 例も実行）
```

## 関連ツール・ライセンス

- [edi-tool のツール一覧](https://edi-tool.github.io/) ／ 開発方針は [edi-tool 開発原則](https://github.com/edi-tool/.github/blob/main/PRINCIPLES.md)
- 変更履歴は [CHANGELOG.md](CHANGELOG.md)
- MIT License © 2026 ISHIKAWA, Natsuki（[LICENSE](LICENSE)）。ルールデータの個別条件は `NOTICE`・`THIRD_PARTY_LICENSES` を参照
