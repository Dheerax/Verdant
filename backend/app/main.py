"""VERDANT ML API — FastAPI server exposing three pretrained models.

Run:  uvicorn app.main:app --port 8000   (from the backend/ folder)
"""

from __future__ import annotations

import os
import threading
from contextlib import asynccontextmanager
from pathlib import Path

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from . import ml

load_dotenv(Path(__file__).parent.parent / ".env")

OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY", "")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
OLLAMA_BASE = "https://api.ollama.com"

_SYSTEM_PROMPT = (
    "You are VERDANT's AI agronomy advisor — an expert in vertical urban farming, "
    "hydroponics, aeroponics, plant nutrition, pest control, and sustainable agriculture. "
    "Answer in 3-5 concise, practical sentences. Be specific and data-driven. "
    "If the question is outside agronomy or farming, politely redirect."
)


def _warmup() -> None:
    """Pre-load models in the background so the first request is fast."""
    for name, fn in (("disease", ml.get_disease), ("species", ml.get_species)):
        try:
            fn()
            print(f"[warmup] {name} model ready")
        except Exception as exc:  # noqa: BLE001
            print(f"[warmup] {name} model failed: {exc}")
    try:
        ml._kb_embeddings()
        print("[warmup] advisor embeddings ready")
    except Exception as exc:  # noqa: BLE001
        print(f"[warmup] advisor failed: {exc}")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    threading.Thread(target=_warmup, daemon=True).start()
    yield


app = FastAPI(title="VERDANT ML API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


async def _call_ollama(question: str, kb_context: str) -> str | None:
    """Call Ollama cloud /api/chat with KB context as grounding. Returns None on any failure."""
    if not OLLAMA_API_KEY:
        return None
    user_msg = (
        f"Relevant knowledge base context:\n{kb_context}\n\n"
        f"Grower's question: {question}"
    )
    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            r = await client.post(
                f"{OLLAMA_BASE}/api/chat",
                headers={"Authorization": f"Bearer {OLLAMA_API_KEY}"},
                json={
                    "model": OLLAMA_MODEL,
                    "messages": [
                        {"role": "system", "content": _SYSTEM_PROMPT},
                        {"role": "user", "content": user_msg},
                    ],
                    "stream": False,
                },
            )
            if r.status_code == 200:
                return r.json()["message"]["content"].strip()
            print(f"[ollama] HTTP {r.status_code}: {r.text[:200]}")
    except Exception as exc:
        print(f"[ollama] call failed: {exc}")
    return None


@app.get("/api/health")
def health():
    return {
        "ok": True,
        "models": ml.loaded(),
        "ids": {
            "disease": ml.DISEASE_MODEL,
            "species": ml.SPECIES_MODEL,
            "advisor": ml.EMBED_MODEL,
        },
        "llm": bool(OLLAMA_API_KEY),
        "llm_model": OLLAMA_MODEL if OLLAMA_API_KEY else None,
    }


@app.post("/api/diagnose")
async def diagnose(file: UploadFile = File(...)):
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="empty file")
    try:
        preds = ml.classify(ml.get_disease(), data, top_k=5)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"inference failed: {exc}")
    return ml.build_diagnosis(preds)


@app.post("/api/identify")
async def identify(file: UploadFile = File(...)):
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="empty file")
    try:
        preds = ml.classify(ml.get_species(), data, top_k=5)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"inference failed: {exc}")
    return {
        "ok": True,
        "offline": False,
        "model": ml.SPECIES_MODEL,
        "top": {"label": ml.prettify(preds[0]["label"]), "score": preds[0]["score"]},
        "predictions": [{"label": ml.prettify(p["label"]), "score": p["score"]} for p in preds],
    }


class AdvisorQuery(BaseModel):
    question: str


@app.post("/api/advisor")
async def advisor(q: AdvisorQuery):
    if not q.question.strip():
        raise HTTPException(status_code=400, detail="empty question")

    # semantic search gives KB context + related questions
    try:
        kb = ml.answer(q.question)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"advisor failed: {exc}")

    # upgrade answer with Ollama LLM (uses KB result as grounding context)
    llm_answer = await _call_ollama(q.question, kb["answer"])
    if llm_answer:
        kb["answer"] = llm_answer
        kb["sources"] = [f"VERDANT KB · {OLLAMA_MODEL} via Ollama"]

    return kb
