import { motion } from 'framer-motion'
import { ArrowRight, Bot, ScanLine, Stethoscope, Droplets, Zap, Leaf } from 'lucide-react'
import { Reveal } from '../components/ui'

const HOW: {
  icon: typeof Stethoscope
  color: string
  eyebrow: string
  title: string
  desc: string
  tag: string
  img: string
  imgClass?: string
}[] = [
  {
    icon: Stethoscope,
    color: '#19e08c',
    eyebrow: 'Vision Transformer · 14 disease classes',
    title: 'Plant Doctor',
    desc: 'Photograph any crop leaf and get an instant AI diagnosis — disease class, confidence score, severity rating, and a full treatment + prevention plan. Trained on thousands of real field images across corn, potato, rice, wheat and more.',
    tag: 'Upload a leaf → get a diagnosis',
    img: '/assets/feature/diseased-leaf.png',
    imgClass: 'botanical',
  },
  {
    icon: ScanLine,
    color: '#8bff5a',
    eyebrow: 'Vision Transformer · 52 species',
    title: 'Species Scanner',
    desc: 'Point your camera at any plant and the AI identifies the species from 52 medicinal varieties — then pulls a tailored grow profile with ideal water, light, and days-to-harvest data.',
    tag: 'Photo → species + grow profile',
    img: '/assets/botanical/fern-transparent.png',
  },
  {
    icon: Bot,
    color: '#38f5c9',
    eyebrow: 'Gemma 3 · Agronomy knowledge base',
    title: 'AI Advisor',
    desc: 'Ask any growing question in plain English. The advisor combines semantic search over a curated agronomy knowledge base with Gemma 3 LLM to deliver expert, grounded answers — nutrients, pH, pests, harvesting, all of it.',
    tag: 'Ask anything → expert answer',
    img: '/assets/brand/logo-glow.png',
    imgClass: 'botanical',
  },
]

const STATS = [
  { value: '95%', label: 'Less water vs soil farming', icon: Droplets, color: '#38f5c9' },
  { value: '98%', label: 'Disease detection accuracy', icon: Zap, color: '#8bff5a' },
  { value: '52', label: 'Plant species identified', icon: Leaf, color: '#19e08c' },
]

