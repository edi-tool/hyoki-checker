"""defaultDict.js を dicts/default_dict.json に変換するスクリプト。"""
import json
import re
import sys
from pathlib import Path

JS_PATH = Path(__file__).parent.parent / "js" / "defaultDict.js"
OUT_PATH = Path(__file__).parent / "dicts" / "default_dict.json"


def convert() -> None:
    source = JS_PATH.read_text(encoding="utf-8")

    # DEFAULT_DICT = [ ... ] のブロックを抽出
    match = re.search(r"const DEFAULT_DICT\s*=\s*(\[[\s\S]*?\]);", source)
    if not match:
        print("ERROR: DEFAULT_DICT が見つかりません", file=sys.stderr)
        sys.exit(1)

    array_str = match.group(1)

    # JS配列リテラルをPythonで評価できる形に変換
    # コメント除去
    array_str = re.sub(r"//[^\n]*", "", array_str)
    # trailing comma を除去（JSONは不可）
    array_str = re.sub(r",\s*]", "]", array_str)
    array_str = re.sub(r",\s*}", "}", array_str)
    # シングルクォートをダブルクォートに
    array_str = re.sub(r"'([^']*)'", r'"\1"', array_str)
    # 波ダッシュ等はそのまま通る

    groups: list[list[str]] = json.loads(array_str)
    groups = [g for g in groups if isinstance(g, list) and len(g) >= 2]

    OUT_PATH.parent.mkdir(exist_ok=True)
    OUT_PATH.write_text(json.dumps(groups, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"変換完了: {len(groups)} グループ → {OUT_PATH}")


if __name__ == "__main__":
    convert()
