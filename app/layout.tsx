import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { RevealController } from "@/components/RevealController";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: `${site.url}/` },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: `${site.url}/`,
    siteName: site.name,
    title: site.title,
    description: site.description,
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#071330",
  width: "device-width",
  initialScale: 1,
};

// Enables scroll-reveal before first paint; if the reveal controller hasn't started within 3s (script error,
// blocked JS bundle), the class is removed again so no content stays hidden.
const revealBootstrap =
  "document.documentElement.classList.add('js-reveal');" +
  "setTimeout(function(){if(!window.__revealReady)document.documentElement.classList.remove('js-reveal')},3000);";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning: the inline script adds the js-reveal class to <html> before hydration.
    <html lang="en-AU" className={`${inter.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: revealBootstrap }} />
      </head>
      <body>
        {children}
        <RevealController />
      </body>
    </html>
  );
}
