# IT GEEK FRONTEND – COMPLETE ENQUIRY FORM API INTEGRATION AUDIT

**Date:** November 27, 2026  
**Audited Frontend Repository:** `IT-GEEK` (`https://it-geek-phi.vercel.app/`)  
**Audited Backend API:** `https://it-geek-backend.vercel.app/`  
**Audit Type:** Code-Level Static & Architectural Integration Audit (Read-Only)

---

## 1. Executive Summary

This audit evaluated the IT Geek frontend codebase to determine whether all customer enquiry entry points and form components across the website are integrated with the CRM backend API.

### Core Audit Finding & Endpoint Distinction
The prompt specified backend API URL is:
`https://it-geek-backend.vercel.app/api/enquiries`

A code-level audit of the backend repository (`it-geek-backend`) and HTTP method verification revealed a critical architectural distinction:
1. **`/api/enquiries` is a private, session-authenticated CRM admin endpoint.**  
   - It only exports a `GET` handler used by authenticated CRM staff to list enquiries and export CSVs.
   - Calling `POST` on `/api/enquiries` returns **`405 Method Not Allowed`**.
   - Calling `GET` on `/api/enquiries` without administrative session cookies returns **`401 Unauthorized`**.
   - Public client-side forms **cannot and must not** submit directly to `/api/enquiries` because doing so would either fail with `405 Method Not Allowed` or require embedding CRM administrator/superadmin session credentials into public browser JavaScript (a critical security vulnerability).
2. **The intended, secure public submission route is `/api/public/enquiries`.**  
   - The backend specifically exposes `POST /api/public/enquiries` and `OPTIONS /api/public/enquiries` for unauthenticated website visitors.
   - It enforces CORS allowing `https://it-geek-phi.vercel.app`, validates payloads against a Zod schema (`publicEnquirySubmissionSchema`), applies in-memory IP rate limiting (10 requests / 10 minutes), prevents duplicate submissions via idempotency keys, generates atomic sequence IDs (`ITG-YYYY-XXXXXX`), auto-matches customer records in MongoDB Atlas, writes audit trail logs, and queues transactional emails.

### Summary Metrics
| Metric | Count | Details |
| :--- | :--- | :--- |
| **Total Enquiry Form Components** | **1** | Unified modal dialog (`EnquiryDialog.tsx`) |
| **Total Enquiry Entry Points / Triggers** | **9** | Hero, Header, Mobile Drawer, Services, Common Issues, Pricing Plans, Pricing Quote, Final CTA |
| **Total Forms Integrated with Public CRM API (`/api/public/enquiries`)** | **1** (100%) | `EnquiryDialog.tsx` via centralized client `lib/api/enquiries.ts` |
| **Total Forms Calling Private Admin Route (`/api/enquiries`) Directly** | **0** | Correctly avoided (prevents 405 Method Not Allowed / 401 Unauthorized) |
| **Total Forms Partially Integrated** | **0** | Fully integrated with loading, success, error, and idempotency handling |
| **Total Forms Not Integrated** | **0** | No rogue, mock, or disconnected forms exist |
| **Total Forms with Incorrect Field Mapping** | **0** | All 7 topics safely mapped to backend enum; user intent preserved in description |
| **Total Forms with Submission / UX Problems** | **0** | Button disables during submit, idempotency key reused on retry, reference ID displayed |

---

## 2. Complete Form Inventory

The IT Geek website is a Next.js App Router application structured as a high-conversion landing page. Rather than distributing separate form implementations across different pages, all enquiry triggers across the entire site route to a single modal dialog component.

| # | Page / Route | Form Component | File Path | API Endpoint | Method | Integration Status |
|---|---|---|---|---|---|---|
| **1** | Homepage (`/`) | `EnquiryDialog` | `components/EnquiryDialog.tsx` | `/api/public/enquiries` | `POST` | **Fully Integrated** |
| **2** | Server Route Proxy | `POST /api/enquiry` | `app/api/enquiry/route.ts` | `/api/public/enquiries` | `POST` | **Fully Integrated (Intermediary)** |

### Comprehensive Audit of Site-Wide CTA Entry Points
Every customer-facing enquiry CTA trigger on the website was audited to verify that it connects to `EnquiryDialog`:

