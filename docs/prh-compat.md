# prh (textlint-rule-prh) YAML 互換

hyoki-checker は [prh](https://github.com/prh/prh) 形式の辞書 YAML を読み込み、
また自社辞書を prh 形式で書き出せる。これにより

- 公開ルール資産（[prh/rules](https://github.com/prh/rules) の各メディア辞書、
  JTF日本語標準スタイルガイド系の prh 辞書など）をそのままブラウザ上で利用でき、
- 逆に本ツールで整備したカスタム辞書を VS Code / CI の textlint へ持ち出せる。

実装は `js/prh.js`（外部依存なし・prh 辞書で使われる範囲の YAML 部分集合パーサ）。

## 対応表

| prh                                   | hyoki-checker                                                    | 備考                                                         |
| ------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------ |
| `version`                             | —                                                                | 読み飛ばす                                                   |
| `meta`                                | —                                                                | 読み飛ばす                                                   |
| `imports`                             | 取り込み結果の `imports` として通知                              | 参照先ファイルは自動取得しない（個別に読み込む）             |
| `rules[].expected`                    | `preferred`（文字列パターン時）／`replacement`                   | `$1` を含む場合は `preferred: null` とし置換文字列として扱う |
| `rules[].pattern`（文字列）           | `variants` の1要素                                               | `expected` と合わせた `type: "preferred"` ルールになる       |
| `rules[].patterns`                    | 同上（配列も可）                                                 | `pattern` と `patterns` は同義として結合                     |
| `rules[].pattern`（`/.../` リテラル） | `type: "pattern"` + `pattern`                                    | フラグは解析側で `gu` を付与するため無視                     |
| `rules[].options.wordBoundary`        | `pattern` を `\b(?:…)\b` で包む                                  | 文字列パターンでも正規表現ルールへ格上げされる               |
| `rules[].regexpMustEmpty`             | `mustEmpty`（グループ番号）                                      | 該当グループが空の一致だけを指摘（`js/analyzer.js`）         |
| `rules[].specs`                       | `pattern`/`patterns` 省略時のみ `from` を候補に                  | 検証用サンプルとしては保持しない                             |
| —                                     | `category: "prh"` / `severity: "warning"` / `fixMode: "confirm"` | 取り込みルールは安全側（要確認）で固定                       |

## 未対応

- `expected` のみのルール（prh が表記候補を自動生成するもの）。取り込み時に
  スキップ件数として通知する。
- `imports` の再帰読み込み（ブラウザから任意 URL を取得しない方針のため）。
- `specs` を使った取り込み時のセルフテスト。

## 変換実績（2026-08-19 時点）

| 辞書                               | prh ルール数 | 変換 | スキップ |
| ---------------------------------- | ------------ | ---- | -------- |
| prh/rules `media/WEB+DB_PRESS.yml` | 1296         | 1298 | 3        |
| prh/rules `media/techbooster.yml`  | 54           | 54   | 0        |

（1つの prh ルールが複数の正規表現を持つ場合、変換後は複数ルールに分かれる）

## 使い方

- 読み込み: 辞書設定パネルの「📥 prh YAML 読込」から `.yml` / `.yaml` を選択。
  取り込んだルールはカスタム辞書（最優先）に追加される。
- 書き出し: 「📤 prh YAML 書き出し」でカスタム辞書を `hyoki_custom_rules.prh.yml`
  として保存。textlint 側では `textlint-rule-prh` の `rulePaths` に指定する。

## textlint 本体を載せるか

現時点では辞書互換のみに留める。textlint 本体（+ kernel + プラグイン）を Web Worker
で動かすにはバンドラ導入が必要で、「バニラ JS + ビルド済み CSS」という現行方針と
コスト面が合わないため。辞書互換だけでも公開ルール資産の再利用と外部持ち出しという
主な利点は得られる。
