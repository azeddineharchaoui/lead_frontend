# Frontend Prompt 5 — Lead Detail & Agent Workflow Implementation

## Overview

This document summarizes the implementation of the Lead Detail page and Agent Workflow features for the Lead.ma CRM frontend. All components follow the spec requirements with enforced state machine transitions, auto-saving notes, CRM delivery tracking, and a comprehensive audit history system.

## Components Created

### 1. **StatusTransitionSelect** (`/components/leads/status-transition-select.tsx`)

A state machine-enforced dropdown for lead status transitions.

**Features:**
- Valid transitions based on current status:
  - `nouveau` → `en_cours`, `rejete`
  - `en_cours` → `qualifie`, `rejete`, `nouveau`
  - `qualifie` → `en_cours`
  - `rejete` → `nouveau`
- Confirmation dialog with optional notes
- Visual indicators with icons and colors per status
- Error handling for invalid transitions (422 response)

**Props:**
- `currentStatus`: Current lead status
- `onStatusChange`: Async callback for status change
- `isLoading`: Loading state indicator

### 2. **StatusHistoryTimeline** (`/components/leads/status-history-timeline.tsx`)

Visual timeline of all status changes with audit trail.

**Features:**
- Chronological timeline (newest first)
- Shows: from/to status, timestamp, changed_by user, reason/notes
- Displays qualification scores if present
- Animated loading state
- Error boundary with user-friendly messages
- Empty state handling

**Data Structure:**
Each `HistoryEntry` includes:
- `id`: Unique entry ID
- `from_status`: Previous status (null for creation)
- `to_status`: New status
- `changed_by`: User who made the change
- `reason`: Change reason/notes
- `extra_data`: Additional context (qualification_score, etc.)
- `created_at`: Timestamp

### 3. **CrmDeliveryBadge** (`/components/leads/crm-delivery-badge.tsx`)

Status indicator for CRM delivery/synchronization.

**Features:**
- Three states:
  - **Success** (green): Shows when `crm_pushed_at` is set
  - **Error** (red): Shows error message when `crm_last_error` is set
  - **Pending** (amber): Shows attempt count while syncing
- Relative timestamps using `formatRelativeTime`
- Error details and retry count display

**Props:**
- `crm_pushed_at`: Timestamp of successful push
- `crm_last_error`: Error message if failed
- `crm_push_attempts`: Current attempt count

### 4. **AssignLeadDialog** (`/components/leads/assign-lead-dialog.tsx`)

Dialog for assigning/reassigning a lead to an agent.

**Features:**
- Agent name input field
- Optional notes textarea
- Confirmation dialog pattern
- Displays current assignee if exists
- Submit only enabled when agent name provided
- Loading state during submission

**Props:**
- `open`: Dialog visibility
- `onOpenChange`: Dialog state callback
- `currentAssignedTo`: Current assignee name
- `onAssign`: Async callback with (agent, notes) params

### 5. **Rebuilt Lead Detail Page** (`/app/leads/[id]/page.tsx`)

Complete redesign with 3-column layout and tabbed interface.

**Layout:**
- **Left Sidebar (1 col):**
  - Status transition selector
  - Lead identity card (company, domain, assigned agent)
  - CRM delivery status
  - Qualification score progress bar
  - Qualification panel

- **Main Content (3 cols) - Tabbed:**
  - **Overview Tab:**
    - Notes section with auto-save (debounced 500ms)
  - **History Tab:**
    - Status change timeline with full audit trail
  - **Chat Tab:**
    - Chat session selector
    - Conversation display
    - Intent detection results
    - Session close button for active sessions

**Features:**
- Back button navigation with `useRouter`
- Copy-to-clipboard for phone number
- Delete lead with confirmation
- Assign lead button
- Phone number display with formatting
- Responsive grid layout

**State Management:**
- Lead detail data
- Chat session selection and loading
- Auto-save notes with debouncing
- Delete confirmation state
- Status update loading state

### 6. **Pending Queue Page** (`/app/leads/pending/page.tsx`)

FIFO queue interface for new leads awaiting assignment.

**Features:**
- List of pending leads (max 50)
- Each lead card shows:
  - Phone number with formatting
  - Company name and domain
  - Creation timestamp (relative)
- "Prendre" (Claim) button for each lead
- Navigates to detail page on claim
- Empty state with icon and message
- Error handling with alert

**Data Source:**
Calls `listPendingLeads(api, 50)` which is a GET to `/api/v1/leads/pending?limit=50`

