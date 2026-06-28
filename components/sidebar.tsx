'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Clock,
  Target,
  MessageCircle,
  Settings,
  KeyRound,
  LogOut,
  ChevronDown,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { RoleGuard } from './auth/RoleGuard'
import { useState } from 'react'

const navigationItems = [
  {
    label: 'Tableau de bord',
    href: '/',
    icon: LayoutDashboard,
    match: (pathname: string) => pathname === '/',
  },
  {
    label: 'Leads',
    href: '/leads',
    icon: Users,
    match: (pathname: string) => pathname === '/leads' || /^\/leads\/[^/]+$/.test(pathname),
    roles: ['owner', 'admin', 'agent'],
  },
  {
    label: "File d'attente",
    href: '/leads/pending',
    icon: Clock,
    match: (pathname: string) => pathname === '/leads/pending' || pathname.startsWith('/leads/pending/'),
    roles: ['owner', 'admin', 'agent'],
  },
  {
    label: 'Cibles de scraping',
    href: '/targets',
    icon: Target,
    match: (pathname: string) => pathname === '/targets' || pathname.startsWith('/targets/'),
    roles: ['owner', 'admin'],
  },
  {
    label: 'Démo chat',
    href: '/chat-widget-demo',
    icon: MessageCircle,
    match: (pathname: string) => pathname === '/chat-widget-demo' || pathname.startsWith('/chat-widget-demo/'),
  },
  {
    label: 'Paramètres',
    href: '/settings',
    icon: Settings,
    match: (pathname: string) => pathname === '/settings' || pathname.startsWith('/settings/'),
  },
]

const adminItems = [
  {
    label: 'Équipe',
    href: '/settings/team',
    icon: Users,
    match: (p: string) => p.startsWith('/settings/team'),
  },
  {
    label: 'Clés API',
    href: '/settings/api-keys',
    icon: KeyRound,
    match: (p: string) => p.startsWith('/settings/api-keys'),
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, organisation, signOut, isAdmin } = useAuth()
  const [adminOpen, setAdminOpen] = useState(false)

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white min-h-screen border-r border-slate-800 dark:bg-slate-950 dark:border-slate-900">
      {/* Logo & Org */}
      <div className="p-6 border-b border-slate-800 dark:border-slate-900">
        <h1 className="text-xl font-bold text-white">Lead.ma</h1>
        {organisation && (
          <p className="text-xs text-slate-400 mt-1 truncate">{organisation.name}</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = item.match(pathname)
          const hasRoleRestriction = item.roles
          
          const content = (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600/20 text-white border-l-2 border-indigo-500'
                  : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )

          if (hasRoleRestriction) {
            return (
              <RoleGuard key={item.href} roles={item.roles as any}>
                {content}
              </RoleGuard>
            )
          }
          return content
        })}

        {/* Admin Section */}
        <RoleGuard roles={['owner', 'admin']}>
          <div className="pt-4 mt-4 border-t border-slate-800 dark:border-slate-900">
            <button
              onClick={() => setAdminOpen(!adminOpen)}
              className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-300 transition-colors"
            >
              Admin
              <ChevronDown
                className={`w-4 h-4 transition-transform ${adminOpen ? 'rotate-180' : ''}`}
              />
            </button>
            
            {adminOpen && (
              <div className="space-y-1 mt-2">
                {adminItems.map((item) => {
                  const Icon = item.icon
                  const isActive = item.match(pathname)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                        isActive
                          ? 'bg-indigo-600/20 text-white border-l-2 border-indigo-500'
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </RoleGuard>
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800 dark:border-slate-900">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-600/30 text-indigo-200 capitalize font-medium">
                  {user.role}
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              title="Sign out"
              className="text-slate-400 hover:text-red-400 transition-colors p-1.5 rounded hover:bg-slate-800/50"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Sign in
          </Link>
        )}
      </div>
    </aside>
  )
}
