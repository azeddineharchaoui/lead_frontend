'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { ApiContextType } from './types'

const ApiContext = createContext<ApiContextType | undefined>(undefined)

// WARNING: This is for v0 prototype only. In production, use secure auth solutions.
export function ApiProvider({ children }: { children: React.ReactNode }) {
  const [baseUrl, setBaseUrlState] = useState('http://localhost:8000')
  const [apiKey, setApiKeyState] = useState('')

  // Load from localStorage on mount
  useEffect(() => {
    const savedBaseUrl = localStorage.getItem('lead_crm_base_url')
    const savedApiKey = localStorage.getItem('lead_crm_api_key')

    if (savedBaseUrl) setBaseUrlState(savedBaseUrl)
    if (savedApiKey) setApiKeyState(savedApiKey)
  }, [])

  const setBaseUrl = (url: string) => {
    setBaseUrlState(url)
    localStorage.setItem('lead_crm_base_url', url)
  }

  const setApiKey = (key: string) => {
    setApiKeyState(key)
    localStorage.setItem('lead_crm_api_key', key)
  }

  // Always provide context even before mount to prevent hydration errors
  return (
    <ApiContext.Provider value={{ baseUrl, apiKey, setBaseUrl, setApiKey }}>
      {children}
    </ApiContext.Provider>
  )
}

export function useApi() {
  const context = useContext(ApiContext)
  if (!context) {
    throw new Error('useApi must be used within ApiProvider')
  }
  return context
}
