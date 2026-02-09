import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Helper to get random point in sphere
const randomInSphere = (radius: number, center: THREE.Vector3) => {
    const r = radius * Math.cbrt(Math.random())
    const theta = Math.random() * 2 * Math.PI
    const phi = Math.acos(2 * Math.random() - 1)
    const x = center.x + r * Math.sin(phi) * Math.cos(theta)
    const y = center.y + r * Math.sin(phi) * Math.sin(theta)
    const z = center.z + r * Math.cos(phi)
    return new THREE.Vector3(x, y, z)
}

// Helper to get random point in cylinder
const randomInCylinder = (radius: number, height: number, center: THREE.Vector3) => {
    const r = radius * Math.sqrt(Math.random())
    const theta = Math.random() * 2 * Math.PI
    const y = center.y + (Math.random() - 0.5) * height
    const x = center.x + r * Math.cos(theta)
    const z = center.z + r * Math.sin(theta)
    return new THREE.Vector3(x, y, z)
}

// Particle Shape Component
const HumanoidShape = ({ position, color, delayOffset = 0, scale = 1 }: { position: [number, number, number], color: string, delayOffset?: number, scale?: number }) => {
    const pointsRef = useRef<THREE.Points>(null)

    // Generate humanoid particles
    const { positions, initialPositions, data } = useMemo(() => {
        const count = 2500 // Particles per figure

        const posArray = new Float32Array(count * 3)
        const initPosArray = new Float32Array(count * 3)
        const dataArray = new Float32Array(count * 4)

        const tempPos = new THREE.Vector3()

        for (let i = 0; i < count; i++) {
            // Determine body part based on random probability
            const rand = Math.random()

            if (rand < 0.15) {
                // Head (Sphere) at y=1.7
                tempPos.copy(randomInSphere(0.25, new THREE.Vector3(0, 1.7, 0)))
            } else if (rand < 0.55) {
                // Torso (Cylinder) at y=1.1, h=0.8
                tempPos.copy(randomInCylinder(0.25, 0.9, new THREE.Vector3(0, 1.15, 0)))
            } else if (rand < 0.75) {
                // Arms (Cylinder) x+/-0.35, y=1.2, h=0.7
                const side = Math.random() > 0.5 ? 1 : -1
                tempPos.copy(randomInCylinder(0.08, 0.75, new THREE.Vector3(side * 0.35, 1.2, 0)))
            } else {
                // Legs (Cylinder) x+/-0.15, y=0.45, h=0.9
                const side = Math.random() > 0.5 ? 1 : -1
                tempPos.copy(randomInCylinder(0.1, 0.9, new THREE.Vector3(side * 0.15, 0.45, 0)))
            }

            // Apply proper scaling
            tempPos.multiplyScalar(scale)

            // Target position
            initPosArray[i * 3] = tempPos.x
            initPosArray[i * 3 + 1] = tempPos.y
            initPosArray[i * 3 + 2] = tempPos.z

            // Start falling from high up
            posArray[i * 3] = tempPos.x + (Math.random() - 0.5) * 3
            posArray[i * 3 + 1] = tempPos.y + 10 + Math.random() * 10
            posArray[i * 3 + 2] = tempPos.z + (Math.random() - 0.5) * 3

            // Data
            dataArray[i * 4] = 1 // direction
            dataArray[i * 4 + 1] = 1.5 + Math.random() * 2 // speed (slower for gravity look)
            dataArray[i * 4 + 2] = Math.random() * 100 + delayOffset // delay
            dataArray[i * 4 + 3] = 0
        }

        return {
            positions: posArray,
            initialPositions: initPosArray,
            data: dataArray
        }
    }, [delayOffset, scale])

    useFrame((_state, delta) => {
        if (!pointsRef.current) return

        const geometry = pointsRef.current.geometry
        const posAttr = geometry.attributes.position
        const initPosAttr = geometry.attributes.initialPosition
        const dataAttr = geometry.attributes.data as THREE.BufferAttribute

        const d = Math.min(delta, 0.1) * 8

        for (let i = 0; i < posAttr.count; i++) {
            const px = posAttr.getX(i)
            const py = posAttr.getY(i)
            const pz = posAttr.getZ(i)

            const ix = initPosAttr.getX(i)
            const iy = initPosAttr.getY(i)
            const iz = initPosAttr.getZ(i)

            let direction = dataAttr.array[i * 4]
            let speed = dataAttr.array[i * 4 + 1]
            let delay = dataAttr.array[i * 4 + 2]

            // Falling logic
            if (direction < 0) {
                if (py > -0.5) { // Floor slightly below 0 relative to figure
                    posAttr.setXYZ(i, px + (Math.random() - 0.5) * 0.02 * speed * d, py - 0.15 * speed * d, pz + (Math.random() - 0.5) * 0.02 * speed * d)
                } else {
                    if (delay <= 0) {
                        dataAttr.array[i * 4] = 1;
                        dataAttr.array[i * 4 + 2] = Math.random() * 50
                    } else {
                        dataAttr.array[i * 4 + 2] -= 1
                    }
                }
            }

            // Rising logic
            if (direction > 0) {
                const dist = Math.sqrt(Math.pow(px - ix, 2) + Math.pow(py - iy, 2) + Math.pow(pz - iz, 2))
                if (dist > 0.05) {
                    posAttr.setXYZ(i, px + (ix - px) * 0.06 * speed * d, py + (iy - py) * 0.06 * speed * d, pz + (iz - pz) * 0.06 * speed * d)
                } else {
                    if (delay <= 0) {
                        dataAttr.array[i * 4] = -1;
                        dataAttr.array[i * 4 + 2] = Math.random() * 200 + 100
                    } else {
                        dataAttr.array[i * 4 + 2] -= 1
                    }
                }
            }
        }
        posAttr.needsUpdate = true
        // No rotation for humanoids, keep them facing forward
    })

    return (
        <points ref={pointsRef} position={position}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-initialPosition" count={initialPositions.length / 3} array={initialPositions} itemSize={3} />
                <bufferAttribute attach="attributes-data" count={data.length / 4} array={data} itemSize={4} />
            </bufferGeometry>
            <pointsMaterial size={0.06} color={color} sizeAttenuation transparent opacity={0.85} blending={THREE.AdditiveBlending} />
        </points>
    )
}