export function Landing({ onLaunch }: { onLaunch: () => void }) {
  return (
    <motion.div
      className="relative"
      exit={{ opacity: 0, scale: 0.97, filter: 'blur(4px)' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ═══════════════════════════════════════
          HERO — centered, full-screen
      ════════════════════════════════════════ */}
      <section className="relative flex min-h-screen flex-col overflow-hidden">

        {/* botanical transparent overlays */}
        <img
          src="/assets/botanical/monstera-transparent.png"
          alt=""
          className="pointer-events-none absolute -right-8 -top-8 h-[320px] w-[320px] rotate-[15deg] opacity-60 md:h-[400px] md:w-[400px]"
        />
        <img
          src="/assets/botanical/fern-transparent.png"
          alt=""
          className="pointer-events-none absolute -left-16 top-32 h-[320px] w-[320px] -rotate-12 opacity-50"
        />
        <img
          src="/assets/botanical/leaf-transparent.png"
          alt=""
          className="pointer-events-none absolute -bottom-10 left-1/4 h-[260px] w-[260px] rotate-[20deg] opacity-40"
        />
        <img
          src="/assets/botanical/sprout-transparent.png"
          alt=""
          className="pointer-events-none absolute -bottom-4 right-10 h-[340px] w-[340px] opacity-35 md:h-[420px] md:w-[420px]"
        />

        {/* top bar */}
        <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
          <Reveal>
            <div className="flex items-center gap-3">
              <img src="/assets/brand/logo-glow.png" alt="VERDANT" className="botanical h-10 w-10" />
              <div>
                <div className="font-display text-xl font-bold leading-none tracking-tight text-glow">VERDANT</div>
                <div className="mt-0.5 font-mono text-[9px] tracking-[0.25em] text-muted">URBAN · AI · FARMING</div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <button
              onClick={onLaunch}
              className="hidden items-center gap-2 rounded-full border border-emerald/30 px-4 py-2 font-mono text-[12px] text-emerald transition-all hover:border-emerald/60 hover:bg-emerald/10 sm:flex"
            >
              Launch Platform <ArrowRight size={13} />
            </button>
          </Reveal>
        </nav>

        {/* center hero content */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-10 text-center md:px-12">

          <Reveal>
            <span className="mb-6 inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-emerald">
              <span className="live-dot" />
              AI-POWERED · REAL INFERENCE · SUSTAINABLE FARMING
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="font-display text-[3.2rem] font-bold leading-[1.01] tracking-tight sm:text-[4.8rem] lg:text-[6.4rem]">
              Grow smarter,
              <br />
              <span className="text-grad text-glow">in the city.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="mt-7 max-w-2xl text-[16px] leading-relaxed text-ink-dim">
              VERDANT is an intelligent urban farming platform that uses AI models to{' '}
              <span className="text-mint">diagnose plant disease</span>,{' '}
              <span className="text-mint">identify species</span>, and{' '}
              <span className="text-mint">answer any growing question</span> — making precision
              agriculture accessible to every grower, everywhere.
            </p>
          </Reveal>

          {/* feature chips */}
          <Reveal delay={0.22}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {[
                { icon: Stethoscope, label: 'Plant Doctor', color: '#19e08c' },
                { icon: ScanLine, label: 'Species Scanner', color: '#8bff5a' },
                { icon: Bot, label: 'AI Advisor', color: '#38f5c9' },
              ].map((f) => (
                <button
                  key={f.label}
                  onClick={onLaunch}
                  className="flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[12px] transition-all hover:scale-105"
                  style={{ borderColor: `${f.color}40`, color: f.color, background: `${f.color}10` }}
                >
                  <f.icon size={13} />
                  {f.label}
                </button>
              ))}
            </div>
          </Reveal>

          {/* main CTA */}
          <Reveal delay={0.29}>
            <motion.button
              onClick={onLaunch}
              className="sheen mt-10 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-lime to-emerald px-10 py-4 font-display text-[17px] font-semibold text-[#05140c] glow-lime transition-all hover:brightness-110"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Enter VERDANT
              <ArrowRight size={20} />
            </motion.button>
          </Reveal>

          {/* scroll hint */}
          <Reveal delay={0.36}>
            <p className="mt-10 font-mono text-[11px] tracking-widest text-faint">
              SCROLL TO EXPLORE ↓
            </p>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════ */}
      <section className="mx-auto max-w-[1100px] px-6 py-20 md:px-12">
        <Reveal>
          <div className="mb-14 text-center">
            <span className="eyebrow mb-3 block">How it works</span>
            <h2 className="font-display text-[2.2rem] font-bold tracking-tight">Three AI tools. One platform.</h2>
          </div>
        </Reveal>

        <div className="space-y-6">
          {HOW.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <div
                className="glass edge-light grid items-center gap-6 rounded-3xl p-6 transition-all hover:scale-[1.01] md:grid-cols-[80px_1fr_auto] md:p-8"
                style={{ borderColor: `${item.color}18` }}
              >
                {/* icon + image */}
                <div className="flex items-center gap-4 md:flex-col md:gap-2">
                  <div
                    className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl"
                    style={{ background: `${item.color}18`, color: item.color }}
                  >
                    <item.icon size={24} />
                  </div>
                  <img
                    src={item.img}
                    alt=""
                    className={`h-12 w-12 object-cover ${item.imgClass ?? ''} ${item.imgClass === 'botanical' ? '' : 'rounded-xl'}`}
                  />
                </div>

                {/* text */}
                <div>
                  <div className="mb-1 font-mono text-[10px] tracking-widest" style={{ color: item.color }}>
                    {item.eyebrow}
                  </div>
                  <h3 className="mb-2 font-display text-xl font-semibold">{item.title}</h3>
                  <p className="max-w-xl text-[13.5px] leading-relaxed text-ink-dim">{item.desc}</p>
                </div>

                {/* tag */}
                <div className="shrink-0">
                  <span
                    className="block rounded-2xl border px-4 py-2 text-center font-mono text-[11px] leading-snug"
                    style={{ borderColor: `${item.color}35`, color: item.color, background: `${item.color}0d` }}
                  >
                    {item.tag}
                  </span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          STATS + FINAL CTA
      ════════════════════════════════════════ */}
      <section className="relative mx-auto max-w-[1100px] overflow-hidden px-6 pb-20 md:px-12">
        {/* ambient texture */}
        <img
          src="/assets/texture/ambient-foliage.png"
          alt=""
          className="botanical pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
        />

        <Reveal>
          <div className="glass edge-light relative rounded-3xl p-8 md:p-12">
            {/* stats */}
            <div className="mb-10 grid grid-cols-3 divide-x divide-white/8">
              {STATS.map((s) => (
                <div key={s.label} className="px-6 text-center first:pl-0 last:pr-0">
                  <div
                    className="mb-1 font-display text-[2.6rem] font-bold leading-none"
                    style={{ color: s.color, textShadow: `0 0 30px ${s.color}80` }}
                  >
                    {s.value}
                  </div>
                  <div className="font-mono text-[11px] text-muted">{s.label}</div>
                </div>
              ))}
            </div>

            {/* CTA strip */}
            <div className="flex flex-col items-center gap-4 border-t border-white/8 pt-8 sm:flex-row sm:justify-between">
              <div>
                <p className="font-display text-lg font-semibold">Ready to grow smarter?</p>
                <p className="mt-1 font-mono text-[12px] text-muted">AI models running locally · no cloud dependency</p>
              </div>
              <motion.button
                onClick={onLaunch}
                className="sheen inline-flex shrink-0 items-center gap-2.5 rounded-full bg-gradient-to-r from-lime to-emerald px-7 py-3.5 font-display text-[15px] font-semibold text-[#05140c] glow-lime transition-all hover:brightness-110"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                Launch Platform <ArrowRight size={17} />
              </motion.button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-6 text-center font-mono text-[11px] text-faint">
            VERDANT · Sustainable AI Urban-Farming · ViT · Gemma 3 · Sentence-Transformer
          </p>
        </Reveal>
      </section>
    </motion.div>
  )
}
