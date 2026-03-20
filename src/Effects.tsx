import { useMemo } from 'react'
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'
import { useAdaptiveQuality, useDeviceDetect } from './hooks/useDeviceDetect'

export const Effects = () => {
  const quality = useAdaptiveQuality()
  const device = useDeviceDetect()

  const effects = useMemo(() => {
    if (!quality.postProcessing) return null

    return {
      bloom: {
        luminanceThreshold: 0.2,
        mipmapBlur: true,
        intensity: device.tier === 'ultra' ? 1.8 : device.tier === 'high' ? 1.5 : 1.2,
        radius: device.tier === 'ultra' ? 0.8 : 0.6,
      },
      noise: {
        opacity: device.tier === 'ultra' ? 0.06 : 0.04,
      },
      vignette: {
        eskil: false,
        offset: 0.1,
        darkness: device.tier === 'ultra' ? 1.2 : 1.1,
      },
    }
  }, [quality, device])

  if (!effects) return null

  return (
    <EffectComposer multisampling={quality.antialias ? 4 : 0}>
      <Bloom
        luminanceThreshold={effects.bloom.luminanceThreshold}
        mipmapBlur={effects.bloom.mipmapBlur}
        intensity={effects.bloom.intensity}
        radius={effects.bloom.radius}
      />
      <Noise opacity={effects.noise.opacity} />
      <Vignette
        eskil={effects.vignette.eskil}
        offset={effects.vignette.offset}
        darkness={effects.vignette.darkness}
      />
    </EffectComposer>
  )
}