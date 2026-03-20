import { useState, useEffect, useMemo } from 'react'

export type DeviceTier = 'low' | 'medium' | 'high' | 'ultra'

export interface DeviceInfo {
  tier: DeviceTier
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLowEnd: boolean
  prefersReducedMotion: boolean
  gpuTier: 'low' | 'high' | 'unknown'
  screenWidth: number
  screenHeight: number
  pixelRatio: number
}

export const useDeviceDetect = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    tier: 'high',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isLowEnd: false,
    prefersReducedMotion: false,
    gpuTier: 'high',
    screenWidth: 1920,
    screenHeight: 1080,
    pixelRatio: 1,
  })

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)

      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024
      const isDesktop = width >= 1024

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      const hardwareConcurrency = navigator.hardwareConcurrency || 4
      const deviceMemory = (navigator as { deviceMemory?: number }).deviceMemory || 4

      const isLowEnd = hardwareConcurrency <= 4 || deviceMemory <= 4

      let tier: DeviceTier = 'high'
      if (isMobile) {
        tier = pixelRatio > 2 ? 'medium' : 'low'
      } else if (isTablet) {
        tier = hardwareConcurrency >= 8 ? 'medium' : 'low'
      } else {
        tier = hardwareConcurrency >= 16 && deviceMemory >= 8 ? 'ultra' : 'high'
      }

      let gpuTier: 'low' | 'high' | 'unknown' = 'high'
      if (isLowEnd) {
        gpuTier = 'low'
      }

      setDeviceInfo({
        tier,
        isMobile,
        isTablet,
        isDesktop,
        isLowEnd,
        prefersReducedMotion,
        gpuTier,
        screenWidth: width,
        screenHeight: height,
        pixelRatio,
      })
    }

    detectDevice()

    const handleResize = () => {
      detectDevice()
    }

    window.addEventListener('resize', handleResize, { passive: true })

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleMotionChange = () => {
      setDeviceInfo((prev) => ({
        ...prev,
        prefersReducedMotion: motionQuery.matches,
      }))
    }
    motionQuery.addEventListener('change', handleMotionChange)

    return () => {
      window.removeEventListener('resize', handleResize)
      motionQuery.removeEventListener('change', handleMotionChange)
    }
  }, [])

  return useMemo(() => deviceInfo, [deviceInfo])
}

export const useAdaptiveQuality = () => {
  const device = useDeviceDetect()

  const quality = useMemo(() => {
    switch (device.tier) {
      case 'ultra':
        return {
          dpr: [1, 2],
          shadowMapSize: 2048,
          particleCount: 2000,
          antialias: true,
          postProcessing: true,
          lodBias: 0,
          geometryDetail: 'high',
        }
      case 'high':
        return {
          dpr: [1, 1.5],
          shadowMapSize: 1024,
          particleCount: 1000,
          antialias: true,
          postProcessing: true,
          lodBias: 1,
          geometryDetail: 'medium',
        }
      case 'medium':
        return {
          dpr: [1, 1],
          shadowMapSize: 512,
          particleCount: 500,
          antialias: false,
          postProcessing: false,
          lodBias: 2,
          geometryDetail: 'low',
        }
      case 'low':
      default:
        return {
          dpr: [1, 1],
          shadowMapSize: 256,
          particleCount: 200,
          antialias: false,
          postProcessing: false,
          lodBias: 3,
          geometryDetail: 'minimal',
        }
    }
  }, [device.tier])

  return quality
}