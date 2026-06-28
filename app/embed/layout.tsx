import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lead.ma Widget',
  description: 'Chat Widget',
  robots: 'noindex,nofollow',
}

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="m-0 p-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
        {children}
      </body>
    </html>
  )
}