| Entry Point | Component File | Trigger Mechanism | Target Preselected Topic | Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Primary CTA** | `components/sections/Hero.tsx` (line 126) | `<Button enquiry="Microsoft 365 help">Get help now</Button>` | `"Microsoft 365 help"` | **Verified Connected** |
| **Hero Quote CTA** | `components/sections/Hero.tsx` (line 129) | `<Button enquiry="Free quote">Request a free quote</Button>` | `"Free quote"` | **Verified Connected** |
| **Desktop Header CTA** | `components/sections/Header.tsx` (line 91) | `<Button enquiry="Microsoft 365 help">Get help</Button>` | `"Microsoft 365 help"` | **Verified Connected** |
| **Mobile Drawer CTA** | `components/sections/Header.tsx` (line 134) | `<Button enquiry="Microsoft 365 help">Get help now</Button>` | `"Microsoft 365 help"` | **Verified Connected** |
| **Service Card 1** | `components/sections/Services.tsx` (line 106) | `<Button enquiry={s.topic}>Get Microsoft 365 help</Button>` | `"Microsoft 365 help"` | **Verified Connected** |
| **Service Card 2** | `components/sections/Services.tsx` (line 106) | `<Button enquiry={s.topic}>Get security help</Button>` | `"Antivirus & security help"` | **Verified Connected** |
| **Common Issues CTA** | `components/sections/CommonIssues.tsx` (line 56) | `<Button enquiry="Something else">Have another issue?</Button>` | `"Something else"` | **Verified Connected** |
| **Pricing Cards (3 Plans)** | `components/sections/Pricing.tsx` (line 128) | `<Button enquiry={plan.topic}>Request support</Button>` | `"Online support (A$99)"`, `"Smart Care annual plan (A$99)"`, `"Onsite support (A$99)"` | **Verified Connected** |
| **Pricing Footnote CTA** | `components/sections/Pricing.tsx` (line 158) | `<a data-enquiry="Free quote">request a free quote</a>` | `"Free quote"` | **Verified Connected** |
| **Final CTA Banner** | `components/sections/FinalCta.tsx` (line 43) | `<Button enquiry="Microsoft 365 help">Send enquiry</Button>` | `"Microsoft 365 help"` | **Verified Connected** |

---

## 3. Detailed Integration Verification

### A. Submission Flow
```
User clicks CTA Button / Link
       │
       ▼
`Button.tsx` renders `data-enquiry="<Topic>"`
       │
       ▼
Global click listener in `EnquiryDialog.tsx` intercepts click
       │
       ▼
`EnquiryDialog.open(topic)` activates modal with preselected topic
       │
       ▼
User fills inputs and clicks "Send enquiry" (`onSubmit`)
       │
       ▼
Local validation (`validateEnquiry`) checks name, email, phone, message
       │
       ▼
Anti-spam honeypot check: If hidden `website` field is populated, reject locally
       │
       ▼
Generates UUID v4 `idempotencyKey` (or reuses key if retrying after network error)
       │
       ▼
`submitEnquiryToCrm(input, idempotencyKey)` in `lib/api/enquiries.ts`
       │
       ▼
`fetch("https://it-geek-backend.vercel.app/api/public/enquiries", { method: "POST", headers: { "X-Idempotency-Key": key } })`
       │
       ▼
Backend Zod validation ──► Customer matched/created ──► Enquiry stored in MongoDB (ITG-YYYY-XXXXXX) ──► Outbox email queued
       │
       ▼
HTTP 201 Created Response { success: true, enquiry: { enquiryId: "ITG-..." } }
       │
       ▼
`EnquiryDialog` renders Success View displaying reference ID "ITG-..."
```

### B. Endpoint Configuration
- **Base URL Variable:** `process.env.NEXT_PUBLIC_CRM_API_BASE_URL`
- **Fallback URL:** `https://it-geek-backend.vercel.app`
- **Path:** `/api/public/enquiries`
- **Full Verified URL:** `https://it-geek-backend.vercel.app/api/public/enquiries`

### C. Request Payload Verification
```typescript
interface BackendEnquiryRequest {
  name: string;               // min 2, max 100 characters, trimmed
  email: string;              // lowercased, trimmed, valid email format
  phone?: string;             // optional; omitted if empty; trimmed if provided
  serviceCategory: string;    // strictly validated against backend enum
  issueDescription: string;   // min 5, max 5000 characters; original message preserved
  idempotencyKey?: string;    // UUID v4 string
}
```

### D. Success & Error Handling Verification
- **In-Flight State:** `submitting` flag disables submit button, renders spinner with "Sending…", and blocks concurrent duplicate clicks.
- **Success State:** Form inputs are not reset immediately while visible; dialog displays confirmed enquiry reference number (e.g., `ITG-2026-000001`), confirmation note, and a "Done" button. Form fields are reset only after the modal is closed.
- **Field Error State:** If the backend returns `422 Unprocessable Entity`, the client maps `details.fieldErrors` (`name`, `email`, `phone`, `serviceCategory`, `issueDescription`) to the corresponding form fields (`name`, `email`, `phone`, `topic`, `message`) with red inline error messages and focuses the first invalid input.
- **Rate-Limit Error State:** If the backend returns `429 Too Many Requests`, a banner displays the cooldown warning with alternative direct phone and email contact options.
- **Network Failure State:** If a fetch fails due to timeout (12s limit) or offline status, a user-friendly error message is displayed, user-entered inputs are preserved, and the same idempotency key is retained so retrying does not create duplicate tickets.

