"""Sudachi同義語辞書CSVから表記ゆれクラスタJSONを生成する開発用スクリプト。

Sudachi公式同義語辞書（synonyms.txt）を読み込み、同一語彙素（同一グループ番号
かつ同一語彙素番号）に属する複数の表記をまとめて1クラスタとし、
`dicts/synonym_variants.json` を生成する。

語彙素番号が異なる語（例: IT と 情報技術）は別語彙＝類義語として区別し、
同一クラスタにまとめない。これにより校正時の過剰検出を防ぐ。

使い方::

    python backend/build_synonym_dict.py [CSVパス]

CSVパス省略時は環境変数 SUDACHI_SYNONYMS、次に %TEMP%/sudachi_synonyms.txt を参照する。
"""

import csv
import json
import os
import re
import sys
from collections import OrderedDict
from pathlib import Path

# 同義語辞書CSVの列インデックス（0始まり）
_COL_GROUP = 0  # グループ番号
_COL_LEXEME = 3  # 語彙素番号
_COL_VARIANT = 6  # 表記ゆれ区分（0=代表表記, 1=表記ゆれ）
_COL_HEADWORD = 8  # 見出し（col7は分野情報()のため8が見出し）

# 通常語として採用しない見出しのパターン（表記正規化用の特殊エントリ等）
_INVALID_HEADWORD = re.compile(r"[()（）/／\s]")
# 漢字を含むかの判定（CJK統合漢字）
_KANJI = re.compile(r"[一-鿿]")

_OUT_PATH = Path(__file__).parent / "dicts" / "synonym_variants.json"


def _resolve_csv_path(argv: list[str]) -> Path:
    """CSVパスを引数・環境変数・既定の順で解決する。

    Args:
        argv: コマンドライン引数リスト。

    Returns:
        CSVファイルのパス。

    Raises:
        FileNotFoundError: CSVが見つからない場合。
    """
    if len(argv) > 1:
        path = Path(argv[1])
    elif os.environ.get("SUDACHI_SYNONYMS"):
        path = Path(os.environ["SUDACHI_SYNONYMS"])
    else:
        path = Path(os.environ.get("TEMP", "/tmp")) / "sudachi_synonyms.txt"
    if not path.exists():
        raise FileNotFoundError(f"同義語辞書CSVが見つかりません: {path}")
    return path


def _is_valid_headword(word: str) -> bool:
    """見出し語が表記ゆれ対象として妥当か判定する。

    括弧・スラッシュ・空白を含む特殊エントリを除外し、
    漢字を含むか2文字以上の語のみを採用する（1文字かなノイズ除去）。

    Args:
        word: 見出し語。

    Returns:
        妥当ならTrue。
    """
    if not word or _INVALID_HEADWORD.search(word):
        return False
    if len(word) >= 2:
        return True
    return bool(_KANJI.search(word))


def build(csv_path: Path) -> list[list[str]]:
    """同義語辞書CSVから表記ゆれクラスタのリストを構築する。

    末尾が欠損したCSV（ダウンロード途中切断等）でも処理を継続できるよう、
    デコード不能なバイトは無視して読み込む。

    Args:
        csv_path: 同義語辞書CSVのパス。

    Returns:
        表記ゆれクラスタのリスト。各クラスタは代表表記を先頭にした語リスト。
    """
    # (グループ番号, 語彙素番号) → OrderedDict[語, 代表フラグ]
    clusters: dict[tuple[str, str], OrderedDict] = {}

    with csv_path.open(encoding="utf-8", errors="ignore") as f:
        for row in csv.reader(f):
            if len(row) <= _COL_HEADWORD:
                continue
            headword = row[_COL_HEADWORD].strip()
            if not _is_valid_headword(headword):
                continue
            key = (row[_COL_GROUP], row[_COL_LEXEME])
            is_representative = row[_COL_VARIANT].strip() == "0"
            members = clusters.setdefault(key, OrderedDict())
            # 代表表記を優先的に保持（同語の重複登録は代表フラグをORで更新）
            members[headword] = members.get(headword, False) or is_representative

    result: list[list[str]] = []
    for members in clusters.values():
        if len(members) < 2:
            continue  # 1表記のみは表記ゆれにならない
        # 代表表記を先頭に並べ替える
        words = sorted(members, key=lambda w: (not members[w], w))
        result.append(words)

    result.sort()
    return result


def main() -> None:
    """CSVを読み込み synonym_variants.json を生成する。"""
    csv_path = _resolve_csv_path(sys.argv)
    clusters = build(csv_path)
    _OUT_PATH.parent.mkdir(exist_ok=True)
    _OUT_PATH.write_text(
        json.dumps(clusters, ensure_ascii=False), encoding="utf-8"
    )
    print(f"生成完了: {_OUT_PATH} クラスタ数={len(clusters)}")


if __name__ == "__main__":
    main()
