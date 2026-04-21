import json
from pathlib import Path

DICTS_DIR = Path(__file__).parent / "dicts"

# 優先度順（低インデックス = 高優先）
LAYER_ORDER = ["custom_dict.json", "jiji_dict.json", "koubunn_dict.json", "default_dict.json"]


def load_layered_dict() -> list[list[str]]:
    """辞書レイヤーを優先度順にマージして返す。高優先ルールが低優先を上書き。"""
    seen: dict[str, int] = {}  # word → group_index
    merged: list[list[str]] = []

    for filename in LAYER_ORDER:
        path = DICTS_DIR / filename
        if not path.exists():
            continue
        groups: list[list[str]] = json.loads(path.read_text(encoding="utf-8"))
        for group in groups:
            words = [w for w in group if w]
            if len(words) < 2:
                continue
            # 既存グループと重複する語があれば統合（高優先が勝つ）
            overlap = next((seen[w] for w in words if w in seen), None)
            if overlap is None:
                idx = len(merged)
                merged.append(words)
                for w in words:
                    seen[w] = idx
            # 高優先は先に追加済みのためスキップ

    return merged


def save_custom_dict(groups: list[list[str]]) -> None:
    DICTS_DIR.mkdir(exist_ok=True)
    path = DICTS_DIR / "custom_dict.json"
    path.write_text(json.dumps(groups, ensure_ascii=False, indent=2), encoding="utf-8")
