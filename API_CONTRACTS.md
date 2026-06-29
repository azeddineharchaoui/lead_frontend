# API Contracts — Lead Detail & Queue

This document specifies the API contracts required for the Lead Detail and Queue features.

## Endpoints

### Get Lead History

```
GET /api/v1/leads/{id}/history
```

**Response:**

```json
[
  {
    "id": "hist_001",
    "from_status": null,
    "to_status": "nouveau",
    "changed_by": null,
    "reason": null,
    "extra_data": null,
    "created_at": "2026-06-28T10:00:00Z"
  },
  {
    "id": "hist_002",
    "from_status": "nouveau",
    "to_status": "en_cours",
    "changed_by": "Ahmed Zaidi",
    "reason": "Called and engaged",
    "extra_data": {
      "call_duration": 240,
      "qualification_score": 85
    },
    "created_at": "2026-06-28T10:30:00Z"
  }
]
```

**Notes:**
- Ordered newest first in response
- `from_status` is null for creation entry
- `extra_data` contains optional context (qualification_score, etc.)
- `changed_by` is null for system-created entries

### Assign Lead

```
POST /api/v1/leads/{id}/assign?agent={agent}&notes={optional}
```

**Query Parameters:**
- `agent` (required): Agent name string
- `notes` (optional): Assignment reason/notes

**Request Body:** None (empty)

**Response:**

```json
{
  "id": "lead_123",
  "phone_number": "+212612345678",
  "source_url": "https://...",
  "company_name": "ABC Corp",
  "notes": "Previous notes...",
  "status": "nouveau",
  "website_domain": "example.com",
  "scraping_target_id": null,
  "call_attempts": 0,
  "last_called_at": null,
  "assigned_to": "Ahmed Zaidi",
  "qualification_score": null,
  "crm_pushed_at": null,
  "crm_push_attempts": 0,
  "crm_last_error": null,
  "created_at": "2026-06-28T10:00:00Z",
  "updated_at": "2026-06-28T10:30:00Z"
}
```

**Errors:**
- 400: Missing or invalid `agent` parameter
- 404: Lead not found
- 409: Lead already assigned to someone else (optional)

### Update Lead Status

```
PATCH /api/v1/leads/{id}/status
```

**Request Body:**

```json
{
  "status": "en_cours",
  "notes": "Started working on this lead"
}
```

**Response:** Updated lead object

```json
{
  "id": "lead_123",
  "status": "en_cours",
  "notes": "Started working on this lead",
  ...other fields...
}
```

**Errors:**
- 400: Invalid status value
- 404: Lead not found
- 422: Invalid transition (e.g., attempting `qualifie` → `nouveau`)
  - Response body should indicate why transition is invalid

### Update Lead

```
PATCH /api/v1/leads/{id}
```

**Request Body (any combination of fields):**

```json
{
  "notes": "Updated note text",
  "company_name": "New Company Name",
  "assigned_to": "New Agent Name"
}
```

**Response:** Updated lead object

**Errors:**
- 400: Invalid field or value
- 404: Lead not found

### List Pending Leads

```
GET /api/v1/leads/pending?limit=50
```

**Query Parameters:**
- `limit` (optional): Max leads to return (default 50, max 100)

**Response:**

```json
[
  {
    "id": "lead_001",
    "phone_number": "+212612345678",
    "source_url": "https://...",
    "company_name": "ABC Corp",
    "notes": null,
    "status": "nouveau",
    "website_domain": "example.com",
    "scraping_target_id": null,
    "call_attempts": 0,
    "last_called_at": null,
    "assigned_to": null,
    "qualification_score": null,
    "crm_pushed_at": null,
    "crm_push_attempts": 0,
    "crm_last_error": null,
    "created_at": "2026-06-28T10:00:00Z",
    "updated_at": "2026-06-28T10:00:00Z"
  }
]
```

**Notes:**
- Returns leads with status `nouveau` only
- Ordered by `created_at` (oldest first, FIFO)
- Max 50 leads in default request

### Claim Next Lead

```
POST /api/v1/leads/claim-next?agent={optional}
```

**Query Parameters:**
- `agent` (optional): Agent claiming the lead

**Request Body:** None

**Response:** Claimed lead object

```json
{
  "id": "lead_001",
  "status": "nouveau",
  "assigned_to": "Ahmed Zaidi",
  ...other fields...
}
```

**Errors:**
- 404: No pending leads available
- 409: Lead already claimed by another agent

## Data Types

