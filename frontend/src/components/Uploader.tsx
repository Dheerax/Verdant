import { useRef, useState } from 'react'
import { ImageUp, Loader2, UploadCloud } from 'lucide-react'
import { cn } from '../lib/cn'

async function fileFromUrl(url: string, name: string): Promise<File> {
  const res = await fetch(url)
  const blob = await res.blob()
  return new File([blob], name, { type: blob.type || 'image/png' })
}

export function Uploader({
  onFile,
  preview,
  loading,
  accent = '#19e08c',
  samples = [],
  cta = 'Drop a leaf photo',
}: {
  onFile: (f: File) => void
  preview: string | null
  loading: boolean
  accent?: string
  samples?: { label: string; src: string; name: string }[]
  cta?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDrag(false)
          const f = e.dataTransfer.files?.[0]
          if (f) onFile(f)
        }}
        className={cn(
          'group relative grid aspect-[4/3] cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed transition-all',
          drag ? 'border-lime bg-lime/5' : 'border-white/12 hover:border-emerald/50',
        )}
      >
        {preview ? (
          <>
            <img src={preview} alt="upload preview" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#04140c]/70 to-transparent" />
            {/* HUD reticle */}
            <div className="pointer-events-none absolute inset-4 rounded-xl border border-lime/30">
              <span className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-lime" />
              <span className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-lime" />
              <span className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-lime" />
              <span className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-lime" />
            </div>
            {loading && (
              <>
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-16"
                  style={{ background: `linear-gradient(to bottom, ${accent}55, transparent)`, animation: 'scanline 1.8s linear infinite' }}
                />
                <div className="absolute inset-0 grid place-items-center bg-[#04140c]/40">
                  <div className="glass-strong flex items-center gap-2 rounded-full px-4 py-2 font-mono text-xs text-lime">
                    <Loader2 size={14} className="animate-spin" /> analyzing…
                  </div>
                </div>
              </>
            )}
            {!loading && (
              <div className="glass absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1.5 font-mono text-[11px] text-ink-dim opacity-0 transition-opacity group-hover:opacity-100">
                click to replace
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center px-6 text-center">
            <span className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-emerald/15 text-lime glow-emerald">
              <UploadCloud size={26} />
            </span>
            <div className="font-display text-lg font-semibold">{cta}</div>
            <p className="mt-1.5 font-mono text-[11px] text-muted">drag & drop · or click to browse · JPG / PNG</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onFile(f)
          }}
        />
      </div>

      {samples.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] tracking-wide text-muted">
            <ImageUp size={12} /> NO PHOTO? TRY A SAMPLE
          </div>
          <div className="flex flex-wrap gap-2">
            {samples.map((s) => (
              <button
                key={s.label}
                onClick={async () => onFile(await fileFromUrl(s.src, s.name))}
                className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1.5 pr-3 transition-all hover:border-emerald/40 hover:bg-emerald/10"
              >
                <img src={s.src} alt="" className="h-8 w-8 rounded-lg object-cover" />
                <span className="font-mono text-[11px] text-ink-dim">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
