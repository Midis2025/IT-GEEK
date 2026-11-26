import { NextResponse, type NextRequest } from "next/server";
import { normaliseEnquiry, validateEnquiry } from "@/lib/enquiry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 10_000;
const MIN_FILL_MS = 2_500; // humans take longer than this to fill the form
const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };

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

  // Never simulate success: without a configured delivery target the lead is rejected in every environment.
  const webhook = process.env.ENQUIRY_WEBHOOK_URL;
  if (!webhook) {
    console.error("[enquiry] ENQUIRY_WEBHOOK_URL is not configured; enquiry was NOT delivered.");
    return json(503, { ok: false, message: "Online enquiries are temporarily unavailable." });
  }
  let target: URL;
  try {
    target = new URL(webhook);
  } catch {
    console.error("[enquiry] ENQUIRY_WEBHOOK_URL is not a valid URL; enquiry was NOT delivered.");
    return json(503, { ok: false, message: "Online enquiries are temporarily unavailable." });
  }
  const loopback = target.hostname === "localhost" || target.hostname === "127.0.0.1";
  if (process.env.NODE_ENV === "production" && target.protocol !== "https:" && !loopback) {
    console.error("[enquiry] ENQUIRY_WEBHOOK_URL must use https:// in production; enquiry was NOT delivered.");
    return json(503, { ok: false, message: "Online enquiries are temporarily unavailable." });
  }

  const lead = { ...data, source: "itgeek-landing", submittedAt: new Date().toISOString() };

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.ENQUIRY_WEBHOOK_SECRET ? { "X-Webhook-Secret": process.env.ENQUIRY_WEBHOOK_SECRET } : {}),
      },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(8_000),
      redirect: "error",
    });
    if (!res.ok) throw new Error(`webhook responded with HTTP ${res.status}`);
  } catch (err) {
    // Log only the failure reason — never the lead (personal information) or the webhook URL (may embed a secret).
    const reason = err instanceof Error ? `${err.name}: ${err.message}` : "unknown error";
    console.error(`[enquiry] delivery failed (${reason}); enquiry was NOT delivered.`);
    return json(502, { ok: false, message: "We couldn’t send your enquiry just now." });
  }

  return json(200, { ok: true });
}
