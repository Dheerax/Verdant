/* ============================================================
   API client for the VERDANT ML backend (FastAPI).
   Every call degrades gracefully: if the backend is offline,
   we return a clearly-flagged demo result so the UI never breaks
   during a presentation.
   ============================================================ */

export interface Prediction {
  label: string
  score: number
}

export interface DiagnoseResult {
  ok: boolean
  offline: boolean
  model: string
  top: Prediction
  predictions: Prediction[]
  crop?: string
  condition?: string
  healthy: boolean
  severity: 'none' | 'low' | 'moderate' | 'high'
  summary: string
  treatment: string[]
  prevention: string[]
}

export interface IdentifyResult {
  ok: boolean
  offline: boolean
  model: string
  top: Prediction
  predictions: Prediction[]
}

export interface AdvisorResult {
  ok: boolean
  offline: boolean
  answer: string
  score: number
  topic: string
  related: string[]
  sources: string[]
}

const TIMEOUT = 60000

async function postFile<T>(url: string, file: File): Promise<T> {
  const form = new FormData()
  form.append('file', file)
  const ctrl = new AbortController()
  const id = setTimeout(() => ctrl.abort(), TIMEOUT)
  try {
    const res = await fetch(url, { method: 'POST', body: form, signal: ctrl.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return (await res.json()) as T
  } finally {
    clearTimeout(id)
  }
}

export async function getHealth(): Promise<{ ok: boolean; models: Record<string, boolean> }> {
  try {
    const res = await fetch('/api/health', { signal: AbortSignal.timeout(4000) })
    if (!res.ok) throw new Error()
    return await res.json()
  } catch {
    return { ok: false, models: {} }
  }
}

export async function diagnoseDisease(file: File): Promise<DiagnoseResult> {
  try {
    return await postFile<DiagnoseResult>('/api/diagnose', file)
  } catch {
    return demoDiagnose()
  }
}

export async function identifySpecies(file: File): Promise<IdentifyResult> {
  try {
    return await postFile<IdentifyResult>('/api/identify', file)
  } catch {
    return demoIdentify()
  }
}

export async function askAdvisor(question: string): Promise<AdvisorResult> {
  try {
    const res = await fetch('/api/advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
      signal: AbortSignal.timeout(TIMEOUT),
    })
    if (!res.ok) throw new Error()
    return await res.json()
  } catch {
    return demoAdvisor(question)
  }
}

/* ---------- offline demo fallbacks ---------- */

function demoDiagnose(): DiagnoseResult {
  return {
    ok: true,
    offline: true,
    model: 'wambugu71/crop_leaf_diseases_vit',
    top: { label: 'Tomato Late Blight', score: 0.93 },
    predictions: [
      { label: 'Tomato Late Blight', score: 0.93 },
      { label: 'Tomato Early Blight', score: 0.05 },
      { label: 'Tomato Healthy', score: 0.02 },
    ],
    crop: 'Tomato',
    condition: 'Late Blight',
    healthy: false,
    severity: 'high',
    summary:
      'Late blight (Phytophthora infestans) detected with high confidence. This water-mould spreads fast in cool, humid canopies and can collapse a crop within days.',
    treatment: [
      'Isolate and remove affected foliage immediately; bag and discard (do not compost).',
      'Apply a copper-based or biofungicide on a 5–7 day cycle.',
      'Drop canopy humidity below 80% and improve airflow between racks.',
    ],
    prevention: [
      'Water at the root zone, never on leaves.',
      'Space plants for airflow and prune lower leaves.',
      'Rotate solanaceous crops and sanitise tools between zones.',
    ],
  }
}

function demoIdentify(): IdentifyResult {
  return {
    ok: true,
    offline: true,
    model: 'dima806/medicinal_plants_image_detection',
    top: { label: 'Rosemary', score: 0.88 },
    predictions: [
      { label: 'Rosemary', score: 0.88 },
      { label: 'Pothos', score: 0.07 },
      { label: 'Aloe Vera', score: 0.03 },
    ],
  }
}

function demoAdvisor(_question: string): AdvisorResult {
  return {
    ok: true,
    offline: true,
    score: 0.82,
    topic: 'General',
    answer:
      "I'm running in offline demo mode (start the backend for live semantic search). In general: keep leafy greens at 18–22°C, EC 1.2–1.8, and 14–16h of light. Match watering to crop stage and never let humidity sit above 80% on fruiting racks.",
    related: ['What EC for lettuce?', 'How to prevent root rot?', 'Best light cycle for basil'],
    sources: ['VERDANT agronomy KB'],
  }
}
