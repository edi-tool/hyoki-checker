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
- `style.dist.css` は `npm run build:css` の生成物。Tailwind は progress.md などリポジトリ内の全ファイルをクラス候補として走査するため、
  **progress.md を編集した後にビルドする**（先にビルドすると CI の「生成物が最新か確認（CSS）」で落ちる）。
- JS/CSS を変えたら `index.html` の `?v=` と `js/app.js` の `APP_VERSION` をそろえて上げる。
- Render の `hyoki-checker-api` はダッシュボードで作成した**ネイティブ Python 環境**で、`render.yaml`・`Dockerfile` は使われない。
  ビルドは直下の `requirements.txt`（`backend/requirements.txt` を参照）と `.python-version`（3.11）を読む。依存は backend 側で管理する。
