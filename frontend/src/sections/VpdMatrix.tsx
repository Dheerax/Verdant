import { useMemo, useState } from 'react'
import { Droplets, Leaf, Thermometer, Wind } from 'lucide-react'
import { Chip, GlassCard, Reveal, SectionTitle } from '../components/ui'
import { VPD_BANDS, vpd, vpdZone } from '../lib/agronomy'

const TEMPS = Array.from({ length: 19 }, (_, i) => 16 + i) // 16..34 °C
const HUMS = Array.from({ length: 12 }, (_, i) => 95 - i * 5) // 95..40 %RH

export function VpdMatrix() {
  const [temp, setTemp] = useState(23)
  const [rh, setRh] = useState(65)

  const current = useMemo(() => vpd(temp, rh), [temp, rh])
  const band = vpdZone(current)

  return (
    <div className="pb-10">
      <SectionTitle
        eyebrow="Vapour Pressure Deficit · Climate console"
        title="VPD Climate Matrix"
        sub="The chart every serious grower lives by. VPD blends temperature and humidity into one transpiration number — computed live with the Tetens equation and a leaf-temperature offset. Click any cell to read its zone."
        right={<Chip tone="emerald" dot>Tetens model</Chip>}
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        {/* ---------- MATRIX ---------- */}
        <Reveal>
          <GlassCard hover={false} className="overflow-hidden p-5 md:p-6">
            <div className="flex gap-2">
              {/* y-axis label */}
              <div className="flex flex-col items-center justify-center">
                <span className="rotate-180 font-mono text-[10px] tracking-widest text-muted [writing-mode:vertical-rl]">
                  RELATIVE HUMIDITY %
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex">
                  {/* y ticks */}
                  <div className="flex flex-col justify-between pr-1.5 py-0.5">
                    {HUMS.map((h) => (
                      <span key={h} className="font-mono text-[9px] leading-none text-faint" style={{ height: `${100 / HUMS.length}%` }}>
                        {h}
                      </span>
                    ))}
                  </div>

                  {/* grid */}
                  <div
                    className="grid flex-1 gap-[2px]"
                    style={{ gridTemplateColumns: `repeat(${TEMPS.length}, minmax(0, 1fr))` }}
                  >
                    {HUMS.map((h) =>
                      TEMPS.map((t) => {
                        const cellV = vpd(t, h)
                        const z = vpdZone(cellV)
                        const isActive = t === temp && Math.abs(h - rh) < 3
                        return (
                          <button
                            key={`${t}-${h}`}
                            onClick={() => { setTemp(t); setRh(h) }}
                            title={`${t}°C · ${h}% → ${cellV.toFixed(2)} kPa`}
                            className="group relative aspect-square rounded-[3px] transition-all hover:z-10 hover:scale-[1.35]"
                            style={{
                              background: z.color,
                              opacity: isActive ? 1 : 0.32,
                              boxShadow: isActive ? `0 0 0 2px #fff, 0 0 14px ${z.color}` : 'none',
                            }}
                          />
                        )
                      }),
                    )}
                  </div>
                </div>

                {/* x ticks */}
                <div className="mt-1.5 flex" style={{ paddingLeft: '1.4rem' }}>
                  <div className="grid flex-1 gap-[2px]" style={{ gridTemplateColumns: `repeat(${TEMPS.length}, minmax(0, 1fr))` }}>
                    {TEMPS.map((t) => (
                      <span key={t} className="text-center font-mono text-[9px] text-faint">
                        {t % 2 === 0 ? t : ''}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-1 text-center font-mono text-[10px] tracking-widest text-muted">AIR TEMPERATURE °C</div>
              </div>
            </div>

            {/* legend */}
            <div className="mt-5 flex flex-wrap gap-2 border-t border-white/8 pt-4">
              {VPD_BANDS.map((b) => (
                <div key={b.zone} className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-[3px]" style={{ background: b.color, boxShadow: `0 0 8px ${b.color}80` }} />
                  <span className="font-mono text-[10px] text-muted">{b.label} <span className="text-faint">({b.range})</span></span>
                </div>
              ))}
            </div>
          </GlassCard>
        </Reveal>

        {/* ---------- READOUT ---------- */}
        <Reveal delay={0.1}>
          <GlassCard hover={false} glow className="flex h-full flex-col p-6">
            <div className="text-center">
              <div className="eyebrow mb-3">Current VPD</div>
              <div className="font-display text-6xl font-bold leading-none" style={{ color: band.color, textShadow: `0 0 30px ${band.color}80` }}>
                {current.toFixed(2)}
              </div>
              <div className="mt-1 font-mono text-xs text-muted">kPa</div>
              <div className="mt-4 inline-flex">
                <Chip tone="muted" className="!border-current" >
                  <span style={{ color: band.color }}>● {band.label}</span>
                </Chip>
              </div>
            </div>

            {/* sliders */}
            <div className="mt-7 space-y-5">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[13px] text-ink-dim"><Thermometer size={14} className="text-amber" /> Temperature</span>
                  <span className="font-mono text-[13px] text-lime">{temp}<span className="ml-0.5 text-[10px] text-muted">°C</span></span>
                </div>
                <input type="range" className="verdant-range" min={16} max={34} step={1} value={temp}
                  onChange={(e) => setTemp(parseInt(e.target.value))}
                  style={{ background: `linear-gradient(90deg, #ffc24b ${((temp - 16) / 18) * 100}%, rgba(255,255,255,0.08) ${((temp - 16) / 18) * 100}%)` }} />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[13px] text-ink-dim"><Droplets size={14} className="text-cyan" /> Humidity</span>
                  <span className="font-mono text-[13px] text-lime">{rh}<span className="ml-0.5 text-[10px] text-muted">%</span></span>
                </div>
                <input type="range" className="verdant-range" min={40} max={95} step={1} value={rh}
                  onChange={(e) => setRh(parseInt(e.target.value))}
                  style={{ background: `linear-gradient(90deg, #4be3ff ${((rh - 40) / 55) * 100}%, rgba(255,255,255,0.08) ${((rh - 40) / 55) * 100}%)` }} />
              </div>
            </div>

            {/* advice */}
            <div className="glass-soft mt-7 flex-1 rounded-2xl p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
                <Wind size={15} className="text-mint" /> Grower guidance
              </div>
              <p className="text-[12.5px] leading-relaxed text-ink-dim">{advice(current)}</p>
            </div>

            <div className="mt-4 flex items-start gap-2 text-[11px] leading-snug text-faint">
              <Leaf size={13} className="mt-0.5 shrink-0 text-emerald" />
              VPD = saturation pressure at leaf temp − actual air vapour pressure. Leaves modelled 1.5°C below air.
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </div>
  )
}

function advice(v: number): string {
  if (v < 0.4) return 'Air is near-saturated — plants can barely transpire. Expect weak nutrient uptake, soft growth and high mildew/edema risk. Raise temperature or dehumidify to push VPD up.'
  if (v < 0.8) return 'Gentle deficit — ideal for clones, seedlings and propagation where you want minimal water stress while roots establish. A touch low for mature vegetative crops.'
  if (v < 1.2) return 'The sweet spot for vegetative growth. Transpiration and calcium transport are steady — most leafy crops and young plants thrive here. Hold this band.'
  if (v < 1.6) return 'Higher deficit suited to flowering and fruiting, when you want firm tissue and lower disease pressure. Watch that leaf temps and feeding keep pace with transpiration.'
  return 'Air is very dry — plants transpire faster than roots can supply. Risk of wilting, tip-burn and stomatal closure. Lower temperature or add humidity to bring VPD down.'
}
