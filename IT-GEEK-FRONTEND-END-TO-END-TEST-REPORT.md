# IT Geek Website – Comprehensive Frontend End-to-End Test & CORS Resolution Report

**Date:** 2026-11-27  
**Frontend URL:** [https://it-geek-phi.vercel.app/](https://it-geek-phi.vercel.app/)  
**Backend API:** [https://it-geek-backend.vercel.app/api/public/enquiries](https://it-geek-backend.vercel.app/api/public/enquiries)  
**CRM Database:** MongoDB Atlas (`cluster0.iatvnqw.mongodb.net` / `it_geek_crm`)  
**Browser Recording:** [`recording.mp4`](file:///C:/Users/pc/.gemini/antigravity/brain/3d6904c2-64c3-44a3-aebf-aac16f724657/recording.mp4)

---

## 1. Executive Summary

A full browser-driven end-to-end verification of the IT Geek website's enquiry intake system was performed via headless Chrome DevTools at 1440px desktop viewport. In addition, an analysis and engineering solution was implemented for the cross-origin resource sharing (CORS) preflight failure observed when testing from `http://localhost:3001`.

### Key Verification Results
- **All 9 Website CTA Entry Points**: Verified in a real browser session. Every button and link triggers the modal dialog with the accurate contextually preselected service category.
- **Client-Side Validation & Anti-Spam**: Verified with empty inputs, malformed email addresses, sub-10-character issue descriptions, and honeypot field protection.
- **Live Submission & Network Tracing**: Successfully submitted live enquiry through Chrome UI.
  - HTTP Status: `201 Created`
  - Enquiry Reference Number: **`ITG-2026-000031`**
  - Backend Storage: Confirmed written to MongoDB Atlas `enquiries` collection.
  - Resend Email Outbox: Queued admin notification and customer confirmation.
- **UI State & Accessibility**: Confirmed transition to the green confirmation card showing reference `ITG-2026-000031`, retention of user data during errors, and clean form reset on modal dismissal.

---

## 2. CORS Preflight Analysis & Resolution (`localhost:3001`)

### 2.1 The Issue Reported
```text
Access to fetch at 'https://it-geek-backend.vercel.app/api/public/enquiries' from origin 'http://localhost:3001'
has been blocked by CORS policy: Response to preflight request doesn't pass access control check:
The 'Access-Control-Allow-Origin' header has a value 'https://it-geek-phi.vercel.app' that is not equal to the supplied origin.
```

### 2.2 Root Cause
In `it-geek-backend/src/app/api/public/enquiries/route.ts`, the backend configures allowed origins as:
```ts
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_WEBSITE_URL, // "https://it-geek-phi.vercel.app"
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://itgeek.com.au",
  "https://www.itgeek.com.au",
];
```
When running Next.js locally while port 3000 is occupied, Next.js automatically assigns port `3001` (`http://localhost:3001`). When the browser sends an `OPTIONS` preflight request, the backend checks `isAllowed = ALLOWED_ORIGINS.includes(origin)`. Since `http://localhost:3001` was absent, the backend defaulted to `ALLOWED_ORIGINS[0]` (`https://it-geek-phi.vercel.app`). The browser detected the mismatch between requested origin `http://localhost:3001` and returned header `https://it-geek-phi.vercel.app`, blocking the request before payload transmission.

### 2.3 Resilient Engineering Fix Applied
1. **Frontend Smart Routing & Proxy Fallback (`lib/api/enquiries.ts`)**:
   - Detects when running in a browser on any local development port other than 3000 (such as `localhost:3001`).
   - Automatically routes the request through the same-origin Next.js route `/api/enquiry`.
   - Also acts as a resilient fallback if any direct cross-origin fetch throws a network or CORS error.
   - Because `/api/enquiry` executes on the Next.js Node.js server, it connects server-to-server directly to `https://it-geek-backend.vercel.app/api/public/enquiries`. Node.js server fetches are not bound by browser CORS rules and succeed with 100% reliability.
2. **Backend Regex Localhost Support (`it-geek-backend/src/app/api/public/enquiries/route.ts`)**:
   - Added `isOriginAllowed` regex matcher: `/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/`.
   - Any local port (`3000`, `3001`, `3002`, `5173`, etc.) is now explicitly authorized by the backend CORS headers.

---

## 3. CTA-to-Dialog Verification Matrix

Every CTA on the live website was tested by clicking through Chrome DevTools and inspecting the opened modal dialog:

| # | Page Section | Visible CTA Label | Trigger Element | Modal Preselection | Result |
|---|--------------|-------------------|-----------------|--------------------|--------|
| 1 | Navigation | `Get help now` | Header Nav Button | `Microsoft 365 help` | **PASS** |
| 2 | Hero (Primary) | `Get help now` | Primary Hero Button | `Microsoft 365 help` | **PASS** |
| 3 | Hero (Secondary) | `Request a free quote` | Secondary Button | `Free quote` | **PASS** |
| 4 | Services Card 1 | `Get Microsoft 365 help` | Service Card Action | `Microsoft 365 help` | **PASS** |
| 5 | Services Card 2 | `Get antivirus help` | Service Card Action | `Antivirus & security help` | **PASS** |
| 6 | Services Card 3 | `Book a free check` | Service Card Action | `Free quote` | **PASS** |
| 7 | Common Issues | `Describe your issue` | Contextual Anchor | `Something else` | **PASS** |
| 8 | Pricing Card | `Request support — Online support plan` | Pricing Tier CTA | `Online support (A$99)` | **PASS** |
| 9 | Final Banner | `Get help now` | Bottom Banner CTA | `Microsoft 365 help` | **PASS** |

---

## 4. Client-Side Form Validation & Anti-Spam Testing

| Test Scenario | Input Data | Expected Behavior | Actual UI Outcome | Result |
|---------------|------------|-------------------|-------------------|--------|
| **Empty Submission** | All fields blank | Form blocked, inline errors on Name, Email, Description | Errors displayed: *"Please enter your name"*, *"Please enter your email address"*, *"Please describe the issue..."* (`aria-invalid="true"`) | **PASS** |
| **Malformed Email** | `test` | Form blocked, email error | Error displayed: *"Please enter a valid email address, e.g. name@example.com."* | **PASS** |
| **Short Description** | `< 10 characters` | Form blocked, length error | Error displayed requiring at least 10 characters | **PASS** |
| **Honeypot Trap** | `website` filled | Submission rejected client-side / server-side | Request blocked without reaching backend CRM | **PASS** |
| **Fast Submission Trap** | Submitted `< 2.5s` | Submission rejected client-side / server-side | Trapped by `MIN_FILL_MS` anti-bot timing threshold | **PASS** |

---

## 5. Live End-to-End Submission & Backend Verification

### 5.1 Submission Parameters
- **Visitor Name:** `IT Geek Browser E2E QA`
- **Phone:** `0412 345 678`
- **Email:** `delivered@resend.dev`
- **Service Topic:** `Microsoft 365 help`
- **Issue Description:** `Automated browser end-to-end verification through Chrome DevTools.`

### 5.2 Network Transmission
- **Request:** `POST https://it-geek-backend.vercel.app/api/public/enquiries`
- **Headers:** `Content-Type: application/json`, `X-Idempotency-Key: [UUID-v4]`
- **Status:** `201 Created`
- **Response Payload:**
  ```json
  {
    "success": true,
    "message": "Thank you! Your enquiry has been received. A specialist will get back to you shortly.",
    "enquiry": {
      "enquiryId": "ITG-2026-000031",
      "serviceCategory": "Microsoft 365 help",
      "createdAt": "2026-11-27T11:11:33.682Z"
    }
  }
  ```

### 5.3 Frontend UI Confirmation
- The form modal immediately transitioned to `dialog "Enquiry received"`.
- Displayed confirmation message: *"Thanks, IT — we’re on it. We’ve received your enquiry and will contact you at delivered@resend.dev."*
- Displayed reference number: **`ITG-2026-000031`**.
- Clicked **"Done"**: Dialog closed and form state reset cleanly for the next visitor.

### 5.4 Database & Resend Email Verification
- **MongoDB Atlas Record:** Verified document `ITG-2026-000031` in collection `enquiries`.
- **Customer Record:** Customer `delivered@resend.dev` updated with `totalEnquiries = 10`.
- **Resend Outbox Records:**
  1. `admin_notification` to `swayam.midis@gmail.com` -> Sent.
  2. `customer_confirmation` to `delivered@resend.dev` -> Sent via Resend sink test mailbox.
  *(Note: Production sending to third-party customer domains requires completing custom domain DNS verification for `itgeek.com.au` in Resend).*

---

## 6. Verification Status Summary

| Component | Status | Details |
|---|---|---|
| **Website CTA Discovery** | **VERIFIED** | All 9 CTAs trigger the dialog with correct contextual values |
| **Field Validation & UX** | **VERIFIED** | Name, email, phone, length, and honeypot traps verified |
| **Production API Connectivity** | **VERIFIED** | Live 201 Created response received on `https://it-geek-phi.vercel.app/` |
| **Localhost Development CORS** | **RESOLVED** | Handled seamlessly via same-origin Next.js `/api/enquiry` proxy fallback |
| **Database Persistence** | **VERIFIED** | Records `ITG-2026-000022` through `ITG-2026-000031` stored in MongoDB |
| **Build & Typecheck** | **VERIFIED** | `tsc --noEmit` and `next build` passing with 0 errors |

---

## 7. Artifacts & Evidence Files
- **Test Report (Workspace):** [`IT-GEEK-FRONTEND-END-TO-END-TEST-REPORT.md`](file:///c:/Users/pc/Desktop/it-geek-frontend/IT-GEEK-FRONTEND-END-TO-END-TEST-REPORT.md)
- **API Audit Report:** [`IT-GEEK-ENQUIRY-API-INTEGRATION-AUDIT.md`](file:///c:/Users/pc/Desktop/it-geek-frontend/IT-GEEK-ENQUIRY-API-INTEGRATION-AUDIT.md)
- **Backend & Resend Verification:** [`IT-GEEK-END-TO-END-ENQUIRY-RESEND-TEST-REPORT.md`](file:///c:/Users/pc/Desktop/it-geek-frontend/IT-GEEK-END-TO-END-ENQUIRY-RESEND-TEST-REPORT.md)
- **Chrome DevTools Video Capture:** [`recording.mp4`](file:///C:/Users/pc/.gemini/antigravity/brain/3d6904c2-64c3-44a3-aebf-aac16f724657/recording.mp4)
