import { useState } from 'react'
import { Droplets, Gauge, Leaf, ScanLine, Sprout, WifiOff } from 'lucide-react'
import { Uploader } from '../components/Uploader'
import { Bar, Chip, GlassCard, Reveal, Ring, SectionTitle } from '../components/ui'
import { identifySpecies, type IdentifyResult } from '../lib/api'
import { CROPS, type Crop } from '../lib/data'

function matchCrop(label: string): Crop | undefined {
  const ltoks = label
    .toLowerCase()
    .replace(/[^a-z ]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 3)
  return CROPS.find((c) => c.name.toLowerCase().split(' ').some((ct) => ltoks.includes(ct)))
}

const waterTone = { low: 'lime', medium: 'mint', high: 'amber' } as const

export function Scanner() {
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<IdentifyResult | null>(null)

  async function handleFile(f: File) {
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setLoading(true)
    const r = await identifySpecies(f)
    setResult(r)
    setLoading(false)
  }

  const crop = result ? matchCrop(result.top.label) : undefined

  return (
    <div className="pb-10">
      <SectionTitle
        eyebrow="Computer vision · Vision Transformer"
        title="Species Scanner"
        sub="Point it at any plant. A Vision Transformer AI names the species and pulls a tailored grow-profile."
        right={<Chip tone="emerald" dot>plant-id · ViT</Chip>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <GlassCard hover={false} className="p-6">
            <Uploader
              onFile={handleFile}
              preview={preview}
              loading={loading}
              accent="#38f5c9"
              cta="Drop a plant photo"
              samples={[
                { label: 'Monstera', src: '/assets/botanical/monstera-glow.png', name: 'monstera.png' },
                { label: 'Fern', src: '/assets/botanical/fern-glow.png', name: 'fern.png' },
                { label: 'Leaf', src: '/assets/botanical/leaf-macro-glow.png', name: 'leaf.png' },
              ]}
            />
          </GlassCard>
        </Reveal>

        <Reveal delay={0.1}>
          <GlassCard hover={false} className="flex h-full flex-col p-6">
            {!result ? (
              <div className="grid flex-1 place-items-center py-16 text-center">
                <div>
                  <span className="mx-auto mb-4 grid h-16 w-16 animate-pulse place-items-center rounded-2xl bg-white/5 text-faint">
                    <ScanLine size={26} />
                  </span>
                  <p className="font-mono text-xs text-muted">awaiting a plant to identify…</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-1.5 flex items-center gap-2">
                      <Chip tone="mint" dot>
                        identified
                      </Chip>
                      {result.offline && (
                        <Chip tone="amber">
                          <WifiOff size={11} /> demo mode
                        </Chip>
                      )}
                    </div>
                    <h3 className="font-display text-2xl font-bold leading-tight">{result.top.label}</h3>
                    <p className="font-mono text-[11px] text-muted">
                      {crop ? `${crop.family} · ${crop.emoji}` : 'species match'}
                    </p>
                  </div>
                  <Ring value={result.top.score * 100} color="#38f5c9" size={92} stroke={8}>
                    <div className="font-display text-xl font-bold leading-none">
                      {Math.round(result.top.score * 100)}
                      <span className="text-xs">%</span>
                    </div>
                    <div className="font-mono text-[9px] text-muted">match</div>
                  </Ring>
                </div>

                {/* distribution */}
                <div className="mt-5">
                  <div className="mb-2 font-mono text-[10px] tracking-wide text-muted">TOP CANDIDATES</div>
                  <div className="space-y-2">
                    {result.predictions.slice(0, 4).map((p, i) => (
                      <div key={p.label}>
                        <div className="mb-1 flex justify-between font-mono text-[11px]">
                          <span className={i === 0 ? 'text-ink' : 'text-muted'}>{p.label}</span>
                          <span className={i === 0 ? 'text-mint' : 'text-muted'}>{(p.score * 100).toFixed(1)}%</span>
                        </div>
                        <Bar value={p.score * 100} color={i === 0 ? '#38f5c9' : '#3a5446'} height={5} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* grow profile */}
                <div className="mt-6 flex-1">
                  <div className="mb-2 font-mono text-[10px] tracking-wide text-muted">GROW PROFILE</div>
                  {crop ? (
                    <div className="glass-soft rounded-2xl p-4">
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <Sprout size={16} className="mx-auto mb-1 text-lime" />
                          <div className="font-display text-base font-bold">{crop.daysToHarvest}d</div>
                          <div className="font-mono text-[9px] text-muted">to harvest</div>
                        </div>
                        <div>
                          <Droplets size={16} className="mx-auto mb-1 text-cyan" />
                          <div className="font-display text-base font-bold capitalize">{crop.water}</div>
                          <div className="font-mono text-[9px] text-muted">water need</div>
                        </div>
                        <div>
                          <Gauge size={16} className="mx-auto mb-1 text-amber" />
                          <div className="font-display text-base font-bold capitalize">{crop.difficulty}</div>
                          <div className="font-mono text-[9px] text-muted">difficulty</div>
                        </div>
                      </div>
                      <p className="mt-3 border-t border-white/8 pt-3 text-[12.5px] leading-relaxed text-ink-dim">
                        {crop.note}
                      </p>
                      <div className="mt-3">
                        <Chip tone={waterTone[crop.water]}>~{crop.yieldPerM2} kg/m² yield</Chip>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-soft flex items-start gap-3 rounded-2xl p-4 text-[12.5px] leading-relaxed text-ink-dim">
                      <Leaf size={16} className="mt-0.5 shrink-0 text-mint" />
                      Not in our vertical-farm catalog yet — but most leafy plants thrive at 18–24°C with
                      14–16h of light and weekly nutrient dosing.
                    </div>
                  )}
                </div>

                <div className="mt-4 border-t border-white/8 pt-3 font-mono text-[10px] text-faint">
                  model · {result.model}
                </div>
              </div>
            )}
          </GlassCard>
        </Reveal>
      </div>
    </div>
  )
}
