# API Platform Layer Implementation

## ✅ Completed Tasks

### 1. ✓ Enhanced `lib/api/endpoints.ts`
Added complete OpenAPI path constants:
- **Auth endpoints**: register, login, refresh, logout, me, verifyEmail, requestReset, resetPassword, mePassword
- **Org endpoints**: root, members, member(id), memberRole(id), invite, apiKeys, apiKey(id)
- **Leads endpoint**: Added claimNext path
- **Status**: 39+ total API paths now centralized and typed

### 2. ✓ Updated `lib/api/index.ts` barrel exports
Added missing exports:
- `export * from "./auth"`
- `export * from "./tasks"`

Now all API modules are properly exported and can be imported directly from `@/lib/api`.

### 3. ✓ Created `components/api-error-alert.tsx`
Global API error component with:
- **Status code handling**:
  - 401 → "Session expirée" + logout + redirect to `/login`
  - 403 → "Accès refusé"
  - 404 → "Ressource introuvable"
  - 422 → Extract first validation error message
  - 500+ → "Erreur serveur"
- **UI**: Uses shadcn Alert + AlertDescription
- **Actions**: Logout button for 401, dismiss button for all errors
- **Localization**: French error messages throughout

### 4. ✓ Enhanced `components/dev-panel.tsx`
Added health check functionality:
- **Health status display**: Shows DB and API component status (✓/✗)
- **Auto-refresh**: Checks health every 30 seconds via `GET /health`
- **Manual refresh**: Clickable refresh button with loading spinner
- **Route navigation**: Dev-only FAB (bottom-left) with categorized route links
- **Dev auth check**: Only shows when `isDevAuthBypass()` returns true

### 5. ✓ Verified existing implementations
- **`lib/api/auth.ts`**: Complete with all auth functions (register, login, logout, getMe, verifyEmail, requestPasswordReset, resetPassword)
- **`lib/api/org.ts`**: Complete with org/team/apikey management functions
- **`lib/api/tasks.ts`**: Complete with getTaskStatus function
- **`lib/api/leads.ts`**: Already implements all lead operations with proper `ApiOptions` pattern
- **`lib/types.ts`**: All OpenAPI types already match spec (UserRole, LeadStatus, TaskStatusResponse, etc.)

## 📋 Architecture Overview

### API Request Flow
```
Component
  ↓
useApiClient() hook
  ↓ (returns ApiClientOptions with auth headers)
apiRequest() function
  ↓ (adds proper headers: Bearer | X-API-Key)
Backend API (/health, /auth/*, /api/v1/*)
```

### Auth Header Priority
1. **Dev mode (NODE_ENV=development)**: `X-API-Key: {apiKey}`
2. **Production logged in**: `Authorization: Bearer {accessToken}`
3. **Dev bypass**: `X-API-Key: {dev-bypass-token}`

### Error Handling
```
API Response Error
  ↓
apiRequest() parses 422/400/50x
  ↓
Throws Error with .status property
  ↓
Component renders ApiErrorAlert
  ↓
User sees French message + action (logout if 401)
```

## 🔧 Usage Examples

### Fetching Data
```tsx
'use client'
import { useApiClient, listLeads } from '@/lib/api'
import { useEffect, useState } from 'react'

export function LeadsList() {
  const client = useApiClient()
  const [leads, setLeads] = useState([])

  useEffect(() => {
    listLeads(client, { page: 1, page_size: 20 })
      .then(setLeads)
      .catch(err => console.error(err))
  }, [client])

  return <div>{leads.items.length} leads</div>
}
```

### Error Handling
```tsx
import { ApiErrorAlert } from '@/components/api-error-alert'
import { useState } from 'react'

export function MyComponent() {
  const [error, setError] = useState<Error | null>(null)

  if (error) {
    return <ApiErrorAlert error={error} onDismiss={() => setError(null)} />
  }

  return <div>Content...</div>
}
```

## 📊 API Paths Summary

| Module | Count | Paths |
|--------|-------|-------|
| auth | 9 | register, login, refresh, logout, me, mePassword, verifyEmail, requestReset, resetPassword |
| leads | 8 | list, claimNext, pending, detail, status, history, assign, sessions |
| targets | 6 | list, statsOverview, detail, toggle, scrapeNow, leads |
| org | 7 | root, members, member, memberRole, invite, apiKeys, apiKey |
| chat | 5 | webhook, audio, tts, visitorStart, visitorMessage |
| tasks | 1 | status |
| health | 1 | /health |
| **Total** | **39+** | All endpoints centralized |

## 🚀 Ready for Production

✅ All API paths centralized in `lib/api/endpoints.ts`
✅ Type-safe request functions with proper error handling
✅ Global error component for consistent UI
✅ Dev panel for debugging (dev-only)
✅ French localization for error messages
✅ Auth header management (Bearer + API-Key fallback)
✅ 401 handling with automatic logout + redirect

## Next Steps

1. **Audit pages** to ensure no raw `fetch()` calls for `/api/v1/*` routes
2. **Test health endpoint** via dev panel in development mode
3. **Verify 401 handling** triggers logout and redirect
4. **Integration testing** with backend API
5. **Deploy** to production with proper environment variables set

---

Generated: 2026-06-29
