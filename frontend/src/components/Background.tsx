import { useEffect, useRef } from 'react'

/**
 * Living backdrop: ambient bioluminescent foliage image, slow drifting
 * glow blobs, and a canvas of floating fireflies/spores.
 */
export function Background() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const DPR = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0

    type P = { x: number; y: number; r: number; sp: number; ph: number; dx: number }
    const count = window.innerWidth < 768 ? 26 : 56
    const spawn = (): P => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.7 + 0.5,
      sp: Math.random() * 0.0007 + 0.00018,
      ph: Math.random() * Math.PI * 2,
      dx: (Math.random() - 0.5) * 0.0004,
    })
    const parts: P[] = Array.from({ length: count }, spawn)

    const resize = () => {
      w = canvas.width = window.innerWidth * DPR
      h = canvas.height = window.innerHeight * DPR
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
    }
    resize()
    window.addEventListener('resize', resize)

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let t = 0

    const frame = () => {
      t += 1
      ctx.clearRect(0, 0, w, h)
      for (const p of parts) {
        p.y -= p.sp
        p.x += p.dx
        if (p.y < -0.05) {
          p.y = 1.05
          p.x = Math.random()
        }
        const tw = (Math.sin(t * 0.03 + p.ph) + 1) / 2
        const x = p.x * w
        const y = p.y * h
        const rad = p.r * DPR * (1 + tw)
        const g = ctx.createRadialGradient(x, y, 0, x, y, rad * 6)
        g.addColorStop(0, `rgba(180,255,150,${0.5 * tw + 0.18})`)
        g.addColorStop(0.4, `rgba(40,230,160,${0.16 * tw})`)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, rad * 6, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(frame)
    }
    frame()
    if (reduce) cancelAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* ambient generated foliage */}
      <div
        className="absolute inset-0 opacity-20 blur-2xl"
        style={{
          backgroundImage: 'url(/assets/texture/ambient-foliage.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* drifting glow blobs */}
      <div className="anim-drift absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-emerald/20 blur-[130px]" />
      <div
        className="anim-drift absolute -right-44 top-1/3 h-[32rem] w-[32rem] rounded-full bg-mint/15 blur-[130px]"
        style={{ animationDelay: '-9s' }}
      />
      <div
        className="anim-drift absolute bottom-0 left-1/3 h-[28rem] w-[28rem] rounded-full bg-lime/10 blur-[130px]"
        style={{ animationDelay: '-17s' }}
      />
      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,transparent_55%,rgba(0,0,0,0.55)_100%)]" />
      {/* fireflies */}
      <canvas ref={ref} className="absolute inset-0" />
    </div>
  )
}
