interface PerformanceMetrics {
  fps: number
  frameTime: number
  memory?: number
  renderTime: number
}

type PerformanceCallback = (metrics: PerformanceMetrics) => void

class PerformanceMonitor {
  private callbacks: Set<PerformanceCallback> = new Set()
  private frameCount = 0
  private lastTime = performance.now()
  private animationId: number | null = null
  private isRunning = false

  start() {
    if (this.isRunning) return
    this.isRunning = true
    this.loop()
  }

  stop() {
    this.isRunning = false
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  subscribe(callback: PerformanceCallback) {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }

  private loop = () => {
    if (!this.isRunning) return

    this.frameCount++
    const now = performance.now()
    const delta = now - this.lastTime

    if (delta >= 1000) {
      const fps = Math.round((this.frameCount * 1000) / delta)
      const frameTime = Math.round(delta / this.frameCount)

      const memory = this.getMemory()

      const metrics: PerformanceMetrics = {
        fps,
        frameTime,
        memory,
        renderTime: frameTime,
      }

      this.callbacks.forEach((cb) => cb(metrics))

      this.frameCount = 0
      this.lastTime = now
    }

    this.animationId = requestAnimationFrame(this.loop)
  }

  private getMemory(): number | undefined {
    const perf = performance as unknown as { memory?: { usedJSHeapSize: number } }
    if (perf.memory) {
      return Math.round(perf.memory.usedJSHeapSize / 1048576)
    }
    return undefined
  }
}

export const performanceMonitor = new PerformanceMonitor()

export const measurePerformance = (
  name: string,
  callback: () => void
): (() => void) => {
  const start = performance.now()
  callback()
  const duration = performance.now() - start
  if (duration > 16) {
    console.warn(`[Performance] ${name} took ${duration.toFixed(2)}ms`)
  }
  return () => {}
}

export const createMemoryWarning = (thresholdMB: number = 100) => {
  let warningFired = false
  return () => {
    const perf = performance as unknown as { memory?: { usedJSHeapSize: number } }
    if (perf.memory) {
      const usedMB = perf.memory.usedJSHeapSize / 1048576
      if (usedMB > thresholdMB && !warningFired) {
        console.warn(`[Memory] High memory usage: ${usedMB.toFixed(2)}MB`)
        warningFired = true
      }
    }
  }
}