## Types Added

New types in `/lib/types.ts`:

```typescript
// CRM push tracking fields
crm_pushed_at?: string | null;
crm_push_attempts?: number;
crm_last_error?: string | null;

// Status change audit entry
interface HistoryEntry {
  id: string;
  from_status: string | null;
  to_status: string;
  changed_by: string | null;
  reason: string | null;
  extra_data: Record<string, unknown> | null;
  created_at: string;
}

// Update payload
interface LeadStatusUpdate {
  status: LeadStatus;
  notes?: string | null;
}

interface LeadUpdate {
  notes?: string | null;
  company_name?: string | null;
  assigned_to?: string | null;
}
```

## API Functions Added

New functions in `/lib/api/leads.ts`:

```typescript
// Get status change history for a lead
export async function getLeadHistory(
  ctx: ApiOptions,
  leadId: string,
): Promise<HistoryEntry[]>

// Update lead notes/company/assignment
export async function updateLead(
  ctx: ApiOptions,
  leadId: string,
  data: Partial<LeadUpdate>,
): Promise<Lead>

// Assign lead to agent with notes
export async function assignLead(
  ctx: ApiOptions,
  leadId: string,
  agent: string,
  notes?: string,
): Promise<Lead>
```

## API Endpoints Added

New endpoints in `/lib/api/endpoints.ts`:

```typescript
history: (id: string) => `/api/v1/leads/${id}/history`,
assign: (id: string) => `/api/v1/leads/${id}/assign`,
```

## Utilities Used

Existing utilities from `/lib/format.ts`:

- `formatPhoneDisplay()`: Formats E.164 phone numbers
- `formatRelativeTime()`: Relative time formatting (e.g., "Il y a 2h")
- `copyToClipboard()`: Copy text with fallback

## UI Components Added/Updated

- **shadcn/ui components:**
  - `AlertDialog` (newly added via CLI)
  - `Tabs` (already existing)
  - `Card`, `Button`, `Textarea`, `Alert`
  - `Input`, `Label` (newly added)

## Design Patterns

### State Machine Pattern

The `StatusTransitionSelect` component enforces valid transitions:

```typescript
const VALID_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  nouveau: ['en_cours', 'rejete'],
  en_cours: ['qualifie', 'rejete', 'nouveau'],
  qualifie: ['en_cours'],
  rejete: ['nouveau'],
}
```

Invalid transitions trigger a 422 error from the backend, caught and displayed to user.

### Auto-Save Pattern

Notes use debounced auto-save:

```typescript
const handleAutoSaveNotes = useCallback((notes: string) => {
  if (notesSaveTimeout) clearTimeout(notesSaveTimeout)
  
  setIsNoteSaving(true)
  const timeout = setTimeout(async () => {
    // Save after 500ms of inactivity
    const updated = await updateLead(api, lead.id, { notes })
    setLead({ ...lead, ...updated })
    setIsNoteSaving(false)
  }, 500)
  
  setNotesSaveTimeout(timeout)
}, [lead, api, notesSaveTimeout])
```

### Timeline Pattern

The history timeline uses a left-side dot-and-line visual:
- Dot represents the status change point
- Vertical line connects consecutive entries
- Content card shows details

## Error Handling

- Invalid status transitions: Display specific 422 error
- API errors: Show toast notification with error message
- Missing lead: Alert with "Lead not found"
- Network errors: Graceful fallback messages

## Accessibility Features

- Semantic HTML structure
- ARIA labels and roles
- Screen reader friendly descriptions
- Keyboard navigation support
- Alert role for important messages
- Proper heading hierarchy

## Testing Checklist

- [ ] Status transitions work with confirmation dialog
- [ ] Invalid transitions show error message
- [ ] Notes auto-save after 500ms inactivity
- [ ] History timeline loads and displays correctly
- [ ] CRM delivery badge shows correct status
- [ ] Assign dialog pops up and submits properly
- [ ] Phone number copy button works
- [ ] Delete confirmation requires explicit confirmation
- [ ] Pending queue loads and claim button navigates
- [ ] Chat history displays with timestamps
- [ ] Intent detection shows with confidence score
- [ ] Responsive layout works on mobile/tablet
- [ ] No console errors or missing components

## Future Enhancements

- Real-time updates via WebSocket
- Bulk status updates
- Advanced filtering on queue page
- Search/filter on pending leads
- Integration with phone system for direct calling
- Qualification questionnaire UI
- Custom fields support
- Lead source tracking enhancements
