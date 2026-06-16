from collections import defaultdict
from functools import lru_cache

import ahocorasick

from .models import AnalysisResult, TextChunk, VariantMatch

# 表記ゆれ判定の対象とする自立語の品詞大分類
_CONTENT_POS = {"名詞", "動詞", "形容詞", "副詞"}
# 自立語でもノイズになりやすい品詞細分類（接尾・非自立・数詞等）
_EXCLUDE_POS1 = {"非自立可能", "非自立", "接尾", "数詞", "助数詞可能"}


@lru_cache(maxsize=1)
def get_tokenizer():
    """SudachiPyトークナイザを遅延生成して共有する。

    生成コストが高いため、プロセス内で1インスタンスのみ生成しキャッシュする。

    Returns:
        SudachiPyのトークナイザオブジェクト。
    """
    import sudachipy
    return sudachipy.Dictionary().create()


def split_mode():
    """形態素分割モードC（最長単位）を返す。

    Returns:
        SudachiPyのSplitMode.C。
    """
    import sudachipy
    return sudachipy.SplitMode.C


def _has_kanji(text: str) -> bool:
    """文字列にCJK統合漢字が含まれるか判定する。

    Args:
        text: 判定対象文字列。

    Returns:
        漢字を含むならTrue。
    """
    return any("一" <= c <= "鿿" for c in text)


def build_automaton(dict_groups: list[list[str]]) -> ahocorasick.Automaton:
    """辞書グループからAho-Corasickオートマトンを構築する。"""
    A = ahocorasick.Automaton()
    for gid, group in enumerate(dict_groups):
        for word in group:
            if word:
                A.add_word(word, (gid, word))
    A.make_automaton()
    return A


def _token_boundaries(text: str) -> tuple[set[int], set[int]]:
    """テキストを形態素解析し、トークンの開始位置集合と終了位置集合を返す。

    Args:
        text: 解析対象テキスト。

    Returns:
        (開始位置集合, 終了位置集合)。SudachiPy未導入時は両方とも空集合。
    """
    try:
        tokenizer = get_tokenizer()
        mode = split_mode()
    except Exception:
        return set(), set()
    starts: set[int] = set()
    ends: set[int] = set()
    for m in tokenizer.tokenize(text, mode):
        starts.add(m.begin())
        ends.add(m.end())
    return starts, ends


def analyze_chunks(
    chunks: list[TextChunk],
    automaton: ahocorasick.Automaton,
    dict_groups: list[list[str]],
) -> list[AnalysisResult]:
    """チャンクリストを解析し、辞書ベースの表記揺れを検知する。

    Aho-Corasickのマッチのうち、形態素境界に整合する（語の途中で切れていない）
    ものだけを採用し、部分文字列による誤検出を排除する。位置は絶対位置の集合で
    集計するため、チャンクのオーバーラップによる二重計上も解消される。
    """
    # gid → {word → {絶対position, ...}}（setでoverlap重複を排除）
    all_matches: dict[int, dict[str, set[int]]] = defaultdict(lambda: defaultdict(set))

    for chunk in chunks:
        starts, ends = _token_boundaries(chunk.text)
        use_boundary = bool(starts)
        for end_idx, (gid, word) in automaton.iter(chunk.text):
            start = end_idx - len(word) + 1
            end_excl = end_idx + 1
            if use_boundary and (start not in starts or end_excl not in ends):
                continue  # 形態素境界に揃わない部分一致は誤検出として除外
            all_matches[gid][word].add(chunk.offset + start)

    results: list[AnalysisResult] = []
    for gid, word_positions in all_matches.items():
        if len(word_positions) < 2:
            continue  # 1種類のみの出現はスキップ

        group = dict_groups[gid]
        counts = [
            VariantMatch(word=w, count=len(ps), positions=sorted(ps))
            for w, ps in word_positions.items()
        ]
        counts.sort(key=lambda x: x.count, reverse=True)

        results.append(AnalysisResult(
            group=group,
            recommended=counts[0].word,
            counts=counts,
        ))

    return results


def morphological_detect(text: str, *, use_reading: bool = False) -> list[AnalysisResult]:
    """SudachiPyの正規化形を主軸に、辞書なしで表記揺れを検知する。

    自立語（名詞・動詞・形容詞・副詞）に限定し、正規化形が一致する複数の表層形が
    同一文書内に共存する場合のみ検出する。送り仮名や長音のゆれ（行なう/行う、
    サーバ/サーバー等）を辞書登録なしで拾える。

    Args:
        text: 解析対象テキスト。
        use_reading: Trueなら読み（発音）一致もクラスタ化する。同音異義語による
            誤検出が増えるため既定はFalse。

    Returns:
        検出結果リスト。SudachiPy未導入時は空。
    """
    try:
        tokenizer = get_tokenizer()
        mode = split_mode()
    except Exception:
        return []

    # クラスタキー → {表層形 → [位置, ...]}
    clusters: dict[tuple[str, str], dict[str, list[int]]] = defaultdict(
        lambda: defaultdict(list)
    )
    for m in tokenizer.tokenize(text, mode):
        pos = m.part_of_speech()
        if pos[0] not in _CONTENT_POS or pos[1] in _EXCLUDE_POS1:
            continue
        surface = m.surface()
        if len(surface) < 2 and not _has_kanji(surface):
            continue  # 1文字かなノイズを除外
        clusters[("norm", m.normalized_form())][surface].append(m.begin())
        if use_reading:
            reading = m.reading_form()
            if reading:
                clusters[("read", reading)][surface].append(m.begin())

    results: list[AnalysisResult] = []
    seen_groups: set[tuple[str, ...]] = set()
    for (kind, key), surf_positions in clusters.items():
        if len(surf_positions) < 2:
            continue
        group = sorted(surf_positions)
        signature = tuple(group)
        if signature in seen_groups:
            continue  # normと readで同一グループが重複した場合の排除
        seen_groups.add(signature)

        counts = [
            VariantMatch(word=w, count=len(ps), positions=sorted(ps))
            for w, ps in surf_positions.items()
        ]
        counts.sort(key=lambda x: x.count, reverse=True)
        results.append(AnalysisResult(
            group=group,
            recommended=counts[0].word,
            counts=counts,
            normalized_form=key if kind == "norm" else "",
            source="reading" if kind == "read" else "sudachi_auto",
        ))

    return results


def sudachi_auto_detect(text: str) -> list[AnalysisResult]:
    """後方互換: 正規化形ベースの表記揺れ検知（morphological_detect）に委譲する。"""
    return morphological_detect(text, use_reading=False)
