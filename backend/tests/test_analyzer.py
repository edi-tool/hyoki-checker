"""analyzer.py の辞書境界フィルタと正規化形検出を検証するテスト。"""

from backend.analyzer import analyze_chunks, build_automaton, morphological_detect
from backend.chunker import split_text


def _run_dict(text: str, groups: list[list[str]]) -> list:
    """辞書グループでテキストを解析するヘルパー。"""
    automaton = build_automaton(groups)
    return analyze_chunks(split_text(text), automaton, groups)


def test_boundary_filter_no_false_positive() -> None:
    """「サーバー」のみの文で部分文字列「サーバ」を誤検出しない。"""
    groups = [["サーバ", "サーバー"]]
    results = _run_dict("サーバーを設定する。サーバーを再起動する。", groups)
    assert results == []


def test_dict_detects_real_mixture() -> None:
    """「サーバ」と「サーバー」が実際に混在する場合は検出する。"""
    groups = [["サーバ", "サーバー"]]
    results = _run_dict("サーバを設定する。サーバーを再起動する。", groups)
    assert len(results) == 1
    assert set(results[0].group) == {"サーバ", "サーバー"}


def test_morphological_okurigana() -> None:
    """送り仮名のゆれ（行なう/行う）を正規化形で検出する。"""
    results = morphological_detect("作業を行なう。次の作業を行う。")
    groups = [set(r.group) for r in results]
    assert any({"行なう", "行う"} <= g for g in groups)


def test_morphological_single_no_detect() -> None:
    """1表記のみなら正規化形検出は警告しない。"""
    results = morphological_detect("作業を行う。次も行う。")
    assert all("行なう" not in r.group for r in results)


def test_morphological_particle_not_detected() -> None:
    """助詞などの非自立語は検出対象にならない。"""
    results = morphological_detect("これはペンです。それはノートです。")
    for r in results:
        assert "は" not in r.group