### Lead

Base lead object:

```typescript
interface Lead {
  id: string;
  phone_number: string;
  source_url: string | null;
  company_name: string | null;
  notes: string | null;
  status: LeadStatus;
  website_domain: string | null;
  scraping_target_id: string | null;
  call_attempts: number;
  last_called_at: string | null;
  assigned_to?: string | null;
  qualification_score?: number | null;
  crm_pushed_at?: string | null;
  crm_push_attempts?: number;
  crm_last_error?: string | null;
  created_at: string;
  updated_at: string;
}
```

### LeadStatus

```typescript
type LeadStatus = "nouveau" | "en_cours" | "qualifie" | "rejete";
```

Valid transitions:
- `nouveau` → `en_cours`, `rejete`
- `en_cours` → `qualifie`, `rejete`, `nouveau`
- `qualifie` → `en_cours`
- `rejete` → `nouveau`

### HistoryEntry

Status change history entry:

```typescript
interface HistoryEntry {
  id: string;
  from_status: string | null;      // null for creation
  to_status: string;
  changed_by: string | null;       // null for system changes
  reason: string | null;           // user-provided reason
  extra_data: Record<string, unknown> | null;
  created_at: string;              // ISO 8601 timestamp
}
```

**extra_data fields (when present):**
- `qualification_score`: number (0-100)
- `call_duration`: number (seconds)
- `crm_push_status`: string ("pending" | "success" | "failed")

## Error Responses

### 400 Bad Request

Invalid parameters:

```json
{
  "error": "Bad Request",
  "message": "Invalid status value",
  "details": {
    "status": "Must be one of: nouveau, en_cours, qualifie, rejete"
  }
}
```

### 404 Not Found

Resource not found:

```json
{
  "error": "Not Found",
  "message": "Lead not found",
  "lead_id": "lead_123"
}
```

Or for pending queue:

```json
{
  "error": "Not Found",
  "message": "No pending leads available"
}
```

### 422 Unprocessable Entity

Invalid status transition:

```json
{
  "error": "Unprocessable Entity",
  "message": "Invalid status transition",
  "current_status": "qualifie",
  "requested_status": "nouveau",
  "valid_transitions": ["en_cours"],
  "reason": "Cannot transition from 'qualifie' to 'nouveau'"
}
```

### 409 Conflict

Resource conflict:

```json
{
  "error": "Conflict",
  "message": "Lead already assigned",
  "assigned_to": "Another Agent",
  "lead_id": "lead_123"
}
```

## Implementation Notes

### Status Transitions

The API must enforce these valid transitions:

```python
VALID_TRANSITIONS = {
    "nouveau": ["en_cours", "rejete"],
    "en_cours": ["qualifie", "rejete", "nouveau"],
    "qualifie": ["en_cours"],
    "rejete": ["nouveau"],
}
```

Return 422 if transition not in list.

### CRM Fields

New fields track CRM synchronization:

- `crm_pushed_at`: ISO 8601 timestamp when successfully pushed to CRM
- `crm_push_attempts`: Number of push attempts (incremented on each try)
- `crm_last_error`: Error message from last failed push (cleared on success)

### History Creation

When status changes, automatically create a `HistoryEntry`:
- `from_status`: Previous status (null if this is creation)
- `to_status`: New status
- `changed_by`: Authenticated user (if available)
- `reason`: Value from `notes` parameter if provided
- `extra_data`: Any context (qualification_score, call_duration, etc.)
- `created_at`: Current timestamp

### Timestamps

All timestamps should be:
- ISO 8601 format: `2026-06-28T10:30:00Z`
- UTC timezone (Z suffix)
- Seconds precision minimum

### Ordering

- History entries: Newest first
- Pending leads: Oldest first (FIFO)
- Chat sessions: Most recent first

## Testing Checklist

- [ ] GET /api/v1/leads/{id}/history returns array of HistoryEntry objects
- [ ] POST /api/v1/leads/{id}/assign updates assigned_to field
- [ ] PATCH /api/v1/leads/{id}/status validates transitions (returns 422 for invalid)
- [ ] PATCH /api/v1/leads/{id} updates notes/company_name/assigned_to
- [ ] GET /api/v1/leads/pending returns only "nouveau" status leads
- [ ] POST /api/v1/leads/claim-next returns next available lead
- [ ] All error responses include appropriate HTTP status codes
- [ ] All timestamps are ISO 8601 format
- [ ] CRM fields are optional but present in responses
