from collections import defaultdict
from functools import lru_cache
import re

import ahocorasick

from .models import AnalysisResult, TextChunk, VariantMatch
from .dict_manager import adapt_rule

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


def _normalize_rules(values: list) -> list[dict]:
    return [rule for index, value in enumerate(values) if (rule := adapt_rule(value, index, "legacy"))]


def build_automaton(dict_groups: list[dict]) -> ahocorasick.Automaton:
    """構造化ルールからAho-Corasickオートマトンを構築する。"""
    dict_groups = _normalize_rules(dict_groups)
    A = ahocorasick.Automaton()
    for gid, rule in enumerate(dict_groups):
        if rule.get("type") == "pattern":
            continue
        for word in rule.get("variants", []):
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
    dict_groups: list[dict],
) -> list[AnalysisResult]:
    """チャンクリストを解析し、辞書ベースの表記揺れを検知する。

    Aho-Corasickのマッチのうち、形態素境界に整合する（語の途中で切れていない）
    ものだけを採用し、部分文字列による誤検出を排除する。位置は絶対位置の集合で
    集計するため、チャンクのオーバーラップによる二重計上も解消される。
    """
    dict_groups = _normalize_rules(dict_groups)
    # gid → {word → {絶対position, ...}}（setでoverlap重複を排除）
    all_matches: dict[int, dict[str, set[int]]] = defaultdict(lambda: defaultdict(set))
    pattern_matches: dict[int, dict[str, set[int]]] = defaultdict(lambda: defaultdict(set))

    for chunk in chunks:
        starts, ends = _token_boundaries(chunk.text)
        use_boundary = bool(starts)
        for end_idx, (gid, word) in automaton.iter(chunk.text):
            start = end_idx - len(word) + 1
            end_excl = end_idx + 1
            if use_boundary and (start not in starts or end_excl not in ends):
                continue  # 形態素境界に揃わない部分一致は誤検出として除外
            all_matches[gid][word].add(chunk.offset + start)
        for gid, rule in enumerate(dict_groups):
            if rule.get("type") != "pattern" or not rule.get("pattern"):
                continue
            try:
                for match in re.finditer(rule["pattern"], chunk.text):
                    pattern_matches[gid][match.group(0)].add(chunk.offset + match.start())
            except re.error:
                continue

    results: list[AnalysisResult] = []
    for gid, word_positions in {**all_matches, **pattern_matches}.items():
        rule = dict_groups[gid]
        group = rule.get("variants", [])
        counts = [
            VariantMatch(word=w, count=len(ps), positions=sorted(ps))
            for w, ps in word_positions.items()
        ]
        counts.sort(key=lambda x: x.count, reverse=True)

        rule_type = rule.get("type", "preferred")
        preferred = rule.get("preferred")
        if rule_type in {"consistency", "contextual"} and len(word_positions) < 2:
            continue
        if rule_type not in {"consistency", "contextual", "forbidden", "pattern"}:
            if not any(word != preferred for word in word_positions):
                continue
        fix_mode = rule.get("fixMode", "none")
        if rule_type in {"consistency", "contextual"}:
            fix_mode = "none"
        if rule_type in {"consistency", "contextual", "forbidden", "pattern"}:
            others = list(word_positions)
        else:
            others = [word for word in word_positions if word != preferred]
        occurrences = sorted(
            (
                {"word": word, "start": start, "end": start + len(word)}
                for word, positions in word_positions.items()
                for start in positions
            ),
            key=lambda item: item["start"],
        )

        results.append(AnalysisResult(
            group=group,
            recommended=preferred,
            counts=counts,
            others=others,
            occurrences=occurrences,
            isInconsistent=len(word_positions) >= 2,
            observedMajority=counts[0].word,
            ruleId=rule.get("id", ""),
            type=rule_type,
            category=rule.get("category", ""),
            severity=rule.get("severity", "info"),
            fixMode=fix_mode,
            reason=rule.get("reason", ""),
            source=rule.get("source", {}),
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
            recommended=None,
            counts=counts,
            others=group,
            occurrences=sorted(
                (
                    {"word": word, "start": start, "end": start + len(word)}
                    for word, positions in surf_positions.items()
                    for start in positions
                ),
                key=lambda item: item["start"],
            ),
            isInconsistent=True,
            observedMajority=counts[0].word,
            ruleId=f"sudachi.{kind}.{key}",
            type="consistency",
            category="sudachi",
            severity="info",
            fixMode="none",
            reason="Sudachiによる自動候補。意味と文脈を確認してください。",
            normalized_form=key if kind == "norm" else "",
            source={
                "pack": "sudachi",
                "title": "Sudachi automatic detection",
                "license": "Apache-2.0",
            },
        ))

    return results


def sudachi_auto_detect(text: str) -> list[AnalysisResult]:
    """後方互換: 正規化形ベースの表記揺れ検知（morphological_detect）に委譲する。"""
    return morphological_detect(text, use_reading=False)
