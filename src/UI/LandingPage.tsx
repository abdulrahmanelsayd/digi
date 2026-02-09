import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

// Premium responsive hook with 3-tier breakpoints
const useResponsive = () => {
    const [device, setDevice] = useState<'phone' | 'tablet' | 'desktop'>('desktop')
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight })

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth
            setDimensions({ width, height: window.innerHeight })
            if (width < 640) setDevice('phone')
            else if (width < 1024) setDevice('tablet')
            else setDevice('desktop')
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return { device, isPhone: device === 'phone', isTablet: device === 'tablet', isDesktop: device === 'desktop', isMobile: device !== 'desktop', ...dimensions }
}

const Section = ({ children, align = 'left', theme = 'dark' }: { children: React.ReactNode, align?: 'left' | 'right' | 'center', theme?: 'dark' | 'white' }) => {
    const { isPhone, isTablet } = useResponsive()

    // Fluid padding based on device
    const getHorizontalPadding = () => {
        if (isPhone) return 'clamp(20px, 6vw, 32px)'
        if (isTablet) return 'clamp(32px, 8vw, 64px)'
        return '10%'
    }

    return (
        <section style={{
            minHeight: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
            paddingLeft: getHorizontalPadding(),
            paddingRight: getHorizontalPadding(),
            boxSizing: 'border-box',
            backgroundColor: theme === 'white' ? '#ffffff' : 'transparent',
            color: theme === 'white' ? '#000000' : '#ffffff',
            position: 'relative',
            zIndex: theme === 'white' ? 10 : 0,
            paddingTop: 'max(80px, env(safe-area-inset-top, 0px))',
            paddingBottom: 'max(80px, env(safe-area-inset-bottom, 0px))'
        }}>
            {children}
        </section>
    )
}

// Ultra Premium Button Component - Apple Style
const PremiumButton = ({ children, variant = 'primary', fullWidth = false }: { children: React.ReactNode, variant?: 'primary' | 'secondary', fullWidth?: boolean }) => {
    const [isPressed, setIsPressed] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    // Primary: Frosted Glass with delicate border
    const primaryStyle: React.CSSProperties = {
        position: 'relative',
        padding: 'clamp(14px, 3vw, 18px) clamp(28px, 6vw, 40px)',
        fontSize: 'clamp(0.8rem, 1.5vw, 0.95rem)',
        fontWeight: 500,
        letterSpacing: '0.05em',
        textTransform: 'uppercase' as const,
        borderRadius: '100px',
        cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.2)',
        background: isHovered
            ? 'rgba(255,255,255,0.15)'
            : 'rgba(255,255,255,0.08)',
        color: '#ffffff',
        width: fullWidth ? '100%' : 'auto',
        minHeight: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isPressed ? 'scale(0.96)' : isHovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isHovered
            ? '0 0 20px rgba(255,255,255,0.1)'
            : '0 0 0 rgba(0,0,0,0)',
        overflow: 'hidden'
    }

    // Secondary: Text only with interaction reveal
    const secondaryStyle: React.CSSProperties = {
        ...primaryStyle,
        background: 'transparent',
        border: '1px solid transparent',
        color: isHovered ? '#ffffff' : 'rgba(255,255,255,0.7)',
        boxShadow: 'none',
        backdropFilter: 'none'
    }

    return (
        <button
            style={variant === 'primary' ? primaryStyle : secondaryStyle}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => { setIsPressed(false); setIsHovered(false) }}
            onMouseEnter={() => setIsHovered(true)}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => setIsPressed(false)}
        >
            {/* Icon arrow for primary */}
            {variant === 'primary' ? (
                <>
                    <span style={{ position: 'relative', zIndex: 1, textShadow: '0 0 10px rgba(255,255,255,0.3)' }}>{children}</span>
                    <span style={{
                        position: 'relative',
                        zIndex: 1,
                        transition: 'transform 0.3s ease',
                        transform: isHovered ? 'translateX(3px)' : 'translateX(0)',
                        fontSize: '1em',
                        opacity: 0.8
                    }}>→</span>
                </>
            ) : (
                <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
            )}
        </button>
    )
}

