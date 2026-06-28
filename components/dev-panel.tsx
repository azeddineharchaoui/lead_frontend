'use client'

import { useState } from 'react'
import { ChevronRight, Code2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PROJECT_LINKS = [
  // Auth
  { label: 'Login', href: '/login', category: 'Auth' },
  { label: 'Register', href: '/register', category: 'Auth' },
  { label: 'Forgot Password', href: '/forgot-password', category: 'Auth' },
  { label: 'Verify Email', href: '/verify-email', category: 'Auth' },
  { label: 'Reset Password', href: '/reset-password', category: 'Auth' },

  // CRM
  { label: 'Dashboard', href: '/', category: 'CRM' },
  { label: 'Leads List', href: '/leads', category: 'CRM' },
  { label: 'Pending Leads', href: '/leads/pending', category: 'CRM' },
  { label: 'Targets', href: '/targets', category: 'CRM' },
  { label: 'Settings', href: '/settings', category: 'CRM' },

  // Chat & Demo
  { label: 'Chat Widget Demo', href: '/chat-widget-demo', category: 'Chat' },

  // API Docs
  { label: 'API Reference', href: 'http://localhost:8000/docs', category: 'Docs' },
  { label: 'Health Check', href: 'http://localhost:8000/health', category: 'Docs' },
]

const CATEGORIES = ['CRM', 'Auth', 'Chat', 'Docs']

export function DevPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<string | null>(null)

  const filteredLinks = filter
    ? PROJECT_LINKS.filter((link) => link.category === filter)
    : PROJECT_LINKS

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-colors"
        title="Dev Navigation"
      >
        <Code2 className="w-5 h-5" />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-40 w-72 max-h-96 bg-white dark:bg-slate-950 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <p className="font-semibold text-sm text-slate-900 dark:text-white">
              Dev Navigation
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All project routes
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 px-3 py-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
            <button
              onClick={() => setFilter(null)}
              className={`whitespace-nowrap px-2 py-1 text-xs font-medium rounded transition-colors ${
                filter === null
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`whitespace-nowrap px-2 py-1 text-xs font-medium rounded transition-colors ${
                  filter === cat
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Links */}
          <div className="overflow-y-auto flex-1">
            {filteredLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : '_self'}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : ''}
                className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {link.label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {link.href}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex-shrink-0" />
              </a>
            ))}
          </div>

          {/* Close button */}
          <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
