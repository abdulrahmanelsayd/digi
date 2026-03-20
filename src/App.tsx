import { Canvas } from '@react-three/fiber'
import { ScrollControls, Scroll } from '@react-three/drei'
import { Suspense, useState, useEffect, lazy, useMemo } from 'react'
import { ErrorBoundary, WebGLErrorFallback } from './components/error/ErrorBoundary'
import { LoadingScreen } from './components/loading/LoadingScreen'
import { SceneController } from './SceneController'
import { Effects } from './Effects'
import { useAdaptiveQuality } from './hooks/useDeviceDetect'
import './index.css'

const LandingPageUI = lazy(() => import('./UI/LandingPage').then(m => ({ default: m.LandingPageUI })))

function App() {
  const [intro, setIntro] = useState(true)
  const [showContent, setShowContent] = useState(false)

  const quality = useAdaptiveQuality()

  const dpr: [number, number] = useMemo(() => [quality.dpr[0], quality.dpr[1]], [quality])

  const handleLoadingComplete = () => {
    // The loading screen takes 0.8s to exit. 
    // We transition the scene and scroll after this duration.
    setTimeout(() => {
      setIntro(false)
      setShowContent(true)
    }, 800)
  }

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile, { passive: true })
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const pages = isMobile ? 7.5 : 6

  return (
    <ErrorBoundary fallback={<WebGLErrorFallback />}>
      <LoadingScreen minimumDuration={2000} onComplete={handleLoadingComplete} />

      <Canvas
        dpr={dpr}
        camera={{ position: [0, 0, 5], fov: isMobile ? 85 : 75 }}
        gl={{
          antialias: quality.antialias,
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        performance={{ min: 0.5 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          touchAction: 'none',
        }}
      >
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 8, 25]} />

        <Suspense fallback={null}>
          <ScrollControls 
            pages={pages} 
            damping={0.15} // Tuned: fluid and premium without feeling sluggish
            style={{ scrollbarWidth: 'none' }} 
            enabled={!intro}
          >
            <SceneController intro={intro} introPhase={0} totalPages={pages} />

            {showContent && !intro && (
              <Scroll html style={{ width: '100%', height: '100%' }}>
                <Suspense fallback={null}>
                  <LandingPageUI />
                </Suspense>
              </Scroll>
            )}
          </ScrollControls>

          {quality.postProcessing && <Effects />}
        </Suspense>
      </Canvas>

      {/* Removed the black hackery intro overlay and text to allow the premium LoadingScreen to shine */}
    </ErrorBoundary>
  )
}

export default App