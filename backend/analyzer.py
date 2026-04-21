from collections import defaultdict

import ahocorasick

from .models import AnalysisResult, TextChunk, VariantMatch


def build_automaton(dict_groups: list[list[str]]) -> ahocorasick.Automaton:
    """辞書グループからAho-Corasickオートマトンを構築する。"""
    A = ahocorasick.Automaton()
    for gid, group in enumerate(dict_groups):
        for word in group:
            if word:
                A.add_word(word, (gid, word))
    A.make_automaton()
    return A


def analyze_chunks(
    chunks: list[TextChunk],
    automaton: ahocorasick.Automaton,
    dict_groups: list[list[str]],
) -> list[AnalysisResult]:
    """チャンクリストを1スキャンで解析し、表記揺れを検知する。"""
    # gid → {word → [position, ...]}
    all_matches: dict[int, dict[str, list[int]]] = defaultdict(lambda: defaultdict(list))

    for chunk in chunks:
        for end_idx, (gid, word) in automaton.iter(chunk.text):
            pos = chunk.offset + end_idx - len(word) + 1
            all_matches[gid][word].append(pos)

    results: list[AnalysisResult] = []
    for gid, word_positions in all_matches.items():
        if len(word_positions) < 2:
            continue  # 1種類のみの出現はスキップ

        group = dict_groups[gid]
        counts = [
            VariantMatch(word=w, count=len(ps), positions=ps)
            for w, ps in word_positions.items()
        ]
        counts.sort(key=lambda x: x.count, reverse=True)
        recommended = counts[0].word

        results.append(AnalysisResult(
            group=group,
            recommended=recommended,
            counts=counts,
        ))

    return results


def sudachi_auto_detect(text: str) -> list[AnalysisResult]:
    """SudachiPyの正規化形を利用し、辞書なしで送り仮名等の揺れを自動検知する。"""
    try:
        import sudachipy
        tokenizer = sudachipy.Dictionary().create()
    except Exception:
        return []

    # 表層形 → 正規化形のマッピングを収集
    normalized_to_surfaces: dict[str, set[str]] = defaultdict(set)
    for token in tokenizer.tokenize(text):
        surface = token.surface()
        normalized = token.normalized_form()
        if surface != normalized and len(surface) > 1:
            normalized_to_surfaces[normalized].add(surface)
            normalized_to_surfaces[normalized].add(normalized)

    results: list[AnalysisResult] = []
    for normalized, surfaces in normalized_to_surfaces.items():
        if len(surfaces) < 2:
            continue
        group = sorted(surfaces)
        counts = [VariantMatch(word=w, count=text.count(w)) for w in group]
        counts = [c for c in counts if c.count > 0]
        if len(counts) < 2:
            continue
        counts.sort(key=lambda x: x.count, reverse=True)
        results.append(AnalysisResult(
            group=group,
            recommended=normalized,
            counts=counts,
            normalized_form=normalized,
            source="sudachi_auto",
        ))

    return results
