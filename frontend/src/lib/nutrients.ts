/* ============================================================
   VERDANT — Nutrient dosing engine
   Real hydroponic fertilizer chemistry. Given a reservoir volume,
   crop and growth stage, it solves a sequential elemental mass
   balance across standard salts to output exact gram doses.
   Not a lookup table — every gram is back-calculated from elemental
   composition and a Hoagland-derived target recipe scaled by EC.
   ============================================================ */

import { AGRO_PROFILES, type AgroProfile } from './agronomy'

/* ---------- Salt elemental composition (mass fraction) ---------- */
interface Salt {
  name: string
  formula: string
  color: string
  // fraction of each element by mass
  N?: number
  P?: number
  K?: number
  Ca?: number
  Mg?: number
  S?: number
}

const CAL_NIT: Salt = { name: 'Calcium Nitrate', formula: 'Ca(NO₃)₂·4H₂O', color: '#8bff5a', N: 0.155, Ca: 0.19 }
const KNO3: Salt = { name: 'Potassium Nitrate', formula: 'KNO₃', color: '#38f5c9', N: 0.13, K: 0.38 }
const MKP: Salt = { name: 'Monopotassium Phosphate', formula: 'KH₂PO₄', color: '#19e08c', P: 0.228, K: 0.287 }
const EPSOM: Salt = { name: 'Magnesium Sulfate', formula: 'MgSO₄·7H₂O', color: '#4be3ff', Mg: 0.098, S: 0.13 }
const K2SO4: Salt = { name: 'Potassium Sulfate', formula: 'K₂SO₄', color: '#b6ff6a', K: 0.415, S: 0.18 }

/* ---------- Reference recipe (ppm of element at EC 2.0, vegetative) ----------
   A realistic balanced controlled-environment formulation. */
const REF_EC = 2.0
const REF_RECIPE = { N: 150, P: 50, K: 210, Ca: 150, Mg: 50 }

export type Stage = 'seedling' | 'vegetative' | 'flower'

export const STAGES: { id: Stage; label: string; mult: number; hint: string }[] = [
  { id: 'seedling', label: 'Seedling', mult: 0.5, hint: 'Gentle — half strength' },
  { id: 'vegetative', label: 'Vegetative', mult: 1.0, hint: 'Full leafy growth' },
  { id: 'flower', label: 'Flower / Fruit', mult: 1.2, hint: 'Boosted P & K' },
]

export interface SaltDose {
  name: string
  formula: string
  grams: number
  gramsPerL: number
  color: string
  provides: string
}

export interface ElementPpm {
  el: string
  ppm: number
  color: string
}

export interface NutrientResult {
  targetEC: number
  tds: number // ppm TDS (700 scale)
  phTarget: string
  volume: number
  salts: SaltDose[]
  elements: ElementPpm[]
  mixingSteps: string[]
  insight: string
}

const EL_COLORS: Record<string, string> = {
  N: '#8bff5a', P: '#19e08c', K: '#38f5c9', Ca: '#b6ff6a', Mg: '#4be3ff', S: '#ffc24b',
}

/* pH targets by crop family (most CEA crops want 5.5–6.2). */
function phTargetFor(p: AgroProfile): string {
  if (p.name.includes('Strawberry')) return '5.5 – 6.0'
  if (p.name.includes('Tomato') || p.name.includes('Pepper')) return '5.8 – 6.3'
  return '5.6 – 6.2'
}

