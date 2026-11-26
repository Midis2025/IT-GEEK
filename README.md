# ITGeek — Landing page

Conversion-focused landing page for ITGeek (Microsoft 365 & antivirus remote support), built from the Figma file
**ITGreek Landing Page** (`Desktop 1440` frame).

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · `next/font` (Inter, Plus Jakarta Sans).
Requires **Node.js 20.9+** (developed on Node 24).

> **Before publishing:** all content checks are verified against itgeek.com.au. Production builds on CI/hosting
> platforms still require `NEXT_PUBLIC_SITE_URL` (see [Remaining launch requirements](#remaining-launch-requirements)).

## Installation

```bash
npm install
cp .env.example .env.local   # then fill in the values (see below)
```

## Local development

```bash
npm run dev          # http://localhost:3000 (hot reload)
npm run lint         # TypeScript type-check (tsc --noEmit)
```

## Production build

```bash
npm run build        # optimised production build (prints the unverified launch items as a warning locally)
npm start            # serve the production build on http://localhost:3000  (npm start -- -p 3100 for another port)
```

> Windows + OneDrive: if a build fails with `EPERM … unlink .next\…`, OneDrive is syncing the build folder.
> Delete `.next` and rebuild, or exclude `.next`/`node_modules` from OneDrive sync.

## Client review mode

The page is ready for client review exactly as visitors would see it — no developer messages in the UI:

- The empty Reviews section and its footer link are hidden (no placeholder) until approved reviews are added.
- The Next.js developer badge is disabled (`devIndicators: false`).
- The hero “Today’s fixes” card stays labelled **Example** (customer-facing, not a developer note).

Recommended client-review server — a local production build (identical to what would be deployed):

```bash
npm run build && npm start -- -p 3100   # http://localhost:3100
```

`npm run dev` (http://localhost:3000) shows the same clean page. Developers can opt in to a labelled Reviews layout
placeholder on the dev server only with `NEXT_PUBLIC_SHOW_REVIEW_PLACEHOLDER=true`; it never renders in a build.

The consolidated client approval checklist is in [`CLIENT-APPROVAL.md`](CLIENT-APPROVAL.md).

## Environment variables

Set these in `.env.local` locally and in your hosting provider's environment settings in production.
Never commit real values (`.env*` is git-ignored).

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Yes | This landing page's own URL — a dedicated subdomain (`https://support.itgeek.com.au`) or path (`https://itgeek.com.au/microsoft-365-support`). Drives canonical, Open Graph, sitemap, robots, structured data and (for a path) the Next.js `basePath`. **Never** `https://itgeek.com.au` — CI builds fail if it is unset or the corporate root. Unset locally → `http://localhost:3000`. |
| `ENQUIRY_WEBHOOK_URL` | Yes | Where enquiry-form leads are POSTed. Server-side only; must be `https://` in production. |
| `ENQUIRY_WEBHOOK_SECRET` | Recommended | Sent as the `X-Webhook-Secret` header so the receiver can reject forged requests. |
| `NEXT_PUBLIC_SHOW_REVIEW_PLACEHOLDER` | No | `true` shows a labelled Reviews layout placeholder on the **dev server only** (never in a build). Leave unset for client review. |
| `ALLOW_UNVERIFIED_CONTENT` | No | `true` lets a CI/hosting build proceed with unverified content (e.g. a password-protected staging site). Leave unset for production. |

## Enquiry webhook setup

Every “Get help”/plan CTA opens the enquiry form. Submissions go to `POST /api/enquiry`, which validates them and
forwards the lead to `ENQUIRY_WEBHOOK_URL` as JSON:

```json
{
  "name": "…", "email": "…", "phone": "… or empty", "topic": "Microsoft 365 help",
  "message": "…", "source": "itgeek-landing", "submittedAt": "2026-11-26T05:38:03.765Z"
}
```

1. Create an inbound webhook in your tool of choice — e.g. a Zapier “Catch Hook”, Make “Custom webhook”, n8n Webhook
   node or your CRM's inbound-lead webhook — and route it to email/CRM/helpdesk.
2. Set `ENQUIRY_WEBHOOK_URL` (and optionally `ENQUIRY_WEBHOOK_SECRET`, then check the header in the receiver).
3. Submit a test enquiry and confirm it arrives. The form shows success **only** if the webhook returns a 2xx.

Without a webhook (or if it fails), the form shows an error with the phone number and email — it never fakes success.

### Lead generation — connecting the form

**Submitted fields** (validated server-side before delivery):

| Field | Type | Rules |
| --- | --- | --- |
| `name` | string | required, ≤ 80 characters |
| `email` | string | required, valid email, ≤ 254 characters |
| `phone` | string | optional (empty string if not given); Australian number if provided, ≤ 20 characters |
| `topic` | string | one of the fixed topics in `lib/enquiry.ts` (e.g. “Microsoft 365 help”, “Free quote”, “Online support (from A$70/hour)”) |
| `message` | string | required, ≤ 2,000 characters |
| `source` | string | always `itgeek-landing` — use it to tag and route these leads |
| `submittedAt` | string | ISO 8601 UTC timestamp |

**Webhook requirements:** an `https://` endpoint that accepts `POST` with `Content-Type: application/json`, answers
with any **2xx within 8 seconds**, and does **not redirect** (redirects are refused). Anything else is shown to the
visitor as a failure (with the phone number and email), never as success. If `ENQUIRY_WEBHOOK_SECRET` is set, the
receiver should reject requests whose `X-Webhook-Secret` header doesn't match.

**Destinations** (to be chosen with the client; none is configured):

- **CRM** (HubSpot, Zoho, Salesforce, Pipedrive, a helpdesk…): use the CRM's inbound webhook / web-to-lead endpoint if
  it accepts this JSON, otherwise put Zapier or Make in between to map the fields (name/email/phone → contact,
  topic → lead source or category, message → note).
- **Email notification:** a Zapier “Catch Hook” or Make “Custom webhook” followed by an email step to the approved
  inbox (e.g. support@itgeek.com.au), optionally also creating the CRM record. A Power Automate “When an HTTP request
  is received” flow also works if the client prefers Microsoft 365.
- **Zapier / Make / n8n:** create the webhook trigger, copy its URL into `ENQUIRY_WEBHOOK_URL`, add a filter step that
  checks the `X-Webhook-Secret` header, then add the CRM and/or email actions.

Check the chosen tool's plan limits, data location and privacy terms against the ITGeek Privacy policy before
connecting it — leads contain personal information. Test only with clearly marked test data (e.g. name
“TEST — please ignore”) and an internal address, never real customer details.

### Form security (current implementation)

- Server-side validation of every field (shared with the client) including an allow-list for the topic.
- Spam protection: hidden honeypot field + minimum fill time (2.5 s); same-origin check on browser requests.
- Request limits: JSON only, 10 KB body maximum (checked before and after reading), field length limits.
- Personal information is never logged; failures log only the reason. The webhook URL/secret stay server-side and
  never appear in client code. Redirects from the webhook are refused.
- Clear feedback for validation errors, rate limiting, unavailability and delivery failures.

### Rate limiting in production

The built-in limiter (5 submissions / 10 minutes per client IP) is **in-memory**: it is per server instance and
resets on restart or redeploy, and it keys on the `x-forwarded-for` header, which must be set by a trusted proxy.

| Hosting | Recommendation |
| --- | --- |
| Single Node server / VPS (`npm start`) | The built-in limiter works. Put it behind Nginx/Caddy that **overwrites** `X-Forwarded-For` with the real client IP, optionally adding Nginx `limit_req` for `/api/enquiry`. |
| Vercel | The platform sets `x-forwarded-for`, but serverless instances don't share memory. Add a Vercel Firewall rate-limit rule for `/api/enquiry`, or a shared store such as Upstash Redis (`@upstash/ratelimit`). |
| Cloudflare in front of any host | A Cloudflare WAF rate-limiting rule on `/api/enquiry`. |
| Netlify / other serverless | A shared store (Redis/KV) or the platform's edge rate limiting. |

Check current plan limits and pricing with the provider before choosing; none of these are configured yet.
For stronger bot protection, a CAPTCHA-style check (e.g. Cloudflare Turnstile) can be added later.

## Business information configuration

All business details live in **`lib/site.ts`** — no component needs editing. Values marked ✓ were verified against
the official website on 26 Nov 2026.

| Setting | Field | Current value / source |
| --- | --- | --- |
| Phone ✓ | `phone.display`, `phone.dial`, `phone.e164` | 1800 484 335 (1800 IT GEEK) — itgeek.com.au/contact |
| Email ✓ | `email` | support@itgeek.com.au — itgeek.com.au/contact |
| Support hours ✓ | `hours`, `openingHours` | Mon–Fri 9am–6pm AEST — itgeek.com.au/support-policy |
| Postal address ✓ | `address` (structured data only) | PO Box 4444 Strathfield NSW 2136 — itgeek.com.au/contact |
| Business / legal name ✓ | `name`, `legalName` | ITGeek / IT Geek Pty Ltd — itgeek.com.au legal pages |
| Legal pages ✓ | `legal` (footer links) | Privacy, Terms and conditions, Support, Refund and cancellation — on itgeek.com.au |
| Social profiles ✓ | `social` (structured data `sameAs`) | Facebook, Instagram, LinkedIn, X — itgeek.com.au footer |
| Logo | `logo` → `public/brand/itgeek-logo.png` | Official logo from itgeek.com.au, white background removed (source JPEG kept as `itgeek-logo.jpeg`) |
| Favicon | `app/icon.png`, `app/apple-icon.png` | Official site icon from itgeek.com.au |
| SEO title & description | `title`, `description` | — |
| Production domain | `NEXT_PUBLIC_SITE_URL` | Not decided — see launch requirements |

Page copy lives in the section components (`components/sections/*`), `lib/faq.ts` and `lib/testimonials.ts` (approved reviews only).

### Launch guard

`lib/site.ts → launchChecks` lists every unverified claim and placeholder. After confirming an item (or replacing it
with verified content), set its `verified: true`. While any item is unverified:

- local `npm run build` prints the list as a warning;
- any build with `CI` set (Vercel, Netlify, GitHub Actions and most hosts) **fails**, unless
  `ALLOW_UNVERIFIED_CONTENT=true` is set deliberately.

## Production deployment

The corporate WordPress site at **itgeek.com.au stays as it is**. This landing page is deployed independently on its
own subdomain or path; it never serves `/` of itgeek.com.au and links to the official policy pages there.

### Option A — subdomain (recommended), e.g. `support.itgeek.com.au`

1. Confirm the subdomain with the client and check it is unused.
2. Deploy the app to a host (Vercel, Netlify, or a Node server — see below) and add the custom domain there.
3. DNS (at the itgeek.com.au DNS provider) — add only a record for the subdomain; **do not change** the apex/`www`
   records that point to WordPress:
   - Vercel / Netlify: `CNAME support → <the target the host shows>` (e.g. `cname.vercel-dns.com`).
   - Own server: `A support → <server IP>` (and `AAAA` for IPv6), HTTPS via the host or Let's Encrypt.
4. Set `NEXT_PUBLIC_SITE_URL=https://support.itgeek.com.au` and the webhook variables, then build and deploy.

### Option B — path on the existing domain, e.g. `itgeek.com.au/microsoft-365-support`

1. Set `NEXT_PUBLIC_SITE_URL=https://itgeek.com.au/microsoft-365-support`. The `basePath` is derived from the URL
   automatically; all assets, images, metadata files and the form API are served under the path.
2. Deploy the app on its own host, then configure the **WordPress server / CDN** to reverse-proxy only
   `/microsoft-365-support` and `/microsoft-365-support/*` to it (Nginx `location` + `proxy_pass`, Cloudflare
   Worker/route, etc.). Forward `Host`, `X-Forwarded-Host` and set `X-Forwarded-For` to the client IP.
3. Crawlers only read `/robots.txt` at the domain root, so submit `<URL>/sitemap.xml` in Google Search Console (or
   reference it from the WordPress robots.txt).

Option A is simpler and fully isolated from WordPress; Option B needs changes on the WordPress hosting.

### Vercel (recommended host for Option A)

Nothing has been created on Vercel. Once approved:

1. **Import** the Git repository as a new Vercel project. Framework preset: Next.js (auto-detected); build command
   `npm run build`; install command `npm ci`; Node.js 20.x or later in the project settings.
2. **Environment variables** (Project → Settings → Environment Variables):

   | Variable | Production | Preview |
   | --- | --- | --- |
   | `NEXT_PUBLIC_SITE_URL` | `https://support.itgeek.com.au` (once approved) | the preview/staging URL |
   | `ENQUIRY_WEBHOOK_URL` | approved production webhook | a test webhook |
   | `ENQUIRY_WEBHOOK_SECRET` | random secret (also set in the receiver) | a separate test secret |
   | `ALLOW_UNVERIFIED_CONTENT` | **unset** | `true` only for a protected preview before approval |

   Mark the webhook variables as **Sensitive**. Vercel sets `CI=1` during builds, so both launch guards run: the
   production build fails until `NEXT_PUBLIC_SITE_URL` is the dedicated URL and every `launchChecks` item is verified.
   If a preview is shared before approval, keep **Deployment Protection** (Vercel Authentication) on for Preview
   deployments so unverified content isn't public — check what your Vercel plan includes.
3. **Domain:** Project → Settings → Domains → add `support.itgeek.com.au`. Vercel shows the exact DNS record to create
   (see DNS below). Canonical URLs always use `NEXT_PUBLIC_SITE_URL`, so the `*.vercel.app` address doesn't compete
   in search.
4. **Rate limiting:** add a Vercel Firewall rate-limit rule for `/api/enquiry` (e.g. 5 requests / 10 minutes per IP),
   or a shared store such as Upstash Redis (`@upstash/ratelimit`). See [Rate limiting in production](#rate-limiting-in-production).
5. Deploy, then run the checks in [After deploying](#after-deploying).

### DNS for `support.itgeek.com.au`

Make the change at the provider that hosts the itgeek.com.au DNS zone (check the domain's nameservers first). Only
**one new record** is needed; leave the apex (`@`), `www`, MX (email) and all other records untouched, and don't move
the nameservers.

| Type | Name / host | Value | TTL |
| --- | --- | --- | --- |
| `CNAME` | `support` | the target shown in Vercel's Domains screen (e.g. `cname.vercel-dns.com`, or a project-specific `…vercel-dns…` value) | 3600 or provider default |

- First confirm `support` isn't already in use (helpdesk/ticketing tools often use that name). If it is, choose
  another subdomain and update `NEXT_PUBLIC_SITE_URL`.
- If the zone has a **CAA** record, it must allow `letsencrypt.org`, or Vercel can't issue the HTTPS certificate.
- If the zone is on Cloudflare, set the record to “DNS only” (grey cloud) unless Cloudflare is deliberately placed in
  front of Vercel.
- Vercel issues the HTTPS certificate automatically once the record resolves.

### Hosting notes

- **Vercel / Netlify:** import the repository; framework auto-detected; set environment variables in the dashboard.
- **Node server:** `npm ci && npm run build && npm start` behind Nginx/Caddy (HTTPS), with a process manager
  (PM2/systemd). Requires Node 20.9+.
- Builds on CI/hosting run the launch guard: they fail until `NEXT_PUBLIC_SITE_URL` is a dedicated URL **and** every
  `launchChecks` item is verified (`ALLOW_UNVERIFIED_CONTENT=true` overrides only the content checks).

### After deploying

Submit a real test enquiry (it must arrive at the webhook), then check `/robots.txt`, `/sitemap.xml`,
`/opengraph-image`, canonical URL, favicon, the four policy links and Lighthouse.

## Structure

```
app/
  layout.tsx            fonts, metadata (title, description, canonical, OG/Twitter)
  page.tsx              section order + JSON-LD (ProfessionalService, WebSite, FAQPage)
  globals.css           design tokens (from Figma variables) + type scale
  api/enquiry/route.ts  validation, spam traps, size limit, rate limit, webhook delivery
  icon.png, apple-icon.png, opengraph-image.tsx, robots.ts, sitemap.ts
components/
  sections/             one component per Figma section (13)
  ui/                   Button, Icon, SectionHeader/Eyebrow, CheckItem, Logo
  EnquiryDialog.tsx     lead form (native <dialog>)
lib/
  site.ts               business configuration + launch checks
  enquiry.ts            shared validation
  faq.ts                FAQ content (also used for FAQPage structured data)
  testimonials.ts       approved customer reviews only (empty → Reviews section hidden)
public/figma/           SVG icons/decorations exported from Figma
next.config.ts          security headers + launch guard
```

## Remaining launch requirements

Tracked in `lib/site.ts → launchChecks`; CI/hosting builds stay blocked until every item is verified.

**Content** — pricing, service coverage and remote-support wording were re-verified against itgeek.com.au and the
unsupported campaign claims removed (see `CLIENT-APPROVAL.md`). The official FAQ's “from AUD 49.99 / AUD 49 per hour”
conflicts with the Plans & Pricing page; the page follows Plans & Pricing until the client confirms.

**Deployment URL** — set `NEXT_PUBLIC_SITE_URL` in the hosting environment (proposed `https://support.itgeek.com.au`).
CI/hosting builds fail without it.

**Testimonials**
- Add genuine, approved reviews to `lib/testimonials.ts`. Until then the Reviews section and its footer link are
  hidden everywhere; a labelled layout placeholder is opt-in for developers on the dev server only.

**Infrastructure**
- Approved lead destination (CRM / email / Zapier / Make) → `ENQUIRY_WEBHOOK_URL` (+ `ENQUIRY_WEBHOOK_SECRET`) and production rate limiting.
- DNS/hosting for the approved URL (see Production deployment). The WordPress site at itgeek.com.au is unaffected.
- Optional: supplied original logo file (not in the project) or a vector/transparent logo.
