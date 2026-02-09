import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const SelectiveLightsMaterial = shaderMaterial(
    {
        time: 0,
        uLight1Color: new THREE.Color('#ffaa00'),
        uLight1Pos: new THREE.Vector3(0, 0, 0),
        uLight2Color: new THREE.Color('#0040ff'),
        uLight2Pos: new THREE.Vector3(0, 0, 0),
        uLight3Color: new THREE.Color('#80ff80'),
        uLight3Pos: new THREE.Vector3(0, 0, 0)
    },
    // Vertex Shader
    `
    uniform float time;
    varying vec3 vPos;
    
    void main() {
      vPos = position;
      
      // Slight movement based on time for "alive" feel
      vec3 pos = position;
      // pos.x += sin(time * 0.1 + position.y) * 0.1;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = (4.0 / -mvPosition.z); // Scale by distance
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
    // Fragment Shader
    `
    uniform vec3 uLight1Color;
    uniform vec3 uLight1Pos;
    uniform vec3 uLight2Color;
    uniform vec3 uLight2Pos;
    uniform vec3 uLight3Color;
    uniform vec3 uLight3Pos;
    
    varying vec3 vPos;

    void main() {
      // Calculate distance to each light
      float d1 = length(vPos - uLight1Pos);
      float d2 = length(vPos - uLight2Pos);
      float d3 = length(vPos - uLight3Pos);

      // Simple attenuation
      vec3 l1 = uLight1Color * (1.0 / (d1 * d1 + 0.1));
      vec3 l2 = uLight2Color * (1.0 / (d2 * d2 + 0.1));
      vec3 l3 = uLight3Color * (1.0 / (d3 * d3 + 0.1));

      vec3 totalLight = l1 + l2 + l3;
      
      // Circular particle shape
      vec2 coord = gl_PointCoord - vec2(0.5);
      if(length(coord) > 0.5) discard;

      gl_FragColor = vec4(totalLight, 1.0);
    }
  `
)

extend({ SelectiveLightsMaterial })

export const GlobalNetwork = () => {
    const count = 500000
    const ref = useRef<any>(null)

    // Generate 500k random points
    const points = useMemo(() => {
        const p = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 10
            const y = (Math.random() - 0.5) * 10
            const z = (Math.random() - 0.5) * 10
            p[i * 3] = x
            p[i * 3 + 1] = y
            p[i * 3 + 2] = z
        }
        return p
    }, [])

    useFrame((state) => {
        if (ref.current) {
            const t = state.clock.getElapsedTime()
            ref.current.time = t

            // Animate Lights (Orbiting)
            ref.current.uLight1Pos.set(
                Math.sin(t * 0.7) * 2.5,
                Math.cos(t * 0.5) * 2.5,
                Math.cos(t * 0.3) * 2.5
            )
            ref.current.uLight2Pos.set(
                Math.cos(t * 0.3) * 2.5,
                Math.sin(t * 0.5) * 2.5,
                Math.sin(t * 0.7) * 2.5
            )
            ref.current.uLight3Pos.set(
                Math.sin(t * 0.7) * 2.5,
                Math.cos(t * 0.3) * 2.5,
                Math.sin(t * 0.5) * 2.5
            )
        }
    })

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[points, 3]}
                />
            </bufferGeometry>
            {/* @ts-ignore */}
            <selectiveLightsMaterial ref={ref} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
        </points>
    )
}
