from contextlib import asynccontextmanager
from dataclasses import asdict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .analyzer import analyze_chunks, build_automaton, sudachi_auto_detect
from .chunker import split_text
from .dict_manager import load_layered_dict, save_custom_dict

_automaton = None
_dict_groups: list[list[str]] = []


def _reload_dict() -> None:
    global _automaton, _dict_groups
    _dict_groups = load_layered_dict()
    _automaton = build_automaton(_dict_groups)


@asynccontextmanager
async def lifespan(app: FastAPI):
    _reload_dict()
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
    include_sudachi_auto: bool = False


class CustomDictRequest(BaseModel):
    groups: list[list[str]]


@app.post("/analyze")
async def analyze(req: AnalyzeRequest):
    if not req.text:
        raise HTTPException(status_code=400, detail="text は必須です")

    chunks = split_text(req.text)
    results = analyze_chunks(chunks, _automaton, _dict_groups)

    if req.include_sudachi_auto:
        auto = sudachi_auto_detect(req.text)
        results.extend(auto)

    return {"results": [asdict(r) for r in results]}


@app.post("/dict/custom")
async def update_custom_dict(req: CustomDictRequest):
    save_custom_dict(req.groups)
    _reload_dict()
    return {"status": "ok", "group_count": len(_dict_groups)}


@app.get("/dict/info")
async def dict_info():
    return {"group_count": len(_dict_groups)}
