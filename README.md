# hyoki-checker

ブラウザ完結型の表記ゆれ検出ツール

🔗 https://edi-tool.github.io/hyoki-checker/

## 特徴

- **ブラウザ完結**: テキストは外部送信されず、解析はすべてブラウザ内（Web Worker）で実行
- **多様な入力**: `.docx` / `.pdf` / `.txt` 読込・直接貼り付けに対応
- **2種の検出**: 辞書ベース／Kuromoji 活用形解析（Beta）
  （ファジー（近似一致）は精度不足のため非表示。実装は維持。[#12](https://github.com/edi-tool/hyoki-checker/issues/12) / [#27](https://github.com/edi-tool/hyoki-checker/issues/27)）
- **カスタム辞書**: 自社の表記基準を追加（localStorage 保存、JSON/TSV/CSV インポート）
- **基準表記を明示**: 辞書グループの先頭を基準とし、多数派に流されず判定
- **原文位置へ移動**: 結果の表記をクリックすると該当箇所を順番に選択
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

- `company`: 既存辞書を構造化して移行。初期ON、旧ルールは安全のため原則 `confirm`
- `jtf-3.0`: JTF 3.0から加工した少数ルール。初期OFF
- `bunka-official`: 文化審議会資料を参照した少数ルール。初期OFF、自動修正なし
- `consistency-only`: 正誤を決めず、文書内の混在だけを通知。初期OFF

`fixMode: auto` のルールだけが一括Word出力の置換対象です。`confirm`、`none`、
文脈依存、Sudachi・ファジー由来の候補は自動置換しません。旧カスタム辞書の
`string[][]` は読み込み時に構造化し、`confirm` として移行します。

コードはMITライセンスです。外部資料由来のルールデータには各ルールの `source`、
`NOTICE`、`THIRD_PARTY_LICENSES` に記載した個別条件が適用されます。

## 採用・参考にした技術

- [PDF.js](https://github.com/mozilla/pdf.js) の `TextItem.hasEOL` と座標を利用し、PDFの改行と欧文の語間を復元
- [Mammoth.js](https://github.com/mwilliamson/mammoth.js) のブラウザ版で `.docx` をプレーンテキスト化
- [kuromoji.js](https://github.com/takuyaa/kuromoji.js) を Web Worker で遅延読込し、形態素境界と活用形を補助判定
- [textlint](https://github.com/textlint/textlint) は日本語校正の参考実装として調査。汎用ルールエンジンのため、現状は軽量な辞書ベース処理を維持

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
npm test                # フロントのテスト
npm run validate:rules  # ルールパックの検証
```
