'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { useAuth } from '@/hooks/useAuth'

const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email']

function LoadingSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="space-y-4 w-full max-w-md px-4">
        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse" />
        </div>
        <div className="space-y-3 pt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isLoading } = useAuth()
  const isAuthPage = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))

  // Auth pages render their own layout (clean centered card)
  if (isAuthPage) {
    return <>{children}</>
  }

  // Show loading skeleton while auth context initializes
  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  )
}
