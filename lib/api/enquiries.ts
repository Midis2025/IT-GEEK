/**
 * Client for the IT Geek CRM's public enquiry intake: POST {NEXT_PUBLIC_CRM_API_BASE_URL}/api/public/enquiries.
 *
 * Contract (IT_GEEK_BACKEND → src/app/api/public/enquiries/route.ts, src/validations/enquiry.validation.ts):
 *   request  { name, email, phone?, serviceCategory, issueDescription, idempotencyKey? }   (JSON, no auth)
 *   201      { success: true, message, enquiry: { enquiryId, serviceCategory, createdAt } }
 *   422      { error, details: { formErrors, fieldErrors: { [field]: string[] } } }
 *   400/429/500 { error }
 * Note: /api/enquiries (without /public) is the CRM dashboard's authenticated GET endpoint — never call it from here.
 *
 * Only public, non-secret configuration lives in this file. Customer data is never logged.
 */
import type { EnquiryErrors, EnquiryField, EnquiryInput, EnquiryTopic } from "@/lib/enquiry";

/** The CRM's serviceCategory enum (IT_GEEK_BACKEND → src/types/constants.ts → SERVICE_CATEGORIES) lists exactly
 *  the website's ENQUIRY_TOPICS, so the visitor's choice is sent unchanged. Keep both lists in sync. */
export type CrmServiceCategory = EnquiryTopic;

/** Public CRM URL used by production builds when NEXT_PUBLIC_CRM_API_BASE_URL is not set (not a secret). */
const PRODUCTION_CRM_BASE_URL = "https://it-geek-backend.vercel.app";

export type PublicEnquiryRequest = {
  name: string;
  email: string;
  phone?: string;
  serviceCategory: CrmServiceCategory;
  issueDescription: string;
  idempotencyKey: string;
};

export type PublicEnquirySuccess = {
  success: true;
  message: string;
  enquiry: { enquiryId: string; serviceCategory: string; createdAt: string };
};

export type SubmitFailureKind =
  | "not_configured" // NEXT_PUBLIC_CRM_API_BASE_URL missing/invalid
  | "spam" // honeypot filled or implausibly fast
  | "validation" // 400/422
  | "rate_limited" // 429
  | "unauthorized" // 401/403 — the public route should never return these
  | "server" // 5xx or an unexpected response
  | "timeout" // no answer in time: the enquiry MAY have been saved
  | "network"; // request never reached the server (offline, DNS, CORS)

export type SubmitResult =
  | { ok: true; enquiryId?: string }
  | { ok: false; kind: SubmitFailureKind; message: string; fieldErrors?: EnquiryErrors };

const TIMEOUT_MS = 15_000;
const MIN_FILL_MS = 2_500; // humans take longer than this to fill the form

/** Backend field → form field, for mapping 422 errors back onto the inputs. */
const FIELD_MAP: Record<string, EnquiryField> = {
  name: "name",
  email: "email",
  phone: "phone",
  serviceCategory: "topic",
  issueDescription: "message",
};

function endpoint(): string | null {
  // Development must opt in explicitly, so local testing never creates production CRM records by accident.
  const base =
    process.env.NEXT_PUBLIC_CRM_API_BASE_URL?.trim() ||
    (process.env.NODE_ENV === "production" ? PRODUCTION_CRM_BASE_URL : "");
  if (!base) return null;
  try {
    const url = new URL(base);
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (url.protocol !== "https:" && !local) return null;
    return `${url.origin}${url.pathname.replace(/\/+$/, "")}/api/public/enquiries`;
  } catch {
    return null;
  }
}

/** A fresh key per logical submission; the caller reuses it only when retrying the same data. */
export function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Maps validated form data (topic already checked against ENQUIRY_TOPICS) onto the CRM schema, unchanged. */
export function toCrmPayload(data: EnquiryInput, idempotencyKey: string): PublicEnquiryRequest {
  return {
    name: data.name,
    email: data.email,
    ...(data.phone ? { phone: data.phone } : {}),
    serviceCategory: data.topic as CrmServiceCategory,
    issueDescription: data.message,
    idempotencyKey,
  };
}

function mapFieldErrors(details: unknown): EnquiryErrors | undefined {
  const fieldErrors = (details as { fieldErrors?: Record<string, unknown> } | undefined)?.fieldErrors;
  if (!fieldErrors || typeof fieldErrors !== "object") return undefined;
  const out: EnquiryErrors = {};
  for (const [key, value] of Object.entries(fieldErrors)) {
    const field = FIELD_MAP[key];
    const first = Array.isArray(value) ? value.find((v): v is string => typeof v === "string") : undefined;
    if (field && first) out[field] = first;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function isSuccessBody(body: unknown): body is PublicEnquirySuccess {
  return !!body && typeof body === "object" && (body as { success?: unknown }).success === true;
}

export async function submitEnquiry(
  data: EnquiryInput,
  opts: { idempotencyKey: string; honeypot: string; startedAt: number },
): Promise<SubmitResult> {
  // Spam traps (the backend's rate limiting and validation stay authoritative). Honeypot content is never sent.
  if (opts.honeypot.length > 0 || !Number.isFinite(opts.startedAt) || Date.now() - opts.startedAt < MIN_FILL_MS) {
    return { ok: false, kind: "spam", message: "We couldn’t verify this submission." };
  }

  const url = endpoint();
  if (!url) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[enquiry] NEXT_PUBLIC_CRM_API_BASE_URL is missing or invalid; enquiry was NOT sent.");
    }
    return { ok: false, kind: "not_configured", message: "Online enquiries are temporarily unavailable." };
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(toCrmPayload(data, opts.idempotencyKey)),
      credentials: "omit",
      mode: "cors",
      redirect: "error",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    if (name === "TimeoutError" || name === "AbortError") {
      return {
        ok: false,
        kind: "timeout",
        message:
          "This is taking longer than expected, and your enquiry may already have been received. Sending again is safe — it won’t create a duplicate.",
      };
    }
    return { ok: false, kind: "network", message: "We couldn’t reach our server — please check your connection." };
  }

  const body: unknown = await res.json().catch(() => undefined);
  const serverMessage =
    body && typeof body === "object" && typeof (body as { error?: unknown }).error === "string"
      ? (body as { error: string }).error
      : undefined;

  if (res.ok && isSuccessBody(body)) {
    const id = body.enquiry?.enquiryId;
    return { ok: true, enquiryId: typeof id === "string" && id ? id : undefined };
  }

  switch (true) {
    case res.status === 422 || res.status === 400: {
      const fieldErrors = mapFieldErrors((body as { details?: unknown } | undefined)?.details);
      return {
        ok: false,
        kind: "validation",
        message: fieldErrors ? "Please check the highlighted fields." : "Some details couldn’t be accepted.",
        fieldErrors,
      };
    }
    case res.status === 429:
      return {
        ok: false,
        kind: "rate_limited",
        message: serverMessage ?? "Too many requests. Please try again in a few minutes.",
      };
    case res.status === 401 || res.status === 403:
      return { ok: false, kind: "unauthorized", message: "Online enquiries are temporarily unavailable." };
    default:
      // 5xx, or a 2xx with an unexpected body. Retrying reuses the idempotency key, so it can't duplicate.
      return { ok: false, kind: "server", message: "We couldn’t send your enquiry just now." };
  }
}
