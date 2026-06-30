import { useState } from 'react'
import { motion } from 'framer-motion'
import { Beaker, CalendarRange, CloudFog, Eye, Loader2, Sparkles, Sun, Thermometer, WifiOff, Wand2 } from 'lucide-react'
import { Chip, GlassCard, GlowButton, Reveal, SectionTitle } from '../components/ui'
import { generateGrowPlan, type GrowPlan as Plan } from '../lib/api'

const QUICK = ['Basil', 'Cherry Tomato', 'Strawberry', 'Butterhead Lettuce', 'Thai Chili', 'Wasabi']
const STAGE_COLORS = ['#8bff5a', '#38f5c9', '#19e08c', '#4be3ff', '#b6ff6a', '#ffc24b']

export function GrowPlan() {
  const [crop, setCrop] = useState('')
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<Plan | null>(null)

  async function run(q: string) {
    const c = q.trim()
    if (!c || loading) return
    setLoading(true)
    setPlan(null)
    const p = await generateGrowPlan(c)
    setPlan(p)
    setLoading(false)
  }

  return (
    <div className="pb-10">
      <SectionTitle
        eyebrow="Generative AI · Gemma 3 grower"
        title="AI Grow Plan Generator"
        sub="Name any crop and the LLM writes a complete controlled-environment schedule — every stage from germination to harvest with climate targets, EC and a risk to watch."
        right={<Chip tone="emerald" dot>Gemma 3</Chip>}
      />

      {/* input */}
      <Reveal>
        <GlassCard hover={false} className="relative overflow-hidden p-6">
          <img src="/assets/hero/grow-lab.png" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.14]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#04120c]/90 to-transparent" />
          <div className="relative">
            <form
              onSubmit={(e) => { e.preventDefault(); run(crop) }}
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <div className="glass-soft flex flex-1 items-center gap-3 rounded-full px-4 py-3">
                <Wand2 size={17} className="shrink-0 text-mint" />
                <input
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  placeholder="Enter any crop — e.g. saffron, oyster mushrooms, dragon fruit…"
                  className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-faint"
                />
              </div>
              <GlowButton type="submit" disabled={loading || !crop.trim()} className="shrink-0">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {loading ? 'Generating…' : 'Generate plan'}
              </GlowButton>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK.map((q) => (
                <button
                  key={q}
                  onClick={() => { setCrop(q); run(q) }}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[11px] text-muted transition-all hover:border-lime/40 hover:text-lime"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      </Reveal>

      {/* loading skeleton */}
      {loading && (
        <div className="mt-6 flex items-center justify-center gap-3 py-16 font-mono text-sm text-mint">
          <Loader2 size={18} className="animate-spin" /> the grower is drafting your schedule…
        </div>
      )}

      {/* plan timeline */}
      {plan && !loading && (
        <div className="mt-8">
          <Reveal>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-2xl font-bold">{plan.crop}</h3>
                  {plan.offline && <Chip tone="amber"><WifiOff size={11} /> offline template</Chip>}
                </div>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-dim">{plan.summary}</p>
              </div>
              <div className="flex items-center gap-2">
                <Chip tone="lime" dot><CalendarRange size={12} /> {plan.totalWeeks} weeks</Chip>
                <Chip tone="mint">{plan.stages.length} stages</Chip>
              </div>
            </div>
          </Reveal>

          <div className="relative">
            {/* vertical spine */}
            <div className="absolute left-[18px] top-2 bottom-2 w-px bg-gradient-to-b from-lime/60 via-emerald/30 to-transparent md:left-[19px]" />

            <div className="space-y-4">
              {plan.stages.map((s, i) => {
                const color = STAGE_COLORS[i % STAGE_COLORS.length]
                return (
                  <motion.div
                    key={`${s.name}-${i}`}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="relative pl-12"
                  >
                    {/* node */}
                    <div
                      className="absolute left-0 top-1 grid h-[38px] w-[38px] place-items-center rounded-full font-display text-sm font-bold"
                      style={{ background: `${color}1f`, color, boxShadow: `0 0 0 1px ${color}55, 0 0 16px ${color}40` }}
                    >
                      {i + 1}
                    </div>

                    <GlassCard hover={false} className="p-5" style={{ borderColor: `${color}22` }}>
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-display text-lg font-semibold" style={{ color }}>{s.name}</h4>
                        <span className="font-mono text-[11px] text-muted">Week {s.weeks}</span>
                      </div>

                      {/* climate chips */}
                      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {[
                          { icon: Thermometer, l: 'Temp', v: s.temp, c: '#ffc24b' },
                          { icon: CloudFog, l: 'VPD', v: s.vpd, c: '#4be3ff' },
                          { icon: Beaker, l: 'EC', v: s.ec, c: '#38f5c9' },
                          { icon: Sun, l: 'Light', v: s.light, c: '#8bff5a' },
                        ].map((m) => (
                          <div key={m.l} className="glass-soft rounded-xl px-2.5 py-2">
                            <div className="flex items-center gap-1.5 font-mono text-[9px] text-muted">
                              <m.icon size={11} style={{ color: m.c }} /> {m.l.toUpperCase()}
                            </div>
                            <div className="mt-0.5 font-mono text-[12px] text-ink">{m.v}</div>
                          </div>
                        ))}
                      </div>

                      {/* tasks */}
                      <ul className="space-y-1.5">
                        {s.tasks.map((t) => (
                          <li key={t} className="flex gap-2 text-[13px] leading-snug text-ink-dim">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: color }} />
                            {t}
                          </li>
                        ))}
                      </ul>

                      {/* watch */}
                      <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber/20 bg-amber/5 px-3 py-2 text-[12px] text-amber/90">
                        <Eye size={13} className="mt-0.5 shrink-0" /> Watch: {s.watch}
                      </div>
                    </GlassCard>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* empty state */}
      {!plan && !loading && (
        <Reveal delay={0.1}>
          <div className="mt-10 grid place-items-center py-16 text-center">
            <div>
              <span className="mx-auto mb-4 grid h-16 w-16 animate-pulse place-items-center rounded-2xl bg-white/5 text-faint">
                <CalendarRange size={26} />
              </span>
              <p className="font-mono text-xs text-muted">enter a crop above to generate a full grow schedule…</p>
            </div>
          </div>
        </Reveal>
      )}
    </div>
  )
}
