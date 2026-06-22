import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Background } from './components/Background'
import { Sidebar, type View } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { Landing } from './sections/Landing'
import { Overview } from './sections/Overview'
import { PlantDoctor } from './sections/PlantDoctor'
import { Scanner } from './sections/Scanner'
import { Advisor } from './sections/Advisor'

function renderView(view: View, navigate: (v: View) => void) {
  switch (view) {
    case 'overview':
      return <Overview onNavigate={navigate} />
    case 'doctor':
      return <PlantDoctor />
    case 'scanner':
      return <Scanner />
    case 'advisor':
      return <Advisor />
  }
}

export default function App() {
  const [launched, setLaunched] = useState(false)
  const [view, setView] = useState<View>('overview')
  const goHome = () => { setLaunched(false); setView('overview') }

  const navigate = (v: View) => {
    setView(v)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <Background />
      <AnimatePresence mode="wait">
        {!launched ? (
          <Landing key="landing" onLaunch={() => setLaunched(true)} />
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Sidebar active={view} onNavigate={navigate} onHome={goHome} />
            <div className="lg:pl-[268px]">
              <div className="mx-auto max-w-[1340px] px-4 pb-12 md:px-8">
                <Topbar active={view} onNavigate={navigate} onHome={goHome} />
                <main className="pt-3">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={view}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {renderView(view, navigate)}
                    </motion.div>
                  </AnimatePresence>
                </main>
                <footer className="mt-10 flex items-center justify-between border-t border-white/8 pt-6 font-mono text-[11px] text-faint">
                  <span>VERDANT · Sustainable AI Urban-Farming Platform</span>
                  <span className="text-muted">ViT · Sentence-Transformer · Gemma 3</span>
                </footer>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
