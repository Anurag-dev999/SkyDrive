'use client'

import { useApp } from '@/context/app-context'
import { AuthPage } from '@/components/auth/auth-page'
import { Dashboard } from '@/components/dashboard/dashboard'

export default function Home() {
  const { user, loading } = useApp()

  if (loading) {
    return null
  }

  if (!user) {
    return <AuthPage />
  }

  return <Dashboard />
}
