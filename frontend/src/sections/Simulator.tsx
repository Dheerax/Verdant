import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Beaker, CloudFog, Gauge, Sparkles, Sprout, Sun, Thermometer, TimerReset } from 'lucide-react'
import { Chip, GlassCard, Reveal, Ring, SectionTitle } from '../components/ui'
import {
  AGRO_KEYS,
  AGRO_PROFILES,
  bandSuitability,
  simulate,
  suitability,
  vpd,
  dli,
  type SimInputs,
} from '../lib/agronomy'

const VERDICT = {
  optimal: { tone: 'lime', color: '#8bff5a', label: 'Optimal envelope' },
  good: { tone: 'mint', color: '#38f5c9', label: 'Healthy growth' },
  suboptimal: { tone: 'amber', color: '#ffc24b', label: 'Sub-optimal' },
  stressed: { tone: 'danger', color: '#ff6b6b', label: 'Plant under stress' },
} as const

interface SliderDef {
  key: keyof SimInputs
  label: string
  icon: typeof Thermometer
  min: number
  max: number
  step: number
  unit: string
}

const SLIDERS: SliderDef[] = [
  { key: 'temp', label: 'Air Temperature', icon: Thermometer, min: 10, max: 38, step: 0.5, unit: '°C' },
  { key: 'humidity', label: 'Relative Humidity', icon: CloudFog, min: 25, max: 95, step: 1, unit: '%' },
  { key: 'ppfd', label: 'Light Intensity (PPFD)', icon: Sun, min: 50, max: 900, step: 10, unit: 'µmol' },
  { key: 'photoperiod', label: 'Photoperiod', icon: TimerReset, min: 6, max: 24, step: 0.5, unit: 'h' },
  { key: 'ec', label: 'Nutrient EC', icon: Beaker, min: 0.4, max: 3.5, step: 0.1, unit: 'mS' },
  { key: 'co2', label: 'CO₂ Enrichment', icon: Activity, min: 400, max: 1500, step: 25, unit: 'ppm' },
]

const DEFAULTS: SimInputs = { temp: 22, humidity: 65, ppfd: 350, photoperiod: 16, ec: 1.6, co2: 900 }

/* A small response-curve sparkline showing how suitability changes across the
   slider's range, with a marker at the current value. */
function ResponseCurve({ slider, inputs, cropKey }: { slider: SliderDef; inputs: SimInputs; cropKey: string }) {
  const p = AGRO_PROFILES[cropKey]
  const w = 100
  const h = 34
  const samples = 40
  const scoreAt = (v: number): number => {
    const t = { ...inputs, [slider.key]: v }
    switch (slider.key) {
      case 'temp': return suitability(t.temp, p.tempOpt, p.tempTol)
      case 'humidity': return bandSuitability(vpd(t.temp, t.humidity), p.vpdLo, p.vpdHi, 0.35)
      case 'ppfd': return suitability(dli(t.ppfd, t.photoperiod), p.dliOpt, p.dliTol)
      case 'photoperiod': return suitability(dli(t.ppfd, t.photoperiod), p.dliOpt, p.dliTol)
      case 'ec': return suitability(t.ec, p.ecOpt, p.ecTol)
      case 'co2': return t.co2 >= p.co2Opt ? 1 : bandSuitability(t.co2, p.co2Opt, p.co2Opt + p.co2Tol, p.co2Tol)
      default: return 0
    }
  }
  const pts: [number, number][] = []
  for (let i = 0; i < samples; i++) {
    const v = slider.min + (i / (samples - 1)) * (slider.max - slider.min)
    const x = (i / (samples - 1)) * w
    const y = h - scoreAt(v) * (h - 3) - 1.5
    pts.push([x, y])
  }
  const line = pts.map((pt) => pt.join(',')).join(' ')
  const cur = inputs[slider.key]
  const cx = ((cur - slider.min) / (slider.max - slider.min)) * w
  const cy = h - scoreAt(cur) * (h - 3) - 1.5
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-9 w-full overflow-visible">
      <polyline points={line} fill="none" stroke="#38f5c9" strokeWidth="1.4" strokeLinejoin="round" opacity={0.55} />
      <circle cx={cx} cy={cy} r="2.6" fill="#8bff5a" style={{ filter: 'drop-shadow(0 0 4px #8bff5a)' }} />
      <line x1={cx} y1={0} x2={cx} y2={h} stroke="#8bff5a" strokeWidth="0.5" opacity={0.3} strokeDasharray="2 2" />
    </svg>
  )
}

