# Architecture — Lead Detail & Queue

Visual reference for component structure and data flow.

## Component Hierarchy

### Lead Detail Page (`/app/leads/[id]`)

```
LeadDetailPage
├── PageHeader (title + description)
├── Navigation
│   ├── Back button
│   └── Action buttons (Assign, Delete)
├── Lead Header (phone number + copy)
├── Delete Confirmation Alert (conditional)
│
└── 3-Column Grid (lg:col-span-4)
    │
    ├── LEFT SIDEBAR (1 col)
    │   ├── Card: StatusTransitionSelect
    │   │   ├── Current status with icon
    │   │   ├── Status dropdown (valid transitions only)
    │   │   └── AlertDialog
    │   │       ├── Confirmation message
    │   │       ├── Notes textarea
    │   │       └── Buttons (Cancel, Confirm)
    │   │
    │   ├── Card: Lead Identity
    │   │   ├── Company name
    │   │   ├── Website domain link
    │   │   ├── Assigned agent
    │   │   ├── Call attempts
    │   │   └── Last called timestamp
    │   │
    │   ├── Card: CrmDeliveryBadge (conditional)
    │   │   ├── Success state (green)
    │   │   ├── Error state (red)
    │   │   └── Pending state (amber)
    │   │
    │   ├── Card: Qualification Score
    │   │   └── Progress bar (0-100%)
    │   │
    │   └── QualificationPanel (existing)
    │
    │
    └── MAIN CONTENT (3 cols)
        ├── Tabs
        │   ├── TabsList
        │   │   ├── "Aperçu" trigger
        │   │   ├── "Historique" trigger
        │   │   └── "Chat" trigger
        │   │
        │   ├── TabsContent "overview"
        │   │   └── Card: Notes Section
        │   │       ├── Display previous notes
        │   │       ├── Textarea (auto-save)
        │   │       └── Saving indicator
        │   │
        │   ├── TabsContent "history"
        │   │   └── Card: StatusHistoryTimeline
        │   │       ├── Timeline dot + line visualization
        │   │       ├── History entry cards
        │   │       └── Empty state (if no history)
        │   │
        │   └── TabsContent "chat"
        │       └── Card: Chat Section
        │           ├── Session selector dropdown
        │           ├── Close session button (if active)
        │           ├── Intent detected badge
        │           ├── Chat history display
        │           └── Loading state
        │
        └── AssignLeadDialog (conditional render)
            ├── Agent name input
            ├── Notes textarea
            └── Buttons (Cancel, Assign)
```

## Pending Queue Page (`/app/leads/pending`)

```
PendingLeadsPage
├── PageHeader (title + lead count)
│
└── Conditional rendering
    │
    ├── IF empty:
    │   └── Empty State Card
    │       ├── Inbox icon
    │       ├── "File d'attente vide" message
    │       └── Back to leads button
    │
    └── IF has leads:
        └── Stack of Lead Cards
            └── For each lead:
                ├── Phone number + icon
                ├── Company name + domain
                ├── Created timestamp
                └── "Prendre" button (claim)
```

## Data Flow

### Status Transition Flow

```
User clicks status dropdown
    ↓
StatusTransitionSelect validates (VALID_TRANSITIONS check)
    ↓
If valid, show AlertDialog for confirmation
    ↓
User enters optional notes and clicks Confirm
    ↓
Call onStatusChange(newStatus, notes)
    ↓
LeadDetailPage.handleUpdateStatus()
    ↓
API: updateLeadStatus(api, leadId, { status, notes })
    ↓
PATCH /api/v1/leads/{id}/status
    ↓
[Backend validates transition, creates HistoryEntry]
    ↓
Returns updated Lead object
    ↓
Update state: setLead(response)
    ↓
Show toast: "Statut changé en [status]"
    ↓
Dialog closes
    ↓
UI updates with new status
```

### Auto-Save Notes Flow

```
User types in notes textarea
    ↓
onChange handler called
    ↓
Clear existing debounce timer
    ↓
Set "Enregistrement en cours..." indicator
    ↓
New timer set for 500ms
    ↓
Wait 500ms with no more changes
    ↓
Call API: updateLead(api, leadId, { notes })
    ↓
PATCH /api/v1/leads/{id}
    ↓
[Backend updates lead]
    ↓
Returns updated Lead
    ↓
Update state: setLead(response)
    ↓
Show toast: "Note enregistrée"
    ↓
Clear textarea
    ↓
Hide "Enregistrement en cours..." indicator
```

### History Load Flow

```
StatusHistoryTimeline mounts
    ↓
useEffect triggers with leadId dependency
    ↓
API: getLeadHistory(api, leadId)
    ↓
GET /api/v1/leads/{id}/history
    ↓
[Backend returns HistoryEntry array]
    ↓
Sort by created_at (newest first)
    ↓
Update state: setEntries(sorted)
    ↓
Render timeline with:
├── Dot + line for each entry
├── Status transition label
├── User and timestamp
└── Reason/notes if present
```

### Lead Assignment Flow

