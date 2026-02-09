import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'

// 1. THE USER'S EXACT SHADER LOGIC (Adapted for R3F)
const KinectMaterial = shaderMaterial(
  {
    map: new THREE.Texture(), // Default empty texture
    width: 640,
    height: 480,
    nearClipping: 850,
    farClipping: 4000,
    pointSize: 4, // Increased visibility
    zOffset: 1000
  },
  // Vertex Shader (User's Code)
  `
    uniform sampler2D map;
    uniform float width;
    uniform float height;
    uniform float nearClipping, farClipping;
    uniform float pointSize;
    uniform float zOffset;

    varying vec2 vUv;

    const float XtoZ = 1.11146; // tan( 1.0144686 / 2.0 ) * 2.0;
    const float YtoZ = 0.83359; // tan( 0.7898090 / 2.0 ) * 2.0;

    void main() {
      vUv = vec2(position.x / width, position.y / height);
      
      vec4 color = texture2D(map, vUv);
      float depth = (color.r + color.g + color.b) / 3.0;

      // Projection code by @kcmic
      float z = (1.0 - depth) * (farClipping - nearClipping) + nearClipping;

      vec4 pos = vec4(
        (position.x / width - 0.5) * z * XtoZ,
        (position.y / height - 0.5) * z * YtoZ,
        -z + zOffset,
        1.0
      );

      gl_PointSize = pointSize;
      gl_Position = projectionMatrix * modelViewMatrix * pos;
    }
  `,
  // Fragment Shader (Stylized)
  `
    uniform sampler2D map;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(map, vUv);
      
      // High-end tech look: Green/Cyan with alpha variation
      float depth = (color.r + color.g + color.b) / 3.0;
      
      if (depth < 0.1) discard; // Cull dark/far points

      gl_FragColor = vec4(0.2, depth + 0.4, 1.0, 0.8 * depth + 0.2);  
    }
  `
)

extend({ KinectMaterial })

// 2. PROCEDURAL DEPTH TEXTURE GENERATOR
// Simulates a video input so the effect works without files
const useProceduralTexture = () => {
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'))
  const textureRef = useRef<THREE.CanvasTexture>(new THREE.CanvasTexture(canvasRef.current))

  useEffect(() => {
    const canvas = canvasRef.current
    canvas.width = 640
    canvas.height = 480
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Settings for "balls" moving around
    const balls = [
      { x: 320, y: 240, r: 100, dx: 2, dy: 1.5 },
      { x: 100, y: 100, r: 80, dx: -2, dy: 2 },
      { x: 500, y: 300, r: 120, dx: -1.5, dy: -2 },
    ]

    let frameId = 0
    const animate = () => {
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, 640, 480)

      balls.forEach(b => {
        b.x += b.dx
        b.y += b.dy
        if (b.x < 0 || b.x > 640) b.dx *= -1
        if (b.y < 0 || b.y > 480) b.dy *= -1

        // Draw gradient "Depth" spheres
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r)
        g.addColorStop(0, 'white') // Close
        g.addColorStop(1, 'black') // Far
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fill()
      })

      // Add some noise lines for "glitch" effect
      if (Math.random() > 0.9) {
        ctx.fillStyle = 'rgba(255, 255, 255, ' + (Math.random() * 0.5) + ')'
        ctx.fillRect(0, Math.random() * 480, 640, 10)
      }

      if (textureRef.current) textureRef.current.needsUpdate = true
      frameId = requestAnimationFrame(animate)
    }
    animate()

    return () => cancelAnimationFrame(frameId)
  }, [])

  return textureRef.current
}

// 3. MAIN COMPONENT
export const DepthAnalytics = ({ intensity, variant = 'analytics', introPhase = 0 }: { intensity: number, variant?: 'analytics' | 'onboarding' | 'intro', introPhase?: number }) => {
  const width = 640
  const height = 480

  // Use our procedurally generated "video" texture
  const texture = useProceduralTexture()
  const materialRef = useRef<any>(null)
  const pointsRef = useRef<THREE.Points>(null)

  // Standard Plane Geometry for points
  const geometry = useMemo(() => {
    const vertices = new Float32Array(width * height * 3)
    for (let i = 0, j = 0, l = vertices.length; i < l; i += 3, j++) {
      vertices[i] = j % width
      vertices[i + 1] = Math.floor(j / width)
      vertices[i + 2] = 0
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    return geo
  }, [])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.map = texture
      materialRef.current.time = state.clock.getElapsedTime()
    }
    if (pointsRef.current) {
      const time = state.clock.getElapsedTime()

      if (variant === 'intro') {
        // PREMIUM INTRO: Evolving behaviors
        // Phase 0: Chaos/Searching (Fast rotation, scattered)
        if (introPhase === 0) {
          pointsRef.current.rotation.y += 0.02
          pointsRef.current.rotation.z = Math.sin(time) * 0.1
          const s = 0.015 + Math.random() * 0.005
          pointsRef.current.scale.set(s, s, s)
        }
        // Phase 1: Analyzing (Stabilizing, slower rotation)
        else if (introPhase === 1) {
          pointsRef.current.rotation.y += 0.005
          pointsRef.current.scale.lerp(new THREE.Vector3(0.018, 0.018, 0.018), 0.1)
        }
        // Phase 2: Optimizing (Breathing, focused)
        else if (introPhase === 2) {
          pointsRef.current.rotation.y = Math.sin(time * 0.5) * 0.2
          const scale = 0.02 + Math.sin(time * 2) * 0.002
          pointsRef.current.scale.set(scale, scale, scale)
        }
        // Phase 3: Verified (Locked in, bright)
        else if (introPhase === 3) {
          pointsRef.current.rotation.y = 0
          pointsRef.current.rotation.z = 0
          pointsRef.current.scale.set(0.025, 0.025, 0.025)
        }

        pointsRef.current.position.set(0, 0, 0) // Centered
      } else if (variant === 'onboarding') {
        pointsRef.current.rotation.y = -Math.sin(Date.now() * 0.001) * 0.5 + (intensity * 0.2)
        pointsRef.current.scale.set(0.015, 0.015, 0.015)
        pointsRef.current.position.x = Math.sin(Date.now() * 0.002) * 50
        pointsRef.current.position.y = 0
        pointsRef.current.position.z = -5
      } else {
        // Standard analytics
        pointsRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.2 + (intensity * 0.5)
        pointsRef.current.scale.set(0.015, 0.015, 0.015)
        pointsRef.current.position.set(0, 0, -5)
      }
    }
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      {/* @ts-ignore */}
      <kinectMaterial ref={materialRef} transparent blending={THREE.AdditiveBlending} depthTest={false} />
    </points>
  )
}
