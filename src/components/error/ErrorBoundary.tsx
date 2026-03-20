import { Component, ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#050505',
            color: '#ffffff',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          <div
            style={{
              textAlign: 'center',
              maxWidth: '400px',
              padding: '2rem',
            }}
          >
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                marginBottom: '1rem',
                letterSpacing: '-0.02em',
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                opacity: 0.6,
                fontSize: '0.875rem',
                lineHeight: 1.6,
              }}
            >
              We encountered an unexpected error. Please refresh the page or try again later.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export const WebGLErrorFallback = () => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      color: '#ffffff',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}
  >
    <div style={{ textAlign: 'center', maxWidth: '500px', padding: '2rem' }}>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
        WebGL Not Supported
      </h2>
      <p style={{ opacity: 0.7, fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
        Your browser or device doesn't support WebGL, which is required for the 3D experience.
      </p>
      <div
        style={{
          background: 'rgba(255,255,255,0.05)',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <p style={{ fontSize: '0.875rem', opacity: 0.6 }}>
          Please try:
        </p>
        <ul style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '0.75rem', paddingLeft: '1.25rem', lineHeight: 2 }}>
          <li>Using a modern browser (Chrome, Firefox, Safari, Edge)</li>
          <li>Enabling hardware acceleration in browser settings</li>
          <li>Updating your graphics drivers</li>
        </ul>
      </div>
    </div>
  </div>
)

export const SceneErrorFallback = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
    }}
  >
    <div
      style={{
        color: 'rgba(255,255,255,0.3)',
        fontSize: '0.75rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}
    >
      Loading...
    </div>
  </div>
)