export function calcNutrients(cropKey: string, stage: Stage, volumeL: number): NutrientResult {
  const profile = AGRO_PROFILES[cropKey]
  const stageDef = STAGES.find((s) => s.id === stage)!
  const targetEC = +(profile.ecOpt * (stage === 'seedling' ? 0.5 : stage === 'flower' ? 1.2 : 1.0)).toFixed(2)

  // Scale the reference recipe by both EC ratio and stage emphasis.
  const ecScale = targetEC / REF_EC
  const flowerBoost = stage === 'flower' ? 1.25 : 1
  const recipe = {
    N: REF_RECIPE.N * ecScale * (stage === 'flower' ? 0.85 : 1),
    P: REF_RECIPE.P * ecScale * flowerBoost,
    K: REF_RECIPE.K * ecScale * flowerBoost,
    Ca: REF_RECIPE.Ca * ecScale,
    Mg: REF_RECIPE.Mg * ecScale,
  }

  // Target milligrams of each element for the whole reservoir (ppm = mg/L).
  const mg = {
    N: recipe.N * volumeL,
    P: recipe.P * volumeL,
    K: recipe.K * volumeL,
    Ca: recipe.Ca * volumeL,
    Mg: recipe.Mg * volumeL,
  }

  // ---- Sequential mass balance (standard hydroponic solve order) ----
  // 1. Calcium Nitrate supplies all Ca (and some N).
  const mCalNit = mg.Ca / CAL_NIT.Ca!
  const nFromCalNit = mCalNit * CAL_NIT.N!

  // 2. MKP supplies all P (and some K).
  const mMKP = mg.P / MKP.P!
  const kFromMKP = mMKP * MKP.K!

  // 3. Epsom supplies all Mg.
  const mEpsom = mg.Mg / EPSOM.Mg!

  // 4. Potassium Nitrate supplies remaining N (and more K).
  const nRemaining = Math.max(0, mg.N - nFromCalNit)
  const mKNO3 = nRemaining / KNO3.N!
  const kFromKNO3 = mKNO3 * KNO3.K!

  // 5. Potassium Sulfate tops up any K shortfall.
  const kRemaining = Math.max(0, mg.K - kFromMKP - kFromKNO3)
  const mK2SO4 = kRemaining / K2SO4.K!

  const toG = (milli: number) => +(milli / 1000).toFixed(milli / 1000 < 10 ? 2 : 1)

  const salts: SaltDose[] = [
    { ...CAL_NIT, grams: toG(mCalNit), gramsPerL: +(mCalNit / 1000 / volumeL).toFixed(3), provides: 'Ca · N' },
    { ...EPSOM, grams: toG(mEpsom), gramsPerL: +(mEpsom / 1000 / volumeL).toFixed(3), provides: 'Mg · S' },
    { ...KNO3, grams: toG(mKNO3), gramsPerL: +(mKNO3 / 1000 / volumeL).toFixed(3), provides: 'K · N' },
    { ...MKP, grams: toG(mMKP), gramsPerL: +(mMKP / 1000 / volumeL).toFixed(3), provides: 'P · K' },
    { ...K2SO4, grams: toG(mK2SO4), gramsPerL: +(mK2SO4 / 1000 / volumeL).toFixed(3), provides: 'K · S' },
  ].filter((s) => s.grams > 0).map((s) => ({
    name: s.name, formula: s.formula, grams: s.grams, gramsPerL: s.gramsPerL, color: s.color, provides: s.provides,
  }))

  // Final delivered elemental ppm (for the breakdown chart).
  const sFromEpsom = mEpsom * EPSOM.S!
  const sFromK2SO4 = mK2SO4 * K2SO4.S!
  const elements: ElementPpm[] = [
    { el: 'N', ppm: Math.round(recipe.N), color: EL_COLORS.N },
    { el: 'P', ppm: Math.round(recipe.P), color: EL_COLORS.P },
    { el: 'K', ppm: Math.round((kFromMKP + kFromKNO3 + kRemaining) / volumeL), color: EL_COLORS.K },
    { el: 'Ca', ppm: Math.round(recipe.Ca), color: EL_COLORS.Ca },
    { el: 'Mg', ppm: Math.round(recipe.Mg), color: EL_COLORS.Mg },
    { el: 'S', ppm: Math.round((sFromEpsom + sFromK2SO4) / volumeL), color: EL_COLORS.S },
  ]

  const mixingSteps = [
    `Fill reservoir with ${volumeL} L of clean water (RO ideal). Start the air pump.`,
    `Dissolve ${salts[0].grams} g Calcium Nitrate fully — this is your "Part A".`,
    `Add ${toG(mEpsom)} g Magnesium Sulfate and stir until clear.`,
    `Add the remaining potassium & phosphate salts ("Part B") one at a time.`,
    `Check EC — adjust toward ${targetEC} mS/cm. Then set pH to ${phTargetFor(profile)} last.`,
  ]

  return {
    targetEC,
    tds: Math.round(targetEC * 700),
    phTarget: phTargetFor(profile),
    volume: volumeL,
    salts,
    elements,
    mixingSteps,
    insight: `Never combine concentrated Calcium Nitrate with phosphates or sulfates — they precipitate into insoluble gypsum. Keep Part A and Part B separate until both are diluted in the reservoir. Stage: ${stageDef.label.toLowerCase()} (${stageDef.mult}× base strength).`,
  }
}
