from dataclasses import dataclass, field
from typing import Literal


@dataclass
class TextChunk:
    id: int
    text: str
    offset: int
    structure: Literal["heading", "body", "quote", "caption"] = "body"
    page_hint: int = 0


@dataclass
class VariantMatch:
    word: str
    count: int
    positions: list[int] = field(default_factory=list)


@dataclass
class AnalysisResult:
    group: list[str]
    recommended: str
    counts: list[VariantMatch]
    normalized_form: str = ""
    source: Literal["dict", "sudachi_auto"] = "dict"
