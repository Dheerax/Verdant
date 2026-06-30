/* ============================================================
   VERDANT — Agronomy engine
   Real horticulture math powering the Grow Simulator & VPD Matrix.
   No hardcoded outputs — every number is computed from established
   plant-science formulas (Tetens/Magnus VPD, DLI integration,
   Gaussian environmental response curves, Liebig's law of the minimum).
   ============================================================ */

/* ---------- Saturation vapour pressure (Tetens equation) ----------
   es(T) in kPa for temperature T in °C. */
export function saturationVaporPressure(tC: number): number {
  return 0.61078 * Math.exp((17.27 * tC) / (tC + 237.3))
}

/* ---------- Vapour Pressure Deficit (kPa) ----------
   Uses a leaf-temperature offset (leaves run ~1.5°C below air under
   transpiration). VPD = es(T_leaf) − e_air, where e_air = es(T_air)·RH. */
export function vpd(airTempC: number, relHumidityPct: number, leafOffsetC = 1.5): number {
  const leafT = airTempC - leafOffsetC
  const esLeaf = saturationVaporPressure(leafT)
  const esAir = saturationVaporPressure(airTempC)
  const eActual = esAir * (relHumidityPct / 100)
  return Math.max(0, esLeaf - eActual)
}

/* ---------- Daily Light Integral (mol·m⁻²·day⁻¹) ----------
   DLI = PPFD(µmol·m⁻²·s⁻¹) × photoperiod(h) × 3600 / 1e6 */
export function dli(ppfd: number, photoperiodH: number): number {
  return (ppfd * photoperiodH * 3600) / 1_000_000
}

/* ---------- Gaussian suitability (0..1) ----------
   1.0 at the optimum, falling off with a tolerance σ. A plant near its
   ideal value scores ~1; far away → ~0. */
export function suitability(value: number, optimum: number, tolerance: number): number {
  const z = (value - optimum) / tolerance
  return Math.exp(-0.5 * z * z)
}

/* Plateau suitability — full marks across a [lo, hi] band, Gaussian falloff
   outside it. Models "any value in the healthy range is fine". */
export function bandSuitability(value: number, lo: number, hi: number, edgeTolerance: number): number {
  if (value >= lo && value <= hi) return 1
  const d = value < lo ? lo - value : value - hi
  const z = d / edgeTolerance
  return Math.exp(-0.5 * z * z)
}

/* ============================================================
   Crop agronomic profiles — optimal environmental envelopes.
   Values are realistic controlled-environment targets.
   ============================================================ */
export interface AgroProfile {
  name: string
  emoji: string
  tempOpt: number // °C optimum
  tempTol: number
  vpdLo: number // kPa healthy band
  vpdHi: number
  dliOpt: number // mol/m²/day optimum
  dliTol: number
  ecOpt: number // mS/cm optimum
  ecTol: number
  co2Opt: number // ppm optimum
  co2Tol: number
  baseDays: number // days-to-harvest at ideal conditions
  baseYield: number // kg/m² at ideal conditions
}

export const AGRO_PROFILES: Record<string, AgroProfile> = {
  lettuce: { name: 'Butterhead Lettuce', emoji: '🥬', tempOpt: 20, tempTol: 5, vpdLo: 0.6, vpdHi: 1.0, dliOpt: 15, dliTol: 6, ecOpt: 1.2, ecTol: 0.6, co2Opt: 900, co2Tol: 500, baseDays: 35, baseYield: 4.2 },
  basil: { name: 'Genovese Basil', emoji: '🌿', tempOpt: 24, tempTol: 5, vpdLo: 0.8, vpdHi: 1.2, dliOpt: 22, dliTol: 7, ecOpt: 1.6, ecTol: 0.7, co2Opt: 1000, co2Tol: 500, baseDays: 28, baseYield: 2.1 },
  tomato: { name: 'Cherry Tomato', emoji: '🍅', tempOpt: 23, tempTol: 4, vpdLo: 0.9, vpdHi: 1.3, dliOpt: 26, dliTol: 8, ecOpt: 2.3, ecTol: 0.8, co2Opt: 1100, co2Tol: 500, baseDays: 65, baseYield: 9.5 },
  pepper: { name: 'Bell Pepper', emoji: '🫑', tempOpt: 24, tempTol: 4, vpdLo: 1.0, vpdHi: 1.4, dliOpt: 25, dliTol: 8, ecOpt: 2.2, ecTol: 0.8, co2Opt: 1100, co2Tol: 500, baseDays: 70, baseYield: 7.0 },
  chard: { name: 'Rainbow Chard', emoji: '🥗', tempOpt: 19, tempTol: 6, vpdLo: 0.7, vpdHi: 1.1, dliOpt: 17, dliTol: 7, ecOpt: 1.8, ecTol: 0.7, co2Opt: 900, co2Tol: 500, baseDays: 40, baseYield: 5.0 },
  strawberry: { name: 'Strawberry', emoji: '🍓', tempOpt: 20, tempTol: 4, vpdLo: 0.7, vpdHi: 1.1, dliOpt: 20, dliTol: 7, ecOpt: 1.4, ecTol: 0.6, co2Opt: 950, co2Tol: 500, baseDays: 90, baseYield: 3.4 },
  kale: { name: 'Kale', emoji: '🥬', tempOpt: 18, tempTol: 6, vpdLo: 0.7, vpdHi: 1.1, dliOpt: 17, dliTol: 7, ecOpt: 1.8, ecTol: 0.7, co2Opt: 900, co2Tol: 500, baseDays: 55, baseYield: 4.8 },
  microgreens: { name: 'Pea Microgreens', emoji: '🌱', tempOpt: 21, tempTol: 5, vpdLo: 0.5, vpdHi: 0.9, dliOpt: 12, dliTol: 6, ecOpt: 1.0, ecTol: 0.5, co2Opt: 800, co2Tol: 500, baseDays: 12, baseYield: 1.6 },
}