```
User clicks "Assigner" button
    ↓
setIsAssignDialogOpen(true)
    ↓
AssignLeadDialog renders
    ↓
User enters agent name
    ↓
User enters optional notes
    ↓
User clicks Confirm
    ↓
Call handleAssign(agent, notes)
    ↓
LeadDetailPage.handleAssignLead()
    ↓
API: assignLead(api, leadId, agent, notes)
    ↓
POST /api/v1/leads/{id}/assign?agent={agent}&notes={notes}
    ↓
[Backend updates assigned_to, creates HistoryEntry]
    ↓
Returns updated Lead
    ↓
Update state: setLead(response)
    ↓
Show toast: "Lead assigné à [agent]"
    ↓
Dialog closes
    ↓
UI updates with new assignee
```

### Queue Claim Flow

```
User views pending queue page
    ↓
Component mounts, loads leads
    ↓
API: listPendingLeads(api, 50)
    ↓
GET /api/v1/leads/pending?limit=50
    ↓
[Backend returns Lead[] with status='nouveau']
    ↓
Update state: setLeads(response)
    ↓
Render lead cards in list
    ↓
User clicks "Prendre" button on a lead
    ↓
Set claimingId state (show loading)
    ↓
API: claimNextLead(api)
    ↓
POST /api/v1/leads/claim-next
    ↓
[Backend claims lead, updates assigned_to]
    ↓
Show toast: "Lead réclamé avec succès"
    ↓
Router.push(`/leads/${leadId}`)
    ↓
Navigate to detail page
```

## State Management

### LeadDetailPage State

```
Interface LeadDetailState {
  lead: LeadDetailResponse | null                    // Main lead data
  sessionSummaries: ChatSessionSummary[]             // List of sessions
  selectedSession: ChatSession | null                // Selected chat
  selectedSessionId: string | null                   // Selected session ID
  loading: boolean                                   // Initial load
  error: string | null                               // Error message
  newNote: string                                    // Notes textarea value
  isDeleting: boolean                                // Delete operation
  showDeleteConfirm: boolean                         // Delete confirmation
  sessionLoading: boolean                            // Chat load
  isUpdatingStatus: boolean                          // Status update
  isAssignDialogOpen: boolean                        // Assign dialog
  isNoteSaving: boolean                              // Note save
  notesSaveTimeout: NodeJS.Timeout | null            // Debounce timer
}
```

### PendingLeadsPage State

```
Interface PendingLeadsState {
  leads: Lead[]                                      // Pending leads list
  loading: boolean                                   // Initial load
  error: string | null                               // Error message
  claimingId: string | null                          // Claiming lead ID
}
```

## API Calls

### Used from Lead Detail:

```
getLead(api, leadId)
→ GET /api/v1/leads/{id}

updateLeadStatus(api, leadId, { status, notes })
→ PATCH /api/v1/leads/{id}/status

getLeadHistory(api, leadId)
→ GET /api/v1/leads/{id}/history

updateLead(api, leadId, { notes })
→ PATCH /api/v1/leads/{id}

assignLead(api, leadId, agent, notes)
→ POST /api/v1/leads/{id}/assign

listChatSessions(api, leadId)
→ GET /api/v1/leads/{id}/sessions

getChatSession(api, leadId, sessionId)
→ GET /api/v1/leads/{leadId}/sessions/{sessionId}

closeChatSession(api, leadId, sessionId)
→ POST /api/v1/leads/{leadId}/sessions/{sessionId}/close

deleteLead(api, leadId)
→ DELETE /api/v1/leads/{id}
```

### Used from Pending Queue:

```
listPendingLeads(api, limit)
→ GET /api/v1/leads/pending?limit={limit}

claimNextLead(api)
→ POST /api/v1/leads/claim-next
```

## Error Boundaries

### Status Transition Errors

```
User attempts invalid transition
    ↓
API returns 422 Unprocessable Entity
    ↓
Component catches error
    ↓
Check if error includes "422" or "transition"
    ↓
Show toast: "Transition invalide: cette action n'est pas autorisée"
    ↓
Dialog remains open
    ↓
User can try again or cancel
```

### Auto-Save Note Errors

```
Debounce timer fires
    ↓
API call made
    ↓
Error occurs
    ↓
Show toast: "Erreur lors de l'enregistrement"
    ↓
Keep note in textarea (don't clear)
    ↓
Try again on next keystroke + 500ms
```

### History Load Errors

```
Component mounts
    ↓
API call fails
    ↓
Catch error
    ↓
Update state: setError(message)
    ↓
Render error alert
    ↓
Show user-friendly message
    ↓
User can retry by revisiting tab
```

## Performance Optimizations

### 1. Debounced Auto-Save
- Prevents excessive API calls
- 500ms delay before saving
- Clears previous timeout on each keystroke

### 2. Lazy Tab Loading
- History only fetches when tab clicked
- Chat sessions only fetch when selected
- Doesn't load all data upfront

### 3. Conditional Rendering
- CRM badge only renders if data present
- Delete confirmation hidden until needed
- Dialog only renders when open

### 4. Memoization
- useCallback for handlers (prevents recreates)
- Dependencies properly specified

## Accessibility Features

- Semantic HTML structure
- ARIA labels on interactive elements
- Alert roles for important messages
- Proper button semantics
- Keyboard navigation support
- Color + icons (not color alone)
- Sufficient color contrast
- Focus management in dialogs

## Dark Mode Support

All components support dark mode via:
- `dark:` Tailwind classes
- Semantic color tokens (bg-background, text-foreground)
- Proper contrast ratios
- No hardcoded colors

---

**Last Updated:** June 28, 2026
