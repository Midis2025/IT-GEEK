# ITGeek landing page — client approval checklist

Please review the page and confirm, change or remove each item below. Items marked **Pending** are on the page now
but are not on itgeek.com.au, so the production build stays blocked until you confirm them (`lib/site.ts → launchChecks`).

Business details, the four policy links, “No fix, no pay (terms apply)”, “Request a free quote”, support hours and
the FAQ were already checked against itgeek.com.au and don't need approval unless you want changes.

---

## 1. Campaign pricing — Pending

Prices are kept exactly as designed. They differ from the plans on itgeek.com.au (online support hourly from AUD 70,
annual plans from AUD 299, “plans from AUD 49.99”), so please confirm they're a separate campaign offer.

| Plan | Price | Note on page | Inclusions shown | Confirm |
| --- | --- | --- | --- | --- |
| One-off Fix | $99 / issue | AUD, inc. GST · No fix, no pay | Remote fix by a specialist · Outlook, Teams, OneDrive & more · Virus & malware removal · Plain-English summary of the fix · **7-day follow-up support** | ☐ |
| Home Protect (featured) | $19 / month | AUD, inc. GST · Up to 5 devices | **Premium antivirus licence included** · Setup on up to 5 devices · **Priority** Microsoft 365 help · **Monthly** security health check · Phishing & scam email checks | ☐ |
| Business Care | $39 / user / month | AUD, inc. GST · **Minimum 3 users** | **Unlimited** Microsoft 365 support · Microsoft Defender management · User onboarding & offboarding · MFA, backup & security policies · **Dedicated account specialist** | ☐ |

Also: “Larger team or a one-off project like a full Microsoft 365 migration? Talk to our team” (below the plans), and
the matching enquiry-form topics. File: `components/sections/Pricing.tsx`, topics in `lib/enquiry.ts`.

## 2. Service coverage — Pending

Please tick each service ITGeek provides; anything unticked will be removed or reworded.

| Service / feature | Where it appears on the page | File(s) | Confirm |
| --- | --- | --- | --- |
| Microsoft Teams | Hero intro and example card · Services checklist · Common issues (“Teams calls drop…”) · Supported products · Pricing (One-off Fix) · Footer link “Teams support” | `Hero.tsx`, `Services.tsx`, `CommonIssues.tsx`, `SupportedProducts.tsx`, `Pricing.tsx`, `Footer.tsx` | ☐ |
| SharePoint | Services (“OneDrive & SharePoint”) · Common issues (sync) · Supported products · Footer link | `Services.tsx`, `CommonIssues.tsx`, `SupportedProducts.tsx`, `Footer.tsx` | ☐ |
| Exchange Online | Supported products | `SupportedProducts.tsx` | ☐ |
| Excel, Word & PowerPoint | Services · Supported products | `Services.tsx`, `SupportedProducts.tsx` | ☐ |
| Licensing & activation | Services · Common issues · Hero example card · Footer link | `Services.tsx`, `CommonIssues.tsx`, `Hero.tsx`, `Footer.tsx` | ☐ |
| Microsoft 365 setups & migrations | Services (“New setups & migrations”) · Pricing note (“full Microsoft 365 migration”) · Footer link “Setup & migration” | `Services.tsx`, `Pricing.tsx`, `Footer.tsx` | ☐ |
| User onboarding & offboarding | Services · Business Care plan | `Services.tsx`, `Pricing.tsx` | ☐ |
| Multi-factor authentication (MFA) & account recovery | Services (“MFA & account recovery”) · Business Care (“MFA, backup & security policies”) | `Services.tsx`, `Pricing.tsx` | ☐ |
| Backup policies | Business Care plan | `Pricing.tsx` | ☐ |
| Microsoft Defender | Services (“Microsoft Defender setup”) · Business Care (“Defender management”) · Supported products · FAQ · Footer link | `Services.tsx`, `Pricing.tsx`, `SupportedProducts.tsx`, `lib/faq.ts`, `Footer.tsx` | ☐ |
| Antivirus support (install, renewals, conflicts) | Services · Common issues (“Antivirus expired or clashing”) · Footer link · FAQ | `Services.tsx`, `CommonIssues.tsx`, `Footer.tsx`, `lib/faq.ts` | ☐ |
| “All major antivirus brands” | Supported products | `SupportedProducts.tsx` | ☐ |
| Premium antivirus licence included | Home Protect plan | `Pricing.tsx` | ☐ |
| Ransomware response | Services · Common issues (“Ransomware or a hacked account — rapid containment…”) · Footer link | `Services.tsx`, `CommonIssues.tsx`, `Footer.tsx` | ☐ |
| Hacked account recovery | Services · Common issues | `Services.tsx`, `CommonIssues.tsx` | ☐ |
| Phishing & scam checks | Services · Common issues (“Clicked a phishing link?”) · Home Protect plan | `Services.tsx`, `CommonIssues.tsx`, `Pricing.tsx` | ☐ |
| Security health checks | Services · Home Protect (“Monthly security health check”) · Footer link | `Services.tsx`, `Pricing.tsx`, `Footer.tsx` | ☐ |
| Ongoing threat monitoring | Services (antivirus checklist) | `Services.tsx` | ☐ |
| “Most of them in a single remote session” | Common issues subtitle | `CommonIssues.tsx` | ☐ |