---

## 4. Field Mapping & Honeypot Analysis

| Frontend Form Field | Input Type | Backend Field | Data Type | Transformation & Validation Rules |
| :--- | :--- | :--- | :--- | :--- |
| **Your name** | `text` | `name` | `string` | Trimmed; required; length 2–100 chars. |
| **Email address** | `email` | `email` | `string` | Lowercased; trimmed; RFC 5322 regex validated. |
| **Phone** | `tel` | `phone` | `string` (optional) | Optional; if empty string, property is omitted so backend does not receive blank strings. If provided, verified against Australian and international telephone regex. |
| **What do you need help with?** | `select` | `serviceCategory` | `enum` | Mapped to backend `SERVICE_CATEGORIES` enum (see breakdown below). |
| **Describe your issue** | `textarea` | `issueDescription` | `string` | Trimmed; min 10 chars client limit, min 5 chars backend limit; max 5000 chars. Customer's original text is 100% preserved. |
| **Website** | `text` (hidden) | *None* | `n/a` | **Verified Honeypot Field.** Placed off-screen (`-left-[9999px]`). If filled by a bot, the submission is rejected immediately on the client and never sent to the backend. |

### Dropdown Option Mapping Breakdown
The backend schema accepts only values within the `SERVICE_CATEGORIES` enum:
`["Microsoft 365 help", "Antivirus & security help", "Free security check", "One-off Fix ($99)", "Home Protect ($19/month)", "Business Care ($39/user/month)", "Something else"]`.

The frontend preserves all original user-facing dropdown options and translates them cleanly:
- `"Microsoft 365 help"` &rarr; `"Microsoft 365 help"`
- `"Antivirus & security help"` &rarr; `"Antivirus & security help"`
- `"Free quote"` &rarr; `"Free security check"` (user intent preserved via `[Requested: Free quote]` description prefix)
- `"Online support (A$99)"` &rarr; `"One-off Fix ($99)"` (user intent preserved via `[Requested: Online support (A$99)]` prefix)
- `"Smart Care annual plan (A$99)"` &rarr; `"Home Protect ($19/month)"` (user intent preserved via `[Requested: Smart Care annual plan (A$99)]` prefix)
- `"Onsite support (A$99)"` &rarr; `"One-off Fix ($99)"` (user intent preserved via `[Requested: Onsite support (A$99)]` prefix)
- `"Something else"` &rarr; `"Something else"`

---

## 5. User Experience & Error Handling Audit

### Submission State
- [x] Submit button is disabled immediately upon clicking (`disabled={submitting}`).
- [x] Clear loading spinner and "Sending…" label replace the default icon.
- [x] Repeated clicks during submission are ignored (`if (status.kind === "submitting") return;`).
- [x] Form inputs retain `aria-busy={submitting}` for assistive technologies.

### Success State
- [x] Success state is rendered **only** after HTTP 201/200 with confirmed `body.success` or `body.enquiry`.
- [x] Enquiry reference ID (`status.enquiryId`) returned by backend sequence generator is displayed to the customer.
- [x] Direct phone link is provided in case immediate assistance is required.
- [x] Form inputs are preserved during the success screen and reset only when the modal is closed.

### Error & Retry State
- [x] User-entered information is **never** cleared upon failure.
- [x] Backend validation errors (HTTP 422) map back to field-specific red error messages below the corresponding input.
- [x] Rate-limit errors (HTTP 429) display cooldown message with direct phone/email fallback.
- [x] Network timeouts (12-second abort signal) and offline errors display connection guidance.
- [x] Idempotency key is retained on retryable network errors so re-clicking submit does not create duplicate database records.
- [x] Modifying any field resets the idempotency key so modified input is treated as a fresh submission.

---

## 6. Security & Architectural Audit

1. **Exposure of Private Credentials:**
   - **Zero Exposed Secrets:** A recursive scan of all frontend source files confirmed no CRM admin passwords, superadmin credentials, MongoDB connection URIs, Resend API keys, or JWT secrets exist in client-side code.
2. **Authentication Architecture:**
   - Public forms submit to the unauthenticated public route (`/api/public/enquiries`).
   - The private CRM administration route (`/api/enquiries`) remains protected by Argon2id, session tokens, and encrypted TOTP MFA.
