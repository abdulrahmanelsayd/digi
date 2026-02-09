import { Canvas } from '@react-three/fiber'
import { ScrollControls, Scroll } from '@react-three/drei'
import { Suspense, useState, useEffect } from 'react'
import { SceneController } from './SceneController'
import { LandingPageUI } from './UI/LandingPage'
import { Effects } from './Effects'
import './index.css'

function App() {
    const [intro, setIntro] = useState(true)
    const [introPhase, setIntroPhase] = useState(0)
    const [textOpacity, setTextOpacity] = useState(0) // Start invisible
    const [sceneOpacity, setSceneOpacity] = useState(0) // Start invisible

    // Cinematic Intro Sequence
    useEffect(() => {
        // Fade in scene initially
        setTimeout(() => {
            setTextOpacity(1)
            setSceneOpacity(1)
        }, 100)

        // Helper to fade text out/in
        const changePhase = (phase: number, delay: number) => {
            setTimeout(() => setTextOpacity(0), delay - 500) // Fade out text
            setTimeout(() => {
                setIntroPhase(phase)
                setTextOpacity(1) // Fade in text
            }, delay)
        }

        // Phase 0: 0s - 2.5s "ESTABLISHING..."
        changePhase(1, 2500) // Phase 1: 2.5s - 5.0s "ANALYZING..."
        changePhase(2, 5000) // Phase 2: 5.0s - 7.5s "OPTIMIZING..."
        changePhase(3, 7500) // Phase 3: 7.5s - 9.0s "ACCESS GRANTED" (Green)

        // Final fade out
        setTimeout(() => {
            setTextOpacity(0)
            setSceneOpacity(0) // Fade out scene
        }, 9500)

        setTimeout(() => setIntro(false), 10500) // End intro

    }, [])

    const introText = [
        "ESTABLISHING SECURE CONNECTION...",
        "ANALYZING GLOBAL DATA STREAMS...",
        "OPTIMIZING PREDICTIVE MODELS...",
        "ACCESS GRANTED. WELCOME, AGENT."
    ]

    // Mobile Logic for Scroll Height
    const [isMobile, setIsMobile] = useState(false)
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // 6 Sections total (Hero, Manifesto, Analytics, Data, CTA, Footer)
    // Mobile needs extra scroll space due to vertical stacking.
    const pages = isMobile ? 7.5 : 6

    // Lower DPR on mobile for better performance
    const dpr: [number, number] = [1, 1.5]

    return (
        <>
            <Canvas
                dpr={dpr}
                camera={{ position: [0, 0, 5], fov: isMobile ? 85 : 75 }}
                gl={{ antialias: !isMobile, alpha: false, powerPreference: 'high-performance' }}
            >
                <color attach="background" args={['#050505']} />

                <Suspense fallback={null}>
                    <ScrollControls pages={pages} damping={0.2} style={{ scrollbarWidth: 'none' }} enabled={!intro}>
                        {/* The 3D Scene transitions based on scroll */}
                        {/* @ts-ignore */}
                        <SceneController intro={intro} introPhase={introPhase} totalPages={pages} />

                        {/* The HTML UI overlay that syncs with scroll */}
                        {!intro && (
                            <Scroll html style={{ width: '100%', height: '100%' }}>
                                <LandingPageUI />
                            </Scroll>
                        )}
                    </ScrollControls>
                    <Effects />
                </Suspense>
            </Canvas>

            {/* Cinematic Fade Overlay */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: '#000',
                opacity: intro ? (1 - sceneOpacity) : 0,
                pointerEvents: 'none',
                zIndex: 100,
                transition: 'opacity 1s ease-in-out'
            }} />

            {/* Loading / Intro HTML Overlay */}
            {intro && (
                <div style={{
                    position: 'absolute',
                    top: isMobile ? '75%' : '80%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: introPhase === 3 ? '#00ff88' : 'rgba(255,255,255,0.8)',
                    fontFamily: 'Courier New, monospace',
                    letterSpacing: isMobile ? '0.1em' : '0.2em',
                    fontSize: isMobile ? '10px' : '12px',
                    width: '90%',
                    maxWidth: '500px',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    textShadow: introPhase === 3 ? '0 0 20px rgba(0,255,136,0.5)' : '0 0 10px rgba(255,255,255,0.3)',
                    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                    opacity: textOpacity,
                    transition: 'opacity 0.5s ease-in-out, color 0.5s ease-in-out, text-shadow 0.5s ease-in-out'
                }}>
                    {introText[introPhase]}
                </div>
            )}
        </>
    )
}

export default App
