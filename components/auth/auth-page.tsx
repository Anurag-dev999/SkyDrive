'use client'

import { useState, useEffect } from 'react'
import { LoginForm } from './login-form'
import { SignupForm } from './signup-form'
import { ResetForm } from './reset-form'
import { Cloud, Zap, ShieldCheck, ArrowUpRight } from 'lucide-react'

type AuthView = 'login' | 'signup' | 'reset'

/* ------------------------------------------------------------------ */
/*  Animated floating orb (background decoration)                      */
/* ------------------------------------------------------------------ */
function Orb({ className }: { className?: string }) {
  return <div className={`absolute rounded-full blur-3xl opacity-30 animate-pulse ${className ?? ''}`} />
}

/* ------------------------------------------------------------------ */
/*  Feature card shown in the hero panel                               */
/* ------------------------------------------------------------------ */
interface FeatureProps {
  icon: React.ReactNode
  title: string
  description: string
  delay: number
}

function FeatureCard({ icon, title, description, delay }: FeatureProps) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <div
      className={`
        flex items-start gap-4 p-4 rounded-2xl
        bg-white/[0.07] dark:bg-white/[0.05]
        backdrop-blur-md border border-white/10
        transition-all duration-700 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
      `}
    >
      <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-xl bg-white/10 text-white">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-white text-sm">{title}</p>
        <p className="text-white/60 text-xs mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Dot grid for visual depth                                          */
/* ------------------------------------------------------------------ */
function DotGrid() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.04]" aria-hidden>
      <defs>
        <pattern id="dot-grid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-grid)" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Main auth page                                                     */
/* ------------------------------------------------------------------ */
export function AuthPage() {
  const [view, setView] = useState<AuthView>('login')

  const features: Omit<FeatureProps, 'delay'>[] = [
    {
      icon: <Cloud className="h-5 w-5" />,
      title: 'Cloud-Native Storage',
      description: 'Secure, always-available storage for all your files across every device.',
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: 'Lightning Fast',
      description: 'Instant uploads, downloads, and real-time sharing with anyone.',
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: 'Enterprise Security',
      description: 'End-to-end encryption keeps your files private and protected.',
    },
  ]

  return (
    <main className="flex min-h-screen w-full flex-col lg:flex-row bg-background">
      {/* ======================== LEFT — HERO PANEL ======================== */}
      <section
        className="
          relative flex flex-col justify-center items-start
          w-full lg:w-[58%] overflow-hidden
          px-8 sm:px-12 lg:px-16 xl:px-24
          py-16 lg:py-0
        "
        style={{
          background:
            'linear-gradient(135deg, oklch(0.35 0.2 275), oklch(0.28 0.18 265) 50%, oklch(0.22 0.12 250))',
        }}
      >
        {/* Decorative orbs */}
        <Orb className="h-[500px] w-[500px] -top-40 -left-40 bg-[oklch(0.55_0.22_275)]" />
        <Orb className="h-[400px] w-[400px] bottom-0 right-0 bg-[oklch(0.62_0.17_155)]" />
        <Orb className="h-[250px] w-[250px] top-1/2 left-1/3 bg-[oklch(0.5_0.2_290)]" />

        {/* Dot grid */}
        <DotGrid />

        {/* Content */}
        <div className="relative z-10 max-w-lg w-full mx-auto lg:mx-0">
          {/* Logo + badge */}
          <div className="flex items-center gap-3 mb-10">
            <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/10 shadow-lg shadow-black/10">
              <img src="/logo.svg" alt="SkyDrive Logo" className="h-8 w-8 object-contain drop-shadow-lg" />
            </div>
            <span className="text-white/90 font-semibold text-lg tracking-tight">SkyDrive</span>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.1] tracking-tight mb-5"
            style={{
              background: 'linear-gradient(160deg, #ffffff 30%, rgba(255,255,255,0.55))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Your files,{' '}
            <span className="block">elevated.</span>
          </h1>

          <p className="text-white/55 text-base sm:text-lg leading-relaxed mb-10 max-w-md">
            Premium cloud storage that's secure, blazing fast, and beautifully simple. Start managing your files like a pro.
          </p>

          {/* Feature cards */}
          <div className="flex flex-col gap-3 mb-10">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={300 + i * 200} />
            ))}
          </div>

          {/* Subtle stat bar */}
          <div className="flex items-center gap-6 text-white/40 text-xs font-medium">
            <span className="flex items-center gap-1">
              <ArrowUpRight className="h-3.5 w-3.5" />
              99.9% Uptime
            </span>
            <span className="h-3 w-px bg-white/20" />
            <span>256-bit AES</span>
            <span className="h-3 w-px bg-white/20" />
            <span>Global CDN</span>
          </div>
        </div>
      </section>

      {/* ======================== RIGHT — AUTH PANEL ======================= */}
      <section className="relative flex flex-1 flex-col items-center justify-center px-6 sm:px-10 py-12 lg:py-0">
        {/* Subtle background accents */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/3 right-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[350px] w-[350px] rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="w-full max-w-md">
          {view === 'login' && (
            <LoginForm
              onSwitchToSignup={() => setView('signup')}
              onSwitchToReset={() => setView('reset')}
            />
          )}
          {view === 'signup' && (
            <SignupForm onSwitchToLogin={() => setView('login')} />
          )}
          {view === 'reset' && (
            <ResetForm onSwitchToLogin={() => setView('login')} />
          )}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          SkyDrive Cloud Storage. Secure, fast, and reliable.
        </p>
      </section>
    </main>
  )
}
