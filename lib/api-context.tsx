'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { ApiContextType } from './types'

const DEFAULT_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8000'
const DEFAULT_API_KEY = process.env.NEXT_PUBLIC_DEFAULT_API_KEY || ''

const ApiContext = createContext<ApiContextType | undefined>(undefined)

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const [baseUrl, setBaseUrlState] = useState(DEFAULT_BASE_URL)
  const [apiKey, setApiKeyState] = useState(DEFAULT_API_KEY)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const savedBaseUrl = localStorage.getItem('lead_crm_base_url')
    const savedApiKey = localStorage.getItem('lead_crm_api_key')

    if (savedBaseUrl) setBaseUrlState(savedBaseUrl)
    else setBaseUrlState(DEFAULT_BASE_URL)

    if (savedApiKey) setApiKeyState(savedApiKey)
    else if (DEFAULT_API_KEY) setApiKeyState(DEFAULT_API_KEY)

    setHydrated(true)
  }, [])

  const setBaseUrl = (url: string) => {
    setBaseUrlState(url)
    localStorage.setItem('lead_crm_base_url', url)
  }

  const setApiKey = (key: string) => {
    setApiKeyState(key)
    localStorage.setItem('lead_crm_api_key', key)
  }

  if (!hydrated) {
    return (
      <ApiContext.Provider
        value={{
          baseUrl: DEFAULT_BASE_URL,
          apiKey: DEFAULT_API_KEY,
          setBaseUrl,
          setApiKey,
        }}
      >
        {children}
      </ApiContext.Provider>
    )
  }

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
