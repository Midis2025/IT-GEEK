/**
 * Business configuration — the single place to update contact details, domain, legal and social links.
 * Components read everything from here; nothing below needs to be edited in individual components.
 */

/**
 * Deployment URL of THIS landing page, e.g. https://support.itgeek.com.au (subdomain) or
 * https://itgeek.com.au/microsoft-365-support (path). It drives canonical URLs, Open Graph, sitemap, robots and — for a
 * path deployment — the Next.js basePath. It must NOT be the corporate root (https://itgeek.com.au), which stays on
 * WordPress. Unset → localhost (local review only; CI/hosting builds are blocked by the launch guard).
 */
const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
const siteUrl = (configuredSiteUrl || "http://localhost:3000").replace(/\/$/, "");

/** True when a dedicated deployment URL is configured (set, and not the corporate WordPress root). */
export const deploymentUrlOk =
  Boolean(configuredSiteUrl) && !["https://itgeek.com.au", "https://www.itgeek.com.au"].includes(siteUrl);

/** Path prefix when deployed under a path of an existing domain ("" for a subdomain/root deployment). */
export const basePath = new URL(siteUrl).pathname.replace(/\/$/, "");

/** Prefix a root-relative URL (public assets, API routes) with the basePath. */
export const withBasePath = (path: string) => `${basePath}${path}`;

/**
 * Official company website — source of the verified details below (checked 26 Nov 2026) and host of the legal pages.
 * Sources: /contact/, /support-policy/, /privacy-policy-2/, /terms-and-conditions/, /refund-and-cancellation-policy/.
 */
const officialSite = "https://itgeek.com.au";

/** Verified: itgeek.com.au/contact — “1800 IT GEEK (48 4335)”. Other official AU numbers: +61 2 8614 8114, +61 480 827 271. */
const phone = {
  display: "1800 484 335",
  /** Digits only, as dialled in Australia. */
  dial: "1800484335",
  /** International format for structured data. */
  e164: "+611800484335",
};

export const site = {
  name: "ITGeek",
  /** Verified: legal pages on itgeek.com.au (“IT Geek Pty Ltd”). */
  legalName: "IT Geek Pty Ltd",
  /** Official logo from itgeek.com.au (850×350 JPEG on white; no SVG/transparent version is published). */
  logo: { src: "/brand/itgeek-logo.jpeg", width: 850, height: 350 },
  url: siteUrl,
  officialSite,
  /** Company domain shown in the footer copyright line (the corporate site, not this landing page's host). */
  domain: new URL(officialSite).host,
  title: "ITGeek | Microsoft 365 Support & Antivirus Specialists in Australia",
  description:
    "Australian remote help desk for Microsoft 365 and antivirus. Outlook, OneDrive, Office, virus and malware problems sorted remotely by professional technicians — no fix, no pay.",

  // Customer support contact
  phoneDisplay: phone.display,
  phoneHref: `tel:${phone.dial}`,
  phoneE164: phone.e164,
  /** Verified: itgeek.com.au/contact and all policies. */
  email: "support@itgeek.com.au",
  /**
   * Verified: itgeek.com.au/support-policy — “Standard support hours: Monday to Friday 9 am to 6 pm AEST”.
   * (The site also advertises 24/7/365 online software support and 24/7 emergency support at extra charge.)
   */
  hours: "Mon–Fri · 9am–6pm AEST",
  /** Machine-readable opening hours for structured data (must match `hours`). */
  openingHours: {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "18:00",
  },
  /** Verified postal address: itgeek.com.au/contact. Used in structured data only (no address slot in the design). */
  address: { streetAddress: "PO Box 4444", locality: "Strathfield", region: "NSW", postalCode: "2136", country: "AU" },
  serviceArea: "Remote support Australia-wide",
  country: "Australia",

  /** Official policy pages on itgeek.com.au (verified to exist and to apply to IT Geek Pty Ltd services). */
  legal: [
    { id: "privacy", label: "Privacy policy", href: `${officialSite}/privacy-policy-2/` },
    { id: "terms", label: "Terms and conditions", href: `${officialSite}/terms-and-conditions/` },
    { id: "support", label: "Support policy", href: `${officialSite}/support-policy/` },
    { id: "refund", label: "Refund and cancellation policy", href: `${officialSite}/refund-and-cancellation-policy/` },
  ],

  /** Verified: social links in the itgeek.com.au footer (used in structured data `sameAs`). */
  social: [
    "https://www.facebook.com/share/14aDYJjN5n1/",
    "https://www.instagram.com/itgeekau/",
    "https://www.linkedin.com/in/itgeekau/",
    "https://x.com/itgeekau",
  ] as string[],
} as const;

