import { useRef, useCallback, useEffect } from 'react'

interface ThrottleOptions {
  leading?: boolean
  trailing?: boolean
}

export const useThrottle = <T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number,
  options: ThrottleOptions = {}
): ((...args: Parameters<T>) => void) => {
  const { leading = true, trailing = true } = options
  const lastRun = useRef<number>(0)
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastArgs = useRef<unknown[] | null>(null)

  const throttledCallback = useCallback(
    (...args: unknown[]) => {
      const now = Date.now()
      const timeSinceLastRun = now - lastRun.current

      lastArgs.current = args

      if (timeSinceLastRun >= delay) {
        if (leading) {
          lastRun.current = now
          callback(...args)
        }
      } else if (trailing && !timeoutId.current) {
        timeoutId.current = setTimeout(
          () => {
            lastRun.current = Date.now()
            timeoutId.current = null
            if (lastArgs.current) {
              callback(...lastArgs.current)
            }
          },
          delay - timeSinceLastRun
        )
      }
    },
    [callback, delay, leading, trailing]
  )

  useEffect(() => {
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current)
      }
    }
  }, [])

  return throttledCallback as (...args: Parameters<T>) => void
}

export const useDebounce = <T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null)

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current)
      }

      timeoutId.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  )

  useEffect(() => {
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current)
      }
    }
  }, [])

  return debouncedCallback
}

export const useScrollProgress = () => {
  const progress = useRef(0)
  const velocity = useRef(0)
  const lastProgress = useRef(0)

  const update = useCallback((offset: number) => {
    velocity.current = offset - lastProgress.current
    lastProgress.current = progress.current
    progress.current = offset
    return {
      progress: progress.current,
      velocity: velocity.current,
    }
  }, [])

  return { update, progress, velocity }
}