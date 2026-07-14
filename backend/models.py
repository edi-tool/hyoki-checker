from dataclasses import dataclass, field
from typing import Any, Literal


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
    recommended: str | None
    counts: list[VariantMatch]
    others: list[str] = field(default_factory=list)
    occurrences: list[dict[str, Any]] = field(default_factory=list)
    isInconsistent: bool = False
    observedMajority: str | None = None
    ruleId: str = ""
    type: str = "consistency"
    category: str = ""
    severity: str = "info"
    fixMode: Literal["auto", "confirm", "none"] = "none"
    reason: str = ""
    normalized_form: str = ""
    source: dict[str, Any] | str = field(default_factory=dict)
