import { NextResponse, type NextRequest } from "next/server";
import { normaliseEnquiry, validateEnquiry } from "@/lib/enquiry";
import { createIdempotencyKey, submitEnquiry } from "@/lib/api/enquiries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 10_000;
const MIN_FILL_MS = 2_500; // humans take longer than this to fill the form
const RATE_LIMIT = { max: 20, windowMs: 10 * 60 * 1000 };

/*
 * Rate limiting: best-effort and IN-MEMORY, so it is per server instance and resets on restart/redeploy.
 * It is effective on a single long-running Node server; on serverless or multi-instance hosting each instance
 * keeps its own counter. See README → "Rate limiting in production" for hosting-specific options.
 */
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5_000) hits.clear();
  return recent.length > RATE_LIMIT.max;
}

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients; still subject to validation, spam traps and rate limiting
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false; // e.g. "Origin: null"
  }
}

export async function POST(req: NextRequest) {
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return json(415, { ok: false, message: "Unsupported request." });
  }
  if (!sameOrigin(req)) return json(403, { ok: false, message: "Forbidden." });

  // Reject oversized bodies before reading them, then enforce the limit on the actual bytes received.
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return json(413, { ok: false, message: "Your message is too long." });
  const raw = await req.text();
  if (Buffer.byteLength(raw) > MAX_BODY_BYTES) return json(413, { ok: false, message: "Your message is too long." });

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return json(400, { ok: false, message: "Invalid request." });
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return json(400, { ok: false, message: "Invalid request." });
  }
  const body = parsed as Record<string, unknown>;

  // Behind a proxy/CDN, the platform must set x-forwarded-for (otherwise all clients share one bucket).
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  if (rateLimited(ip)) {
    return json(429, { ok: false, message: "Too many requests. Please call us or try again in a few minutes." });
  }

  // Spam traps: hidden honeypot field and an implausibly fast submission.
  const startedAt = Number(body.startedAt);
  const tooFast = !Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FILL_MS;
  if ((typeof body.website === "string" && body.website.length > 0) || tooFast) {
    return json(400, { ok: false, message: "We couldn’t verify this submission. Please try again or call us." });
  }

  const data = normaliseEnquiry(body);
  const errors = validateEnquiry(data);
  if (Object.keys(errors).length > 0) {
    return json(422, { ok: false, message: "Please check the highlighted fields.", errors });
  }

  // Forward enquiry to the central CRM API integration
  const idempotencyKey =
    typeof body.idempotencyKey === "string" && body.idempotencyKey.length > 0
      ? body.idempotencyKey
      : createIdempotencyKey();

  const result = await submitEnquiry(
    data,
    {
      idempotencyKey,
      honeypot: typeof body.website === "string" ? body.website : "",
      startedAt,
    },
    { directOnly: true },
  );

  if (result.ok) {
    return json(200, { ok: true, enquiryId: result.enquiryId });
  }

  if (result.kind === "validation") {
    return json(422, { ok: false, message: result.message, errors: result.fieldErrors });
  }

  if (result.kind === "rate_limited") {
    return json(429, { ok: false, message: result.message });
  }

  return json(502, { ok: false, message: result.message });
}
