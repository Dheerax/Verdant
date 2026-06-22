/* ============================================================
   VERDANT — synthetic farm telemetry & catalog
   Drives the live dashboards. Values are seeded then jittered
   client-side to feel "live" without a sensor backend.
   ============================================================ */

export type Trend = 'up' | 'down' | 'flat'

export interface Kpi {
  key: string
  label: string
  value: number
  unit: string
  delta: number // % vs last period
  trend: Trend
  spark: number[]
}

export interface Zone {
  id: string
  name: string
  crop: string
  emoji: string
  stage: string
  progress: number // 0..100 to harvest
  health: number // 0..100
  temp: number
  humidity: number
  soil: number // moisture %
  light: number // % of target PPFD
  status: 'optimal' | 'watch' | 'alert'
}

export interface AlertItem {
  id: string
  zone: string
  level: 'info' | 'warn' | 'crit'
  msg: string
  ago: string
}

export interface Crop {
  name: string
  emoji: string
  family: string
  daysToHarvest: number
  water: 'low' | 'medium' | 'high'
  difficulty: 'easy' | 'moderate' | 'expert'
  yieldPerM2: number
  note: string
}

export const KPIS: Kpi[] = [
  { key: 'yield', label: 'Projected Yield', value: 412, unit: 'kg/mo', delta: 8.4, trend: 'up', spark: [280, 300, 295, 330, 360, 348, 390, 412] },
  { key: 'water', label: 'Water Saved', value: 73, unit: '%', delta: 4.1, trend: 'up', spark: [58, 60, 63, 62, 67, 69, 71, 73] },
  { key: 'energy', label: 'Energy / kg', value: 1.9, unit: 'kWh', delta: -6.2, trend: 'down', spark: [2.6, 2.5, 2.4, 2.3, 2.2, 2.1, 2.0, 1.9] },
  { key: 'carbon', label: 'CO₂ Offset', value: 1.4, unit: 't/mo', delta: 11.0, trend: 'up', spark: [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4] },
  { key: 'crops', label: 'Active Crops', value: 18, unit: 'types', delta: 2.0, trend: 'up', spark: [12, 13, 14, 14, 15, 16, 17, 18] },
  { key: 'auto', label: 'Automation', value: 96, unit: '%', delta: 1.2, trend: 'up', spark: [88, 90, 91, 92, 93, 94, 95, 96] },
]

export const ZONES: Zone[] = [
  { id: 'A1', name: 'Rack A · Leafy', crop: 'Butterhead Lettuce', emoji: '🥬', stage: 'Vegetative', progress: 64, health: 97, temp: 22.4, humidity: 64, soil: 71, light: 92, status: 'optimal' },
  { id: 'B2', name: 'Rack B · Herbs', crop: 'Genovese Basil', emoji: '🌿', stage: 'Mature', progress: 88, health: 99, temp: 24.1, humidity: 58, soil: 68, light: 88, status: 'optimal' },
  { id: 'C1', name: 'Rack C · Fruiting', crop: 'Cherry Tomato', emoji: '🍅', stage: 'Flowering', progress: 47, health: 82, temp: 25.8, humidity: 71, soil: 54, light: 96, status: 'watch' },
  { id: 'C3', name: 'Rack C · Fruiting', crop: 'Bell Pepper', emoji: '🫑', stage: 'Fruiting', progress: 59, health: 91, temp: 25.2, humidity: 66, soil: 62, light: 94, status: 'optimal' },
  { id: 'D2', name: 'Rack D · Roots', crop: 'Rainbow Chard', emoji: '🥗', stage: 'Vegetative', progress: 38, health: 74, temp: 21.9, humidity: 77, soil: 49, light: 80, status: 'alert' },
  { id: 'E1', name: 'Rack E · Micro', crop: 'Pea Microgreens', emoji: '🌱', stage: 'Germination', progress: 22, health: 95, temp: 23.0, humidity: 82, soil: 88, light: 60, status: 'optimal' },
]

export const ALERTS: AlertItem[] = [
  { id: 'al1', zone: 'D2', level: 'crit', msg: 'Soil moisture below threshold — drip cycle queued', ago: '2m' },
  { id: 'al2', zone: 'C1', level: 'warn', msg: 'Canopy temp trending high — vents at 60%', ago: '14m' },
  { id: 'al3', zone: 'B2', level: 'info', msg: 'Basil ready for harvest in ~3 days', ago: '38m' },
  { id: 'al4', zone: 'A1', level: 'info', msg: 'Nutrient dose A/B balanced to EC 1.8', ago: '1h' },
  { id: 'al5', zone: 'E1', level: 'info', msg: 'Germination humidity dome at optimal 82%', ago: '2h' },
]

