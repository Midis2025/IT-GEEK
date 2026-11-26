import type { NextConfig } from "next";
import { basePath, deploymentUrlOk, unverifiedLaunchChecks } from "./lib/site";

// Deployment guard (not overridable): a CI/hosting build must target a dedicated URL, never the corporate
// WordPress root, so this landing page can't replace or mis-canonicalise the existing itgeek.com.au site.
if (process.argv.includes("build") && process.env.CI && process.env.CI !== "false" && !deploymentUrlOk) {
  throw new Error(
    "\nProduction build blocked: set NEXT_PUBLIC_SITE_URL to the landing page's own URL " +
      "(e.g. https://support.itgeek.com.au or https://itgeek.com.au/microsoft-365-support) — not https://itgeek.com.au.",
  );
}

// Launch guard: sample/placeholder content must not reach production by accident.
// CI and hosting platforms (Vercel, Netlify, GitHub Actions…) set CI=true → the build fails.
// Local builds only warn, so the site stays reviewable. Override deliberately with ALLOW_UNVERIFIED_CONTENT=true.
if (process.argv.includes("build") && unverifiedLaunchChecks.length > 0) {
  const list = unverifiedLaunchChecks.map((c) => `  - ${c.item}  [${c.where}]`).join("\n");
  const message = `\n⚠ ${unverifiedLaunchChecks.length} unverified launch items (lib/site.ts → launchChecks):\n${list}\n`;
  const ci = process.env.CI && process.env.CI !== "false";
  if (ci && process.env.ALLOW_UNVERIFIED_CONTENT !== "true") {
    throw new Error(`${message}\nProduction build blocked. Verify these items, or set ALLOW_UNVERIFIED_CONTENT=true to deploy anyway.`);
  }
  console.warn(message);
}

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // No Next.js developer badge in the page UI, so the local dev server doubles as a clean review preview.
  devIndicators: false,
  // Set automatically when NEXT_PUBLIC_SITE_URL contains a path (e.g. https://itgeek.com.au/microsoft-365-support).
  ...(basePath ? { basePath } : {}),
  // 90 is used for the logo so the small web address in the artwork stays crisp.
  images: { qualities: [75, 90] },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