export function Simulator() {
  const [cropKey, setCropKey] = useState('lettuce')
  const [inputs, setInputs] = useState<SimInputs>(DEFAULTS)

  const profile = AGRO_PROFILES[cropKey]
  const result = useMemo(() => simulate(profile, inputs), [profile, inputs])
  const v = VERDICT[result.verdict]
  const gi = Math.round(result.growthIndex * 100)

  const set = (key: keyof SimInputs, value: number) => setInputs((s) => ({ ...s, [key]: value }))
  const reset = () => setInputs(DEFAULTS)

  return (
    <div className="pb-10">
      <SectionTitle
        eyebrow="Digital twin · Real agronomy model"
        title="Grow Simulator"
        sub="Tune the environment and watch a live plant-science model predict growth. VPD, DLI and suitability are computed from real horticulture equations — Liebig's law of the minimum gates the verdict."
        right={<Chip tone="emerald" dot>live model</Chip>}
      />

      {/* crop selector */}
      <Reveal>
        <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
          {AGRO_KEYS.map((k) => {
            const cp = AGRO_PROFILES[k]
            const on = k === cropKey
            return (
              <button
                key={k}
                onClick={() => setCropKey(k)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 font-mono text-[12px] transition-all ${
                  on ? 'border-emerald/50 bg-emerald/15 text-lime' : 'border-white/10 text-muted hover:text-ink-dim'
                }`}
              >
                <span className="text-base">{cp.emoji}</span> {cp.name}
              </button>
            )
          })}
        </div>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* ---------- CONTROLS ---------- */}
        <Reveal>
          <GlassCard hover={false} className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="eyebrow flex items-center gap-2"><Gauge size={13} /> Environment console</div>
              <button onClick={reset} className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 font-mono text-[11px] text-muted transition-all hover:border-mint/40 hover:text-mint">
                <TimerReset size={12} /> reset
              </button>
            </div>

            <div className="space-y-5">
              {SLIDERS.map((s) => {
                const val = inputs[s.key]
                const pct = ((val - s.min) / (s.max - s.min)) * 100
                return (
                  <div key={s.key}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-[13px] text-ink-dim">
                        <s.icon size={14} className="text-mint" /> {s.label}
                      </span>
                      <span className="font-mono text-[13px] text-lime">
                        {val}
                        <span className="ml-1 text-[10px] text-muted">{s.unit}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        className="verdant-range flex-1"
                        min={s.min}
                        max={s.max}
                        step={s.step}
                        value={val}
                        onChange={(e) => set(s.key, parseFloat(e.target.value))}
                        style={{ background: `linear-gradient(90deg, #19e08c ${pct}%, rgba(255,255,255,0.08) ${pct}%)` }}
                      />
                      <div className="w-12 shrink-0">
                        <ResponseCurve slider={s} inputs={inputs} cropKey={cropKey} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </GlassCard>
        </Reveal>

        {/* ---------- READOUT ---------- */}
        <Reveal delay={0.1}>
          <GlassCard hover={false} glow className="flex h-full flex-col p-6">
            {/* verdict + growth index */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <Chip tone={v.tone} dot>{v.label}</Chip>
                <h3 className="mt-2 font-display text-[1.7rem] font-bold leading-none">
                  {profile.emoji} {profile.name}
                </h3>
                <p className="mt-2 max-w-[200px] text-[12.5px] leading-snug text-muted">
                  Limiting factor: <span className="text-amber">{result.limiting}</span>
                </p>
              </div>
              <Ring value={gi} color={v.color} size={104} stroke={9}>
                <div className="font-display text-2xl font-bold leading-none" style={{ color: v.color }}>{gi}</div>
                <div className="font-mono text-[9px] text-muted">growth idx</div>
              </Ring>
            </div>

            {/* key outputs */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { icon: Sprout, label: 'Days to harvest', val: result.daysToHarvest, unit: 'd', c: '#8bff5a' },
                { icon: Activity, label: 'Predicted yield', val: result.yield, unit: 'kg/m²', c: '#38f5c9' },
                { icon: CloudFog, label: 'VPD', val: result.vpd, unit: 'kPa', c: '#4be3ff' },
                { icon: Sun, label: 'DLI', val: result.dli, unit: 'mol', c: '#ffc24b' },
              ].map((o) => (
                <div key={o.label} className="glass-soft rounded-2xl p-3.5">
                  <o.icon size={15} style={{ color: o.c }} className="mb-1.5" />
                  <div className="font-display text-xl font-bold leading-none">
                    {o.val}
                    <span className="ml-1 font-mono text-[10px] font-normal text-muted">{o.unit}</span>
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-muted">{o.label}</div>
                </div>
              ))}
            </div>

            {/* factor suitability bars */}
            <div className="mt-6 flex-1">
              <div className="mb-2.5 font-mono text-[10px] tracking-wide text-muted">FACTOR SUITABILITY</div>
              <div className="space-y-2.5">
                {result.factors.map((f) => {
                  const sc = Math.round(f.score * 100)
                  const col = sc >= 80 ? '#8bff5a' : sc >= 55 ? '#ffc24b' : '#ff6b6b'
                  return (
                    <div key={f.key}>
                      <div className="mb-1 flex items-center justify-between font-mono text-[11px]">
                        <span className="text-ink-dim">{f.label}</span>
                        <span className="text-muted">
                          {f.value}{f.unit} · opt {f.optimum} ·{' '}
                          <span style={{ color: col }}>{sc}%</span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: col, boxShadow: `0 0 8px ${col}` }}
                          animate={{ width: `${sc}%` }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-5 flex items-start gap-2 border-t border-white/8 pt-4 text-[11.5px] leading-snug text-faint">
              <Sparkles size={13} className="mt-0.5 shrink-0 text-mint" />
              Growth index blends Liebig's law (weakest factor) with the geometric mean of all five
              environmental scores — exactly how multi-factor crop stress compounds in the real world.
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </div>
  )
}
