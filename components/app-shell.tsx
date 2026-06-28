'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { Header } from './header'

const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email']

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))

  // Auth pages render their own layout (clean centred card)
  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
