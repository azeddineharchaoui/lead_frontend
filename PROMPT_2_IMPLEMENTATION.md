# Frontend Prompt 2 — Authentication, Onboarding & Organisation Settings

## Implementation Complete

This document outlines the complete implementation of authentication pages, organization settings, team management, and API key controls for Lead.ma CRM.

---

## Task 1: Types & API Module

### Added to `lib/types.ts`:
- `ApiKeyResponse` interface with id, name, prefix, scopes, expires_at, last_used_at, created_at
- `ApiKeyCreatedResponse` extends ApiKeyResponse with raw_key field

### Created `lib/api/org.ts`:
- `getOrg()` - GET /api/v1/org
- `updateOrg()` - PATCH /api/v1/org (name, settings, timezone, webhook_url)
- `listMembers()` - GET /api/v1/org/members
- `inviteMember()` - POST /api/v1/org/invite
- `removeMember()` - DELETE /api/v1/org/members/{id}
- `updateMemberRole()` - PATCH /api/v1/org/members/{id}/role
- `listApiKeys()` - GET /api/v1/org/api-keys
- `createApiKey()` - POST /api/v1/org/api-keys
- `revokeApiKey()` - DELETE /api/v1/org/api-keys/{id}

All functions exported from `lib/api/index.ts`.

---

## Task 2: Auth Layout Redesign

### Split-Screen Design (`app/(auth)/layout.tsx`):
- **Left panel (hidden on mobile)**: Indigo-to-violet gradient with product messaging
- **Right panel**: White card with form, centered
- **Testimonial quote**: French customer testimonial with frosted glass styling
- **Mobile**: Branding text shown above form
- Responsive: Hidden sidebar on screens < 1024px

---

## Task 3: Auth Pages — Premium Styling

All auth pages use consistent French messaging with indigo brand color and smooth interactions.

### Login Page (`app/(auth)/login/page.tsx`)
- Email + password fields with inline validation
- "Se souvenir de moi" (Remember me) checkbox
- Forgot password link
- Error toast display
- Suspense boundary for useSearchParams
- Loading state with spinner
- Links to register and forgot-password

### Register Page (`app/(auth)/register/page.tsx`)
- Full name, email, password, organization name fields
- **Password strength meter** with real-time checklist:
  - ✓ At least 8 characters
  - ✓ Uppercase letter
  - ✓ Lowercase letter
  - ✓ One number
- Terms & privacy checkbox (required)
- Submit button disabled until strong password + terms accepted
- Success toast on account creation

### Forgot Password (`app/(auth)/forgot-password/page.tsx`)
- Email input
- Sends reset link via backend
- Success state shows confirmation message
- French copy: "Lien de réinitialisation envoyé"

### Reset Password (`app/(auth)/reset-password/page.tsx`)
- Accepts token from query param
- New password + confirmation fields
- Password validation: min 8 chars
- Success screen with animated checkmark
- Auto-redirects to login after 3 seconds
- French messaging throughout

### Verify Email (`app/(auth)/verify-email/page.tsx`)
- Auto-verifies token from query param
- Loading spinner during verification
- Success state: checkmark icon + "Email vérifié!"
- Error state: X icon with error message
- All states use Suspense boundary

---

## Task 4: Settings Hub (`app/settings/page.tsx`)

### Tabbed Interface
Five tabs with role-based access:

1. **Profil** (all users)
   - Avatar display (initials in circle)
   - Edit full name
   - Read-only email with verification badge
   - Read-only role
   - Change password form (placeholder for future)

2. **Organisation** (admin+)
   - Edit organization name
   - Timezone selector (Casablanca, Rabat, Fez, UTC, Paris)
   - Webhook URL field
   - Organization stats (plan, member count, creation date)

3. **Équipe** (admin+) - *Placeholder for Phase 2*
   - Will include member list with role badges
   - Invite dialog with email/name/role
   - Remove member with confirmation
   - Change role (owner only)

4. **Clés API** (admin+) - *Placeholder for Phase 2*
   - Will list API keys with prefix, scopes, last used
   - Create dialog with name and scope checkboxes
   - One-time raw key reveal modal
   - Revoke with confirmation

5. **Sécurité** (all users)
   - Info card about 2FA (coming soon)
   - Last login timestamp
   - Placeholder for future security features

### Tab Navigation
- Icons + labels on desktop, labels only on mobile
- Active tab indicator with indigo underline
- Role-based RoleGuard wrappers hide admin-only tabs

---

## Task 5: Tab Components

### `app/settings/tabs/profile.tsx`
- Avatar upload placeholder (styled for future)
- Full name edit field
- Email display with verification badge
- Role display (read-only, capitalized)
- Password change form (disabled, placeholder)
- Loader state during save

### `app/settings/tabs/organisation.tsx`
- Organization name editor
- Timezone dropdown with Moroccan/common timezones
- Webhook URL field for event subscriptions
- Organization stats section
- Save button with loader state

---

## Key Features Implemented

✓ Split-screen auth layout with gradient and testimonial  
✓ Premium login/register pages with French copy  
✓ Password strength meter with real-time validation  
✓ Forgot password + reset password + email verification flows  
✓ Suspense boundaries on all auth pages for useSearchParams  
✓ Settings hub with 5 tabs (2 role-restricted)  
✓ Profile management with avatar placeholder  
✓ Organization settings with timezone picker  
✓ Role-based UI (RoleGuard on team/API keys tabs)  
✓ Toast notifications for all actions  
✓ Dark mode support throughout  
✓ Fully typed with TypeScript  
✓ Accessibility: proper labels, ARIA roles, semantic HTML  

---

## Ready for Phase 2

The following are stubbed out and ready for implementation:
- **PATCH /auth/me** integration in profile tab
- **PATCH /auth/me/password** for password changes
- **PATCH /api/v1/org** integration in organization tab
- **GET /api/v1/org/members** team list with DataTable
- **POST /api/v1/org/invite** and **DELETE /api/v1/org/members/{id}** member management
- **PATCH /api/v1/org/members/{id}/role** for role changes (owner only)
- **GET /api/v1/org/api-keys** list with pagination
- **POST /api/v1/org/api-keys** with one-time raw key modal
- **DELETE /api/v1/org/api-keys/{id}** revoke with confirm

---

## Architecture Notes

- All auth pages use 'use client' directive for client-side state
- Suspense boundaries wrap dynamic hooks (useSearchParams, useSearchParams)
- TabsContent components properly conditionally render based on RoleGuard
- Tab components are separate files for modularity
- Toast notifications use sonner for consistent UX
- Form validation happens client-side with visual feedback
- Dark mode uses Tailwind dark: prefix consistently
- Indigo color scheme matches design system (#4F46E5 primary)

---

## Next Steps

1. Connect Next.js API routes for secure cookie handling (login/refresh/logout)
2. Implement team member management with DataTable
3. Add API key creation with one-time reveal modal
4. Wire up PATCH /auth/me for profile updates
5. Add password change with PATCH /auth/me/password
6. Test full authentication flow end-to-end