// Premium Glass Card Component
const GlassCard = ({ children, maxWidth = '500px' }: { children: React.ReactNode, maxWidth?: string }) => {
    const { isMobile } = useResponsive()

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
                pointerEvents: 'auto',
                background: 'linear-gradient(180deg, rgba(25,25,25,0.9) 0%, rgba(10,10,10,0.95) 100%)',
                backdropFilter: isMobile ? 'blur(20px)' : 'blur(40px)',
                WebkitBackdropFilter: isMobile ? 'blur(20px)' : 'blur(40px)',
                padding: 'clamp(24px, 5vw, 40px)',
                borderRadius: 'clamp(16px, 3vw, 24px)',
                border: '1px solid rgba(255,255,255,0.1)',
                maxWidth: maxWidth,
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}
        >
            {children}
        </motion.div>
    )
}
export const LandingPageUI = () => {
    const { isPhone, isTablet, isMobile } = useResponsive()

    return (
        <div style={{ width: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>

            {/* PAGE 1: HERO */}
            <Section align="center">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        pointerEvents: 'auto',
                        textAlign: 'center',
                        width: '100%',
                        maxWidth: '1200px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        zIndex: 2
                    }}
                >




                    {/* BUTTONS */}
                    <div style={{
                        marginTop: 'calc(100vh - 150px)', // Pushes to bottom but keeps accessible
                        transform: 'translateY(-100%)', // Align bottom edge
                        display: 'flex',
                        gap: isPhone ? '16px' : '32px',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: 'center',
                        width: isMobile ? '100%' : 'auto',
                        maxWidth: '400px'
                    }}>
                        <PremiumButton variant="primary" fullWidth={isMobile}>
                            Initialize
                        </PremiumButton>
                        <PremiumButton variant="secondary" fullWidth={isMobile}>
                            Documentation
                        </PremiumButton>
                    </div>
                </motion.div>
            </Section>

            {/* PAGE 2: WHITE MANIFESTO */}
            <Section align="center" theme="white">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    style={{ pointerEvents: 'auto', textAlign: 'center', padding: '0 1rem' }}
                >
                    <h2 style={{
                        fontSize: isPhone ? 'clamp(2rem, 10vw, 3rem)' : isTablet ? 'clamp(3rem, 8vw, 4rem)' : '6vw',
                        fontWeight: 800,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.1,
                        marginBottom: '1.5rem',
                        color: '#000'
                    }}>
                        THE NEW STANDARD.
                    </h2>
                    <p style={{
                        fontSize: 'clamp(1rem, 3vw, 1.5rem)',
                        opacity: 0.7,
                        maxWidth: '800px',
                        margin: '0 auto',
                        lineHeight: 1.6,
                        fontWeight: 400
                    }}>
                        We don't just track clicks. We engineer ecosystem dominance.
                    </p>
                </motion.div>
            </Section>

            {/* PAGE 3: ANALYTICS */}
            <Section align={isMobile ? 'center' : 'right'}>
                <GlassCard>
                    <h2 style={{
                        fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                        marginBottom: '1rem',
                        lineHeight: 1.1,
                        letterSpacing: '-0.02em'
                    }}>
                        Transparent Analytics
                    </h2>
                    <p style={{
                        lineHeight: 1.6,
                        marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
                        opacity: 0.7,
                        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)'
                    }}>
                        Holographic tracking of every conversion. Deep-scan technology ensures 100% attribution accuracy.
                    </p>
                    <div style={{ display: 'flex', gap: 'clamp(24px, 8vw, 40px)' }}>
                        <div>
                            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 1.8rem)', fontWeight: 'bold', color: '#fff' }}>99.9%</div>
                            <div style={{ fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)', opacity: 0.5, letterSpacing: '0.1em', marginTop: '4px' }}>UPTIME</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 'clamp(1.5rem, 5vw, 1.8rem)', fontWeight: 'bold', color: '#fff' }}>0.01s</div>
                            <div style={{ fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)', opacity: 0.5, letterSpacing: '0.1em', marginTop: '4px' }}>LATENCY</div>
                        </div>
                    </div>
                </GlassCard>
            </Section>

            {/* PAGE 4: WHITE DATA */}
            <Section align="left" theme="white">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    style={{ pointerEvents: 'auto', maxWidth: isMobile ? '100%' : '80%' }}
                >
                    <h2 style={{
                        fontSize: isPhone ? 'clamp(2.5rem, 12vw, 3.5rem)' : isTablet ? 'clamp(3.5rem, 10vw, 5rem)' : '8vw',
                        fontWeight: 900,
                        lineHeight: 0.9,
                        letterSpacing: '-0.03em',
                        color: '#000',
                        marginBottom: '2rem'
                    }}>
                        PURE DATA.<br />
                        PURE PROFIT.
                    </h2>
                    <div style={{
                        marginTop: 'clamp(2rem, 5vw, 3rem)',
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? 'clamp(1.5rem, 4vw, 2rem)' : '4rem'
                    }}>
                        <div>
                            <h3 style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)', fontWeight: 'bold', marginBottom: '0.5rem', textTransform: 'uppercase', opacity: 0.5 }}>01. Verify</h3>
                            <p style={{ opacity: 0.8, maxWidth: '300px', lineHeight: 1.5, fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>Real-time user verification eliminates bot traffic instantly.</p>
                        </div>
                        <div>
                            <h3 style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)', fontWeight: 'bold', marginBottom: '0.5rem', textTransform: 'uppercase', opacity: 0.5 }}>02. Scale</h3>
                            <p style={{ opacity: 0.8, maxWidth: '300px', lineHeight: 1.5, fontSize: 'clamp(0.9rem, 2.5vw, 1rem)' }}>Infrastructure built to handle 10M+ events per second.</p>
                        </div>
                    </div>
                </motion.div>
            </Section>

            {/* PAGE 5: CTA */}
            <Section align="left">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                        pointerEvents: 'auto',
                        maxWidth: '600px',
                        textAlign: 'left',
                        padding: '0'
                    }}
                >
                    <h2 style={{
                        fontSize: isPhone ? 'clamp(2.5rem, 10vw, 3rem)' : 'clamp(3rem, 6vw, 4rem)',
                        lineHeight: 0.95,
                        fontWeight: 800,
                        letterSpacing: '-0.02em',
                        marginBottom: '1.5rem'
                    }}>
                        Global Scale. <br />Local Reach.
                    </h2>
                    <p style={{
                        fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
                        margin: '0 0 2rem 0',
                        opacity: 0.7,
                        lineHeight: 1.6,
                        maxWidth: '100%'
                    }}>
                        Join a network of 500,000+ elite affiliates lighting up the digital map.
                    </p>
                    <PremiumButton variant="primary" fullWidth={isPhone}>
                        Get Started
                    </PremiumButton>
                </motion.div>
            </Section>

            {/* MEGA FOOTER */}
            <Section align="center">
                <div style={{
                    width: '100%',
                    display: 'grid',
                    gridTemplateColumns: isPhone ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                    gap: isPhone ? '2.5rem' : '2rem',
                    pointerEvents: 'auto',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    paddingTop: 'clamp(2rem, 5vw, 3rem)',
                    textAlign: 'left'
                }}>
                    {/* COL 1: BRAND */}
                    <div>
                        <h3 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', fontWeight: '800', margin: '0 0 1rem 0', letterSpacing: '-0.02em' }}>EMO</h3>
                        <p style={{ opacity: 0.4, fontSize: 'clamp(0.8rem, 2vw, 0.85rem)', lineHeight: 1.6, maxWidth: '200px' }}>
                            Redefining digital attribution.
                        </p>
                    </div>

                    {/* COL 2: PLATFORM */}
                    <div>
                        <h4 style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', fontWeight: 'bold', margin: '0 0 1.2rem 0', opacity: 0.4, letterSpacing: '0.1em' }}>PLATFORM</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 'clamp(0.85rem, 2vw, 0.9rem)', opacity: 0.7, lineHeight: 2.5 }}>
                            <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Solutions</a></li>
                            <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Integration</a></li>
                            <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Pricing</a></li>
                        </ul>
                    </div>

                    {/* COL 3: COMPANY */}
                    <div>
                        <h4 style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', fontWeight: 'bold', margin: '0 0 1.2rem 0', opacity: 0.4, letterSpacing: '0.1em' }}>COMPANY</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 'clamp(0.85rem, 2vw, 0.9rem)', opacity: 0.7, lineHeight: 2.5 }}>
                            <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>About</a></li>
                            <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Careers</a></li>
                            <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</a></li>
                        </ul>
                    </div>

                    {/* COL 4: NEWSLETTER */}
                    <div style={{ gridColumn: isTablet && !isPhone ? 'span 2' : 'auto' }}>
                        <h4 style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', fontWeight: 'bold', margin: '0 0 1.2rem 0', opacity: 0.4, letterSpacing: '0.1em' }}>STAY UPDATED</h4>
                        <div style={{ display: 'flex', marginTop: '0.5rem', width: '100%', maxWidth: isTablet ? '400px' : '100%' }}>
                            <input type="email" placeholder="email@domain.com" style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#fff',
                                padding: 'clamp(10px, 2vw, 12px) clamp(12px, 3vw, 16px)',
                                borderRadius: '8px 0 0 8px',
                                width: '100%',
                                outline: 'none',
                                fontSize: '16px',
                                minHeight: '48px'
                            }} />
                            <button style={{
                                background: '#fff',
                                color: '#000',
                                border: 'none',
                                padding: '0 clamp(16px, 4vw, 20px)',
                                borderRadius: '0 8px 8px 0',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                                minHeight: '48px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>→</button>
                        </div>
                    </div>
                </div>

                <div style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: isMobile ? 'center' : 'space-between',
                    alignItems: 'center',
                    marginTop: 'clamp(2rem, 5vw, 4rem)',
                    opacity: 0.3,
                    fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
                    gap: '1rem',
                    paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))'
                }}>
                    <div>© 2026 EMO INC.</div>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <span>PRIVACY POLICY</span>
                        <span>TERMS OF SERVICE</span>
                    </div>
                </div>
            </Section>

        </div>
    )
}