// Floor Grid to match reference (Red Dots)
const ParticleGrid = () => {
    const points = useMemo(() => {
        const p = []
        // Sparse grid
        for (let x = -30; x <= 30; x += 1.0) {
            for (let z = -30; z <= 30; z += 1.0) {
                p.push(x, -0.5, z)
            }
        }
        return new Float32Array(p)
    }, [])

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={points.length / 3} array={points} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.05} color="#dd2222" sizeAttenuation transparent opacity={0.6} blending={THREE.AdditiveBlending} />
        </points>
    )
}

export const SpotlightIntro = ({ introPhase = 0 }: { introPhase?: number }) => {
    const { viewport } = useThree()

    // Scale for mobile (much smaller viewport)
    const scale = viewport.width < 5 ? 0.35 : 0.65

    // Reference colors
    const colors = {
        white: '#ffffff',
        pink: '#ff44cc',
        orange: '#ff8800',
        yellow: '#ffee00',
        blue: '#22ccff'
    }

    if (introPhase === 3) {
        // Access Granted -> All Green
        Object.keys(colors).forEach(k => (colors as any)[k] = '#00ff88')
    }

    return (
        <group scale={[scale, scale, scale]} position={[0, -2, -5]} rotation={[0, 0, 0]}>
            <ParticleGrid />

            {/* Main Center Group - Matching Reference */}
            {/* Center Front - White */}
            <HumanoidShape position={[0, 0, 2]} color={colors.white} delayOffset={0} scale={1.2} />

            {/* Left - Pink Female-ish */}
            <HumanoidShape position={[-3.5, 0, 0]} color={colors.pink} delayOffset={50} scale={1.1} />

            {/* Right - Orange Male-ish */}
            <HumanoidShape position={[3.5, 0, 0]} color={colors.orange} delayOffset={100} scale={1.15} />

            {/* Back Right - Yellow Small */}
            <HumanoidShape position={[6, 0, -3]} color={colors.yellow} delayOffset={150} scale={0.9} />

            {/* Back Left - Blue Tall */}
            <HumanoidShape position={[-6, 0, -2]} color={colors.blue} delayOffset={200} scale={1.25} />

            {/* Ambient Atmosphere */}
            <color attach="background" args={['#000000']} />
            <fog attach="fog" args={['#000000', 5, 30]} />
        </group>
    )
}
