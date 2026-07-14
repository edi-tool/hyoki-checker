# hyoki-checker

ブラウザ完結型の表記ゆれ検出ツール（辞書ベース／ファジー／Kuromoji 活用形解析）。テキストは外部送信せず Web Worker で解析する。
公開URL: https://edi-tool.github.io/hyoki-checker/ （GitHub Pages）

## 実行コマンド

- プレビュー: `python -m http.server 8000`
- 整形: `npx prettier --write .`

## プロジェクト方針

- フロントはバニラ JS（Web Worker）＋ビルド済み Tailwind CSS。テキストを外部送信しない設計を崩さない。
- `backend/` は任意構成（FastAPI + SudachiPy、Render デプロイ、`API_BASE` 設定時のみ使用）。フロント単体で動作することを常に維持。
- 軽微な修正での push 禁止。ローカルサーバーで検証し、複数修正を1コミットに集約（GitHub Actions 節約）。
- セッション終了時に `progress.md` を更新。
