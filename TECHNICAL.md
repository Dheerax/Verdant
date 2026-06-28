# VERDANT — Technical Documentation

**Version:** 1.0  
**Stack:** React 19 · TypeScript · Tailwind CSS v4 · Vite 6 · FastAPI · PyTorch · HuggingFace Transformers · Sentence-Transformers · Ollama  
**Repository:** https://github.com/Dheerax/Verdant

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Backend Architecture](#4-backend-architecture)
5. [Machine-Learning Models](#5-machine-learning-models)
6. [AI Advisor — RAG Pipeline](#6-ai-advisor--rag-pipeline)
7. [REST API Reference](#7-rest-api-reference)
8. [Data-Flow Walkthroughs](#8-data-flow-walkthroughs)
9. [Design System](#9-design-system)
10. [File & Directory Layout](#10-file--directory-layout)
11. [Environment & Configuration](#11-environment--configuration)
12. [Setup & Running Locally](#12-setup--running-locally)
13. [Dependencies](#13-dependencies)

---

## 1. Project Overview

VERDANT is a full-stack intelligent urban farming platform that makes AI-powered plant diagnostics and agronomy advice accessible from a browser. It exposes three distinct AI capabilities:

| Tool | Input | AI technique | Output |
|---|---|---|---|
| **Plant Doctor** | Leaf photograph | Vision Transformer image classification | Disease class · confidence · severity · treatment + prevention plan |
| **Species Scanner** | Plant photograph | Vision Transformer image classification | Species name · confidence distribution · grow profile |
| **AI Advisor** | Natural-language question | Sentence-Transformer semantic search + Ollama LLM (Gemma 3) | Expert agronomy answer grounded in curated knowledge base |

The system runs entirely on a developer's machine — no external cloud calls except for the Ollama LLM step, which is optional and gracefully skipped if no API key is present. All ML inference is local CPU via PyTorch.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User's Browser                          │
│                                                             │
│   React 19 SPA  (Vite dev server  :5173)                    │
│   Landing → App shell → [Overview | Doctor | Scanner | Adv] │
└───────────────────┬─────────────────────────────────────────┘
                    │  /api/*  (Vite proxy → :8000)
                    │
┌───────────────────▼─────────────────────────────────────────┐
│                FastAPI  :8000  (Python 3.10+)                │
│                                                             │
│   POST /api/diagnose   →  Disease ViT pipeline              │
│   POST /api/identify   →  Species ViT pipeline              │
│   POST /api/advisor    →  Sentence-Transformer + KB + Ollama│
│   GET  /api/health     →  Model status check                │
└──────────┬────────────────────────┬────────────────────────┘
           │                        │
┌──────────▼──────────┐   ┌────────▼──────────────────────────┐
│  HuggingFace Hub    │   │  Ollama Cloud API                  │
│  (first-run DL)     │   │  api.ollama.com/api/chat           │
│                     │   │  Model: gemma3:4b                  │
│  crop_leaf_diseases │   │  Auth: Bearer token                │
│  medicinal_plants   │   └────────────────────────────────────┘
│  all-MiniLM-L6-v2   │
└─────────────────────┘
```

### Communication

- The Vite dev server proxies every `/api/*` request to `http://127.0.0.1:8000`, so the frontend never hard-codes the backend address.
- All endpoints accept and return JSON except `/diagnose` and `/identify`, which receive `multipart/form-data` file uploads.
- If the backend is unreachable (connection refused, timeout > 60 s), the frontend returns a pre-built **offline demo result** so the UI remains fully functional during presentations.

---

## 3. Frontend Architecture

### 3.1 Technology Choices

| Library | Version | Purpose |
|---|---|---|
| React | 19 | Component model, state, hooks |
| TypeScript | 5.x | Type safety across all layers |
| Vite | 6 | Dev server with HMR, build tool |
| Tailwind CSS | v4 (Vite plugin) | Utility-first styling |
| Framer Motion | 12 | Page transitions, reveal animations |
| Lucide React | — | Icon system (consistent SVG icons) |

### 3.2 Application Shell (`App.tsx`)

The entire app lives in a single component with two top-level states:

```tsx
const [launched, setLaunched] = useState(false)   // Landing ↔ App toggle
const [view, setView]         = useState<View>('overview')
```

**Rendering logic:**

```
launched = false  →  <Landing onLaunch={() => setLaunched(true)} />
launched = true   →  <Sidebar> + <Topbar> + <main> containing renderView(view)
```

`AnimatePresence mode="wait"` wraps both states so transitions play sequentially (exit animation completes before enter begins).

**View type:**

```ts
type View = 'overview' | 'doctor' | 'scanner' | 'advisor'
```

Navigation is stateless — `navigate(v: View)` sets the view and scrolls to the top. `goHome()` sets `launched = false` and resets view to `'overview'`.

### 3.3 Component Tree

```
App
├── Background          Canvas firefly particles (ambient animation)
├── Landing             Full-screen entry page (shown before launch)
│   ├── Nav bar
│   ├── Hero (botanical PNG overlays + CTA)
│   ├── How-it-works cards (Plant Doctor · Scanner · Advisor)
│   └── Stats + launch strip
└── (after launch)
    ├── Sidebar         Fixed left nav — logo, 4 nav items
    ├── Topbar          Breadcrumb + mobile hamburger
    └── main
        ├── Overview    Platform home — KPIs, capabilities, model table
        ├── PlantDoctor Upload + diagnosis result
        ├── Scanner     Upload + species result + grow profile
        └── Advisor     Chat UI + suggestions + input form
```

### 3.4 UI Component Library (`components/ui.tsx`)

All primitive components live in a single file, exported as named components:

| Component | Props | Description |
|---|---|---|
| `GlassCard` | `hover`, `glow`, `onClick`, `className` | Frosted glass card with optional glow border |
| `Chip` | `tone` (lime/mint/emerald/amber/muted/danger), `dot` | Pill badge with colour variants |
| `Reveal` | `delay`, `className` | Wraps `motion.div` with fade-up entrance |
| `SectionTitle` | `eyebrow`, `title`, `sub`, `right` | Section heading with sub-text and optional right slot |
| `GlowButton` | `variant` (solid/outline), `onClick` | Primary CTA button |
| `Ring` | `value`, `color`, `size`, `stroke` | SVG circular progress ring |
| `Bar` | `value`, `color`, `height` | Horizontal progress bar |
| `Sparkline` | `data`, `w`, `h`, `color` | Mini SVG line chart |

### 3.5 API Client (`lib/api.ts`)

Single source of truth for all backend calls. Key design decisions:

- **60-second timeout** via `AbortController` — image inference on CPU can take 30–50 s on first cold start.
- **Graceful degradation** — every exported function catches errors and returns a typed `offline: true` demo result. The UI renders the same components regardless.
- **Vite proxy** — all calls use relative paths (`/api/...`); no environment variable needed.

**TypeScript interfaces:**

```ts
DiagnoseResult  { ok, offline, model, top, predictions, crop, condition, healthy, severity, summary, treatment[], prevention[] }
IdentifyResult  { ok, offline, model, top, predictions[] }
AdvisorResult   { ok, offline, answer, score, topic, related[], sources[] }
```

### 3.6 Routing & Navigation

There is no React Router — navigation is pure state. This was a deliberate choice for simplicity:

- Single URL (`localhost:5173/`) — no history API usage.
- The `View` type is the entire route state.
- Sidebar + Topbar both receive `onNavigate` and `onHome` callbacks.
- Deep links are not supported (not needed for this use case).

### 3.7 Animation Architecture

Framer Motion is used at three levels:

1. **Page transitions** — `AnimatePresence mode="wait"` at the `launched` toggle and the `view` switch. Cubic ease `[0.22, 1, 0.36, 1]` (custom expo-out) throughout.
2. **Section reveals** — `<Reveal delay={n}>` stagger-wraps every major content block. Uses `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}`, observed via `IntersectionObserver` pattern via Framer's `whileInView`.
3. **Interactive micro-animations** — `whileHover={{ scale: 1.04 }}` and `whileTap={{ scale: 0.97 }}` on primary buttons.

---

## 4. Backend Architecture

### 4.1 Framework: FastAPI

FastAPI was chosen for:
- Automatic OpenAPI / Swagger docs at `/docs`
- Native `async/await` for the Ollama HTTP call
- `python-multipart` file upload support
- Pydantic validation with zero boilerplate

### 4.2 Server Startup — Lifespan & Warmup

```python
@asynccontextmanager
async def lifespan(_app: FastAPI):
    threading.Thread(target=_warmup, daemon=True).start()
    yield
```

On startup, a **daemon thread** calls `_warmup()`, which pre-loads all three models into the module-level `_cache` dict. This means:
- The server accepts requests immediately (does not block on model load).
- The first request after warmup completes hits a hot cache.
- Warmup failures are logged but do not crash the server.

### 4.3 Model Cache (`ml.py`)

All models are stored in a module-level `_cache` dict, protected by per-key `threading.Lock` objects (double-checked locking pattern):

```python
_cache: dict[str, Any] = {}
_locks: dict[str, threading.Lock] = { 'disease': Lock(), 'species': Lock(), 'embed': Lock(), 'kb': Lock() }
```

Lazily populated on first access via `get_disease()`, `get_species()`, `get_embedder()`. Concurrent requests that arrive before warmup finishes will block on the lock until the model is ready, then share the single cached instance.

### 4.4 CORS

```python
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
```

Open CORS is used because this is a local-only development tool. In production this would be locked to the frontend's origin.

### 4.5 Async / Sync Split

| Path | Async? | Reason |
|---|---|---|
| `/api/diagnose` | `async` | FastAPI requires it, but actual work is sync CPU |
| `/api/identify` | `async` | Same |
| `/api/advisor` | `async` | Awaits `_call_ollama()` which is a real async HTTP call |
| Model inference | sync (thread pool) | PyTorch / HuggingFace pipelines are not async |

FastAPI automatically runs sync route handlers in a thread pool to avoid blocking the event loop.

---

## 5. Machine-Learning Models

All three models are **pretrained** — no fine-tuning or training is performed by VERDANT. They are downloaded from HuggingFace Hub on first use and cached at `~/.cache/huggingface/hub`.

### 5.1 Disease Classifier

| Property | Value |
|---|---|
| HuggingFace ID | `wambugu71/crop_leaf_diseases_vit` |
| Architecture | Vision Transformer (ViT-Base/16) |
| Task | `image-classification` |
| Classes | 14+ disease/healthy labels |
| Crops covered | Corn · Potato · Rice · Wheat · Tomato · Pepper · Apple · Grape and more |
| Validation accuracy | ~98% |
| Input | PIL Image (any size — pipeline auto-resizes to 224×224) |
| Output | Sorted list of `{label, score}` |

**Label format:** `CropName___condition_name` e.g. `Tomato___Late_blight`

The `prettify()` function in `ml.py` converts this to a human-readable string:
- `___` → ` · `
- `_` → ` `
- Each word title-cased

The `parse_label()` function extracts the crop and condition separately for structured display.

**Severity mapping** (`ml.py → advice_for()`): keyword matching against a priority-ordered list of `(keywords_tuple, advice_dict)` pairs. The first match wins. Advice objects carry `severity`, `summary`, `treatment[]`, and `prevention[]`.

### 5.2 Species Classifier

| Property | Value |
|---|---|
| HuggingFace ID | `dima806/medicinal_plants_image_detection` |
| Architecture | Vision Transformer (ViT) |
| Task | `image-classification` |
| Classes | 52 medicinal plant species |
| Input | PIL Image |
| Output | Sorted list of `{label, score}` (top-5 returned) |

The frontend's `matchCrop()` function in `Scanner.tsx` attempts to match the identified species label against the local `CROPS` dataset in `lib/data.ts`. If a match is found, a grow profile (days-to-harvest, water need, difficulty, yield/m², notes) is displayed.

### 5.3 Sentence-Transformer (Advisor Retrieval)

| Property | Value |
|---|---|
| HuggingFace ID | `sentence-transformers/all-MiniLM-L6-v2` |
| Architecture | MiniLM (6 layers, 22M params) |
| Embedding dimension | 384 |
| Task | Semantic sentence similarity |
| Throughput | ~14 000 sentences/sec on CPU |

Used exclusively for semantic search over the knowledge base. See Section 6 for the full RAG pipeline.

---

## 6. AI Advisor — RAG Pipeline

The advisor implements a lightweight Retrieval-Augmented Generation (RAG) pattern:

```
User question
     │
     ▼
Sentence-Transformer encodes question → 384-d vector
     │
     ▼
Cosine similarity against pre-encoded KB question vectors
     │
     ▼
Top-1 KB entry selected  (question + answer + topic)
     │
     ├─── score < 0.35 → prepend "I'm not fully sure…" disclaimer
     │
     ▼
KB answer used as grounding context for Ollama LLM call
     │
     ├─── OLLAMA_API_KEY missing → return KB answer directly (offline mode)
     │
     ▼
_call_ollama(question, kb_context)
     │   POST https://api.ollama.com/api/chat
     │   Model: gemma3:4b
     │   System prompt: agronomy expert persona
     │   User message: "KB context:\n{kb_answer}\n\nQuestion: {question}"
     │
     ├─── HTTP 200 → replace answer with LLM-generated text
     └─── any error → fall back to raw KB answer
     │
     ▼
Return { answer, score, topic, related[], sources[] }
```

### 6.1 Knowledge Base (`knowledge.py`)

The KB is a hand-curated list of `{topic, q, a}` dicts covering:

| Topic | Sample questions |
|---|---|
| Lettuce | EC/pH ranges, tip-burn, temperature |
| Nutrients | N/P/K roles, deficiency diagnosis, solution change frequency, EC |
| pH | Optimal range, adjustment methods |
| Light | Basil light cycle, DLI, LED distance |
| Root Rot | Prevention, hydrogen peroxide, reservoir temp |
| Microgreens | Harvest timing, seeding density |
| Tomato | Flowering light, calcium/BER, EC during fruiting |
| Pests | Fungus gnats, spider mites |
| Water | Temperature, dissolved oxygen, RO water |
| General | Carbon footprint, water savings, yield comparison |

**Pre-encoding:** On server startup, all KB *questions* are encoded once and stored as a tensor in `_cache['kb_emb']`. This means semantic search is a single matrix-vector dot product at query time — effectively free.

### 6.2 Ollama Integration

```python
async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
    r = await client.post(
        "https://api.ollama.com/api/chat",
        headers={"Authorization": f"Bearer {OLLAMA_API_KEY}"},
        json={
            "model": "gemma3:4b",
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": f"KB context:\n{kb_context}\n\nQuestion: {question}"}
            ],
            "stream": False,
        },
    )
    return r.json()["message"]["content"].strip()
```

**Ollama API format:** Native Ollama format (not OpenAI-compatible). Response key is `message.content`, not `choices[0].message.content`.

**Model:** `gemma3:4b` — Google's Gemma 3 4B parameter model, available on the Ollama cloud API. Chosen for its strong instruction-following and speed on cloud hardware.

**System prompt** constrains the model to: agronomy/urban farming expertise, 3–5 sentence answers, specific and data-driven, redirect off-topic questions.

---

## 7. REST API Reference

Base URL (via Vite proxy): `/api`  
Direct: `http://localhost:8000`

---

### `GET /api/health`

Returns the current status of all models and the LLM connection.

**Response:**

```json
{
  "ok": true,
  "models": {
    "disease": true,
    "species": true,
    "advisor": true
  },
  "ids": {
    "disease": "wambugu71/crop_leaf_diseases_vit",
    "species": "dima806/medicinal_plants_image_detection",
    "advisor": "sentence-transformers/all-MiniLM-L6-v2"
  },
  "llm": true,
  "llm_model": "gemma3:4b"
}
```

`models.*` fields are `false` until the warmup thread finishes loading the respective model.

---

### `POST /api/diagnose`

Classifies plant disease from a leaf image.

**Request:** `multipart/form-data` with field `file` (any common image format)

**Response:**

```json
{
  "ok": true,
  "offline": false,
  "model": "wambugu71/crop_leaf_diseases_vit",
  "top": { "label": "Tomato · Late Blight", "score": 0.94 },
  "predictions": [
    { "label": "Tomato · Late Blight",  "score": 0.94 },
    { "label": "Tomato · Early Blight", "score": 0.04 },
    { "label": "Tomato · Healthy",      "score": 0.02 }
  ],
  "crop": "Tomato",
  "condition": "Late Blight",
  "healthy": false,
  "severity": "high",
  "summary": "Late blight (Phytophthora) detected on Tomato — ...",
  "treatment": ["Remove and bag affected leaves...", "..."],
  "prevention": ["Water at the root zone...", "..."]
}
```

**Error:** `HTTP 400` on empty file, `HTTP 500` on inference failure.

---

### `POST /api/identify`

Identifies plant species from an image.

**Request:** `multipart/form-data` with field `file`

**Response:**

```json
{
  "ok": true,
  "offline": false,
  "model": "dima806/medicinal_plants_image_detection",
  "top": { "label": "Rosemary", "score": 0.87 },
  "predictions": [
    { "label": "Rosemary", "score": 0.87 },
    { "label": "Lavender", "score": 0.08 },
    { "label": "Thyme",    "score": 0.05 }
  ]
}
```

---

### `POST /api/advisor`

Answers an agronomy question using RAG + optional LLM.

**Request body (JSON):**

```json
{ "question": "What EC and pH suit lettuce?" }
```

**Response:**

```json
{
  "ok": true,
  "offline": false,
  "answer": "Lettuce grows best at EC 0.8–1.2 mS/cm and pH 5.8–6.2...",
  "score": 0.91,
  "topic": "Lettuce",
  "related": [
    "Why does my lettuce have brown leaf tips?",
    "What temperature is best for growing lettuce?"
  ],
  "sources": ["VERDANT KB · gemma3:4b via Ollama"]
}
```

`score` is the cosine similarity between the user's question and the matched KB entry (0–1). `sources` reflects whether the answer was enhanced by the LLM or came straight from the KB.

---

## 8. Data-Flow Walkthroughs

### 8.1 Plant Doctor — Disease Diagnosis

```
User drops image on Uploader
       │
       ▼
handleFile(f: File)
  setPreview(URL.createObjectURL(f))
  setLoading(true)
  r = await diagnoseDisease(f)         ← api.ts
       │
       ▼ POST /api/diagnose  multipart
       │
       ▼ FastAPI endpoint
  data = await file.read()             ← bytes
  preds = ml.classify(ml.get_disease(), data, top_k=5)
       │
       ▼ ml.classify()
  img = PIL.Image.open(BytesIO(data)).convert("RGB")
  out = pipeline(img, top_k=5)        ← HuggingFace transformers
  return [{label, score}, ...]
       │
       ▼ ml.build_diagnosis(preds)
  parse_label(raw)   → (crop, condition)
  advice_for(raw)    → {severity, summary, treatment[], prevention[]}
  return full DiagnoseResult dict
       │
       ▼ JSON response → frontend
  setResult(r)
  setLoading(false)
       │
       ▼ React re-renders result panel
  Ring (confidence score)
  Severity chip
  Probability distribution bars
  Treatment + Prevention lists
```

### 8.2 AI Advisor — Question Answering

```
User types question + submits form
       │
       ▼
send(question)
  append user message to messages[]
  setLoading(true)
  r = await askAdvisor(question)       ← api.ts
       │
       ▼ POST /api/advisor  JSON
       │
       ▼ FastAPI endpoint (async)
  kb = ml.answer(question)
       │
       ▼ ml.answer()
  qv = embedder.encode(question)       ← 384-d vector
  scores = cosine_similarity(qv, kb_embeddings)   ← tensor dot product
  idx = argmax(scores)
  item = KB[idx]
  return {answer, score, topic, related[]}
       │
       ▼ back in endpoint
  llm_answer = await _call_ollama(question, kb["answer"])
       │
       ▼ httpx POST to api.ollama.com/api/chat
  if HTTP 200:
      kb["answer"] = llm_answer
      kb["sources"] = ["VERDANT KB · gemma3:4b via Ollama"]
       │
       ▼ JSON response → frontend
  append AI message to messages[]
  setLoading(false)
       │
       ▼ React renders chat bubble
  Topic eyebrow label
  Answer text
  Related question chips (clickable → auto-send)
```

---

## 9. Design System

### 9.1 Colour Palette

| Token | Hex | Usage |
|---|---|---|
| `--lime` | `#8bff5a` | Primary accent, stat highlights |
| `--emerald` | `#19e08c` | Secondary accent, nav active states |
| `--mint` | `#38f5c9` | Tertiary accent, score readouts |
| `--cyan` | `#2af5f0` | Water/humidity indicators |
| `--amber` | `#ffc24b` | Warning severity, offline state |
| `--danger` | `#ff6b6b` | High-severity disease alerts |
| Canvas | `#03100a` | Near-black base background |
| Glass | `rgba(255,255,255,0.04)` | Card background |
| Border | `rgba(255,255,255,0.08)` | Card and divider borders |

### 9.2 Typography

| Role | Font | Usage |
|---|---|---|
| Display | Space Grotesk | Headlines, numbers, card titles |
| Body | Inter | Paragraphs, descriptions |
| Mono | JetBrains Mono | Eyebrows, badges, code, data labels |

### 9.3 Glass Morphism

Cards use a layered glass effect:
- `background: rgba(255,255,255,0.04)` (barely-visible fill)
- `border: 1px solid rgba(255,255,255,0.08)`
- `backdrop-filter: blur(12px)` on the strongest variant
- `box-shadow: 0 0 0 1px rgba(255,255,255,0.06) inset`

### 9.4 Glow Effects

Neon glows are implemented via `text-shadow` and `box-shadow`:

```css
.text-glow   { text-shadow: 0 0 30px #19e08c60, 0 0 60px #19e08c30; }
.glow-lime   { box-shadow: 0 0 20px #8bff5a40, 0 0 40px #8bff5a20; }
.glow-emerald{ box-shadow: 0 0 20px #19e08c40; }
```

### 9.5 Botanical Assets

All botanical overlay images are true alpha-transparent PNGs (generated by Google AI + PIL background removal). They use standard `<img>` tags with opacity utilities — no `mix-blend-mode: screen` required.

| Asset | Used in |
|---|---|
| `monstera-transparent.png` | Landing hero overlay (top-right) |
| `fern-transparent.png` | Landing hero overlay (top-left) + Scanner card |
| `leaf-transparent.png` | Landing hero overlay (bottom-center) |
| `sprout-transparent.png` | Landing hero overlay (bottom-right) |
| `diseased-leaf.png` | Plant Doctor sample / How-it-works card |
| `hero-farm.png` | Overview hero image (neon vertical farm) |
| `logo-glow.png` | Brand logo (nav, chat avatar) |

### 9.6 Background Animation (`Background.tsx`)

A `<canvas>` element renders procedural "firefly" particles:
- N particles (scales with viewport), each with random position, velocity, and opacity.
- Each frame: position updates, opacity oscillates (sine), particles out of bounds wrap.
- Drawn as soft radial gradient circles (lime at center, transparent at edges).
- `requestAnimationFrame` loop, paused when the tab is hidden.

---

## 10. File & Directory Layout

```
Urban Farm/
│
├── .gitignore                     Root gitignore (secrets, venvs, cache)
├── README.md                      Project overview + quick start
├── TECHNICAL.md                   This document
├── start.ps1                      One-shot Windows launcher
│
├── backend/
│   ├── requirements.txt           Python dependencies
│   ├── download_models.py         Pre-download HuggingFace weights (run once)
│   ├── run.ps1                    Backend launcher script
│   └── app/
│       ├── __init__.py
│       ├── main.py                FastAPI app, endpoints, Ollama client
│       ├── ml.py                  Model loading, inference, advice engine
│       └── knowledge.py           Curated agronomy knowledge base (KB)
│
├── frontend/
│   ├── index.html                 Vite entry HTML
│   ├── vite.config.ts             Vite config (proxy, plugins)
│   ├── tailwind.config.ts         (v4 — inline via @theme in CSS)
│   ├── package.json
│   ├── tsconfig.json
│   │
│   ├── public/
│   │   └── assets/
│   │       ├── botanical/         Transparent plant PNGs
│   │       ├── brand/             Logo assets
│   │       ├── feature/           Feature-specific photos
│   │       ├── hero/              Hero background image
│   │       └── texture/           Ambient texture overlays
│   │
│   └── src/
│       ├── App.tsx                Root component, routing state
│       ├── index.css              Tailwind directives + custom tokens
│       │
│       ├── components/
│       │   ├── Background.tsx     Canvas firefly animation
│       │   ├── Sidebar.tsx        Left nav (desktop) — View type exported here
│       │   ├── Topbar.tsx         Top bar — breadcrumb + mobile nav
│       │   ├── Uploader.tsx       Drag-and-drop + sample image picker
│       │   └── ui.tsx             Shared primitive components
│       │
│       ├── sections/
│       │   ├── Landing.tsx        Entry page (pre-launch)
│       │   ├── Overview.tsx       Platform home with KPIs + features
│       │   ├── PlantDoctor.tsx    Disease diagnosis UI
│       │   ├── Scanner.tsx        Species identification UI
│       │   └── Advisor.tsx        AI chat interface
│       │
│       └── lib/
│           ├── api.ts             Backend client + offline fallbacks
│           ├── cn.ts              className merge utility
│           └── data.ts            Static data (CROPS, KPIs, sparklines)
│
└── assets/                        Raw source images (pre-compositing)
    ├── botanical/
    ├── brand/
    ├── feature/
    ├── hero/
    └── texture/
```

---

## 11. Environment & Configuration

### `backend/.env`

```env
OLLAMA_API_KEY=<your-ollama-cloud-key>
OLLAMA_MODEL=gemma3:4b
```

Both variables are optional. If `OLLAMA_API_KEY` is absent, the advisor returns the raw KB answer without LLM enhancement. `OLLAMA_MODEL` defaults to `llama3.2` if unset.

### Vite Proxy (`vite.config.ts`)

```ts
server: {
  allowedHosts: true,     // allows tunnel hostnames (serveo, localtunnel, etc.)
  proxy: {
    '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true }
  }
}
```

`allowedHosts: true` disables Vite's host-validation check, required when sharing via tunnel services.

### HuggingFace Cache

Models are cached at `~/.cache/huggingface/hub` (default). To override:

```powershell
$env:HF_HOME = "D:\models"     # PowerShell
```

---

## 12. Setup & Running Locally

### Prerequisites

- Python 3.10+
- Node.js 18+
- ~1 GB free disk for model weights

### Step 1 — Backend

```powershell
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt

# (Optional) Pre-download model weights — run once, takes 5–10 min
.venv\Scripts\python download_models.py

# Create .env with your Ollama key (optional)
echo "OLLAMA_API_KEY=your_key" > .env
echo "OLLAMA_MODEL=gemma3:4b" >> .env

# Start the API server
.venv\Scripts\python -m uvicorn app.main:app --port 8000
```

### Step 2 — Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

### Step 3 — One-shot (Windows)

```powershell
./start.ps1
```

Launches both services in separate terminal windows.

### Model Download Times (approximate, on typical broadband)

| Model | Size | Download time |
|---|---|---|
| `wambugu71/crop_leaf_diseases_vit` | ~350 MB | ~2–4 min |
| `dima806/medicinal_plants_image_detection` | ~350 MB | ~2–4 min |
| `sentence-transformers/all-MiniLM-L6-v2` | ~90 MB | ~30 sec |

Models are downloaded only once and cached permanently.

---

## 13. Dependencies

### Python (`backend/requirements.txt`)

| Package | Version | Purpose |
|---|---|---|
| `fastapi` | ≥0.115 | REST API framework |
| `uvicorn[standard]` | ≥0.30 | ASGI server with WebSocket + HTTP/2 |
| `python-multipart` | ≥0.0.9 | File upload parsing |
| `pillow` | ≥10.3 | Image decoding for ML pipeline |
| `torch` | ≥2.2 | PyTorch — tensor ops + model runtime |
| `transformers` | ≥4.44 | HuggingFace pipeline for ViT models |
| `sentence-transformers` | ≥3.0 | Semantic embedding for advisor |
| `httpx` | ≥0.27 | Async HTTP client for Ollama |
| `python-dotenv` | ≥1.0 | Load `backend/.env` secrets |
| `pip-system-certs` | ≥4.0 | Windows: trust system SSL certs for HuggingFace downloads |

### JavaScript (`frontend/package.json`)

| Package | Purpose |
|---|---|
| `react` + `react-dom` | UI component model |
| `framer-motion` | Animations and page transitions |
| `lucide-react` | SVG icon library |
| `tailwindcss` + `@tailwindcss/vite` | Utility-first CSS, v4 Vite plugin |
| `@vitejs/plugin-react` | React fast-refresh for Vite |
| `typescript` | Type safety |
| `vite` | Build tool and dev server |

---

*VERDANT Technical Documentation — generated 2026-06-22*