export const AGRO_KEYS = Object.keys(AGRO_PROFILES)

/* ============================================================
   Environment → growth prediction
   ============================================================ */
export interface SimInputs {
  temp: number // °C
  humidity: number // % RH
  ppfd: number // µmol/m²/s
  photoperiod: number // hours/day
  ec: number // mS/cm
  co2: number // ppm
}

export interface FactorScore {
  key: string
  label: string
  value: number
  unit: string
  score: number // 0..1
  optimum: string
}

export interface SimResult {
  vpd: number
  dli: number
  growthIndex: number // 0..1 overall
  limiting: string // limiting factor label
  daysToHarvest: number
  yield: number // kg/m²
  factors: FactorScore[]
  verdict: 'optimal' | 'good' | 'suboptimal' | 'stressed'
}

/* CO₂ has diminishing returns and only helps when light is strong — model a
   saturating benefit capped at the optimum rather than a symmetric penalty. */
function co2Score(co2: number, opt: number, tol: number): number {
  if (co2 >= opt) return 1
  return bandSuitability(co2, opt, opt + tol, tol)
}

export function simulate(profile: AgroProfile, inp: SimInputs): SimResult {
  const _vpd = vpd(inp.temp, inp.humidity)
  const _dli = dli(inp.ppfd, inp.photoperiod)

  const sTemp = suitability(inp.temp, profile.tempOpt, profile.tempTol)
  const sVpd = bandSuitability(_vpd, profile.vpdLo, profile.vpdHi, 0.35)
  const sDli = suitability(_dli, profile.dliOpt, profile.dliTol)
  const sEc = suitability(inp.ec, profile.ecOpt, profile.ecTol)
  const sCo2 = co2Score(inp.co2, profile.co2Opt, profile.co2Tol)

  const factors: FactorScore[] = [
    { key: 'temp', label: 'Temperature', value: inp.temp, unit: '°C', score: sTemp, optimum: `${profile.tempOpt}°C` },
    { key: 'vpd', label: 'VPD', value: +_vpd.toFixed(2), unit: 'kPa', score: sVpd, optimum: `${profile.vpdLo}–${profile.vpdHi}` },
    { key: 'dli', label: 'Light (DLI)', value: +_dli.toFixed(1), unit: 'mol', score: sDli, optimum: `${profile.dliOpt}` },
    { key: 'ec', label: 'Nutrient EC', value: inp.ec, unit: 'mS', score: sEc, optimum: `${profile.ecOpt}` },
    { key: 'co2', label: 'CO₂', value: inp.co2, unit: 'ppm', score: sCo2, optimum: `${profile.co2Opt}` },
  ]

  /* Liebig's law of the minimum — growth is gated by the weakest factor,
     blended with the geometric mean so several mild stresses still compound. */
  const scores = factors.map((f) => f.score)
  const minScore = Math.min(...scores)
  const geoMean = Math.pow(scores.reduce((a, b) => a * b, 1), 1 / scores.length)
  const growthIndex = 0.55 * minScore + 0.45 * geoMean

  const limiting = factors.reduce((a, b) => (a.score < b.score ? a : b)).label

  /* Slower growth when stressed (asymptote at 1.8× base days),
     yield scales with the growth index. */
  const daysToHarvest = Math.round(profile.baseDays * (1 + (1 - growthIndex) * 0.8))
  const yld = +(profile.baseYield * (0.35 + 0.65 * growthIndex)).toFixed(1)

  let verdict: SimResult['verdict'] = 'stressed'
  if (growthIndex >= 0.88) verdict = 'optimal'
  else if (growthIndex >= 0.7) verdict = 'good'
  else if (growthIndex >= 0.5) verdict = 'suboptimal'

  return {
    vpd: +_vpd.toFixed(2),
    dli: +_dli.toFixed(1),
    growthIndex,
    limiting,
    daysToHarvest,
    yield: yld,
    factors,
    verdict,
  }
}

/* ============================================================
   VPD matrix — classifies a temp/RH cell into a grower zone.
   These bands are the industry-standard VPD targets by stage.
   ============================================================ */
export type VpdZone = 'danger-wet' | 'propagation' | 'vegetative' | 'flower' | 'danger-dry'

export interface VpdBand {
  zone: VpdZone
  label: string
  range: string
  color: string
}

export const VPD_BANDS: VpdBand[] = [
  { zone: 'danger-wet', label: 'Over-transpiration risk', range: '< 0.4 kPa', color: '#4be3ff' },
  { zone: 'propagation', label: 'Propagation / clones', range: '0.4 – 0.8', color: '#38f5c9' },
  { zone: 'vegetative', label: 'Vegetative growth', range: '0.8 – 1.2', color: '#8bff5a' },
  { zone: 'flower', label: 'Flower / fruit', range: '1.2 – 1.6', color: '#ffc24b' },
  { zone: 'danger-dry', label: 'Water-stress risk', range: '> 1.6 kPa', color: '#ff6b6b' },
]

export function vpdZone(vpdValue: number): VpdBand {
  if (vpdValue < 0.4) return VPD_BANDS[0]
  if (vpdValue < 0.8) return VPD_BANDS[1]
  if (vpdValue < 1.2) return VPD_BANDS[2]
  if (vpdValue < 1.6) return VPD_BANDS[3]
  return VPD_BANDS[4]
}
