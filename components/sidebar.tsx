'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ListTodo,
  Clock,
  KeyRound,
  LogOut,
  Settings,
  Target,
  MessageCircle,
  Users,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

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
    icon: ListTodo,
    match: (pathname: string) =>
      pathname === '/leads' || /^\/leads\/[^/]+$/.test(pathname),
  },
  {
    label: "File d'attente",
    href: '/leads/pending',
    icon: Clock,
    match: (pathname: string) =>
      pathname === '/leads/pending' || pathname.startsWith('/leads/pending/'),
  },
  {
    label: 'Cibles de scraping',
    href: '/targets',
    icon: Target,
    match: (pathname: string) =>
      pathname === '/targets' || pathname.startsWith('/targets/'),
  },
  {
    label: 'Démo chat',
    href: '/chat-widget-demo',
    icon: MessageCircle,
    match: (pathname: string) =>
      pathname === '/chat-widget-demo' ||
      pathname.startsWith('/chat-widget-demo/'),
  },
  {
    label: 'Paramètres',
    href: '/settings',
    icon: Settings,
    match: (pathname: string) =>
      pathname === '/settings' || pathname.startsWith('/settings/'),
  },
]

const adminItems = [
  {
    label: 'Team',
    href: '/settings/team',
    icon: Users,
    match: (p: string) => p.startsWith('/settings/team'),
  },
  {
    label: 'API Keys',
    href: '/settings/api-keys',
    icon: KeyRound,
    match: (p: string) => p.startsWith('/settings/api-keys'),
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, organisation, signOut, isAdmin, isOwner } = useAuth()

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white min-h-screen border-r border-slate-700">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold">Lead.ma CRM</h1>
        {organisation && (
          <p className="text-xs text-slate-400 mt-0.5 truncate">{organisation.name}</p>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = item.match(pathname)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          )
        })}

        {/* Admin-only nav items */}
        {isAdmin && (
          <>
            <div className="pt-2 pb-1 px-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin</span>
            </div>
            {adminItems.map((item) => {
              const Icon = item.icon
              const isActive = item.match(pathname)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* User profile + logout */}
      <div className="p-4 border-t border-slate-700">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold uppercase flex-shrink-0">
              {user.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
            <button
              onClick={() => signOut()}
              title="Sign out"
              className="text-slate-400 hover:text-white transition-colors p-1 rounded"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link href="/login" className="text-sm text-slate-400 hover:text-white">Sign in</Link>
        )}
      </div>
    </aside>
  )
}