Already confirmed by itgeek.com.au (no action needed): Microsoft Office / Outlook / OneDrive help, virus & malware
removal, cybersecurity, remote support, onsite support (costs confirmed first).

## 3. Remote-session wording — Pending

Please confirm these statements match how your technicians actually connect:

| Statement on the page | Where | File | Confirm |
| --- | --- | --- | --- |
| “With your permission we connect over a secure remote session, and you can watch as we work.” | How it works, step 2 | `components/sections/HowItWorks.tsx` | ☐ |
| “Your OK comes first — Nothing on your device is accessed without your permission.” | Why ITGeek | `components/sections/WhyItGeek.tsx` | ☐ |
| “With your permission, your specialist connects to your device through a secure remote session. You can watch as they work, and nothing is accessed without your OK.” | FAQ (also in Google structured data) | `lib/faq.ts` | ☐ |
| “Nothing is accessed on your device without your OK.” | Enquiry form, under the Send button | `components/EnquiryDialog.tsx` | ☐ |
| “Secure remote help” | Hero trust row | `components/sections/Hero.tsx` | ☐ |

## 4. Hero example card — for information

The “Today’s fixes” card in the hero is labelled **Example** and shows illustrative tickets (Teams sign-in loop,
trojan found on laptop, Office activation error, “Threat scan complete — Malware removed”). No times, counts or
customer data are shown. Approve as illustrative ☐ or ask for it to be changed.

## 5. Customer reviews

The Reviews section is hidden (and so is its footer link) because there are no approved reviews. The design is kept
ready. To show it, supply genuine reviews with the customer's permission: quote, name as it may be published,
role/location (optional), star rating actually given (optional) and where it was originally posted. ☐ Supply reviews /
☐ Keep hidden.

## 6. Logo

The page uses the official logo from itgeek.com.au, unaltered (JPEG on a white plate). If you have an original
vector or transparent-background version, please send its file. ☐ Keep current logo / ☐ Replacement supplied.

## 7. Launch decisions

| Decision | Proposed | Confirm |
| --- | --- | --- |
| Landing page address | `https://support.itgeek.com.au/` (itgeek.com.au WordPress site unchanged) | ☐ |
| Hosting | Vercel (or another host you prefer) | ☐ |
| DNS change | One `CNAME support → <Vercel target>` record at your DNS provider; nothing else changes | ☐ |
| Where enquiries go | CRM / email notification / Zapier / Make — please name the destination and the inbox | ☐ |
| Spam / rate limiting | Vercel Firewall rule or Upstash Redis (see README) | ☐ |
