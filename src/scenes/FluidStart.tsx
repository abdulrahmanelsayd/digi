import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'


// Monjori Shader Port
const MonjoriMaterial = shaderMaterial(
    { time: 0, opacity: 1 },
    // Vertex Shader
    `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    // Fragment Shader
    `
    varying vec2 vUv;
    uniform float time;
    uniform float opacity;

    void main() {
      vec2 p = -1.0 + 2.0 * vUv;
      float a = time * 40.0;
      float d, e, f, g = 1.0 / 40.0, h, i, r, q;

      e = 400.0 * (p.x * 0.5 + 0.5);
      f = 400.0 * (p.y * 0.5 + 0.5);
      i = 200.0 + sin(e * g + a / 150.0) * 20.0;
      d = 200.0 + cos(f * g / 2.0) * 18.0 + cos(e * g) * 7.0;
      r = sqrt(pow(abs(i - e), 2.0) + pow(abs(d - f), 2.0));
      q = f / r;
      e = (r * cos(q)) - a / 2.0;
      f = (r * sin(q)) - a / 2.0;
      d = sin(e * g) * 176.0 + sin(e * g) * 164.0 + r;
      h = ((f + d) + a / 2.0) * g;
      i = cos(h + r * p.x / 1.3) * (e + e + a) + cos(q * g * 6.0) * (r + h / 3.0);
      h = sin(f * g) * 144.0 - sin(e * g) * 212.0 * p.x;
      h = (h + (f - e) * q + sin(r - (a + h) / 7.0) * 10.0 + i / 4.0) * g;
      i += cos(h * 2.3 * sin(a / 350.0 - q)) * 184.0 * sin(q - (r * 4.3 + a / 12.0) * g) + tan(r * g + h) * 184.0 * cos(r * g + h);
      i = mod(i / 5.6, 256.0) / 64.0;
      if (i < 0.0) i += 4.0;
      if (i >= 2.0) i = 4.0 - i;
      d = r / 350.0;
      d += sin(d * d * 8.0) * 0.52;
      f = (sin(a * g) + 1.0) / 2.0;
      
      vec3 color = vec3(f * i / 1.6, i / 2.0 + d / 13.0, i) * d * p.x + vec3(i / 1.3 + d / 8.0, i / 2.0 + d / 18.0, i) * d * (1.0 - p.x);
      
      // Apply Opacity
      gl_FragColor = vec4(color, opacity);
    }
  `
)

extend({ MonjoriMaterial })

// TypeScript support for custom material
declare global {
    namespace JSX {
        interface IntrinsicElements {
            monjoriMaterial: any
        }
    }
}

export const FluidStart = ({ opacity }: { opacity: number }) => {
    const ref = useRef<any>(null)
    const { viewport } = useThree()

    useFrame((_, delta) => {
        if (ref.current) {
            ref.current.time += delta * 0.5
            ref.current.opacity = opacity
        }
    })

    return (
        <mesh scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            <monjoriMaterial ref={ref} transparent />
        </mesh>
    )
}
