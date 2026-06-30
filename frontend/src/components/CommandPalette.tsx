import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CornerDownLeft, Search } from 'lucide-react'
import { NAV, type View } from './Sidebar'

export function CommandPalette({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return NAV
    return NAV.filter((n) => `${n.label} ${n.hint}`.toLowerCase().includes(q))
  }, [query])

  // global ⌘K / Ctrl+K toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    // let anything dispatch a custom open event (e.g. the topbar search)
    const openEvt = () => setOpen(true)
    window.addEventListener('verdant:cmdk', openEvt)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('verdant:cmdk', openEvt)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setCursor(0)
      setTimeout(() => inputRef.current?.focus(), 40)
    }
  }, [open])

  useEffect(() => setCursor(0), [query])

  const choose = (v: View) => {
    onNavigate(v)
    setOpen(false)
  }

  const onInputKey = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)) }
    if (e.key === 'Enter' && results[cursor]) { e.preventDefault(); choose(results[cursor].id) }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cmdk-backdrop fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[14vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="glass-strong w-full max-w-[560px] overflow-hidden rounded-2xl"
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* input */}
            <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3.5">
              <Search size={17} className="text-mint" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Jump to a tool…"
                className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-faint"
              />
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-muted">ESC</kbd>
            </div>

            {/* results */}
            <div className="max-h-[44vh] overflow-y-auto p-2">
              {results.length === 0 && (
                <div className="px-3 py-6 text-center font-mono text-[12px] text-muted">no tools match “{query}”</div>
              )}
              {results.map((n, i) => {
                const Icon = n.icon
                const on = i === cursor
                return (
                  <button
                    key={n.id}
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => choose(n.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      on ? 'bg-emerald/15' : 'hover:bg-white/5'
                    }`}
                  >
                    <span className={`grid h-8 w-8 place-items-center rounded-lg ${on ? 'bg-emerald/25 text-lime' : 'bg-white/5 text-muted'}`}>
                      <Icon size={15} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-[13.5px] font-medium text-ink">{n.label}</span>
                      <span className="block font-mono text-[10px] text-faint">{n.hint}</span>
                    </span>
                    {on && <CornerDownLeft size={14} className="text-mint" />}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-between border-t border-white/8 px-4 py-2.5 font-mono text-[10px] text-faint">
              <span>↑↓ navigate · ↵ open</span>
              <span>VERDANT command bar</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
