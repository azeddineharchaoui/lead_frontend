/**
 * lib/api/auth.ts
 * Auth API — talks to the FastAPI /auth and /api/v1/org endpoints.
 * Tokens are stored in httpOnly cookies set by the Next.js API routes.
 */

import type {
  AuthUser,
  AuthOrganisation,
  LoginPayload,
  MeResponse,
  RegisterPayload,
  TokenResponse,
} from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ---------------------------------------------------------------------------
// Internal helper — calls the backend directly with a Bearer token
// ---------------------------------------------------------------------------
async function backendFetch<T>(
  path: string,
  init: RequestInit = {},
  accessToken?: string | null,
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      typeof body?.detail === "string"
        ? body.detail
        : body?.detail?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Public auth functions — called from Next.js API routes or client side
// ---------------------------------------------------------------------------

/** Register a new organisation + owner user */
export async function register(payload: RegisterPayload): Promise<MeResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(typeof body?.detail === "string" ? body.detail : "Registration failed");
  }
  const accessToken = res.headers.get("X-Access-Token");
  const data: MeResponse = await res.json();
  return { ...data, _accessToken: accessToken } as MeResponse & { _accessToken: string | null };
}

/** Login with email + password */
export async function login(payload: LoginPayload): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(typeof body?.detail === "string" ? body.detail : "Login failed");
  }
  return res.json();
}

/** Refresh the access token using the httpOnly refresh token cookie */
export async function refreshTokens(): Promise<TokenResponse> {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Session expired");
  return res.json();
}

/** Logout — revokes refresh token + clears cookie */
export async function logout(accessToken?: string | null): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
}

/** Get current user profile */
export async function getMe(accessToken: string): Promise<MeResponse> {
  return backendFetch<MeResponse>("/auth/me", { method: "GET" }, accessToken);
}

/** Verify email address */
export async function verifyEmail(token: string): Promise<AuthUser> {
  return backendFetch<AuthUser>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

/** Request password reset email */
export async function requestPasswordReset(email: string): Promise<void> {
  return backendFetch("/auth/request-reset", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/** Consume reset token and set new password */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  return backendFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, new_password: newPassword }),
  });
}

/** Update user profile (full_name) */
export async function updateProfile(full_name: string, accessToken: string): Promise<AuthUser> {
  return backendFetch<AuthUser>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify({ full_name }),
  }, accessToken);
}

/** Change password */
export async function changePassword(current_password: string, new_password: string, accessToken: string): Promise<void> {
  return backendFetch("/auth/me/password", {
    method: "PATCH",
    body: JSON.stringify({ current_password, new_password }),
  }, accessToken);
}