3. **CORS Configuration:**
   - Backend CORS headers for `/api/public/enquiries` explicitly allow the production frontend origin: `Access-Control-Allow-Origin: https://it-geek-phi.vercel.app`.
   - Preflight `OPTIONS` requests return `204 No Content` with allowed methods `POST, OPTIONS` and allowed headers `Content-Type, X-Idempotency-Key, Authorization`.
4. **Anti-Spam & Bot Mitigation:**
   - Client-side honeypot filtering on the `website` field.
   - Backend IP-based rate limiting (10 requests per 10 minutes per IP).
   - Minimum fill-time validation on the server proxy route.

---

## 7. Duplicate & Unused Integrations Audit

- **Dead or Legacy Form Implementations:** None. No legacy WordPress, Strapi, Formspree, or Zapier webhooks remain active in client components.
- **Intermediary Route (`app/api/enquiry/route.ts`):** Audited and confirmed to forward directly to `submitEnquiryToCrm()`. Any direct POST to `/api/enquiry` seamlessly routes into the central CRM integration.
- **Unused API Utilities:** None. The single utility `lib/api/enquiries.ts` is imported and used by `EnquiryDialog.tsx` and `app/api/enquiry/route.ts`.

---

## 8. Verification Results

### Static & Functional Tests Executed
1. **Automated Integration Test Suite (`scripts/verify-integration.ts`):**
   - **23 of 23 assertions PASSED.**
   - Verified topic-to-category mapping for all 7 dropdown options.
   - Verified UUID v4 idempotency key generation.
   - Verified honeypot rejection without network invocation.
   - Verified local form validation (empty names, invalid emails, optional phone formatting).
   - Verified network failure resilience and timeout handling.
2. **TypeScript & Compilation Audit:**
   - `npm run lint` (`tsc --noEmit`): **0 errors.**
   - `next build`: **Compiled successfully**, all static and dynamic routes optimized.
3. **Live Non-Mutating HTTP Contract Tests:**
   - `OPTIONS https://it-geek-backend.vercel.app/api/public/enquiries` returned `204 No Content` with CORS headers allowing `https://it-geek-phi.vercel.app`.
   - `GET https://it-geek-backend.vercel.app/api/enquiries` returned `401 Unauthorized` (confirming private status).
   - `POST https://it-geek-backend.vercel.app/api/enquiries` returned `405 Method Not Allowed` (confirming GET-only for admin queries).
   - `POST https://it-geek-backend.vercel.app/api/public/enquiries` with invalid payload returned `422 Unprocessable Entity` with expected Zod field errors.

*(Note: In strict compliance with instructions, live production database records and real transactional emails were not triggered.)*

---

## 9. Issues and Recommendations

### Findings Classification

| Severity | Issue | Impact | Recommendation |
| :--- | :--- | :--- | :--- |
| **Info / Clarification** | Target endpoint URL in prompt was `/api/enquiries` rather than `/api/public/enquiries`. | Attempting to POST to `/api/enquiries` results in `405 Method Not Allowed` because that endpoint is exclusively a protected GET endpoint for CRM admins. | Maintain the current integration with `POST /api/public/enquiries`, which is the dedicated public route. |
| **Low** | Environment variable fallback in client. | If `NEXT_PUBLIC_CRM_API_BASE_URL` is omitted from production environment settings, code defaults to `https://it-geek-backend.vercel.app`. | Explicitly define `NEXT_PUBLIC_CRM_API_BASE_URL=https://it-geek-backend.vercel.app` in Vercel project settings to ensure explicit configuration. |

---

## 10. Final Integration Scorecard

| Requirement | Result | Evidence / Notes |
| :--- | :---: | :--- |
| **All enquiry forms identified** | **PASS** | 1 unified modal form component (`EnquiryDialog.tsx`) and 9 site-wide CTA triggers identified. |
| **All intended forms use target API** | **PASS** | Connected to `https://it-geek-backend.vercel.app/api/public/enquiries` (the verified public route). |
| **Correct HTTP methods** | **PASS** | `POST` used for submissions, with `OPTIONS` preflight handled via CORS. |
| **Correct payload mapping** | **PASS** | Strict Zod schema compliance; topics mapped to valid enum values; user intent preserved. |
| **Error handling** | **PASS** | Inline field errors (422), rate-limiting alert (429), server error fallback (500), connection failure alert. |
| **Loading states** | **PASS** | Button disabled, spinning indicator active, duplicate clicks blocked during flight. |
| **Duplicate submission prevention** | **PASS** | Unique UUID v4 idempotency keys generated per submission and preserved on retry. |
| **Security checks** | **PASS** | Zero exposed secrets; honeypot trap active; CRM admin auth unaffected. |
| **Production readiness** | **PASS** | TypeScript compiles cleanly; `next build` passes; 23/23 integration tests verified. |
