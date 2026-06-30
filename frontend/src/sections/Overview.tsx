import {
  ArrowUpRight,
  Beaker,
  Bot,
  CalendarRange,
  Droplets,
  Gauge,
  LayoutGrid,
  ScanLine,
  Sparkles,
  Stethoscope,
  Sun,
  Thermometer,
} from 'lucide-react'
import { Chip, GlassCard, GlowButton, Reveal, SectionTitle, Sparkline } from '../components/ui'
import { KPIS } from '../lib/data'
import type { View } from '../components/Sidebar'

const FEATURES: { id: View; icon: typeof Stethoscope; title: string; desc: string; tag: string }[] = [
  { id: 'doctor', icon: Stethoscope, title: 'Plant Doctor', desc: 'Upload a leaf — a Vision Transformer flags disease and prescribes a full treatment plan.', tag: 'ViT' },
  { id: 'scanner', icon: ScanLine, title: 'Species Scanner', desc: 'Identify any plant from a single photo with a Vision Transformer classifier.', tag: 'ViT' },
  { id: 'simulator', icon: Gauge, title: 'Grow Simulator', desc: 'A live digital twin — tune the climate and a real agronomy model predicts growth & yield.', tag: 'model' },
  { id: 'vpd', icon: LayoutGrid, title: 'VPD Matrix', desc: 'The pro climate console — a temp×humidity heatmap with live VPD zones from the Tetens equation.', tag: 'climate' },
  { id: 'growplan', icon: CalendarRange, title: 'AI Grow Plan', desc: 'Name any crop and Gemma 3 writes a full germination-to-harvest schedule with climate targets.', tag: 'LLM' },
  { id: 'nutrients', icon: Beaker, title: 'Nutrient Lab', desc: 'A fertilizer mass-balance solver — exact salt doses, mixing order and elemental ppm profile.', tag: 'solver' },
  { id: 'advisor', icon: Bot, title: 'AI Advisor', desc: 'Ask any growing question — Gemma 3 grounded by a curated agronomy knowledge base.', tag: 'LLM' },
]

const MODELS = [
  { name: 'crop_leaf_diseases_vit', task: 'Disease diagnosis', arch: 'Vision Transformer', acc: '98%' },
  { name: 'plant-id (ViT)', task: 'Species identification', arch: 'Vision Transformer', acc: '52 plants' },
  { name: 'all-MiniLM-L6-v2', task: 'Advisor retrieval', arch: 'Sentence-Transformer', acc: '384-d' },
]

