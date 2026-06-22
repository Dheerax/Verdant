import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  Legend,
} from 'recharts'
import { AlertTriangle, Bell, Gauge, Info, Wind } from 'lucide-react'
import { Bar as ProgressBar, Chip, GlassCard, LiveDot, Reveal, Ring, SectionTitle } from '../components/ui'
import { ALERTS, KPIS, WEEKLY_YIELD, ZONES, dayCurve, type Zone } from '../lib/data'

const clamp = (n: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n))

const statusTone: Record<Zone['status'], 'lime' | 'amber' | 'danger'> = {
  optimal: 'lime',
  watch: 'amber',
  alert: 'danger',
}
const statusColor: Record<Zone['status'], string> = {
  optimal: '#8bff5a',
  watch: '#ffc24b',
  alert: '#ff6b6b',
}

export function Dashboard() {
  const curve = useMemo(() => dayCurve(), [])
  const [zones, setZones] = useState(ZONES)
  const [live, setLive] = useState({ temp: 22.4, humidity: 64, soil: 68, co2: 612 })

  // gentle random-walk to feel alive
  useEffect(() => {
    const id = setInterval(() => {
      setZones((zs) =>
        zs.map((z) => ({
          ...z,
          temp: +(z.temp + (Math.random() - 0.5) * 0.3).toFixed(1),
          humidity: Math.round(clamp(z.humidity + (Math.random() - 0.5) * 1.6)),
          soil: Math.round(clamp(z.soil + (Math.random() - 0.5) * 1.2)),
        })),
      )
      setLive((l) => ({
        temp: +(l.temp + (Math.random() - 0.5) * 0.25).toFixed(1),
        humidity: Math.round(clamp(l.humidity + (Math.random() - 0.5) * 1.5)),
        soil: Math.round(clamp(l.soil + (Math.random() - 0.5) * 1.2)),
        co2: Math.round(clamp(l.co2 + (Math.random() - 0.5) * 14, 400, 900)),
      }))
    }, 2400)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="space-y-6 pb-10">
      {/* KPI ribbon */}
      <div className="no-scrollbar grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {KPIS.map((k, i) => (
          <Reveal key={k.key} delay={i * 0.04}>
            <GlassCard className="p-4" hover={false}>
              <div className="font-mono text-[10px] tracking-wide text-muted">{k.label}</div>
              <div className="mt-1.5 font-display text-xl font-bold">
                {k.value}
                <span className="ml-1 font-mono text-[10px] font-normal text-muted">{k.unit}</span>
              </div>
              <div className={`mt-1 font-mono text-[10px] ${k.trend === 'down' ? 'text-amber' : 'text-lime'}`}>
                {k.delta > 0 ? '▲' : '▼'} {Math.abs(k.delta)}%
              </div>
            </GlassCard>
          </Reveal>
        ))}
      </div>

      {/* env chart + gauges */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <GlassCard hover={false} className="h-full p-6">
            <SectionTitle
              eyebrow="Climate · last 24h"
              title="Environment telemetry"
              right={<LiveDot />}
              className="mb-4"
            />
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={curve} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#19e08c" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#19e08c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8bff5a" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#8bff5a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(120,220,170,0.07)" vertical={false} />
                <XAxis dataKey="t" interval={3} tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={38} />
                <Tooltip />
                <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#7e9c8b' }} />
                <Area type="monotone" dataKey="light" name="Light %" stroke="#8bff5a" strokeWidth={1.5} fill="url(#gLight)" />
                <Area type="monotone" dataKey="temp" name="Temp °C" stroke="#19e08c" strokeWidth={2.4} fill="url(#gTemp)" />
                <Line type="monotone" dataKey="humidity" name="Humidity %" stroke="#4be3ff" strokeWidth={2} dot={false} strokeDasharray="4 3" />
              </ComposedChart>
            </ResponsiveContainer>
          </GlassCard>
        </Reveal>

        <Reveal delay={0.1}>
          <GlassCard hover={false} className="flex h-full flex-col p-6">
            <SectionTitle eyebrow="Now" title="Current conditions" className="mb-5" />
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { v: live.temp, max: 35, label: 'Temp °C', color: '#19e08c', suffix: '' },
                { v: live.humidity, max: 100, label: 'Humidity', color: '#4be3ff', suffix: '%' },
                { v: live.soil, max: 100, label: 'Soil', color: '#8bff5a', suffix: '%' },
              ].map((g) => (
                <div key={g.label} className="flex flex-col items-center">
                  <Ring value={(g.v / g.max) * 100} color={g.color} size={84} stroke={7}>
                    <div className="font-display text-lg font-bold leading-none">{g.v}</div>
                    <div className="font-mono text-[9px] text-muted">{g.suffix || '°C'}</div>
                  </Ring>
                  <div className="mt-2 font-mono text-[10px] tracking-wide text-muted">{g.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-3">
              <div className="glass-soft flex items-center justify-between rounded-xl px-4 py-3">
                <span className="flex items-center gap-2 text-sm text-ink-dim">
                  <Wind size={15} className="text-mint" /> CO₂
                </span>
                <span className="font-mono text-sm text-lime">{live.co2} ppm</span>
              </div>
              <div className="glass-soft flex items-center justify-between rounded-xl px-4 py-3">
                <span className="flex items-center gap-2 text-sm text-ink-dim">
                  <Gauge size={15} className="text-amber" /> VPD
                </span>
                <span className="font-mono text-sm text-ink">0.94 kPa</span>
              </div>
            </div>
          </GlassCard>
        </Reveal>
      </div>

      {/* zones + alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <GlassCard hover={false} className="h-full p-6">
            <SectionTitle eyebrow="Grow zones" title="Rack monitor" right={<Chip tone="muted">6 active</Chip>} className="mb-4" />
            <div className="grid gap-3 sm:grid-cols-2">
              {zones.map((z) => (
                <div key={z.id} className="glass rounded-2xl p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-xl">{z.emoji}</span>
                      <div>
                        <div className="text-sm font-semibold leading-tight">{z.crop}</div>
                        <div className="font-mono text-[10px] text-muted">
                          {z.id} · {z.stage}
                        </div>
                      </div>
                    </div>
                    <Chip tone={statusTone[z.status]} dot>
                      {z.status}
                    </Chip>
                  </div>
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between font-mono text-[10px] text-muted">
                      <span>health</span>
                      <span style={{ color: statusColor[z.status] }}>{z.health}%</span>
                    </div>
                    <ProgressBar value={z.health} color={statusColor[z.status]} height={5} />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[10px] text-muted">
                    <span>🌡 {z.temp}°</span>
                    <span>💧 {z.humidity}%</span>
                    <span>🌱 {z.soil}%</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </Reveal>

        <Reveal delay={0.1}>
          <GlassCard hover={false} className="flex h-full flex-col p-6">
            <SectionTitle eyebrow="Activity" title="Alerts & events" right={<Bell size={16} className="text-mint" />} className="mb-4" />
            <div className="space-y-3">
              {ALERTS.map((a) => {
                const Icon = a.level === 'crit' ? AlertTriangle : a.level === 'warn' ? AlertTriangle : Info
                const color = a.level === 'crit' ? 'text-danger' : a.level === 'warn' ? 'text-amber' : 'text-mint'
                return (
                  <div key={a.id} className="glass-soft flex gap-3 rounded-xl p-3">
                    <Icon size={16} className={`mt-0.5 shrink-0 ${color}`} />
                    <div className="min-w-0">
                      <p className="text-[13px] leading-snug text-ink-dim">{a.msg}</p>
                      <div className="mt-1 font-mono text-[10px] text-faint">
                        zone {a.zone} · {a.ago} ago
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </GlassCard>
        </Reveal>
      </div>

      {/* weekly yield */}
      <Reveal>
        <GlassCard hover={false} className="p-6">
          <SectionTitle eyebrow="Output" title="Harvest yield vs target" sub="Daily harvested mass against the AI-set production target (kg)." className="mb-4" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={WEEKLY_YIELD} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barGap={4}>
              <defs>
                <linearGradient id="gBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8bff5a" />
                  <stop offset="100%" stopColor="#19e08c" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(120,220,170,0.07)" vertical={false} />
              <XAxis dataKey="d" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={36} />
              <Tooltip cursor={{ fill: 'rgba(120,220,170,0.06)' }} />
              <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 11 }} />
              <Bar dataKey="target" name="Target" fill="rgba(126,156,139,0.25)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="actual" name="Actual" fill="url(#gBar)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </Reveal>
    </div>
  )
}
