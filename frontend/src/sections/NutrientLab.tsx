import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Beaker, FlaskConical, GlassWater, Info, ListOrdered, Scale } from 'lucide-react'
import { Chip, GlassCard, Reveal, SectionTitle } from '../components/ui'
import { AGRO_KEYS, AGRO_PROFILES } from '../lib/agronomy'
import { STAGES, calcNutrients, type Stage } from '../lib/nutrients'

export function NutrientLab() {
  const [cropKey, setCropKey] = useState('tomato')
  const [stage, setStage] = useState<Stage>('vegetative')
  const [volume, setVolume] = useState(50)

  const result = useMemo(() => calcNutrients(cropKey, stage, volume), [cropKey, stage, volume])
  const maxPpm = Math.max(...result.elements.map((e) => e.ppm))
  const maxGrams = Math.max(...result.salts.map((s) => s.grams))

  return (
    <div className="pb-10">
      <SectionTitle
        eyebrow="Fertilizer chemistry · Mass-balance solver"
        title="Nutrient Dosing Lab"
        sub="Pick a crop, growth stage and reservoir size — the lab solves a sequential elemental mass balance across five real salts and returns exact gram doses, a mixing order and the delivered ppm profile."
        right={<Chip tone="emerald" dot>solver</Chip>}
      />

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        {/* ---------- INPUTS ---------- */}
        <Reveal>
          <GlassCard hover={false} className="p-6">
            <div className="eyebrow mb-4 flex items-center gap-2"><Beaker size={13} /> Recipe inputs</div>

            {/* crop */}
            <div className="mb-5">
              <div className="mb-2 font-mono text-[11px] text-muted">CROP</div>
              <div className="flex flex-wrap gap-2">
                {AGRO_KEYS.map((k) => {
                  const cp = AGRO_PROFILES[k]
                  const on = k === cropKey
                  return (
                    <button
                      key={k}
                      onClick={() => setCropKey(k)}
                      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 font-mono text-[11px] transition-all ${
                        on ? 'border-emerald/50 bg-emerald/15 text-lime' : 'border-white/10 text-muted hover:text-ink-dim'
                      }`}
                    >
                      <span>{cp.emoji}</span> {cp.name.split(' ').slice(-1)}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* stage */}
            <div className="mb-5">
              <div className="mb-2 font-mono text-[11px] text-muted">GROWTH STAGE</div>
              <div className="grid grid-cols-3 gap-2">
                {STAGES.map((s) => {
                  const on = s.id === stage
                  return (
                    <button
                      key={s.id}
                      onClick={() => setStage(s.id)}
                      className={`rounded-xl border px-2 py-2.5 text-center transition-all ${
                        on ? 'border-emerald/50 bg-emerald/15' : 'border-white/10 hover:bg-white/5'
                      }`}
                    >
                      <div className={`text-[12.5px] font-medium ${on ? 'text-lime' : 'text-ink-dim'}`}>{s.label}</div>
                      <div className="mt-0.5 font-mono text-[9px] text-muted">{s.hint}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* volume */}
            <div className="mb-6">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-[13px] text-ink-dim"><GlassWater size={14} className="text-cyan" /> Reservoir volume</span>
                <span className="font-mono text-[13px] text-lime">{volume}<span className="ml-1 text-[10px] text-muted">L</span></span>
              </div>
              <input type="range" className="verdant-range" min={5} max={200} step={5} value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                style={{ background: `linear-gradient(90deg, #19e08c ${((volume - 5) / 195) * 100}%, rgba(255,255,255,0.08) ${((volume - 5) / 195) * 100}%)` }} />
            </div>

            {/* targets */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { l: 'Target EC', v: result.targetEC, u: 'mS/cm', c: '#8bff5a' },
                { l: 'TDS', v: result.tds, u: 'ppm', c: '#38f5c9' },
                { l: 'pH', v: result.phTarget, u: '', c: '#4be3ff' },
              ].map((t) => (
                <div key={t.l} className="glass-soft rounded-2xl p-3 text-center">
                  <div className="font-display text-lg font-bold leading-none" style={{ color: t.c }}>{t.v}</div>
                  <div className="mt-1 font-mono text-[9px] text-muted">{t.l}{t.u && ` · ${t.u}`}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </Reveal>

        {/* ---------- OUTPUT ---------- */}
        <Reveal delay={0.1}>
          <GlassCard hover={false} glow className="relative overflow-hidden p-6">
            <img src="/assets/hero/nutrient-flow.png" alt="" className="pointer-events-none absolute right-0 top-0 h-44 w-1/2 object-cover opacity-[0.16]" />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#08160c]/40" />

            <div className="relative">
              {/* salt doses */}
              <div className="mb-2 flex items-center gap-2">
                <Scale size={15} className="text-lime" />
                <span className="font-display text-base font-semibold">Salt doses — for {volume} L</span>
              </div>
              <div className="space-y-2.5">
                {result.salts.map((s, i) => (
                  <motion.div
                    key={s.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-soft rounded-2xl p-3.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[13.5px] font-medium text-ink">{s.name}</div>
                        <div className="font-mono text-[10px] text-muted">{s.formula} · supplies {s.provides}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-lg font-bold" style={{ color: s.color }}>
                          {s.grams}<span className="ml-1 text-[11px] font-normal text-muted">g</span>
                        </div>
                        <div className="font-mono text-[9px] text-faint">{s.gramsPerL} g/L</div>
                      </div>
                    </div>
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/8">
                      <motion.div className="h-full rounded-full" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }}
                        animate={{ width: `${(s.grams / maxGrams) * 100}%` }} transition={{ duration: 0.5 }} />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* elemental profile */}
              <div className="mt-6">
                <div className="mb-2.5 flex items-center gap-2 font-mono text-[10px] tracking-wide text-muted">
                  <FlaskConical size={13} className="text-mint" /> DELIVERED ELEMENTAL PROFILE (ppm)
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {result.elements.map((e) => (
                    <div key={e.el} className="text-center">
                      <div className="relative mx-auto flex h-24 w-full items-end justify-center overflow-hidden rounded-lg bg-white/5">
                        <motion.div className="w-full rounded-t-lg" style={{ background: `linear-gradient(180deg, ${e.color}, ${e.color}40)` }}
                          initial={{ height: 0 }} animate={{ height: `${(e.ppm / maxPpm) * 100}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
                      </div>
                      <div className="mt-1.5 font-display text-sm font-bold" style={{ color: e.color }}>{e.el}</div>
                      <div className="font-mono text-[9px] text-muted">{e.ppm}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </Reveal>
      </div>

      {/* mixing order + insight */}
      <div className="mt-6 grid gap-6 md:grid-cols-[1.3fr_0.7fr]">
        <Reveal>
          <GlassCard hover={false} className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <ListOrdered size={15} className="text-lime" />
              <span className="font-display text-base font-semibold">Mixing order</span>
            </div>
            <ol className="space-y-3">
              {result.mixingSteps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald/15 font-mono text-[11px] text-lime">{i + 1}</span>
                  <span className="pt-0.5 text-[13px] leading-snug text-ink-dim">{step}</span>
                </li>
              ))}
            </ol>
          </GlassCard>
        </Reveal>

        <Reveal delay={0.1}>
          <GlassCard hover={false} className="h-full p-6">
            <div className="mb-3 flex items-center gap-2">
              <Info size={15} className="text-amber" />
              <span className="font-display text-base font-semibold">Chemist's note</span>
            </div>
            <p className="text-[13px] leading-relaxed text-ink-dim">{result.insight}</p>
          </GlassCard>
        </Reveal>
      </div>
    </div>
  )
}
