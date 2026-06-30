"""VERDANT ML API — FastAPI server exposing three pretrained models.

Run:  uvicorn app.main:app --port 8000   (from the backend/ folder)
"""

from __future__ import annotations

import json
import os
import re
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


_GROWPLAN_SYSTEM = (
    "You are VERDANT's master grower. Produce a complete controlled-environment "
    "grow plan for the requested crop as STRICT JSON only — no prose, no markdown. "
    "Schema: {\"crop\": str, \"summary\": str (one sentence), \"totalWeeks\": int, "
    "\"stages\": [{\"name\": str, \"weeks\": str (e.g. '1-2'), \"temp\": str, "
    "\"vpd\": str, \"ec\": str, \"light\": str (photoperiod + PPFD), "
    "\"tasks\": [str, str, str], \"watch\": str (one risk to watch)}]}. "
    "Give 4-6 stages from germination to harvest. Be specific and data-driven "
    "with real numbers. Output ONLY the JSON object."
)


def _extract_json(text: str) -> dict | None:
    """Pull the first JSON object out of an LLM response (handles code fences)."""
    if not text:
        return None
    text = re.sub(r"^```(?:json)?|```$", "", text.strip(), flags=re.MULTILINE).strip()
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        return None
    try:
        return json.loads(text[start : end + 1])
    except json.JSONDecodeError:
        return None


def _growplan_fallback(crop: str) -> dict:
    """Deterministic plan used when the LLM is unavailable."""
    return {
        "ok": True,
        "offline": True,
        "crop": crop.title(),
        "summary": f"A general controlled-environment schedule for {crop.title()} from seed to harvest.",
        "totalWeeks": 8,
        "stages": [
            {"name": "Germination", "weeks": "1", "temp": "22-24°C", "vpd": "0.4-0.6 kPa",
             "ec": "0.5-0.8", "light": "16h · 150 PPFD", "watch": "Damping-off in wet media",
             "tasks": ["Sow into pre-moistened rockwool or plugs", "Keep humidity 80%+ under a dome",
                       "Bottom-water only; never let media dry out"]},
            {"name": "Seedling", "weeks": "2", "temp": "21-23°C", "vpd": "0.6-0.8 kPa",
             "ec": "0.8-1.2", "light": "16h · 200 PPFD", "watch": "Stretching from weak light",
             "tasks": ["Remove humidity dome gradually", "Begin quarter-strength nutrients",
                       "Add gentle airflow to strengthen stems"]},
            {"name": "Vegetative", "weeks": "3-5", "temp": "20-24°C", "vpd": "0.8-1.1 kPa",
             "ec": "1.4-1.8", "light": "16h · 300 PPFD", "watch": "Nutrient tip-burn at high EC",
             "tasks": ["Ramp to full-strength nutrients", "Top/prune to shape the canopy",
                       "Scout leaf undersides for pests twice weekly"]},
            {"name": "Maturation", "weeks": "6-7", "temp": "19-23°C", "vpd": "1.0-1.2 kPa",
             "ec": "1.6-2.0", "light": "14h · 350 PPFD", "watch": "Humidity spikes inviting mildew",
             "tasks": ["Hold steady feeding and climate", "Increase airflow as canopy fills",
                       "Begin checking for harvest readiness"]},
            {"name": "Harvest", "weeks": "8", "temp": "18-22°C", "vpd": "1.0-1.2 kPa",
             "ec": "1.2-1.6", "light": "12h · 300 PPFD", "watch": "Over-maturity reducing quality",
             "tasks": ["Harvest in the morning for best turgor", "Use clean, sanitised tools",
                       "Cool immediately to extend shelf life"]},
        ],
    }


async def _growplan_llm(crop: str) -> dict | None:
    if not OLLAMA_API_KEY:
        return None
    try:
        async with httpx.AsyncClient(timeout=45.0, follow_redirects=True) as client:
            r = await client.post(
                f"{OLLAMA_BASE}/api/chat",
                headers={"Authorization": f"Bearer {OLLAMA_API_KEY}"},
                json={
                    "model": OLLAMA_MODEL,
                    "messages": [
                        {"role": "system", "content": _GROWPLAN_SYSTEM},
                        {"role": "user", "content": f"Crop: {crop}"},
                    ],
                    "stream": False,
                },
            )
            if r.status_code == 200:
                parsed = _extract_json(r.json()["message"]["content"])
                if parsed and parsed.get("stages"):
                    parsed["ok"] = True
                    parsed["offline"] = False
                    return parsed
            print(f"[growplan] HTTP {r.status_code}")
    except Exception as exc:  # noqa: BLE001
        print(f"[growplan] failed: {exc}")
    return None


class GrowPlanQuery(BaseModel):
    crop: str


@app.post("/api/growplan")
async def growplan(q: GrowPlanQuery):
    crop = q.crop.strip()
    if not crop:
        raise HTTPException(status_code=400, detail="empty crop")
    plan = await _growplan_llm(crop)
    return plan or _growplan_fallback(crop)


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
