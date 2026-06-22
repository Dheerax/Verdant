import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CornerDownLeft, Loader2, Sparkles, WifiOff } from 'lucide-react'
import { Chip, GlassCard, Reveal, SectionTitle } from '../components/ui'
import { askAdvisor } from '../lib/api'

interface Msg {
  id: number
  role: 'user' | 'ai'
  text: string
  topic?: string
  related?: string[]
  sources?: string[]
  offline?: boolean
  score?: number
}

const SUGGESTIONS = [
  'What EC and pH suit lettuce?',
  'How do I prevent root rot?',
  'Best light cycle for basil?',
  'When are microgreens ready?',
  'How to boost tomato yield?',
]

let counter = 1

export function Advisor() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 0,
      role: 'ai',
      text: "I'm VERDANT's grow advisor. Ask me anything about hydroponics, crop care, nutrients, light or pests — I search a curated agronomy knowledge base with a sentence-transformer to find the best answer.",
      topic: 'Welcome',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(q: string) {
    const question = q.trim()
    if (!question || loading) return
    setInput('')
    setMessages((m) => [...m, { id: counter++, role: 'user', text: question }])
    setLoading(true)
    const r = await askAdvisor(question)
    setMessages((m) => [
      ...m,
      {
        id: counter++,
        role: 'ai',
        text: r.answer,
        topic: r.topic,
        related: r.related,
        sources: r.sources,
        offline: r.offline,
        score: r.score,
      },
    ])
    setLoading(false)
  }

  return (
    <div className="pb-10">
      <SectionTitle
        eyebrow="Natural language · Sentence-Transformer"
        title="AI Advisor"
        sub="Semantic retrieval over a hand-built agronomy knowledge base — runs fully offline once the backend is up."
        right={<Chip tone="emerald" dot>all-MiniLM-L6-v2</Chip>}
      />

      <Reveal>
        <GlassCard hover={false} className="flex h-[64vh] min-h-[460px] flex-col p-0">
          {/* messages */}
          <div className="no-scrollbar flex-1 space-y-5 overflow-y-auto p-6">
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {m.role === 'ai' ? (
                  <img src="/assets/brand/logo-glow.png" alt="" className="botanical h-9 w-9 shrink-0" />
                ) : (
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-emerald to-mint font-display text-xs font-bold text-[#05140c]">
                    D
                  </div>
                )}
                <div className={`max-w-[78%] ${m.role === 'user' ? 'items-end text-right' : ''}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed ${
                      m.role === 'user'
                        ? 'rounded-tr-sm bg-emerald/15 text-ink'
                        : 'glass-soft rounded-tl-sm text-ink-dim'
                    }`}
                  >
                    {m.role === 'ai' && m.topic && (
                      <div className="mb-1.5 flex items-center gap-2">
                        <span className="eyebrow !text-[9px]">{m.topic}</span>
                        {m.offline && (
                          <span className="inline-flex items-center gap-1 font-mono text-[9px] text-amber">
                            <WifiOff size={9} /> offline
                          </span>
                        )}
                        {typeof m.score === 'number' && !m.offline && (
                          <span className="font-mono text-[9px] text-mint">{Math.round(m.score * 100)}% match</span>
                        )}
                      </div>
                    )}
                    {m.text}
                  </div>

                  {m.role === 'ai' && m.related && m.related.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.related.map((r) => (
                        <button
                          key={r}
                          onClick={() => send(r)}
                          className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] text-muted transition-all hover:border-mint/40 hover:text-mint"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {loading && (
              <div className="flex items-center gap-3">
                <img src="/assets/brand/logo-glow.png" alt="" className="botanical h-9 w-9" />
                <div className="glass-soft flex items-center gap-2 rounded-2xl rounded-tl-sm px-4 py-3 font-mono text-xs text-mint">
                  <Loader2 size={13} className="animate-spin" /> searching knowledge base…
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* suggestions */}
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-6 pb-3">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[11px] text-muted transition-all hover:border-emerald/40 hover:text-lime"
              >
                <Sparkles size={11} /> {s}
              </button>
            ))}
          </div>

          {/* input */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex items-center gap-3 border-t border-white/8 p-4"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about crops, nutrients, climate, pests…"
              className="flex-1 bg-transparent px-2 text-sm text-ink outline-none placeholder:text-faint"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="sheen inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-lime to-emerald px-4 py-2.5 text-sm font-semibold text-[#05140c] glow-lime transition-all hover:brightness-110 disabled:opacity-40"
            >
              Ask <CornerDownLeft size={15} />
            </button>
          </form>
        </GlassCard>
      </Reveal>
    </div>
  )
}
