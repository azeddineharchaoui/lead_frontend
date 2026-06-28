import { toast } from "sonner";
import { normalizeApiError } from "@/lib/api-client";

export function showApiError(error: unknown, fallback = "Une erreur est survenue"): void {
  if (error instanceof Error) {
    toast.error(error.message || fallback);
    return;
  }
  toast.error(fallback);
}

export function parseApiError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return normalizeApiError(500, { message: "Une erreur inattendue est survenue" });
}
