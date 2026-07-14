import json
from pathlib import Path
from typing import Any

DICTS_DIR = Path(__file__).parent / "dicts"


def _custom_source() -> dict[str, Any]:
    return {
        "pack": "custom",
        "title": "ユーザーカスタム辞書",
        "url": "",
        "license": "user-provided",
        "attribution": "user",
        "retrievedAt": "2026-07-14",
        "modified": True,
    }


def adapt_rule(value: Any, index: int = 0, pack: str = "custom") -> dict | None:
    """旧 list[str] と構造化ルールを共通形式へ変換する。"""
    if isinstance(value, list):
        variants = list(dict.fromkeys(word for word in value if isinstance(word, str) and word))
        if len(variants) < 2:
            return None
        return {
            "id": f"{pack}.legacy.{index + 1}",
            "type": "preferred",
            "preferred": variants[0],
            "variants": variants,
            "category": "legacy-custom",
            "severity": "warning",
            "fixMode": "confirm",
            "reason": "旧配列形式から移行したルール。",
            "source": _custom_source(),
        }
    if not isinstance(value, dict) or not isinstance(value.get("variants"), list):
        return None
    rule = dict(value)
    rule.setdefault("id", f"{pack}.imported.{index + 1}")
    rule.setdefault("type", "preferred")
    rule.setdefault("preferred", rule["variants"][0] if rule["variants"] else None)
    rule.setdefault("category", "custom")
    rule.setdefault("severity", "warning")
    rule.setdefault("fixMode", "confirm")
    rule.setdefault("reason", "ユーザーカスタムルール")
    rule.setdefault("source", _custom_source())
    return rule


def load_generated_packs() -> list[dict]:
    data = json.loads((DICTS_DIR / "default_dict.json").read_text(encoding="utf-8"))
    if isinstance(data, dict) and isinstance(data.get("packs"), list):
        return data["packs"]
    # 生成前の旧ファイルも読み込めるようにする。
    rules = [rule for i, value in enumerate(data) if (rule := adapt_rule(value, i, "company"))]
    return [{"id": "company", "priority": 300, "defaultEnabled": True, "rules": rules}]


def load_layered_dict(selected_packs: list[str] | None = None) -> list[dict]:
    """生成パックとカスタム辞書を優先度順にマージする。"""
    packs = load_generated_packs()
    if selected_packs is None:
        selected = {pack["id"] for pack in packs if pack.get("defaultEnabled")}
    else:
        selected = set(selected_packs)

    custom_path = DICTS_DIR / "custom_dict.json"
    custom_values = json.loads(custom_path.read_text(encoding="utf-8")) if custom_path.exists() else []
    custom_rules = [
        rule for i, value in enumerate(custom_values) if (rule := adapt_rule(value, i, "custom"))
    ]
    layers = [{"id": "custom", "priority": 400, "rules": custom_rules}]
    layers.extend(pack for pack in packs if pack["id"] in selected)
    layers.sort(key=lambda pack: pack.get("priority", 0), reverse=True)

    claimed: set[str] = set()
    merged: list[dict] = []
    for pack in layers:
        for rule in pack.get("rules", []):
            variants = [word for word in rule.get("variants", []) if word]
            if any(word in claimed for word in variants):
                continue
            merged.append(rule)
            claimed.update(variants)
    return merged


def save_custom_dict(groups: list[Any]) -> None:
    DICTS_DIR.mkdir(exist_ok=True)
    rules = [rule for i, value in enumerate(groups) if (rule := adapt_rule(value, i, "custom"))]
    (DICTS_DIR / "custom_dict.json").write_text(
        json.dumps(rules, ensure_ascii=False, indent=2), encoding="utf-8"
    )
