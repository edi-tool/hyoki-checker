from contextlib import asynccontextmanager
from dataclasses import asdict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .analyzer import analyze_chunks, build_automaton, morphological_detect
from .chunker import split_text
from .dict_manager import load_layered_dict, save_custom_dict
from .normalizer import normalize_text
from .synonym_detector import detect_synonyms, load_synonym_variants

_automaton = None
_dict_groups: list[list[str]] = []


def _reload_dict() -> None:
    global _automaton, _dict_groups
    _dict_groups = load_layered_dict()
    _automaton = build_automaton(_dict_groups)


@asynccontextmanager
async def lifespan(app: FastAPI):
    _reload_dict()
    load_synonym_variants()
    yield


app = FastAPI(title="表記揺れ検知API v2", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    text: str
    include_sudachi_auto: bool = True
    include_reading: bool = False
    normalize: bool = False


class CustomDictRequest(BaseModel):
    groups: list[list[str]]


def _merge_unique(results: list, additions: list, seen: set) -> None:
    """グループ重複を避けて検出結果を追加する。

    既に検出済みのグループ（語の集合が同一）は重複として追加しない。
    辞書→同義語→正規化形の優先順で先に追加されたものを残す。

    Args:
        results: 追加先の結果リスト（破壊的に更新）。
        additions: 追加候補の結果リスト。
        seen: 既出グループの集合（破壊的に更新）。
    """
    for r in additions:
        signature = frozenset(r.group)
        if signature in seen:
            continue
        seen.add(signature)
        results.append(r)


@app.post("/analyze")
async def analyze(req: AnalyzeRequest):
    if not req.text:
        raise HTTPException(status_code=400, detail="text は必須です")

    text = normalize_text(req.text) if req.normalize else req.text

    # 1. 辞書ベース（形態素境界フィルタ済み）
    chunks = split_text(text)
    results = analyze_chunks(chunks, _automaton, _dict_groups)
    seen = {frozenset(r.group) for r in results}

    # 2. Sudachi同義語辞書ベース（主軸）
    _merge_unique(results, detect_synonyms(text), seen)

    # 3. 正規化形ベース（辞書未収録ゆれのフォールバック）
    if req.include_sudachi_auto:
        auto = morphological_detect(text, use_reading=req.include_reading)
        _merge_unique(results, auto, seen)

    return {"results": [asdict(r) for r in results]}


@app.post("/dict/custom")
async def update_custom_dict(req: CustomDictRequest):
    save_custom_dict(req.groups)
    _reload_dict()
    return {"status": "ok", "group_count": len(_dict_groups)}


@app.get("/dict/info")
async def dict_info():
    return {"group_count": len(_dict_groups)}
