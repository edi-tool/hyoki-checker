"""Sudachi同義語辞書ベースの表記ゆれ検出モジュール。

`dicts/synonym_variants.json`（同一語彙素の表記ゆれクラスタ集合）を読み込み、
入力テキストを形態素解析して各語をクラスタと突き合わせる。
同一クラスタに属する異なる表記が同一文書内に2種以上出現した場合のみ警告する。

語彙素番号で区別済みのため、類義語（例: IT と 情報技術）は別クラスタとなり
混在検出の対象にならない。これにより校正時の過剰検出を防ぐ。
"""

import json
from collections import defaultdict
from pathlib import Path

from .analyzer import get_tokenizer, split_mode
from .models import AnalysisResult, VariantMatch

_VARIANTS_PATH = Path(__file__).parent / "dicts" / "synonym_variants.json"

# 語 → クラスタID（逆引き）と、クラスタID → 全表記
_word_to_cluster: dict[str, int] = {}
_cluster_words: list[list[str]] = []


def load_synonym_variants(path: Path = _VARIANTS_PATH) -> int:
    """表記ゆれクラスタJSONを読み込み、語の逆引きマップを構築する。

    Args:
        path: クラスタJSONのパス。

    Returns:
        読み込んだクラスタ数。ファイルが無い場合は0。
    """
    global _word_to_cluster, _cluster_words
    _word_to_cluster = {}
    _cluster_words = []
    if not path.exists():
        return 0

    clusters: list[list[str]] = json.loads(path.read_text(encoding="utf-8"))
    for cid, words in enumerate(clusters):
        _cluster_words.append(words)
        for word in words:
            # 既出語は先に登録されたクラスタを優先（重複時の安定化）
            _word_to_cluster.setdefault(word, cid)
    return len(_cluster_words)


def detect_synonyms(text: str) -> list[AnalysisResult]:
    """テキスト内の同義語辞書由来の表記ゆれ混在を検出する。

    形態素解析で語を切り出し、表層形・正規化形のいずれかが同義語クラスタに
    一致する語を集計する。同一クラスタの異なる表記が2種以上共存する場合のみ
    結果を返す。

    Args:
        text: 解析対象テキスト。

    Returns:
        表記ゆれの検出結果リスト。SudachiPy未導入時やクラスタ未ロード時は空。
    """
    if not _cluster_words:
        return []
    try:
        tokenizer = get_tokenizer()
        mode = split_mode()
    except Exception:
        return []

    # クラスタID → {出現表記 → [位置, ...]}
    hits: dict[int, dict[str, list[int]]] = defaultdict(lambda: defaultdict(list))
    for m in tokenizer.tokenize(text, mode):
        surface = m.surface()
        # 表層形を優先し、無ければ正規化形でクラスタを引く
        cid = _word_to_cluster.get(surface)
        matched = surface
        if cid is None:
            normalized = m.normalized_form()
            cid = _word_to_cluster.get(normalized)
            matched = normalized
        if cid is None:
            continue
        hits[cid][matched].append(m.begin())

    results: list[AnalysisResult] = []
    for cid, word_positions in hits.items():
        if len(word_positions) < 2:
            continue  # 文書内に1表記のみ＝ゆれなし

        counts = [
            VariantMatch(word=w, count=len(ps), positions=sorted(ps))
            for w, ps in word_positions.items()
        ]
        counts.sort(key=lambda x: x.count, reverse=True)

        cluster = _cluster_words[cid]
        # 推奨表記はクラスタ代表（先頭）。出現語に無くても辞書の代表を提示
        recommended = cluster[0]
        results.append(AnalysisResult(
            group=cluster,
            recommended=recommended,
            counts=counts,
            source="synonym",
        ))

    return results