export const CROPS: Crop[] = [
  { name: 'Butterhead Lettuce', emoji: '🥬', family: 'Asteraceae', daysToHarvest: 35, water: 'medium', difficulty: 'easy', yieldPerM2: 4.2, note: 'Thrives at 18–22°C, EC 1.2. Ideal beginner leafy green.' },
  { name: 'Genovese Basil', emoji: '🌿', family: 'Lamiaceae', daysToHarvest: 28, water: 'medium', difficulty: 'easy', yieldPerM2: 2.1, note: 'High light lover. Pinch tops to bush out and delay flowering.' },
  { name: 'Cherry Tomato', emoji: '🍅', family: 'Solanaceae', daysToHarvest: 65, water: 'high', difficulty: 'moderate', yieldPerM2: 9.5, note: 'Needs pollination assist & strong PPFD. Watch for blight.' },
  { name: 'Bell Pepper', emoji: '🫑', family: 'Solanaceae', daysToHarvest: 70, water: 'high', difficulty: 'moderate', yieldPerM2: 7.0, note: 'Warm-season fruiting crop. Calcium key to avoid blossom rot.' },
  { name: 'Rainbow Chard', emoji: '🥗', family: 'Amaranthaceae', daysToHarvest: 40, water: 'medium', difficulty: 'easy', yieldPerM2: 5.0, note: 'Cut-and-come-again. Tolerant of cooler racks.' },
  { name: 'Strawberry', emoji: '🍓', family: 'Rosaceae', daysToHarvest: 90, water: 'medium', difficulty: 'expert', yieldPerM2: 3.4, note: 'Day-neutral cultivars suit vertical NFT channels.' },
  { name: 'Kale', emoji: '🥬', family: 'Brassicaceae', daysToHarvest: 55, water: 'medium', difficulty: 'easy', yieldPerM2: 4.8, note: 'Cold-hardy nutrient powerhouse, very forgiving.' },
  { name: 'Pea Microgreens', emoji: '🌱', family: 'Fabaceae', daysToHarvest: 12, water: 'low', difficulty: 'easy', yieldPerM2: 1.6, note: 'Fastest cash crop. Harvest at 7–14 days.' },
]

/* ---------- time-series generators ---------- */

/** 24-hour environment curve (temp, humidity, CO₂, light). */
export function dayCurve() {
  const out: { t: string; temp: number; humidity: number; co2: number; light: number }[] = []
  for (let h = 0; h < 24; h++) {
    const day = h >= 6 && h <= 20
    const arc = Math.sin(((h - 6) / 14) * Math.PI) // 0..1 across daylight
    out.push({
      t: `${String(h).padStart(2, '0')}:00`,
      temp: +(20 + (day ? arc * 6 : -1) + Math.random() * 0.6).toFixed(1),
      humidity: +(62 + (day ? -arc * 8 : 10) + Math.random() * 3).toFixed(0),
      co2: +(420 + (day ? arc * 480 : 60) + Math.random() * 30).toFixed(0),
      light: day ? +(arc * 100).toFixed(0) : 0,
    })
  }
  return out
}

/** Weekly yield vs target. */
export const WEEKLY_YIELD = [
  { d: 'Mon', actual: 52, target: 50 },
  { d: 'Tue', actual: 58, target: 52 },
  { d: 'Wed', actual: 49, target: 53 },
  { d: 'Thu', actual: 63, target: 55 },
  { d: 'Fri', actual: 67, target: 58 },
  { d: 'Sat', actual: 61, target: 58 },
  { d: 'Sun', actual: 70, target: 60 },
]

/** Resource mix for sustainability radial. */
export const RESOURCE_MIX = [
  { name: 'Solar', value: 58, color: '#8bff5a' },
  { name: 'Grid (green)', value: 27, color: '#38f5c9' },
  { name: 'Recovered', value: 15, color: '#19e08c' },
]

/** Water lifecycle (closed loop). */
export const WATER_FLOW = [
  { stage: 'Intake', value: 100 },
  { stage: 'Irrigation', value: 100 },
  { stage: 'Transpire', value: 38 },
  { stage: 'Captured', value: 34 },
  { stage: 'Recycled', value: 31 },
]

/** Monthly sustainability footprint vs conventional farming. */
export const FOOTPRINT = [
  { m: 'Jan', verdant: 30, conventional: 100 },
  { m: 'Feb', verdant: 28, conventional: 102 },
  { m: 'Mar', verdant: 26, conventional: 99 },
  { m: 'Apr', verdant: 24, conventional: 104 },
  { m: 'May', verdant: 22, conventional: 101 },
  { m: 'Jun', verdant: 19, conventional: 103 },
]

export const SUSTAIN_STATS = [
  { label: 'Water vs soil farming', value: '95%', sub: 'less consumed', icon: 'droplet' },
  { label: 'Food miles removed', value: '1,240', sub: 'km / shipment', icon: 'truck' },
  { label: 'Pesticide use', value: '0', sub: 'zero synthetic', icon: 'shield' },
  { label: 'Land efficiency', value: '99×', sub: 'yield per m²', icon: 'layers' },
]
