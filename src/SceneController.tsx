import { useScroll } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'

import { DepthAnalytics } from './scenes/DepthAnalytics'
import { ShapeShifter } from './scenes/ShapeShifter'
import { HeroIntro } from './scenes/HeroIntro'

export const SceneController = ({ intro, introPhase = 0, totalPages = 5 }: { intro: boolean, introPhase?: number, totalPages?: number }) => {
    const { viewport } = useThree()
    // Premium Mobile Logic: Much dimmer background for text readability
    const isPhone = viewport.width < 4
    const isTablet = viewport.width >= 4 && viewport.width < 6

    // More aggressive scaling/opacity on phone for performance + readability
    const mobileScale = isPhone ? 0.5 : isTablet ? 0.7 : 1
    const mobileOpacity = isPhone ? 0.2 : isTablet ? 0.35 : 1

    const scroll = useScroll()
    const [scrollProgress, setScrollProgress] = useState(0)

    // Refs for scene groups to control opacity/visibility
    const fluidRef = useRef<THREE.Group>(null)
    const depthRef = useRef<THREE.Group>(null)
    const networkRef = useRef<THREE.Group>(null)
    const onboardingRef = useRef<THREE.Group>(null)
    const introRef = useRef<THREE.Group>(null)

    useFrame(() => {
        setScrollProgress(scroll.offset)

        if (intro) {
            // INTRO MODE: Only show the intro sequence
            if (fluidRef.current) fluidRef.current.visible = false
            if (depthRef.current) depthRef.current.visible = false
            if (networkRef.current) networkRef.current.visible = false
            if (onboardingRef.current) onboardingRef.current.visible = false
            if (introRef.current) introRef.current.visible = true
            return
        }

        // STANDARD SCROLL MODE
        if (introRef.current) introRef.current.visible = false

        // DYNAMICS: Normalize logic by totalPages
        // Page 0 is 0..1/N, Page 1 is 1/N..2/N etc.
        const pageDuration = 1 / totalPages

        // FLUID SCENE: Visible on Page 0.
        if (fluidRef.current) {
            const opacity = 1 - scroll.range(0, pageDuration)
            fluidRef.current.position.z = -scroll.offset * 5 // Parallax push
            // @ts-ignore
            fluidRef.current.visible = opacity > 0.01
        }

        // DEPTH SCENE: Visible on Page 2.
        // Starts at 2 * pageDuration
        if (depthRef.current) {
            const curve = scroll.curve(2 * pageDuration, pageDuration)
            // @ts-ignore
            depthRef.current.visible = curve > 0.01
            depthRef.current.rotation.y = scroll.offset * Math.PI
        }

        // NETWORK SCENE: Visible on Page 4.
        // Starts at 4 * pageDuration
        if (networkRef.current) {
            const fadeIn = scroll.range(4 * pageDuration, pageDuration)
            // @ts-ignore
            networkRef.current.visible = fadeIn > 0.01
        }

        // ONBOARDING (reuse Kinect): Visible at very end (last 10% of scroll?)
        // Or mapped to the final page? Let's say last page.
        if (onboardingRef.current) {
            const fadeIn = scroll.range(1 - pageDuration, pageDuration)
            // @ts-ignore
            onboardingRef.current.visible = fadeIn > 0.01
            // @ts-ignore
            onboardingRef.current.position.z = -10 + (fadeIn * 10)
        }
    })

    return (
        <>
            {/* INTRO SCENE - Spotlight with Abstract Monolith */}
            <group ref={introRef} visible={intro}>
                <HeroIntro introPhase={introPhase} />
            </group>

            {/* HERO SECTION BACKGROUND - 3D Model with Reflective Floor */}
            <group ref={fluidRef}>
                <HeroIntro introPhase={0} />
            </group>

            <group ref={depthRef}>
                <DepthAnalytics intensity={scrollProgress * mobileOpacity} />
            </group>

            {/* SHAPE SHIFTER (Sprite Effect) */}
            <group ref={networkRef} scale={[0.005, 0.005, 0.005]}>
                <ShapeShifter />
            </group>
            {/* ONBOARDING KINECT REUSE */}
            <group ref={onboardingRef} scale={[mobileScale, mobileScale, mobileScale]}>
                <DepthAnalytics intensity={scrollProgress * mobileOpacity} variant="onboarding" />
            </group>
        </>
    )
}
