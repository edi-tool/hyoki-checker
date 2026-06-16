"""normalizer.py の正規化挙動を検証するテスト。"""

from backend.normalizer import normalize_text


def test_fullwidth_alnum() -> None:
    """全角英数字が半角に正規化される。"""
    assert normalize_text("ＡＢＣ１２３") == "ABC123"


def test_halfwidth_kana() -> None:
    """半角カナが全角に正規化される。"""
    assert normalize_text("ﾃｽﾄ") == "テスト"


def test_repeated_long_vowel() -> None:
    """連続した長音記号が1つに正規化される。"""
    assert normalize_text("ウェーーーイ") == "ウェーイ"


def test_empty() -> None:
    """空文字はそのまま返る。"""
    assert normalize_text("") == ""
