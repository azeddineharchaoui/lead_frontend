'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApi } from '@/lib/api-context'
import { fetchHealth } from '@/lib/api'
import { isApiHealthy } from '@/lib/types'
import { useAuth } from '@/hooks/useAuth'
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Search,
  Moon,
  Sun,
  Bell,
  LogOut,
  Settings,
  ChevronRight,
} from 'lucide-react'
import { useState as useStateTheme } from 'react'

export function Header() {
  const pathname = usePathname()
  const { baseUrl, apiKey } = useApi()
  const { user, signOut } = useAuth()
  const [healthy, setHealthy] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Initialize dark mode from localStorage
  useEffect(() => {
    const isDark = localStorage.getItem('lead-crm-dark-mode') === 'true'
    setDarkMode(isDark)
    updateDarkMode(isDark)
  }, [])

  const updateDarkMode = (isDark: boolean) => {
    const html = document.documentElement
    if (isDark) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
    localStorage.setItem('lead-crm-dark-mode', isDark.toString())
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    updateDarkMode(!darkMode)
  }

  // Health check
  useEffect(() => {
    const check = async () => {
      try {
        setLoading(true)
        const data = await fetchHealth({ baseUrl, apiKey })
        setHealthy(isApiHealthy(data))
      } catch {
        setHealthy(false)
      } finally {
        setLoading(false)
      }
    }

    check()
    const interval = setInterval(check, 10000)
    return () => clearInterval(interval)
  }, [baseUrl, apiKey])

  // Generate breadcrumbs from pathname
  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs = [{ label: 'Accueil', href: '/' }]

    segments.forEach((segment, idx) => {
      const href = '/' + segments.slice(0, idx + 1).join('/')
      const label = segment
        .replace(/([A-Z])/g, ' $1')
        .replace('-', ' ')
        .replace(/_/g, ' ')
        .trim()
        .charAt(0)
        .toUpperCase() + segment.slice(1)

      breadcrumbs.push({ label, href })
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        {/* Breadcrumbs + Search */}
        <div className="flex-1 flex items-center gap-4">
          <nav className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, idx) => (
              <div key={crumb.href} className="flex items-center gap-2">
                {idx > 0 && <ChevronRight className="w-4 h-4 text-slate-400" />}
                <Link
                  href={crumb.href}
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {crumb.label}
                </Link>
              </div>
            ))}
          </nav>

          {/* Search */}
          <div className="hidden lg:flex items-center gap-2 ml-auto px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Chercher... (Cmd+K)"
              className="bg-transparent text-sm text-slate-600 dark:text-slate-300 placeholder:text-slate-400 outline-none w-32"
              disabled
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
            {!loading && (
              <>
                {healthy ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-200">
                      API OK
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span className="text-xs font-medium text-rose-700 dark:text-rose-200">
                      Hors ligne
                    </span>
                  </>
                )}
              </>
            )}
          </div>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            )}
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white">
                {user?.full_name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:inline">
                {user?.full_name}
              </span>
            </button>

            {/* User dropdown menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 py-1 z-50">
                <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.full_name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                </div>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Paramètres
                </Link>
                <button
                  onClick={() => {
                    signOut()
                    setUserMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-700 dark:text-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* API Key warning */}
      {!apiKey && (
        <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950/20 border-t border-amber-200 dark:border-amber-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            <span className="text-sm text-amber-800 dark:text-amber-200">
              Clé API requise pour les cibles de scraping
            </span>
          </div>
          <Link
            href="/settings"
            className="text-sm font-medium text-amber-900 dark:text-amber-100 hover:text-amber-700 dark:hover:text-amber-200 underline"
          >
            Paramètres
          </Link>
        </div>
      )}
    </header>
  )
}
