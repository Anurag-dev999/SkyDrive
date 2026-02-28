'use client'

import { useState } from 'react'
import { LoginForm } from './login-form'
import { SignupForm } from './signup-form'
import { ResetForm } from './reset-form'

type AuthView = 'login' | 'signup' | 'reset'

export function AuthPage() {
  const [view, setView] = useState<AuthView>('login')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />
      </div>

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

      <p className="mt-8 text-center text-xs text-muted-foreground">
        SkyDrive Cloud Storage. Secure, fast, and reliable.
      </p>
    </main>
  )
}
