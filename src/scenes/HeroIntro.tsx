import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Reflector, Text, useTexture, useGLTF, useVideoTexture } from '@react-three/drei'

function Carla(props: any) {
    const { scene } = useGLTF('/carla-draco.glb')
    return <primitive object={scene} {...props} />
}

function VideoText(props: any) {
    const texture = useVideoTexture('/drei.mp4', { loop: true, muted: true, start: true, crossOrigin: 'Anonymous' })
    return (
        <Text font="/Inter-Bold.woff" fontSize={3} letterSpacing={-0.06} {...props}>
            emo
            <meshBasicMaterial toneMapped={false} map={texture} />
        </Text>
    )
}

function Ground() {
    const [floor, normal] = useTexture(['/SurfaceImperfections003_1K_var1.jpg', '/SurfaceImperfections003_1K_Normal.jpg'])
    return (
        // Optimization: Reduced resolution (1024 -> 512) and blur samples for better performance
        <Reflector blur={[300, 50]} resolution={512} args={[50, 50]} mirror={0.5} mixBlur={6} mixStrength={1.5} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
            {(Material, props) => <Material color="#a0a0a0" metalness={0.4} roughnessMap={floor} normalMap={normal} normalScale={new THREE.Vector2(2, 2)} {...props} />}
        </Reflector>
    )
}

function Intro() {
    const vec = useRef(new THREE.Vector3())
    return useFrame((state) => {
        state.camera.position.lerp(vec.current.set(state.mouse.x * 3, 2 + state.mouse.y * 1.5, 8), 0.05)
        state.camera.lookAt(0, 0.5, 0)
    })
}

function InteractiveGroup({ children }: { children: React.ReactNode }) {
    const group = useRef<THREE.Group>(null)
    useFrame((state) => {
        if (group.current) {
            // Subtle rotation influence from mouse
            group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, (state.mouse.x * Math.PI) / 20, 0.05)
            group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -(state.mouse.y * Math.PI) / 20, 0.05)
        }
    })
    return <group ref={group}>{children}</group>
}

export const HeroIntro = ({ introPhase: _introPhase = 0 }: { introPhase?: number }) => {
    // Use introPhase for potential future enhancements
    const { viewport } = useThree()
    const isMobile = viewport.width < 5
    const isTablet = viewport.width >= 5 && viewport.width < 10

    // Dynamic scaling based on viewport width to ensure "Apple-level" fit
    const scale = isMobile ? 0.9 : isTablet ? 1.2 : 1.8
    const positionY = isMobile ? -1 : isTablet ? -1.2 : -1.5

    return (
        <>
            <color attach="background" args={['#050505']} />
            <fog attach="fog" args={['#050505', 8, 25]} />

            <InteractiveGroup>
                <group position={[0, positionY, 0]} scale={[scale, scale, scale]}>
                    <Carla rotation={[0, Math.PI - 0.4, 0]} position={[-1.2, 0, 0.6]} scale={[0.32, 0.32, 0.32]} />
                    <VideoText position={[0, 1.5, -2]} />
                    <Ground />
                </group>
            </InteractiveGroup>

            {/* Cinematic Lighting Setup - Optimized: Removed expensive shadows */}
            <ambientLight intensity={0.4} />
            <spotLight position={[0, 15, 0]} intensity={0.8} angle={0.6} penumbra={0.5} />
            <spotLight position={[-5, 5, 5]} intensity={0.5} angle={0.5} penumbra={1} color="#ffffff" />
            <directionalLight position={[-50, 0, -40]} intensity={0.7} />
            <pointLight position={[2, 2, 2]} intensity={0.3} color="#ffffff" />

            <Intro />
        </>
    )
}
