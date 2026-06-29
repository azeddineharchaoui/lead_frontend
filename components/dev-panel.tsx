'use client'

import { useState } from 'react'
import { ChevronRight, Code2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isDevAuthBypass } from '@/lib/dev-auth'
import { DEV_ROUTE_CATEGORIES, DEV_ROUTE_LINKS } from '@/lib/dev-routes'

export function DevPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<string | null>(null)

  if (!isDevAuthBypass()) return null

  const filteredLinks = filter
    ? DEV_ROUTE_LINKS.filter((link) => link.category === filter)
    : DEV_ROUTE_LINKS

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-40 flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-colors"
        title="Dev Navigation"
      >
        <Code2 className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed bottom-20 left-6 z-40 w-80 max-h-[28rem] bg-white dark:bg-slate-950 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-sm text-slate-900 dark:text-white">
                Dev Navigation
              </p>
              <span className="text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                DEV — auth bypassed
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              All project routes
            </p>
          </div>

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
            {DEV_ROUTE_CATEGORIES.map((cat) => (
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

          <div className="overflow-y-auto flex-1">
            {filteredLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : '_self'}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : ''}
                className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {link.label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {link.href}
                  </p>
                  {link.note && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {link.note}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex-shrink-0" />
              </a>
            ))}
          </div>

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

      {isOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
