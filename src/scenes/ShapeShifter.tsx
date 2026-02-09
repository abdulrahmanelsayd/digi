import * as THREE from 'three'
import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'

// 1. UTILS TO GENERATE POSITIONS (Ported from User Code)
const count = 512
const separationPlane = 150
const amountX = 16
const amountZ = 32
const separationCube = 150
const amountCube = 8
const radiusSphere = 750

const getSpherePositions = () => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
        const phi = Math.acos(-1 + (2 * i) / count)
        const theta = Math.sqrt(count * Math.PI) * phi
        pos[i * 3] = radiusSphere * Math.cos(theta) * Math.sin(phi)
        pos[i * 3 + 1] = radiusSphere * Math.sin(theta) * Math.sin(phi)
        pos[i * 3 + 2] = radiusSphere * Math.cos(phi)
    }
    return pos
}

const getCubePositions = () => {
    const pos = new Float32Array(count * 3)
    const offset = ((amountCube - 1) * separationCube) / 2
    for (let i = 0; i < count; i++) {
        const x = (i % amountCube) * separationCube
        const y = Math.floor((i / amountCube) % amountCube) * separationCube
        const z = Math.floor(i / (amountCube * amountCube)) * separationCube
        pos[i * 3] = x - offset
        pos[i * 3 + 1] = y - offset
        pos[i * 3 + 2] = z - offset
    }
    return pos
}

const getPlanePositions = () => {
    const pos = new Float32Array(count * 3)
    const offsetX = ((amountX - 1) * separationPlane) / 2
    const offsetZ = ((amountZ - 1) * separationPlane) / 2
    for (let i = 0; i < count; i++) {
        const x = (i % amountX) * separationPlane
        const z = Math.floor(i / amountX) * separationPlane
        const y = (Math.sin(x * 0.5) + Math.sin(z * 0.5)) * 200
        pos[i * 3] = x - offsetX
        pos[i * 3 + 1] = y
        pos[i * 3 + 2] = z - offsetZ
    }
    return pos
}

const getRandomPositions = () => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
        pos[i * 3] = Math.random() * 4000 - 2000
        pos[i * 3 + 1] = Math.random() * 4000 - 2000
        pos[i * 3 + 2] = Math.random() * 4000 - 2000
    }
    return pos
}

export const ShapeShifter = () => {
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const [mode, setMode] = useState(0) // 0: Random, 1: Sphere, 2: Cube, 3: Plane

    // Pre-calculate all layouts
    const positions = useMemo(() => [
        getRandomPositions(),
        getSpherePositions(),
        getCubePositions(),
        getPlanePositions()
    ], [])

    // Current animated positions (starts at Random)
    const currentPositions = useMemo(() => new Float32Array(positions[0]), [])

    // Smoothly transition shape every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setMode(prev => (prev + 1) % 4)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    const dummy = new THREE.Object3D()

    useFrame((state, delta) => {
        if (!meshRef.current) return

        const target = positions[mode]
        const speed = 2 * delta // transition speed

        for (let i = 0; i < count; i++) {
            // Lerp position roughly
            const ix = i * 3
            const iy = i * 3 + 1
            const iz = i * 3 + 2

            // Use simple lerp for visuals
            currentPositions[ix] += (target[ix] - currentPositions[ix]) * speed
            currentPositions[iy] += (target[iy] - currentPositions[iy]) * speed
            currentPositions[iz] += (target[iz] - currentPositions[iz]) * speed

            // Update Instance Matrix
            dummy.position.set(
                currentPositions[ix],
                currentPositions[iy],
                currentPositions[iz]
            )

            // "Look at camera" billboard effect + scale pulse
            dummy.lookAt(state.camera.position)

            // Pulse scale like the example
            const time = state.clock.getElapsedTime()
            const scale = Math.sin((Math.floor(dummy.position.x) + time) * 0.002) * 0.3 + 1
            dummy.scale.set(scale * 15, scale * 15, scale * 15) // Scale up to be visible (units are large)

            dummy.updateMatrix()
            meshRef.current.setMatrixAt(i, dummy.matrix)
        }
        meshRef.current.instanceMatrix.needsUpdate = true
    })

    // Create a circular glow texture procedurally
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas')
        canvas.width = 128
        canvas.height = 128
        const ctx = canvas.getContext('2d')
        if (ctx) {
            const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
            g.addColorStop(0, 'rgba(255,255,255,1)')
            g.addColorStop(0.5, 'rgba(0,128,255,0.5)')
            g.addColorStop(1, 'rgba(0,0,0,0)')
            ctx.fillStyle = g
            ctx.fillRect(0, 0, 128, 128)
        }
        return new THREE.CanvasTexture(canvas)
    }, [])

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
                map={texture}
                transparent
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                side={THREE.DoubleSide}
            />
        </instancedMesh>
    )
}
