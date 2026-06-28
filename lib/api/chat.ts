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

export async function fetchTtsAudio(
  ctx: ApiOptions,
  text: string,
  lang?: "fr" | "ar",
): Promise<Blob> {
  if (!text || text.trim().length === 0) {
    throw new Error("Texte vide pour la synthèse vocale")
  }

  const opts = toClientOptions(ctx)
  const truncatedText = text.slice(0, 2000)
  const params = new URLSearchParams({ text: truncatedText })
  if (lang) params.set("lang", lang)

  const headers: Record<string, string> = {}
  if (opts.apiKey) headers["X-API-Key"] = opts.apiKey

  try {
    const res = await fetch(`${opts.baseUrl}${API.chat.tts}?${params.toString()}`, {
      method: "GET",
      headers,
    })

    if (!res.ok) {
      if (res.status === 503) {
        throw new Error("tts_unavailable")
      }
      if (res.status === 400) {
        throw new Error("validation_error")
      }
      throw new Error(`HTTP ${res.status}`)
    }

    return res.blob()
  } catch (error) {
    if (error instanceof Error && error.message === "tts_unavailable") {
      throw new Error("tts_unavailable")
    }
    throw error
  }
}

// Legacy alias for backward compatibility
export async function fetchTTS(
  ctx: ApiOptions,
  text: string,
  lang?: string,
): Promise<Blob> {
  return fetchTtsAudio(ctx, text, lang as "fr" | "ar" | undefined)
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
