import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Droplets, Layers, Leaf, Recycle, Shield, Truck, type LucideIcon } from 'lucide-react'
import { Bar, Chip, GlassCard, Reveal, Ring, SectionTitle } from '../components/ui'
import { FOOTPRINT, RESOURCE_MIX, SUSTAIN_STATS, WATER_FLOW } from '../lib/data'

const ICONS: Record<string, LucideIcon> = { droplet: Droplets, truck: Truck, shield: Shield, layers: Layers }

const EQUIV = [
  { label: 'Trees planted (eq.)', value: '64', sub: 'annual CO₂ capture', icon: Leaf },
  { label: 'Cars off the road', value: '0.9', sub: 'per year equivalent', icon: Truck },
  { label: 'Water recirculated', value: '31×', sub: 'closed-loop reuse', icon: Recycle },
]

export function Sustainability() {
  return (
    <div className="space-y-6 pb-10">
      <SectionTitle
        eyebrow="Impact"
        title="Sustainability intelligence"
        sub="Every cycle, VERDANT quantifies its environmental edge over conventional field farming."
        right={<Chip tone="lime" dot>carbon-negative</Chip>}
      />

      {/* headline stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {SUSTAIN_STATS.map((s, i) => {
          const Icon = ICONS[s.icon] ?? Leaf
          return (
            <Reveal key={s.label} delay={i * 0.06}>
              <GlassCard className="p-5">
                <span className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-emerald/15 text-lime glow-emerald">
                  <Icon size={18} />
                </span>
                <div className="font-display text-3xl font-bold text-grad">{s.value}</div>
                <div className="mt-1 text-sm font-medium text-ink">{s.sub}</div>
                <div className="mt-0.5 font-mono text-[10px] text-muted">{s.label}</div>
              </GlassCard>
            </Reveal>
          )
        })}
      </div>

      {/* footprint + resource mix */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <GlassCard hover={false} className="h-full p-6">
            <SectionTitle
              eyebrow="Carbon footprint · index vs baseline 100"
              title="VERDANT vs conventional farming"
              className="mb-4"
            />
            <ResponsiveContainer width="100%" height={290}>
              <AreaChart data={FOOTPRINT} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gConv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff6b6b" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#ff6b6b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gVerd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8bff5a" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#8bff5a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(120,220,170,0.07)" vertical={false} />
                <XAxis dataKey="m" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={36} />
                <Tooltip />
                <Area type="monotone" dataKey="conventional" name="Conventional" stroke="#ff6b6b" strokeWidth={2} fill="url(#gConv)" />
                <Area type="monotone" dataKey="verdant" name="VERDANT" stroke="#8bff5a" strokeWidth={2.5} fill="url(#gVerd)" />
              </AreaChart>
            </ResponsiveContainer>
          </GlassCard>
        </Reveal>

        <Reveal delay={0.1}>
          <GlassCard hover={false} className="flex h-full flex-col p-6">
            <SectionTitle eyebrow="Energy" title="Power mix" className="mb-2" />
            <div className="relative mx-auto">
              <ResponsiveContainer width={220} height={200}>
                <PieChart>
                  <Pie data={RESOURCE_MIX} dataKey="value" innerRadius={62} outerRadius={92} paddingAngle={3} stroke="none">
                    {RESOURCE_MIX.map((r) => (
                      <Cell key={r.name} fill={r.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                <div>
                  <div className="font-display text-2xl font-bold text-lime">85%</div>
                  <div className="font-mono text-[10px] text-muted">renewable</div>
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {RESOURCE_MIX.map((r) => (
                <div key={r.name} className="flex items-center justify-between text-[12px]">
                  <span className="flex items-center gap-2 text-ink-dim">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: r.color }} /> {r.name}
                  </span>
                  <span className="font-mono text-muted">{r.value}%</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </Reveal>
      </div>

      {/* water loop + equivalencies */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <GlassCard hover={false} className="h-full p-6">
            <SectionTitle
              eyebrow="Closed loop"
              title="Water lifecycle"
              sub="Of every 100 L drawn, 31 L returns to the cycle — the rest becomes plant."
              className="mb-5"
            />
            <div className="space-y-4">
              {WATER_FLOW.map((w) => (
                <div key={w.stage}>
                  <div className="mb-1.5 flex justify-between font-mono text-[11px]">
                    <span className="text-ink-dim">{w.stage}</span>
                    <span className="text-cyan">{w.value} L</span>
                  </div>
                  <Bar value={w.value} color="#4be3ff" height={8} />
                </div>
              ))}
            </div>
          </GlassCard>
        </Reveal>

        <Reveal delay={0.1}>
          <GlassCard hover={false} className="flex h-full flex-col p-6">
            <SectionTitle eyebrow="Equivalence" title="What that means" className="mb-5" />
            <div className="flex items-center gap-6">
              <Ring value={92} color="#8bff5a" size={120} stroke={10}>
                <div>
                  <div className="font-display text-2xl font-bold">92%</div>
                  <div className="font-mono text-[9px] text-muted">circular</div>
                </div>
              </Ring>
              <div className="flex-1 space-y-3">
                {EQUIV.map((e) => (
                  <div key={e.label} className="glass-soft flex items-center gap-3 rounded-xl p-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/5 text-lime">
                      <e.icon size={15} />
                    </span>
                    <div>
                      <div className="font-display text-base font-bold leading-none">{e.value}</div>
                      <div className="mt-1 font-mono text-[10px] text-muted">{e.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </Reveal>
      </div>

      {/* banner */}
      <Reveal>
        <GlassCard hover={false} className="relative overflow-hidden">
          <img src="/assets/feature/seedling-hands.png" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#04120c]/95 to-[#04120c]/40" />
          <div className="relative flex flex-col items-start gap-3 p-8 md:p-10">
            <Chip tone="lime" dot>
              UN SDG 2 · 11 · 12 · 13
            </Chip>
            <h2 className="max-w-lg text-2xl font-bold leading-tight md:text-3xl">
              Climate-positive food, grown where it's eaten.
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-ink-dim">
              By collapsing the supply chain and recycling every input, each VERDANT node turns a
              city block into a net-negative carbon asset.
            </p>
          </div>
        </GlassCard>
      </Reveal>
    </div>
  )
}
