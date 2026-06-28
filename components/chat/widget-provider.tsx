'use client'

import { createContext, useContext, ReactNode } from 'react'

export interface WidgetConfig {
  orgId: string
  orgName: string
  orgLogoUrl?: string
  apiBaseUrl: string
  publicApiKey?: string
  primaryColor: string
  position: 'bottom-right' | 'bottom-left'
  channel: 'web_chat'
  prechatForm: boolean
}

const defaultConfig: WidgetConfig = {
  orgId: '',
  orgName: 'Lead.ma',
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  primaryColor: '#4F46E5',
  position: 'bottom-right',
  channel: 'web_chat',
  prechatForm: true,
}

const WidgetContext = createContext<WidgetConfig | null>(null)

interface WidgetProviderProps {
  config: Partial<WidgetConfig>
  children: ReactNode
}

export function WidgetProvider({ config, children }: WidgetProviderProps) {
  const mergedConfig = {
    ...defaultConfig,
    ...config,
  }

  return <WidgetContext.Provider value={mergedConfig}>{children}</WidgetContext.Provider>
}

export function useWidgetConfig(): WidgetConfig {
  const context = useContext(WidgetContext)
  if (!context) {
    return defaultConfig
  }
  return context
}