export const privacyPolicyUrl = site.legal.find((l) => l.id === "privacy")?.href ?? "";
/** Terms that apply to the “No fix, no pay” offer (official Refund and cancellation policy). */
export const refundPolicyUrl = site.legal.find((l) => l.id === "refund")?.href ?? "";

/** Anchor every enquiry CTA uses. Without JavaScript it scrolls to the final CTA (phone + email). */
export const ENQUIRY_HREF = "#contact";

export const navLinks = [
  { label: "Microsoft 365", href: "#microsoft-365" },
  { label: "Antivirus", href: "#antivirus" },
  { label: "Common issues", href: "#common-issues" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
] as const;

/**
 * Pre-launch verification. Items marked `verified: true` were confirmed against the official website (`source`).
 * Everything else is content from the Figma design that is unverified or CONTRADICTED by itgeek.com.au and needs
 * client confirmation (`note` records what the official site says).
 *
 * A production build on a CI/hosting platform fails while any item is unverified (see next.config.ts),
 * so sample content cannot be deployed by accident. Override deliberately with ALLOW_UNVERIFIED_CONTENT=true.
 */
type LaunchCheck = { id: string; verified: boolean; item: string; where: string; source?: string; note?: string };

export const launchChecks: readonly LaunchCheck[] = [
  // ── Business details verified against itgeek.com.au (26 Nov 2026) ──
  { id: "name", verified: true, item: "Company name ITGeek / legal entity IT Geek Pty Ltd", where: "lib/site.ts → name, legalName", source: `${officialSite}/terms-and-conditions/` },
  { id: "phone", verified: true, item: "Phone 1800 484 335 (1800 IT GEEK)", where: "lib/site.ts → phone", source: `${officialSite}/contact/` },
  { id: "email", verified: true, item: "Email support@itgeek.com.au", where: "lib/site.ts → email", source: `${officialSite}/contact/` },
  { id: "hours", verified: true, item: "Support hours Mon–Fri 9am–6pm AEST (hero, top bar, footer, CTA, form)", where: "lib/site.ts → hours, openingHours", source: `${officialSite}/support-policy/` },
  { id: "address", verified: true, item: "Postal address PO Box 4444 Strathfield NSW 2136 (structured data only)", where: "lib/site.ts → address", source: `${officialSite}/contact/` },
  { id: "social", verified: true, item: "Facebook, Instagram, LinkedIn and X profiles", where: "lib/site.ts → social", source: `${officialSite}/` },
  { id: "legal", verified: true, item: "Privacy, Terms and conditions, Support and Refund policies linked from the footer", where: "lib/site.ts → legal", source: `${officialSite}/privacy-policy-2/` },
  { id: "privacy-note", verified: true, item: "Enquiry form privacy note references and links the official Privacy policy", where: "components/EnquiryDialog.tsx", source: `${officialSite}/privacy-policy-2/` },
  { id: "guarantee", verified: true, item: "“No fix, no pay” with “terms apply” linked to the Refund and cancellation policy", where: "Hero, WhyItGeek, Pricing, FAQ, FinalCta", source: `${officialSite}/plans-and-pricing/` },
  { id: "free-quote", verified: true, item: "“Request a free quote” CTA (replaces the unverified “Free security check” offer)", where: "Hero.tsx, lib/enquiry.ts", source: `${officialSite}/contact/` },
  { id: "australian", verified: true, item: "“Australian remote IT support” / “Australian business — IT Geek Pty Ltd” (replaces “100% Australian-based”)", where: "TopBar.tsx, WhyItGeek.tsx", source: `${officialSite}/terms-and-conditions/` },
  { id: "benefits", verified: true, item: "Why ITGeek benefit cards: remote support, Outlook/Office/OneDrive help, virus & malware removal, no fix no pay; “Professional technicians… clear scope of work”; “plain-English” help", where: "components/sections/WhyItGeek.tsx", source: `${officialSite}/services/ · /plans-and-pricing/ · /about/` },
  { id: "faq", verified: true, item: "FAQ: brand list and “teams of 3–50” removed; business, onsite and no-fix-no-pay answers use official facts", where: "lib/faq.ts", source: `${officialSite}/faq/ · /contact/ · /refund-and-cancellation-policy/` },

  // ── Resolved in code (unverified claims removed) ──
  { id: "response", verified: true, item: "All response-time promises removed (15-min response, within the hour, within minutes, usually same day, fixed in N min)", where: "Hero, WhyItGeek, HowItWorks, Pricing, FinalCta", note: "Official Support Policy: standard requests answered within one business day" },
  { id: "rating", verified: true, item: "Customer ratings removed (4.9/5, 500+ reviews, star rating in hero)", where: "Hero.tsx, WhyItGeek.tsx" },
  { id: "stats", verified: true, item: "Statistics removed (2,000+ issues resolved, 98% first-contact fix)", where: "components/sections/WhyItGeek.tsx" },
  { id: "callout", verified: true, item: "“No call-out fee(s)” wording removed", where: "HowItWorks.tsx, FinalCta.tsx", note: "Official onsite plans include an A$150 call-out fee" },
  { id: "reviews", verified: true, item: "Figma sample testimonials removed; Reviews section renders only with approved reviews (dev-only labelled preview otherwise)", where: "lib/testimonials.ts, components/sections/Testimonials.tsx" },
  { id: "scope", verified: true, item: "No statements that ITGeek offers nothing else; this page is described as a dedicated Microsoft 365 & antivirus help desk", where: "Hero, Services, WhyItGeek, FAQ, meta description" },
  { id: "hero-tickets", verified: true, item: "Hero “Today’s fixes” card labelled “Example”; no times or counts presented as live data", where: "components/sections/Hero.tsx" },
  { id: "channels", verified: true, item: "No live chat / online booking references (“Call us or send an online enquiry”; “Request support” replaces “Book a fix”)", where: "HowItWorks.tsx, Pricing.tsx" },

  // ── Deployment URL: verified automatically once NEXT_PUBLIC_SITE_URL is a dedicated subdomain/path ──
  {
    id: "domain",
    verified: deploymentUrlOk,
    item: "Deployment URL (NEXT_PUBLIC_SITE_URL) — proposed https://support.itgeek.com.au, pending client approval; never the itgeek.com.au root",
    where: "NEXT_PUBLIC_SITE_URL",
  },

  // ── Re-verified against itgeek.com.au (26 Nov 2026); unsupported campaign claims removed ──
  {
    id: "pricing",
    verified: true,
    item: "Pricing replaced with the official published plans: online support from A$70/hour (business days 9am–6pm); Smart Care annual plans Basic A$299, Standard A$499, Premium A$699 per year (one-year contract, online support 24/7/365); onsite support from A$70/hour + A$150 call-out fee (parts, travel and weekend surcharges extra); all prices excl. GST and card fees. Campaign $99/$19/$39 plans and their inclusions removed.",
    where: "components/sections/Pricing.tsx, lib/enquiry.ts (topics), app/page.tsx (priceRange)",
    source: `${officialSite}/plans-and-pricing/ (rendered page, desktop and mobile)`,
    note: "The official FAQ still says “Plans start from AUD 49.99” and “Onsite visits start from AUD 49 per hour”, which conflicts with the Plans & Pricing page — ask the client to align the corporate site",
  },
  {
    id: "service-inclusions",
    verified: true,
    item: "Service checklists, product pills, common issues, footer links and structured data now list only services on the official Services page (Outlook/email, OneDrive, Excel/Word/PowerPoint, OneNote/Access/Publisher, Microsoft Office, Windows, software/drivers, backup; virus/malware/spyware/adware/Trojan removal, security installation, internet security, firewall, password manager, ad blocker). Removed: Teams, SharePoint, Exchange Online, licensing, migrations, on/offboarding, MFA, ransomware response, Defender, phishing checks, hacked-account recovery, threat monitoring, health checks, “all major antivirus brands”",
    where: "Services.tsx, SupportedProducts.tsx, CommonIssues.tsx, Footer.tsx, Hero.tsx (example card), lib/faq.ts, app/page.tsx",
    source: `${officialSite}/services/ · /faq/`,
  },
  {
    id: "remote-process",
    verified: true,
    item: "Remote-session wording matches the official FAQ (“We use secure remote tools and only access your device with permission”). Removed: “you can watch as we work”",
    where: "HowItWorks.tsx, WhyItGeek.tsx, lib/faq.ts, EnquiryDialog.tsx, Hero.tsx",
    source: `${officialSite}/faq/`,
  },
];

export const unverifiedLaunchChecks = launchChecks.filter((c) => !c.verified);
