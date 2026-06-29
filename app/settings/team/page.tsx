'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SettingsTeamPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/settings?tab=team')
  }, [router])

  return null
}
