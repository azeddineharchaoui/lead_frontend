'use client';

import { AlertCircle, LogOut } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ApiErrorAlertProps {
  error: Error & { status?: number; code?: string; headers?: HeadersInit };
  onDismiss?: () => void;
}

export function ApiErrorAlert({ error, onDismiss }: ApiErrorAlertProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const status = error.status || 500;
  const message = error.message || 'Une erreur est survenue';

  let title = 'Erreur API';
  let description = message;
  let action: (() => void) | null = null;

  // Parse validation errors (422)
  if (status === 422) {
    try {
      const parsed = JSON.parse(message);
      if (Array.isArray(parsed.detail)) {
        const firstError = parsed.detail[0];
        description = firstError?.msg || 'Erreur de validation';
      }
    } catch {
      // Fallback to raw message
    }
  }

  // Handle specific status codes
  switch (status) {
    case 401:
      title = 'Session expirée';
      description = 'Votre session a expiré. Veuillez vous reconnecter.';
      action = async () => {
        await logout();
        router.push('/login');
      };
      break;
    case 403:
      title = 'Accès refusé';
      description = 'Vous n\'avez pas les permissions pour accéder à cette ressource.';
      break;
    case 404:
      title = 'Ressource introuvable';
      description = 'La ressource demandée n\'existe pas ou a été supprimée.';
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      title = 'Erreur serveur';
      description = `Une erreur serveur s'est produite (${status}). Veuillez réessayer plus tard.`;
      break;
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p>{description}</p>
        <div className="flex gap-2">
          {action && (
            <button
              onClick={action}
              className="text-xs font-medium underline hover:no-underline flex items-center gap-1"
            >
              <LogOut className="h-3 w-3" />
              Se reconnecter
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-xs font-medium underline hover:no-underline"
            >
              Fermer
            </button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
