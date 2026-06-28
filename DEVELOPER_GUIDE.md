# Developer Guide — Lead Detail & Queue

Quick reference for the Lead Detail and Queue features.

## File Structure

```
/app/leads/
  [id]/
    page.tsx                           # Lead detail page (3-col layout + tabs)
  /pending/
    page.tsx                           # Pending queue page (FIFO list)

/components/leads/
  status-transition-select.tsx         # Status dropdown with state machine
  status-history-timeline.tsx          # Audit trail timeline
  crm-delivery-badge.tsx               # CRM sync status indicator
  assign-lead-dialog.tsx               # Assign lead dialog
  QualificationPanel.tsx               # (existing)
  leads-data-table.tsx                 # (existing)
  leads-filter-bar.tsx                 # (existing)
  leads-pagination.tsx                 # (existing)

/lib/
  types.ts                             # HistoryEntry, LeadUpdate types
  api/
    leads.ts                           # getLeadHistory, updateLead, assignLead
    endpoints.ts                       # API routes for history, assign
  format.ts                            # Phone, time formatting utilities
```

## Usage Examples

### Use StatusTransitionSelect in a component

```tsx
import { StatusTransitionSelect } from '@/components/leads/status-transition-select'
import { updateLeadStatus } from '@/lib/api'

export function MyComponent() {
  const [lead, setLead] = useState<LeadDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusChange = async (status: LeadStatus, notes?: string) => {
    setIsLoading(true)
    try {
      const updated = await updateLeadStatus(api, lead.id, { status, notes })
      setLead({ ...lead, ...updated })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <StatusTransitionSelect
      currentStatus={lead.status}
      onStatusChange={handleStatusChange}
      isLoading={isLoading}
    />
  )
}
```

### Display status history timeline

```tsx
import { StatusHistoryTimeline } from '@/components/leads/status-history-timeline'

export function HistoryPanel() {
  return <StatusHistoryTimeline leadId={leadId} />
}
```

### Show CRM delivery status

```tsx
import { CrmDeliveryBadge } from '@/components/leads/crm-delivery-badge'

export function LeadCard({ lead }: { lead: Lead }) {
  return (
    <CrmDeliveryBadge
      crm_pushed_at={lead.crm_pushed_at}
      crm_last_error={lead.crm_last_error}
      crm_push_attempts={lead.crm_push_attempts}
    />
  )
}
```

### Open assign dialog

```tsx
import { AssignLeadDialog } from '@/components/leads/assign-lead-dialog'
import { assignLead } from '@/lib/api'

export function LeadActions() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [lead, setLead] = useState<Lead | null>(null)

  const handleAssign = async (agent: string, notes?: string) => {
    const updated = await assignLead(api, lead.id, agent, notes)
    setLead({ ...lead, ...updated })
  }

  return (
    <>
      <button onClick={() => setIsDialogOpen(true)}>Assign</button>
      <AssignLeadDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        currentAssignedTo={lead?.assigned_to}
        onAssign={handleAssign}
      />
    </>
  )
}
```

### Load pending leads

```tsx
import { listPendingLeads } from '@/lib/api'
import type { Lead } from '@/lib/types'

async function getPendingQueue() {
  const leads = await listPendingLeads(api, 50)
  // leads: Lead[]
}
```

### Get status history

```tsx
import { getLeadHistory } from '@/lib/api'
import type { HistoryEntry } from '@/lib/types'

async function getAuditTrail(leadId: string) {
  const entries = await getLeadHistory(api, leadId)
  // entries: HistoryEntry[]
}
```

## State Machine Rules

Valid transitions for lead status:

```
nuevo
├─ en_cours (start work)
└─ rejete (reject immediately)

en_cours
├─ qualifie (lead is good)
├─ rejete (lead is bad)
└─ nuevo (reopen)

qualifie
└─ en_cours (needs more work)

rejete
└─ nuevo (reconsider)
```

If an invalid transition is attempted:
1. Backend returns 422 (Unprocessable Entity)
2. Component catches error and displays toast: "Transition invalide: cette action n'est pas autorisée"
3. Status doesn't change

## Auto-Save Notes

Notes auto-save after **500ms of inactivity**:

1. User types in textarea
2. `handleAutoSaveNotes` is called
3. Previous timeout cleared
4. New timeout set for 500ms
5. After 500ms with no more changes:
   - Call `updateLead(api, leadId, { notes })`
   - Show "Note enregistrée" toast
   - Clear textarea

If user hasn't typed anything, no save occurs.

## Data Structures

### HistoryEntry

```typescript
{
  id: "hist_123",
  from_status: "nouveau",           // null on creation
  to_status: "en_cours",
  changed_by: "Ahmed Zaidi",
  reason: "Called and confirmed interest",
  extra_data: {
    qualification_score: 85,
    call_duration: 240
  },
  created_at: "2026-06-28T10:30:00Z"
}
```

### LeadUpdatePayload

When updating a lead:

```typescript
// Update notes
await updateLead(api, leadId, { notes: "New note text" })

// Update company name
await updateLead(api, leadId, { company_name: "ABC Corp" })

// Assign to agent
await assignLead(api, leadId, "Ahmed Zaidi", "Reassigned due to workload")
```

## Common Patterns

### Loading State with Skeleton

```tsx
if (loading) {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
    </div>
  )
}
```

### Error Alert

```tsx
if (error) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="w-4 h-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )
}
```

### Phone Number Formatting

```tsx
import { formatPhoneDisplay } from '@/lib/format'

// "+212612345678" → "+212 6 12 34 56 78"
// "612345678" → "06 12 34 56 78"
<span>{formatPhoneDisplay(lead.phone_number)}</span>
```

### Relative Time

```tsx
import { formatRelativeTime } from '@/lib/format'

// "2026-06-28T08:30:00Z" → "Il y a 2h"
<p>{formatRelativeTime(lead.created_at)}</p>
```

### Copy to Clipboard

```tsx
import { copyToClipboard } from '@/lib/format'
import { toast } from 'sonner'

const handleCopy = async () => {
  try {
    await copyToClipboard(lead.phone_number)
    toast.success('Numéro copié')
  } catch (err) {
    toast.error('Erreur de copie')
  }
}
```

## Debugging

### Check valid transitions

If status change fails, verify:

1. Is the transition in `VALID_TRANSITIONS`?
2. Does backend return 422?
3. Check console for error messages

### Timeline not loading

Check:
1. Lead ID is correct
2. API endpoint `/api/v1/leads/{id}/history` exists
3. No network errors in DevTools
4. History entries have required fields

### Notes not saving

Verify:
1. Textarea has text
2. 500ms debounce has elapsed
3. `updateLead` endpoint exists
4. No API errors in console

### Dialog not closing

Check:
1. `onOpenChange` callback is called
2. No error during async operation
3. Dialog state updates after submission

## Testing

Run build to catch TypeScript errors:

```bash
npm run build
```

Start dev server:

```bash
npm run dev
```

Test with real API by logging in and navigating to:
- `/leads/pending` — queue
- `/leads/123` — detail page

## Performance Tips

- Status timeline lazy loads on tab change
- Chat history lazy loads on session select
- Notes debounced to avoid excessive saves
- History limit to 50 leads on queue page

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Module not found" for UI components | Run `npx shadcn@latest add` for missing component |
| Status doesn't change | Check network tab for 422 error, verify transition is valid |
| Notes disappear | Check API response, browser console for errors |
| Timeline empty | Verify history endpoint is returning data |
| Dialog won't close | Check for errors during async submit |
| Phone number formatting wrong | Check E.164 format of input number |
