import { apiRequest } from "@/lib/api-client";
import type {
  AudioChatResponse,
  ChatbotResponse,
  ChatSession,
  IncomingChatMessage,
} from "@/lib/types";
import { API } from "./endpoints";
import { toClientOptions, type ApiOptions } from "./client-options";

export async function sendChatMessage(
  ctx: ApiOptions,
  payload: IncomingChatMessage,
): Promise<ChatbotResponse> {
  return apiRequest<ChatbotResponse>(
    toClientOptions(ctx),
    API.chat.webhook,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function sendAudioMessage(
  ctx: ApiOptions,
  formData: FormData,
): Promise<AudioChatResponse> {
  const opts = toClientOptions(ctx);
  const headers: Record<string, string> = {};
  if (opts.apiKey) headers["X-API-Key"] = opts.apiKey;

  const res = await fetch(`${opts.baseUrl}${API.chat.audio}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail?.message ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchTTS(
  ctx: ApiOptions,
  text: string,
  lang?: string,
): Promise<Blob> {
  const opts = toClientOptions(ctx);
  const params = new URLSearchParams({ text });
  if (lang) params.set("lang", lang);

  const headers: Record<string, string> = {};
  if (opts.apiKey) headers["X-API-Key"] = opts.apiKey;
  const res = await fetch(`${opts.baseUrl}${API.chat.tts}?${params.toString()}`, { headers });
  if (!res.ok) throw new Error(`TTS error: HTTP ${res.status}`);
  return res.blob();
}

export async function listChatSessions(
  ctx: ApiOptions,
  leadId: string,
): Promise<ChatSession[]> {
  return apiRequest<ChatSession[]>(
    toClientOptions(ctx),
    API.leads.sessions(leadId),
  );
}

export async function getChatSession(
  ctx: ApiOptions,
  leadId: string,
  sessionId: string,
): Promise<ChatSession> {
  return apiRequest<ChatSession>(
    toClientOptions(ctx),
    API.leads.session(leadId, sessionId),
  );
}

export async function closeChatSession(
  ctx: ApiOptions,
  leadId: string,
  sessionId: string,
): Promise<void> {
  await apiRequest<void>(
    toClientOptions(ctx),
    API.leads.session(leadId, sessionId),
    { method: "DELETE" },
  );
}
