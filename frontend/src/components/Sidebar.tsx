import { motion } from 'framer-motion'
import { Bot, Leaf, ScanLine, Sparkles, Stethoscope, type LucideIcon } from 'lucide-react'
import { cn } from '../lib/cn'

export type View = 'overview' | 'doctor' | 'scanner' | 'advisor'

export const NAV: { id: View; label: string; icon: LucideIcon; hint: string }[] = [
  { id: 'overview', label: 'Overview', icon: Sparkles, hint: 'Command center' },
  { id: 'doctor', label: 'Plant Doctor', icon: Stethoscope, hint: 'Disease diagnosis' },
  { id: 'scanner', label: 'Species Scanner', icon: ScanLine, hint: 'Identify plants' },
  { id: 'advisor', label: 'AI Advisor', icon: Bot, hint: 'Ask anything' },
]

export function Sidebar({ active, onNavigate, onHome }: { active: View; onNavigate: (v: View) => void; onHome: () => void }) {
  return (
    <aside className="glass-strong fixed inset-y-0 left-0 z-40 hidden w-[268px] flex-col border-r border-white/5 px-5 py-7 lg:flex">
      {/* brand */}
      <button onClick={onHome} className="mb-9 flex items-center gap-3 text-left">
        <div className="relative h-11 w-11 shrink-0">
          <img src="/assets/brand/logo-glow.png" alt="VERDANT" className="botanical h-11 w-11" />
        </div>
        <div>
          <div className="font-display text-lg font-bold leading-none tracking-tight text-glow">VERDANT</div>
          <div className="mt-1 font-mono text-[10px] tracking-[0.22em] text-muted">URBAN · AI · FARMING</div>
        </div>
      </button>

      {/* nav */}
      <nav className="flex flex-1 flex-col gap-1.5">
        {NAV.map((item) => {
          const isActive = active === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-all duration-200',
                isActive ? 'text-ink' : 'text-muted hover:text-ink-dim',
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-2xl border border-emerald/30 bg-gradient-to-r from-emerald/15 to-transparent"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span
                className={cn(
                  'relative grid h-9 w-9 place-items-center rounded-xl transition-all',
                  isActive ? 'bg-emerald/20 text-lime glow-emerald' : 'bg-white/5 group-hover:bg-white/10',
                )}
              >
                <Icon size={17} strokeWidth={2} />
              </span>
              <span className="relative">
                <span className="block text-[13.5px] font-medium leading-tight">{item.label}</span>
                <span className="block font-mono text-[10px] tracking-wide text-faint">{item.hint}</span>
              </span>
            </button>
          )
        })}
      </nav>

      {/* footer status card */}
      <div className="glass mt-4 rounded-2xl p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="eyebrow">System</span>
          <span className="live-dot" />
        </div>
        <p className="text-[12px] leading-relaxed text-ink-dim">
          6 racks online · <span className="text-lime">96%</span> automated
        </p>
        <div className="mt-3 flex items-center gap-2 font-mono text-[10px] text-muted">
          <Leaf size={12} className="text-emerald" /> carbon-negative ops
        </div>
      </div>
    </aside>
  )
}
