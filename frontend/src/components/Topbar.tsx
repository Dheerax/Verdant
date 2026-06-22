import { useEffect, useState } from 'react'
import { CloudSun, Search } from 'lucide-react'
import { NAV, type View } from './Sidebar'
import { cn } from '../lib/cn'

export function Topbar({
  active,
  onNavigate,
  onHome,
}: {
  active: View
  onNavigate: (v: View) => void
  onHome: () => void
}) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const current = NAV.find((n) => n.id === active)!

  return (
    <header className="sticky top-0 z-30 -mx-4 mb-2 px-4 pt-4 md:-mx-8 md:px-8">
      <div className="glass flex items-center justify-between gap-4 rounded-2xl px-4 py-3 md:px-5">
        {/* mobile brand */}
        <button onClick={onHome} className="flex items-center gap-3 lg:hidden">
          <img src="/assets/brand/logo-glow.png" alt="" className="botanical h-8 w-8" />
          <span className="font-display text-base font-bold tracking-tight text-glow">VERDANT</span>
        </button>

        {/* desktop title */}
        <div className="hidden lg:block">
          <h1 className="font-display text-lg font-semibold leading-none">{current.label}</h1>
          <p className="mt-1 font-mono text-[11px] tracking-wide text-muted">{current.hint}</p>
        </div>

        {/* search (decorative) */}
        <div className="glass-soft hidden items-center gap-2 rounded-full px-3.5 py-2 text-muted xl:flex">
          <Search size={14} />
          <span className="font-mono text-[11px]">Search zones, crops…</span>
          <kbd className="ml-2 rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
        </div>

        {/* right cluster */}
        <div className="flex items-center gap-2.5">
          <div className="glass-soft hidden items-center gap-2 rounded-full px-3 py-2 sm:flex">
            <CloudSun size={15} className="text-amber" />
            <span className="font-mono text-[11px] text-ink-dim">22°C · Clear</span>
          </div>

          <div className="hidden text-right md:block">
            <div className="font-mono text-[13px] leading-none text-ink">
              {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="mt-1 font-mono text-[10px] text-muted">
              {now.toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short' })}
            </div>
          </div>

        </div>
      </div>

      {/* mobile nav pills */}
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => onNavigate(n.id)}
            className={cn(
              'whitespace-nowrap rounded-full border px-3.5 py-1.5 font-mono text-[11px] transition-all',
              active === n.id
                ? 'border-emerald/40 bg-emerald/15 text-lime'
                : 'border-white/10 text-muted',
            )}
          >
            {n.label}
          </button>
        ))}
      </div>
    </header>
  )
}
