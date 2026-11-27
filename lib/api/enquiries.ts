/**
 * Client for the IT Geek CRM's public enquiry intake: POST {NEXT_PUBLIC_CRM_API_BASE_URL}/api/public/enquiries.
 *
 * Contract (IT_GEEK_BACKEND -> src/app/api/public/enquiries/route.ts, src/validations/enquiry.validation.ts):
 *   request  { name, email, phone?, serviceCategory, issueDescription, idempotencyKey? }   (JSON, no auth)
 *   201      { success: true, message, enquiry: { enquiryId, serviceCategory, createdAt } }
 *   422      { error, details: { formErrors, fieldErrors: { [field]: string[] } } }
 *   400/429/500 { error }
 * Note: /api/enquiries (without /public) is the CRM dashboard's authenticated GET endpoint — never call it from here.
 *
 * Only public, non-secret configuration lives in this file. Customer data is never logged.
 */
import type { EnquiryErrors, EnquiryField, EnquiryInput } from "@/lib/enquiry";

/** Backend accepted serviceCategory enum values */
export const BACKEND_SERVICE_CATEGORIES = [
  "Microsoft 365 help",
  "Antivirus & security help",
  "Free security check",
  "One-off Fix ($99)",
  "Home Protect ($19/month)",
  "Business Care ($39/user/month)",
  "Something else",
] as const;

export type CrmServiceCategory = (typeof BACKEND_SERVICE_CATEGORIES)[number];

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

/** Backend field -> form field, for mapping 422 errors back onto the inputs. */
const FIELD_MAP: Record<string, EnquiryField> = {
  name: "name",
  email: "email",
  phone: "phone",
  serviceCategory: "topic",
  issueDescription: "message",
};

/**
 * Maps frontend dropdown topic to backend serviceCategory.
 * If the topic is distinct from the backend category, we preserve the user's
 * exact choice by returning a prefix to be included in issueDescription.
 */
export function mapTopicToServiceCategory(topic: string): {
  serviceCategory: CrmServiceCategory;
  prefix?: string;
} {
  const trimmed = topic.trim();
  switch (trimmed) {
    case "Microsoft 365 help":
      return { serviceCategory: "Microsoft 365 help" };
    case "Antivirus & security help":
      return { serviceCategory: "Antivirus & security help" };
    case "Free quote":
      return { serviceCategory: "Free security check", prefix: "[Requested: Free quote]" };
    case "Online support (A$99)":
      return { serviceCategory: "One-off Fix ($99)", prefix: "[Requested: Online support (A$99)]" };
    case "Smart Care annual plan (A$99)":
      return { serviceCategory: "Home Protect ($19/month)", prefix: "[Requested: Smart Care annual plan (A$99)]" };
    case "Onsite support (A$99)":
      return { serviceCategory: "One-off Fix ($99)", prefix: "[Requested: Onsite support (A$99)]" };
    case "Something else":
      return { serviceCategory: "Something else" };
    default:
      if ((BACKEND_SERVICE_CATEGORIES as readonly string[]).includes(trimmed)) {
        return { serviceCategory: trimmed as CrmServiceCategory };
      }
      return {
        serviceCategory: "Something else",
        prefix: trimmed ? `[Requested: ${trimmed}]` : undefined,
      };
  }
}

function endpoint(): string | null {
  const base =
    process.env.NEXT_PUBLIC_CRM_API_BASE_URL?.trim() || PRODUCTION_CRM_BASE_URL;
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

/** Maps validated form data onto the CRM schema, with category mapping and intent preservation. */
export function toCrmPayload(data: EnquiryInput, idempotencyKey: string): PublicEnquiryRequest {
  const { serviceCategory, prefix } = mapTopicToServiceCategory(data.topic);
  const cleanMessage = data.message.trim();
  const description = prefix ? `${prefix}\n\n${cleanMessage}` : cleanMessage;

  return {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    ...(data.phone?.trim() ? { phone: data.phone.trim() } : {}),
    serviceCategory,
    issueDescription: description,
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

/**
 * Fallback submission via same-origin Next.js API route (/api/enquiry).
 * Used when running in browser environments where cross-origin requests to the CRM
 * backend are restricted by CORS (e.g. localhost on non-standard ports like :3001).
 */
async function submitViaLocalProxy(
  data: EnquiryInput,
  opts: { idempotencyKey: string; honeypot: string; startedAt: number },
): Promise<SubmitResult> {
  try {
    const res = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        ...data,
        website: opts.honeypot,
        startedAt: opts.startedAt,
        idempotencyKey: opts.idempotencyKey,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    const body = (await res.json().catch(() => undefined)) as
      | { ok?: boolean; enquiryId?: string; message?: string; errors?: EnquiryErrors }
      | undefined;

    if (res.ok && body?.ok) {
      return { ok: true, enquiryId: body.enquiryId };
    }

    if (res.status === 422) {
      return {
        ok: false,
        kind: "validation",
        message: body?.message || "Please check the highlighted fields.",
        fieldErrors: body?.errors,
      };
    }

    if (res.status === 429) {
      return {
        ok: false,
        kind: "rate_limited",
        message: body?.message || "Too many requests. Please try again in a few minutes.",
      };
    }

    return {
      ok: false,
      kind: "server",
      message: body?.message || "We couldn’t send your enquiry just now.",
    };
  } catch (proxyErr) {
    const name = proxyErr instanceof Error ? proxyErr.name : "";
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
}

export async function submitEnquiry(
  data: EnquiryInput,
  opts: { idempotencyKey: string; honeypot: string; startedAt: number },
  options?: { directOnly?: boolean },
): Promise<SubmitResult> {
  // Spam traps (the backend's rate limiting and validation stay authoritative). Honeypot content is never sent.
  if (opts.honeypot.length > 0 || !Number.isFinite(opts.startedAt) || Date.now() - opts.startedAt < MIN_FILL_MS) {
    return { ok: false, kind: "spam", message: "We couldn’t verify this submission." };
  }

  const isBrowser = typeof window !== "undefined";
  // If running on a local development port other than 3000 (e.g. :3001), CRM backend CORS
  // preflight will reject the cross-origin fetch. Route seamlessly via local same-origin proxy.
  const isDevNonStandardPort =
    isBrowser &&
    !options?.directOnly &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") &&
    window.location.port !== "" &&
    window.location.port !== "3000";

  if (isDevNonStandardPort) {
    return submitViaLocalProxy(data, opts);
  }

  const url = endpoint();
  if (!url) {
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

    // If direct cross-origin fetch failed with a network/CORS error in the browser,
    // attempt fallback through the same-origin Next.js server route before reporting failure.
    if (isBrowser && !options?.directOnly) {
      return submitViaLocalProxy(data, opts);
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
