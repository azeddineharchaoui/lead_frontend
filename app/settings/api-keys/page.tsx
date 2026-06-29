'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SettingsApiKeysPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/settings?tab=api-keys')
  }, [router])

  return null
}
