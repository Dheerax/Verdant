import { motion } from 'framer-motion'
import {
  Beaker,
  Bot,
  CalendarRange,
  Gauge,
  LayoutDashboard,
  LayoutGrid,
  Leaf,
  ScanLine,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '../lib/cn'

export type View =
  | 'overview'
  | 'doctor'
  | 'scanner'
  | 'simulator'
  | 'vpd'
  | 'growplan'
  | 'nutrients'
  | 'advisor'

export interface NavItem {
  id: View
  label: string
  icon: LucideIcon
  hint: string
}

export const NAV: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, hint: 'Command center' },
  { id: 'doctor', label: 'Plant Doctor', icon: Stethoscope, hint: 'Disease diagnosis' },
  { id: 'scanner', label: 'Species Scanner', icon: ScanLine, hint: 'Identify plants' },
  { id: 'simulator', label: 'Grow Simulator', icon: Gauge, hint: 'Digital twin' },
  { id: 'vpd', label: 'VPD Matrix', icon: LayoutGrid, hint: 'Climate console' },
  { id: 'growplan', label: 'Grow Plan', icon: CalendarRange, hint: 'AI scheduler' },
  { id: 'nutrients', label: 'Nutrient Lab', icon: Beaker, hint: 'Dosing solver' },
  { id: 'advisor', label: 'AI Advisor', icon: Bot, hint: 'Ask anything' },
]

const GROUPS: { label: string; ids: View[] }[] = [
  { label: 'Diagnose', ids: ['doctor', 'scanner'] },
  { label: 'Grow Lab', ids: ['simulator', 'vpd', 'growplan', 'nutrients'] },
  { label: 'Assist', ids: ['advisor'] },
]

const byId = (id: View) => NAV.find((n) => n.id === id)!

export function Sidebar({ active, onNavigate, onHome }: { active: View; onNavigate: (v: View) => void; onHome: () => void }) {
  return (
    <aside className="glass-strong fixed inset-y-0 left-0 z-40 hidden w-[268px] flex-col border-r border-white/5 px-5 py-7 lg:flex">
      {/* brand */}
      <button onClick={onHome} className="mb-7 flex shrink-0 items-center gap-3 text-left">
        <img src="/assets/brand/logo-glow.png" alt="VERDANT" className="botanical h-11 w-11" />
        <div>
          <div className="font-display text-lg font-bold leading-none tracking-tight text-glow">VERDANT</div>
          <div className="mt-1 font-mono text-[10px] tracking-[0.22em] text-muted">URBAN · AI · FARMING</div>
        </div>
      </button>

      {/* nav */}
      <nav className="no-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto">
        <NavButton item={byId('overview')} active={active} onNavigate={onNavigate} />

        {GROUPS.map((g) => (
          <div key={g.label} className="mt-3">
            <div className="mb-1 px-3 font-mono text-[9px] tracking-[0.2em] text-faint">{g.label.toUpperCase()}</div>
            {g.ids.map((id) => (
              <NavButton key={id} item={byId(id)} active={active} onNavigate={onNavigate} />
            ))}
          </div>
        ))}
      </nav>

      {/* footer status card */}
      <div className="glass mt-4 shrink-0 rounded-2xl p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="eyebrow">System</span>
          <span className="live-dot" />
        </div>
        <p className="text-[12px] leading-relaxed text-ink-dim">
          8 AI tools online · <span className="text-lime">⌘K</span> to jump
        </p>
        <div className="mt-3 flex items-center gap-2 font-mono text-[10px] text-muted">
          <Leaf size={12} className="text-emerald" /> carbon-negative ops
        </div>
      </div>
    </aside>
  )
}

function NavButton({ item, active, onNavigate }: { item: NavItem; active: View; onNavigate: (v: View) => void }) {
  const isActive = active === item.id
  const Icon = item.icon
  return (
    <button
      onClick={() => onNavigate(item.id)}
      className={cn(
        'group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left transition-all duration-200',
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
          'relative grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-all',
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
}
