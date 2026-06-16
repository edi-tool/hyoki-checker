"""neologdnによる文字種正規化モジュール。

全角・半角、長音記号、チルダ、連続空白などのゆれを正規化し、
表記ゆれ検出の前処理として表層のばらつきを吸収する。
"""

import neologdn


def normalize_text(text: str) -> str:
    """テキストの文字種を正規化する。

    neologdnで全角半角・長音記号・チルダ・重複空白等を統一する。
    文字数が変化しうるため、正規化後テキストに対する位置情報は
    元テキストの位置とは一致しない点に注意する。

    Args:
        text: 正規化対象のテキスト。

    Returns:
        正規化済みテキスト。
    """
    if not text:
        return text
    return neologdn.normalize(text)
