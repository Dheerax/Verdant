"""
Pre-download all VERDANT ML models so the first API request is instant.

Run once before starting the server:
    python download_models.py          (from inside backend/)
    .venv\Scripts\python download_models.py
"""

import sys
import time

DISEASE_MODEL = "wambugu71/crop_leaf_diseases_vit"
SPECIES_MODEL = "dima806/medicinal_plants_image_detection"
EMBED_MODEL   = "sentence-transformers/all-MiniLM-L6-v2"


def _banner(msg: str) -> None:
    print(f"\n{'─' * 56}\n  {msg}\n{'─' * 56}")


def download_image_models() -> None:
    from transformers import pipeline

    for name, model_id in (
        ("Disease classifier", DISEASE_MODEL),
        ("Species classifier", SPECIES_MODEL),
    ):
        _banner(f"Downloading  {name}")
        t0 = time.perf_counter()
        try:
            pipeline("image-classification", model=model_id)
            print(f"  ✓ done in {time.perf_counter() - t0:.1f}s")
        except Exception as exc:
            print(f"  ✗ FAILED: {exc}", file=sys.stderr)


def download_embed_model() -> None:
    from sentence_transformers import SentenceTransformer

    _banner(f"Downloading  Sentence-Transformer")
    t0 = time.perf_counter()
    try:
        SentenceTransformer(EMBED_MODEL)
        print(f"  ✓ done in {time.perf_counter() - t0:.1f}s")
    except Exception as exc:
        print(f"  ✗ FAILED: {exc}", file=sys.stderr)


if __name__ == "__main__":
    print("VERDANT — model pre-download")
    print("Models will be cached in ~/.cache/huggingface/hub\n")

    download_image_models()
    download_embed_model()

    _banner("All models ready — start the server with:")
    print("  .venv\\Scripts\\python -m uvicorn app.main:app --port 8000\n")
