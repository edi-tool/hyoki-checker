# hyoki-checker

ブラウザ完結型の表記ゆれ検出ツール

🔗 https://edi-tool.github.io/hyoki-checker/

## 特徴

- **ブラウザ完結**: テキストは外部送信されず、解析はすべてブラウザ内（Web Worker）で実行
- **多様な入力**: `.docx` / `.pdf` / `.txt` 読込・直接貼り付けに対応
- **3種の検出**: 辞書ベース／ファジー（近似一致）／Kuromoji 活用形解析（Beta）
- **カスタム辞書**: 自社の表記基準を追加（localStorage 保存、JSON/TSV/CSV インポート）
- **推奨表記へ統一**: 検出結果を推奨表記へ一括置換し `.docx` 出力

## 使い方

1. テキストを貼り付け、またはファイルをドラッグ＆ドロップ
2. 検知結果タブで表記ゆれグループと出現数を確認
3. プレビュータブで非推奨表記のハイライトを確認
4. 「推奨表記に統一してWord出力」で統一済み `.docx` をダウンロード

## 技術構成

| 区分 | 内容 |
|---|---|
| フロント | バニラ JS（Web Worker）、Tailwind（ビルド済み CSS） |
| 形態素解析 | Kuromoji.js（Beta、遅延ロード） |
| 文書入出力 | mammoth（docx 読込）、pdf.js（PDF 読込）、html-docx-js（docx 出力） |
| バックエンド（任意） | FastAPI + SudachiPy + Aho-Corasick（大容量テキスト向け、`API_BASE` 設定時のみ使用） |

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
