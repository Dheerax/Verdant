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

export interface GrowStage {
  name: string
  weeks: string
  temp: string
  vpd: string
  ec: string
  light: string
  tasks: string[]
  watch: string
}

export interface GrowPlan {
  ok: boolean
  offline: boolean
  crop: string
  summary: string
  totalWeeks: number
  stages: GrowStage[]
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

export async function generateGrowPlan(crop: string): Promise<GrowPlan> {
  try {
    const res = await fetch('/api/growplan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ crop }),
      signal: AbortSignal.timeout(TIMEOUT),
    })
    if (!res.ok) throw new Error()
    return await res.json()
  } catch {
    return demoGrowPlan(crop)
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

function demoGrowPlan(crop: string): GrowPlan {
  return {
    ok: true,
    offline: true,
    crop: crop ? crop.charAt(0).toUpperCase() + crop.slice(1) : 'Crop',
    summary: `A general controlled-environment schedule for ${crop || 'this crop'} from seed to harvest (offline template — start the backend for an AI-tailored plan).`,
    totalWeeks: 8,
    stages: [
      { name: 'Germination', weeks: '1', temp: '22–24°C', vpd: '0.4–0.6 kPa', ec: '0.5–0.8', light: '16h · 150 PPFD', watch: 'Damping-off in wet media', tasks: ['Sow into pre-moistened rockwool or plugs', 'Keep humidity 80%+ under a dome', 'Bottom-water only; never let media dry out'] },
      { name: 'Seedling', weeks: '2', temp: '21–23°C', vpd: '0.6–0.8 kPa', ec: '0.8–1.2', light: '16h · 200 PPFD', watch: 'Stretching from weak light', tasks: ['Remove humidity dome gradually', 'Begin quarter-strength nutrients', 'Add gentle airflow to strengthen stems'] },
      { name: 'Vegetative', weeks: '3–5', temp: '20–24°C', vpd: '0.8–1.1 kPa', ec: '1.4–1.8', light: '16h · 300 PPFD', watch: 'Nutrient tip-burn at high EC', tasks: ['Ramp to full-strength nutrients', 'Prune to shape the canopy', 'Scout leaf undersides for pests twice weekly'] },
      { name: 'Maturation', weeks: '6–7', temp: '19–23°C', vpd: '1.0–1.2 kPa', ec: '1.6–2.0', light: '14h · 350 PPFD', watch: 'Humidity spikes inviting mildew', tasks: ['Hold steady feeding and climate', 'Increase airflow as canopy fills', 'Begin checking for harvest readiness'] },
      { name: 'Harvest', weeks: '8', temp: '18–22°C', vpd: '1.0–1.2 kPa', ec: '1.2–1.6', light: '12h · 300 PPFD', watch: 'Over-maturity reducing quality', tasks: ['Harvest in the morning for best turgor', 'Use clean, sanitised tools', 'Cool immediately to extend shelf life'] },
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
