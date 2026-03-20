import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LoadingScreenProps {
  minimumDuration?: number
  onComplete?: () => void
}

export const LoadingScreen = ({ minimumDuration = 4500, onComplete }: LoadingScreenProps) => {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true)
      onComplete?.()
    }, minimumDuration)

    return () => clearTimeout(timer)
  }, [minimumDuration, onComplete])

  return (
    <AnimatePresence>
      {!isReady && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(20px)' }}
          transition={{ duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            background: '#000000', // Apple True Black
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            overflow: 'hidden'
          }}
        >
          {/* Subtle slow-breathing background glow like a resting Mac */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.25, scale: 1 }}
            transition={{ duration: 4, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: '60vw',
              height: '60vw',
              background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0) 60%)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }}
          />

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 15, filter: 'blur(10px)', scale: 0.95 }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
              transition={{ delay: 0.4, duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 style={{
                fontSize: 'clamp(4rem, 15vw, 12rem)',
                fontWeight: 600,
                letterSpacing: '-0.04em',
                margin: 0,
                lineHeight: 1,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
                // Titanium metallic text effect
                background: 'linear-gradient(135deg, #FFFFFF 0%, #E0E0E0 40%, #888888 60%, #FFFFFF 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                <motion.span
                  animate={{ backgroundPosition: ['0% center', '200% center'] }}
                  transition={{ duration: 8, ease: 'linear', repeat: Infinity }}
                  style={{ display: 'inline-block' }}
                >
                  DIGI
                </motion.span>
              </h1>
            </motion.div>

            {/* The razor-thin separator line that elegantly wipes in */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 1.4, duration: 2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: '120%',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                marginTop: '1.5rem',
                transformOrigin: 'center'
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 1.8, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                marginTop: '1.5rem',
                fontSize: 'clamp(0.7rem, 2vw, 0.9rem)',
                letterSpacing: '0.6em',
                textTransform: 'uppercase',
                color: '#888888', // Space gray tone
                fontWeight: 500,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif'
              }}
            >
              Pro Grade Attribution
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const SceneLoadingFallback = () => (
  <div
    style={{
      position: 'absolute',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
    }}
  >
    <div
      style={{
        width: '40px',
        height: '40px',
        border: '2px solid rgba(255,255,255,0.1)',
        borderTopColor: 'rgba(255,255,255,0.5)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
)