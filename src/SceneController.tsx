import { lazy, Suspense } from 'react'
import { useScroll } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useDeviceDetect } from './hooks/useDeviceDetect'

const HeroIntro = lazy(() => import('./scenes/HeroIntro').then(m => ({ default: m.HeroIntro })))
const DepthAnalytics = lazy(() => import('./scenes/DepthAnalytics').then(m => ({ default: m.DepthAnalytics })))
const ShapeShifter = lazy(() => import('./scenes/ShapeShifter').then(m => ({ default: m.ShapeShifter })))

const SceneFallback = () => (
  <group>
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#1a1a1a" wireframe />
    </mesh>
  </group>
)

export const SceneController = ({ 
  intro, 
  introPhase = 0, 
  totalPages = 5 
}: { 
  intro: boolean, 
  introPhase?: number, 
  totalPages?: number 
}) => {
  const { viewport } = useThree()
  const device = useDeviceDetect()

  const isPhone = viewport.width < 4
  const isTablet = viewport.width >= 4 && viewport.width < 6

  const mobileScale = useMemo(() => {
    if (device.tier === 'low') return 0.3
    if (device.tier === 'medium') return 0.4
    return isPhone ? 0.5 : isTablet ? 0.7 : 1
  }, [device.tier, isPhone, isTablet])

  const mobileOpacity = useMemo(() => {
    if (device.tier === 'low') return 0.1
    if (device.tier === 'medium') return 0.15
    return isPhone ? 0.2 : isTablet ? 0.35 : 1
  }, [device.tier, isPhone, isTablet])

  const scroll = useScroll()
  const scrollProgressRef = useRef(0)

  const fluidRef = useRef<THREE.Group>(null)
  const depthRef = useRef<THREE.Group>(null)
  const networkRef = useRef<THREE.Group>(null)
  const onboardingRef = useRef<THREE.Group>(null)
  const introRef = useRef<THREE.Group>(null)

  useFrame(() => {
    scrollProgressRef.current = scroll.offset

    if (intro) {
      if (fluidRef.current) fluidRef.current.visible = false
      if (depthRef.current) depthRef.current.visible = false
      if (networkRef.current) networkRef.current.visible = false
      if (onboardingRef.current) onboardingRef.current.visible = false
      if (introRef.current) introRef.current.visible = true
      return
    }

    if (introRef.current) introRef.current.visible = false

    const pageDuration = 1 / totalPages

    if (fluidRef.current) {
      const opacity = 1 - scroll.range(0, pageDuration)
      fluidRef.current.position.z = -scroll.offset * 5
      fluidRef.current.visible = opacity > 0.01
      if (fluidRef.current.visible) {
        fluidRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material.opacity = opacity
            child.material.transparent = true
          }
        })
      }
    }

    if (depthRef.current) {
      const curve = scroll.curve(2 * pageDuration, pageDuration)
      depthRef.current.visible = curve > 0.01
      depthRef.current.rotation.y = scroll.offset * Math.PI
    }

    if (networkRef.current) {
      const fadeIn = scroll.range(4 * pageDuration, pageDuration)
      networkRef.current.visible = fadeIn > 0.01
    }

    if (onboardingRef.current) {
      const fadeIn = scroll.range(1 - pageDuration, pageDuration)
      onboardingRef.current.visible = fadeIn > 0.01
      onboardingRef.current.position.z = -10 + fadeIn * 10
    }
  })

  return (
    <>
      <group ref={introRef} visible={intro}>
        <Suspense fallback={<SceneFallback />}>
          <HeroIntro introPhase={introPhase} />
        </Suspense>
      </group>

      <group ref={fluidRef}>
        <Suspense fallback={<SceneFallback />}>
          <HeroIntro introPhase={0} />
        </Suspense>
      </group>

      <group ref={depthRef}>
        <Suspense fallback={<SceneFallback />}>
          <DepthAnalytics intensity={scrollProgressRef.current * mobileOpacity} />
        </Suspense>
      </group>

      <group ref={networkRef} scale={[0.005, 0.005, 0.005]}>
        <Suspense fallback={<SceneFallback />}>
          <ShapeShifter />
        </Suspense>
      </group>

      <group ref={onboardingRef} scale={[mobileScale, mobileScale, mobileScale]}>
        <Suspense fallback={<SceneFallback />}>
          <DepthAnalytics intensity={scrollProgressRef.current * mobileOpacity} variant="onboarding" />
        </Suspense>
      </group>
    </>
  )
}