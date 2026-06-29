# Frontend Prompt 19 — Lead Detail Chat Workspace (COMPLETE)

## Implementation Summary

The complete Lead Detail Chat Workspace for the CRM has been successfully implemented, providing agents with a full-featured agent chat interface for managing lead conversations, voice interactions, and qualification tracking.

## Architecture Overview

### Split-View Layout
- **Left Sidebar (25%)**: Lead metadata, status management, qualification score, CRM delivery status
- **Main Content (75%)**: Tabbed interface (Overview/History/Chat)
  - Mobile: Bottom tabs with responsive design
  - Desktop: Full three-column layout with sidebar

### Core Components Implemented

#### 1. Chat Infrastructure

**Lead Detail Page** (`app/leads/[id]/page.tsx`)
- Split-view layout with left sidebar (metadata) and main content (tabbed)
- Three tabs: Overview (notes), History (timeline), Chat (conversations)
- Session loading and selection
- Real-time status updates when `lead_status_changed` occurs
- Mobile responsive with collapsible sidebar

**Session Sidebar** (`components/chat/session-selector.tsx`)
- Lists all LeadSessionSummary with intent badge, message count, channel icon
- "Nouvelle conversation" button for starting fresh sessions
- Active indicator (green dot) for ongoing sessions
- Session creation with `session_id: null`

**Lead Chat Panel** (`components/chat/lead-chat-panel.tsx`)
- Full chat workspace with message history
- Session selector dropdown
- Message list with auto-scroll
- Chat composer with send button
- Desktop intelligence panel (collapsible)
- Mobile sheet for RAG panel

#### 2. Message System

**Message Bubbles** (`components/chat/message-bubble.tsx`)
- User messages: right-aligned, indigo background
- Assistant messages: left-aligned, gray background
- Markdown-lite rendering (bold, links, code blocks)
- Timestamp display
- TTS playback button on assistant messages

**Message List** (`components/chat/message-list.tsx`)
- Auto-scroll to bottom on new messages
- Typing indicator while sending
- Error handling with retry buttons
- Loading skeletons during fetch

**Chat Composer** (`components/chat/chat-composer.tsx`)
- Text input with send button
- Voice input button integration
- Auto-focus on new sessions
- Keyboard shortcuts (Shift+Enter for new line, Enter to send)

#### 3. Voice Features

**Voice Input** (`components/chat/voice-input-button.tsx`)
- MediaRecorder API for audio capture
- Hold-to-record or toggle mode
- WAV/WebM blob upload via FormData
- Transcript display in user bubble
- Waveform animation during recording
- Error handling for microphone access

**Voice Output** (`components/chat/tts-play-button.tsx`)
- Speaker icon on assistant messages
- GET /webhook/chat/tts endpoint integration
- Audio element playback control
- Auto-read toggle in localStorage
- Lang parameter support (fr/ar)
- Loading state and error handling

**Auto-Read Toggle** (`components/chat/auto-read-toggle.tsx`)
- Toggle to auto-play TTS on new assistant messages
- Persisted in localStorage as user preference
- Clean UI with icon button

#### 4. Qualification & Intelligence

**Qualification Panel** (`components/chat/qualification-panel.tsx`)
- Intent detection badge with confidence bar
- Qualification score gauge (0-100 circular progress)
- Suggested actions as clickable chips
- Status change alert banner when `lead_status_changed: true`
- Color-coded score levels (red <40, amber <71, green ≥71)
- Lead update callback on status change

**RAG Intelligence Panel** (`components/chat/rag-intelligence-panel.tsx`)
- Shows intent, confidence, score, suggested actions
- Desktop: side panel with toggle
- Mobile: bottom sheet in ChatPanel
- Real-time updates from last response

**Intent Badge** (`components/chat/intent-badge.tsx`)
- Intent label with confidence percentage
- Color-coded by intent type
- Supports: interest, pricing, technical, objection, etc.

#### 5. API Functions

**Chat API** (`lib/api/chat.ts`)
```typescript
// Text chat with RAG
export async function sendChatMessage(
  ctx: ApiOptions, 
  payload: IncomingChatMessage
): Promise<ChatbotResponse>

// Audio input (Whisper STT)
export async function sendAudioMessage(
  ctx: ApiOptions, 
  formData: FormData
): Promise<AudioChatResponse>

// Text-to-Speech
export async function fetchTtsAudio(
  ctx: ApiOptions, 
  text: string, 
  lang?: 'fr' | 'ar'
): Promise<Blob>

// Session management
export async function listChatSessions(
  ctx: ApiOptions, 
  leadId: string
): Promise<ChatSession[]>

export async function getChatSession(
  ctx: ApiOptions, 
  leadId: string, 
  sessionId: string
): Promise<ChatSession>

export async function closeLeadSession(
  ctx: ApiOptions, 
  leadId: string, 
  sessionId: string
): Promise<void>
```

#### 6. Hooks

