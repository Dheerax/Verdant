import { useState } from 'react'
import { Activity, CheckCircle2, Leaf, ShieldCheck, Stethoscope, TriangleAlert, WifiOff } from 'lucide-react'
import { Uploader } from '../components/Uploader'
import { Bar, Chip, GlassCard, Reveal, Ring, SectionTitle } from '../components/ui'
import { diagnoseDisease, type DiagnoseResult } from '../lib/api'

const SEV: Record<DiagnoseResult['severity'], { color: string; tone: 'lime' | 'amber' | 'danger'; label: string }> = {
  none: { color: '#8bff5a', tone: 'lime', label: 'Healthy' },
  low: { color: '#ffc24b', tone: 'amber', label: 'Low severity' },
  moderate: { color: '#ffc24b', tone: 'amber', label: 'Moderate' },
  high: { color: '#ff6b6b', tone: 'danger', label: 'High severity' },
}

export function PlantDoctor() {
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DiagnoseResult | null>(null)

  async function handleFile(f: File) {
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setLoading(true)
    const r = await diagnoseDisease(f)
    setResult(r)
    setLoading(false)
  }

  const sev = result ? SEV[result.severity] : null

  return (
    <div className="pb-10">
      <SectionTitle
        eyebrow="Computer vision · Vision Transformer"
        title="Plant Doctor"
        sub="Upload a leaf and a Vision Transformer AI classifies disease across crops, then prescribes a treatment & prevention plan."
        right={<Chip tone="emerald" dot>crop_leaf_diseases_vit</Chip>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* INPUT */}
        <Reveal>
          <GlassCard hover={false} className="p-6">
            <Uploader
              onFile={handleFile}
              preview={preview}
              loading={loading}
              cta="Drop a leaf photo"
              samples={[
                { label: 'Diseased leaf', src: '/assets/feature/diseased-leaf.png', name: 'diseased.png' },
                { label: 'Macro leaf', src: '/assets/botanical/leaf-macro-glow.png', name: 'leaf.png' },
              ]}
            />
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              {[
                { icon: Activity, t: '14+ classes', s: 'corn · potato · rice · wheat' },
                { icon: Stethoscope, t: '98% acc', s: 'validation set' },
                { icon: ShieldCheck, t: 'on-device', s: 'private inference' },
              ].map((x) => (
                <div key={x.t} className="glass-soft rounded-xl p-3">
                  <x.icon size={16} className="mx-auto mb-1.5 text-mint" />
                  <div className="font-display text-sm font-semibold">{x.t}</div>
                  <div className="font-mono text-[9px] text-muted">{x.s}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </Reveal>

        {/* OUTPUT */}
        <Reveal delay={0.1}>
          <GlassCard hover={false} className="flex h-full flex-col p-6">
            {!result ? (
              <div className="grid flex-1 place-items-center py-16 text-center">
                <div>
                  <span className="mx-auto mb-4 grid h-16 w-16 animate-pulse place-items-center rounded-2xl bg-white/5 text-faint">
                    <Leaf size={26} />
                  </span>
                  <p className="font-mono text-xs text-muted">awaiting a sample to diagnose…</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col">
                {/* header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <Chip tone={sev!.tone} dot>
                        {sev!.label}
                      </Chip>
                      {result.offline && (
                        <Chip tone="amber">
                          <WifiOff size={11} /> demo mode
                        </Chip>
                      )}
                    </div>
                    <h3 className="font-display text-2xl font-bold leading-tight">
                      {result.condition ?? result.top.label}
                    </h3>
                    {result.crop && <p className="font-mono text-[11px] text-muted">crop · {result.crop}</p>}
                  </div>
                  <Ring value={result.top.score * 100} color={sev!.color} size={92} stroke={8}>
                    <div className="font-display text-xl font-bold leading-none">
                      {Math.round(result.top.score * 100)}
                      <span className="text-xs">%</span>
                    </div>
                    <div className="font-mono text-[9px] text-muted">conf.</div>
                  </Ring>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-ink-dim">{result.summary}</p>

                {/* prediction distribution */}
                <div className="mt-5">
                  <div className="mb-2 font-mono text-[10px] tracking-wide text-muted">PROBABILITY DISTRIBUTION</div>
                  <div className="space-y-2">
                    {result.predictions.slice(0, 4).map((p, i) => (
                      <div key={p.label}>
                        <div className="mb-1 flex justify-between font-mono text-[11px]">
                          <span className={i === 0 ? 'text-ink' : 'text-muted'}>{p.label}</span>
                          <span className={i === 0 ? 'text-lime' : 'text-muted'}>{(p.score * 100).toFixed(1)}%</span>
                        </div>
                        <Bar value={p.score * 100} color={i === 0 ? sev!.color : '#3a5446'} height={5} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* treatment + prevention */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="glass-soft rounded-2xl p-4">
                    <div className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-ink">
                      <TriangleAlert size={15} className="text-amber" /> Treatment
                    </div>
                    <ul className="space-y-2">
                      {result.treatment.map((t) => (
                        <li key={t} className="flex gap-2 text-[12.5px] leading-snug text-ink-dim">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass-soft rounded-2xl p-4">
                    <div className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-ink">
                      <CheckCircle2 size={15} className="text-lime" /> Prevention
                    </div>
                    <ul className="space-y-2">
                      {result.prevention.map((t) => (
                        <li key={t} className="flex gap-2 text-[12.5px] leading-snug text-ink-dim">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-lime" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
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
