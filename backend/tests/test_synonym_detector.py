"""synonym_detector.py の同義語辞書ベース検出を検証するテスト。"""

import pytest

from backend.synonym_detector import detect_synonyms, load_synonym_variants


@pytest.fixture(scope="module", autouse=True)
def _load_variants():
    """テスト前に同義語ゆれ辞書をロードする。未生成ならスキップ。"""
    if load_synonym_variants() == 0:
        pytest.skip("synonym_variants.json が未生成のためスキップ")


def test_variant_mixture_detected() -> None:
    """同一語彙素の表記ゆれ（アイデア/アイディア）の混在を検出する。"""
    results = detect_synonyms("良いアイデアと悪いアイディアを比較する。")
    groups = [set(r.group) for r in results]
    assert any({"アイデア", "アイディア"} <= g for g in groups)


def test_single_notation_no_detect() -> None:
    """同一表記のみなら警告しない。"""
    results = detect_synonyms("良いアイデアを出す。次のアイデアも出す。")
    assert all(not ({"アイデア", "アイディア"} <= set(r.group)) for r in results)


def test_recommended_is_representative() -> None:
    """推奨表記がクラスタ代表（アイデア）になる。"""
    results = detect_synonyms("アイデアとアイディア。")
    target = [r for r in results if {"アイデア", "アイディア"} <= set(r.group)]
    assert target and target[0].recommended == "アイデア"