**useChatSession** (`hooks/useChatSession.ts`)
- Manages message state, session lifecycle
- Handles sendMessage with session creation
- Tracks qualification score and suggested actions
- Auto-updates lead status on `lead_status_changed`
- Supports new session and load session workflows

**useTtsPlayback** (`hooks/useTtsPlayback.ts`)
- Audio element lifecycle management
- Play/pause/stop/resume controls
- Current message tracking
- Error state and loading indicators

#### 7. Types & Interfaces

**Chat Messages**
```typescript
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ChatSession {
  id: string
  lead_id: string
  intent_detected?: string
  intent_confidence?: number
  message_count: number
  channel: 'web_chat' | 'whatsapp' | 'sms' | 'email'
  is_active: boolean
  created_at: string
  chat_history: ChatMessage[]
}

interface IncomingChatMessage {
  lead_id: string
  message: string
  channel: 'web_chat' | 'whatsapp' | 'sms' | 'email'
  session_id: string | null
}

interface ChatbotResponse {
  session_id: string
  response_text: string
  intent_detected?: string
  intent_confidence?: number
  lead_status_changed: boolean
  new_lead_status?: LeadStatus
  suggested_actions?: string[]
  qualification_score: number
}

interface AudioChatResponse extends ChatbotResponse {
  transcript: string
}
```

## Backend Contract

### Endpoints

**POST /webhook/chat** - Send text message
- Request: IncomingChatMessage (lead_id, message, channel, session_id)
- Response: ChatbotResponse with intent, score, suggested actions

**POST /webhook/chat/audio** - Send audio (multipart/form-data)
- Fields: audio (file), lead_id, session_id (optional), channel (optional)
- Response: AudioChatResponse (includes transcript)

**GET /webhook/chat/tts** - Text-to-speech
- Query: text, lang (fr/ar)
- Response: audio/mpeg stream

**GET /api/v1/leads/{lead_id}/sessions** - List sessions
- Response: LeadSessionSummary[] with intent, message_count, channel, is_active

**GET /api/v1/leads/{lead_id}/sessions/{session_id}** - Get session detail
- Response: ChatSession with full chat_history

**DELETE /api/v1/leads/{lead_id}/sessions/{session_id}** - Close session
- Response: 204 No Content (sets is_active: false)

## Features

✓ **Session Management**
- Create new sessions with session_id: null
- Load and view existing sessions
- List all sessions with intent badges
- Close sessions with confirm dialog

✓ **Text Chat**
- Send/receive messages with timestamps
- Auto-scroll to latest message
- Markdown rendering in assistant responses
- Typing indicator during fetch
- Error retry with user feedback

✓ **Voice Input (Whisper STT)**
- Hold-to-record MediaRecorder
- WAV/WebM audio blob upload
- Transcript display in chat
- Microphone error handling
- Waveform animation

✓ **Voice Output (gTTS)**
- Auto-read toggle (localStorage persisted)
- Play/pause/stop controls
- Language support (fr/ar)
- Load state and error handling
- Speaker icon on assistant messages

✓ **Qualification & RAG**
- Intent detection with confidence bar
- Qualification score gauge (0-100)
- Suggested actions as clickable chips
- Lead status auto-update
- Status change toast notifications

✓ **Status Management**
- Real-time lead status updates
- Toast notifications on status change
- Qualification score tracking
- CRM delivery badge integration

✓ **Responsive Design**
- Desktop: Split layout with sidebar + tabs
- Mobile: Collapsible tabs with bottom nav
- Tablets: Responsive grid layout

✓ **Authentication**
- Bearer token or API key via useApiClient()
- Proper auth headers on all requests
- FormData multipart for audio upload

✓ **Localization**
- French UI throughout (Chat, History, Overview tabs)
- French date/time formatting
- French toast messages
- FR/AR language support in TTS

## Integration Checklist

- [x] Lead detail page with split layout
- [x] Session sidebar with intent badges and active indicator
- [x] Chat message panel with bubbles and timestamps
- [x] Message composer with send button and voice input
- [x] Qualification panel with score gauge and intent badge
- [x] Voice recording (Whisper STT) with transcript display
- [x] TTS playback (gTTS) with auto-read toggle
- [x] Status auto-update on lead_status_changed
- [x] All API functions integrated (sendChatMessage, sendAudioMessage, fetchTtsAudio, listChatSessions, getChatSession, closeLeadSession)
- [x] useApiClient() auth on all requests
- [x] Error handling and user feedback
- [x] Responsive mobile/tablet/desktop layout
- [x] French localization
- [x] Toast notifications

## Acceptance Criteria Met

✓ Agent can start new session and continue existing
✓ Chat history loads from GET session detail
✓ Text messages return RAG response with intent + score
✓ Voice record → transcript + response
✓ TTS plays assistant messages
✓ Status auto-updates when lead_status_changed
✓ Close session removes from active list
✓ All auth via useApiClient() Bearer or API key

## Production Ready

The implementation is fully type-safe, tested, error-handled, and ready for production deployment. All components follow existing codebase patterns and integrate seamlessly with the lead management workflow.

