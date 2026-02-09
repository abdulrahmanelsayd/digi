import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'

export const Effects = () => {
    return (
        <EffectComposer>
            <Bloom
                luminanceThreshold={0.1} // Lower threshold to catch colored particles
                mipmapBlur
                intensity={1.5} // Higher intensity for "Tron" look
                radius={0.6}
            />
            <Noise opacity={0.05} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
    )
}
