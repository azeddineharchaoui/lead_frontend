export interface DevRouteLink {
  label: string
  href: string
  category: 'CRM' | 'Auth' | 'Chat' | 'Embed' | 'Docs'
  note?: string
}

const SAMPLE_LEAD_ID =
  process.env.NEXT_PUBLIC_DEV_SAMPLE_LEAD_ID ||
  '00000000-0000-0000-0000-000000000001'

export const DEV_ROUTE_LINKS: DevRouteLink[] = [
  // CRM
  { label: 'Dashboard', href: '/', category: 'CRM' },
  { label: 'Leads List', href: '/leads', category: 'CRM' },
  { label: 'Pending Leads', href: '/leads/pending', category: 'CRM' },
  {
    label: 'Lead Detail',
    href: `/leads/${SAMPLE_LEAD_ID}`,
    category: 'CRM',
    note: 'Set NEXT_PUBLIC_DEV_SAMPLE_LEAD_ID or create a lead first',
  },
  { label: 'Targets', href: '/targets', category: 'CRM' },
  { label: 'Settings', href: '/settings', category: 'CRM' },
  { label: 'Voice & Audio', href: '/settings/voice', category: 'CRM' },

  // Auth
  { label: 'Login', href: '/login', category: 'Auth' },
  { label: 'Register', href: '/register', category: 'Auth' },
  { label: 'Forgot Password', href: '/forgot-password', category: 'Auth' },
  { label: 'Reset Password', href: '/reset-password', category: 'Auth' },
  { label: 'Verify Email', href: '/verify-email', category: 'Auth' },

  // Chat
  { label: 'Chat Widget Demo', href: '/chat-widget-demo', category: 'Chat' },

  // Embed
  { label: 'Embed Chat', href: '/embed/chat', category: 'Embed' },

  // Docs
  { label: 'API Reference', href: 'http://localhost:8000/docs', category: 'Docs' },
  { label: 'Health Check', href: 'http://localhost:8000/health', category: 'Docs' },
]

export const DEV_ROUTE_CATEGORIES = ['CRM', 'Auth', 'Chat', 'Embed', 'Docs'] as const
