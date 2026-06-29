'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ApiProvider } from '@/lib/api-context'
import { ChatWidget } from '@/components/chat/chat-widget'
import { Toaster } from 'sonner'

function EmbedChatContent() {
  const searchParams = useSearchParams()

  const leadId = searchParams.get('lead') || undefined
  const orgName = searchParams.get('org_name') || 'Lead.ma'
  const orgLogoUrl = searchParams.get('logo') || undefined
  const primaryColor = searchParams.get('primary') || '#4F46E5'
  const position = (searchParams.get('position') as 'bottom-right' | 'bottom-left') || 'bottom-right'

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      <ChatWidget
        leadId={leadId}
        orgName={orgName}
        orgLogoUrl={orgLogoUrl}
        primaryColor={primaryColor}
        position={position}
        defaultOpen={true}
        channel="web_chat"
      />
      <Toaster richColors position="top-right" />
    </div>
  )
}

export default function EmbedChatPage() {
  return (
    <ApiProvider>
      <Suspense fallback={null}>
        <EmbedChatContent />
      </Suspense>
    </ApiProvider>
  )
}