export function Overview({ onNavigate }: { onNavigate: (v: View) => void }) {
  return (
    <div className="space-y-16 pb-10">
      {/* ============ HERO ============ */}
      <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal>
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <Chip tone="lime" dot>
                Sustainable AI · Urban Farming
              </Chip>
            </div>

            <h1 className="font-display text-[2.7rem] font-bold leading-[1.02] tracking-tight sm:text-6xl">
              Grow smarter,
              <br />
              <span className="text-grad text-glow">in the city.</span>
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-dim">
              VERDANT is an intelligent urban farming platform powered by AI models that{' '}
              <span className="text-mint">diagnose disease</span>,{' '}
              <span className="text-mint">identify species</span>, and{' '}
              <span className="text-mint">advise growers</span> — delivering sustainable, high-yield growing with 95% less water and zero pesticides.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <GlowButton onClick={() => onNavigate('doctor')}>
                <Stethoscope size={16} /> Diagnose a plant
              </GlowButton>
              <GlowButton variant="outline" onClick={() => onNavigate('scanner')}>
                <ScanLine size={16} /> Identify species
              </GlowButton>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-9 gap-y-4">
              {[
                { k: '412', u: 'kg/mo', l: 'Projected yield' },
                { k: '95%', u: 'less', l: 'Water used' },
                { k: '7', u: 'tools', l: 'AI Tools' },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-2xl font-bold text-ink">
                    {s.k}
                    <span className="ml-1 font-mono text-xs font-normal text-muted">{s.u}</span>
                  </div>
                  <div className="mt-0.5 font-mono text-[11px] tracking-wide text-muted">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* hero visual */}
        <Reveal delay={0.15}>
          <div className="relative">
            <GlassCard hover={false} className="relative overflow-hidden p-2.5" glow>
              <div className="relative overflow-hidden rounded-[1.15rem]">
                <img
                  src="/assets/hero/hero-farm.png"
                  alt="Neon vertical hydroponic farm at night"
                  className="h-[360px] w-full object-cover sm:h-[440px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#04140c] via-transparent to-transparent" />

                {/* scanning beam */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-lime/25 to-transparent" style={{ animation: 'scanline 6s linear infinite' }} />

                {/* top chip */}
                <div className="absolute left-4 top-4 flex items-center gap-2">
                  <Chip tone="emerald" dot>
                    RACK A · vegetative
                  </Chip>
                </div>

                {/* HUD bar */}
                <div className="absolute inset-x-3 bottom-3 grid grid-cols-3 gap-2">
                  {[
                    { icon: Thermometer, v: '22.4°', l: 'temp', c: 'text-amber' },
                    { icon: Droplets, v: '64%', l: 'humidity', c: 'text-cyan' },
                    { icon: Sun, v: '92%', l: 'light', c: 'text-lime' },
                  ].map((m) => (
                    <div key={m.l} className="glass-strong flex items-center gap-2 rounded-xl px-2.5 py-2">
                      <m.icon size={15} className={m.c} />
                      <div className="leading-none">
                        <div className="font-mono text-[13px] text-ink">{m.v}</div>
                        <div className="mt-0.5 font-mono text-[9px] text-muted">{m.l}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

          </div>
        </Reveal>
      </section>

      {/* ============ KPI STRIP ============ */}
      <section>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {KPIS.slice(0, 4).map((k, i) => (
            <Reveal key={k.key} delay={i * 0.06}>
              <GlassCard className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-mono text-[11px] tracking-wide text-muted">{k.label}</div>
                    <div className="mt-2 font-display text-3xl font-bold">
                      {k.value}
                      <span className="ml-1 font-mono text-xs font-normal text-muted">{k.unit}</span>
                    </div>
                  </div>
                  <span className={`font-mono text-[11px] ${k.trend === 'down' ? 'text-amber' : 'text-lime'}`}>
                    {k.delta > 0 ? '▲' : '▼'} {Math.abs(k.delta)}%
                  </span>
                </div>
                <div className="mt-3">
                  <Sparkline data={k.spark} w={200} h={36} color={k.trend === 'down' ? '#ffc24b' : '#8bff5a'} />
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ CAPABILITIES ============ */}
      <section>
        <SectionTitle
          eyebrow="Platform"
          title="One brain for the whole farm"
          sub="Seven integrated AI tools — each a click away. Tap any card to open it, or hit ⌘K to jump."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05}>
              <GlassCard
                onClick={() => onNavigate(f.id)}
                className="group h-full cursor-pointer p-6"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald/25 to-mint/10 text-lime transition-all group-hover:glow-emerald">
                    <f.icon size={20} />
                  </span>
                  <Chip tone="muted">{f.tag}</Chip>
                </div>
                <h3 className="flex items-center gap-1.5 text-lg font-semibold">
                  {f.title}
                  <ArrowUpRight size={16} className="text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-lime" />
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.desc}</p>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ ML MODELS ============ */}
      <section>
        <Reveal>
          <GlassCard hover={false} className="grid-faint overflow-hidden p-7 md:p-9">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="eyebrow mb-2 flex items-center gap-2">
                  <Sparkles size={13} /> Real machine learning · no toy models
                </div>
                <h2 className="text-2xl font-semibold">Powered by AI models</h2>
              </div>
              <Chip tone="lime" dot>
                inference on-device
              </Chip>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {MODELS.map((m) => (
                <div key={m.name} className="glass rounded-2xl p-5">
                  <div className="font-mono text-[12px] text-lime">{m.name}</div>
                  <div className="mt-3 text-sm font-medium text-ink">{m.task}</div>
                  <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-3 font-mono text-[11px] text-muted">
                    <span>{m.arch}</span>
                    <span className="text-mint">{m.acc}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </Reveal>
      </section>

      {/* ============ CLOSING CTA ============ */}
      <section>
        <Reveal>
          <GlassCard hover={false} className="relative overflow-hidden">
            <img
              src="/assets/feature/seedling-hands.png"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#04120c]/95 via-[#04120c]/70 to-transparent" />
            <div className="relative grid gap-6 p-8 md:grid-cols-2 md:p-12">
              <div>
                <h2 className="text-3xl font-bold leading-tight">
                  Feed the city.
                  <br />
                  <span className="text-grad">Heal the planet.</span>
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-dim">
                  Every rack is a small act of climate repair — 95% less water, zero pesticides, and
                  food grown metres from the plate.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <GlowButton onClick={() => onNavigate('doctor')}>
                    <Stethoscope size={16} /> Try Plant Doctor
                  </GlowButton>
                  <GlowButton variant="outline" onClick={() => onNavigate('advisor')}>
                    <Bot size={16} /> Ask the advisor
                  </GlowButton>
                </div>
              </div>
            </div>
          </GlassCard>
        </Reveal>
      </section>
    </div>
  )
}
