import { AlertCircle, ShieldAlert } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function EmbedSecurityNotice() {
  return (
    <Card className="p-4 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
          <h3 className="font-semibold text-amber-900 dark:text-amber-100">Sécurité & Bonnes Pratiques</h3>
        </div>

        <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
          <li className="flex gap-2">
            <span className="font-bold text-amber-600 dark:text-amber-400">1.</span>
            <span>
              La <strong>clé publique widget</strong> doit être limitée aux actions:{' '}
              <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded text-xs">create_lead</code>,{' '}
              <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded text-xs">send_message</code>
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-amber-600 dark:text-amber-400">2.</span>
            <span>
              N&apos;utilisez <strong>jamais</strong> votre JWT admin ou clé secrète dans le code client
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-amber-600 dark:text-amber-400">3.</span>
            <span>
              Backend doit configurer <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded text-xs">CORS</code>{' '}
              pour les domaines clients
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-amber-600 dark:text-amber-400">4.</span>
            <span>
              Les données lead sont créées <strong>en temps réel</strong> (API POST), consultables dans le CRM
            </span>
          </li>
        </ul>

        <div className="pt-2 border-t border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Consultez la{' '}
            <a href="#" className="underline hover:text-amber-900 dark:hover:text-amber-100">
              documentation API
            </a>{' '}
            pour plus de détails sur les permissions widget.
          </p>
        </div>
      </div>
    </Card>
  )
}
