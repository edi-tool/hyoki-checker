# 進捗: kenchikekka UI 機能復活 ✅

## 概要
過去のバージョンで失われていた検知結果UIの2つの機能を復活：
1. 各表記の**出現回数を数値表示**
2. **表記統一ボタン**（クリックで本文一括置換）

## 解決内容

### 実装内容
- **index.html:629** `renderResults()` 書き換え → 各表記をボタン化、出現回数バッジ付きで表示
  - 推奨表記（最多出現）は `bg-[#f0fbfc] border-[#118e9e]` で強調
  - インデックスベースのクリックハンドラで特殊文字エスケープ問題を回避
  
- **index.html:666** `unifyTo(groupIdx, wordIdx)` 新規実装
  - グループ内の全単語を選択語に一括置換
  - `replacementLog` に記録、再解析をトリガー
  
- **index.html:691** `updateReplacementBadge()` 新規実装
  - 右上バッジに統一実行回数を表示
  
- **index.html:794** `clearAll()` 微修正
  - replacementLog をリセット、バッジを非表示

### 既存データの有効活用
`js/analyzer.js:12-25` の `analyze()` は既に `counts: [{word, count}]` 配列を返していたため、データベースレイヤーはそのまま。UI層だけの修正で対応完了。

---

## 前回の解決内容：ファイル選択後に分析が進まない問題 ✅

### 実装した対策（plan: robust-snuggling-dongarra.md）
1. **Service Worker 自己撤去** → 旧キャッシュ廃止、新修正が確実に配信される
2. **pdf.js workerSrc 設定前倒し** → pdf.js読み込み直後に即設定、素早いPDF処理
3. **進捗 UI 動的化** → 段階別メッセージ表示（ファイル読み込み中→テキスト抽出中→解析中）
4. **診断ログ追加** → DevTools Console に実行フロー痕跡

### 根本原因（事後判明）
**kuromoji 自動初期化が Worker をブロック** → page load から 2 秒後に自動的に kuromoji.js + 多 MB 辞書をインポート → 単一スレッド Worker の message queue を 30 秒以上ブロック → ANALYZE メッセージが届かないまま timeout

### 最終修正
- `index.html` 行 17-25: setTimeout 自動初期化を廃止
- `worker.js`, `analyzer.js`: 変更なし（設計正常）

### 実装済みコミット
- `ca1f3e1` favicon
- `93d57ef` Fix duplicate isKuromojiReady identifier conflicting with analyzer.js
- `5c69ef3` Add progress UI, remove stale service worker, fix pdf.js init race
- `6fdc79a` Fix dropZone click event propagation loop blocking file picker
- `53eb790` Stop auto-initializing kuromoji; it blocked ANALYZE on the single worker thread

## 検証済み
✅ .docx ファイル選択 → テキスト抽出成功 → 解析完了  
✅ 進捗表示が画面に更新される  
✅ DevTools に診断ログ出力  
✅ エラー時は画面に赤字表示  

---

## 最新コミット
`58992ee` Restore kenchikekka UI: display counts and unification buttons
