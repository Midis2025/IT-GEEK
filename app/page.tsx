import { EnquiryDialog } from "@/components/EnquiryDialog";
import { CommonIssues } from "@/components/sections/CommonIssues";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Pricing } from "@/components/sections/Pricing";
import { Services } from "@/components/sections/Services";
import { SupportedProducts } from "@/components/sections/SupportedProducts";
import { Testimonials } from "@/components/sections/Testimonials";
import { TopBar } from "@/components/sections/TopBar";
import { WhyItGeek } from "@/components/sections/WhyItGeek";
import { faqs } from "@/lib/faq";
import { site } from "@/lib/site";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": `${site.url}/#business`,
      name: site.name,
      url: site.url,
      logo: `${site.url}${site.logo.src}`,
      image: `${site.url}${site.logo.src}`,
      description: site.description,
      email: site.email,
      telephone: site.phoneE164,
      legalName: site.legalName,
      address: {
        "@type": "PostalAddress",
        streetAddress: site.address.streetAddress,
        addressLocality: site.address.locality,
        addressRegion: site.address.region,
        postalCode: site.address.postalCode,
        addressCountry: site.address.country,
      },
      areaServed: { "@type": "Country", name: site.country },
      priceRange: "From A$70 (excl. GST)",
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: site.openingHours.days,
        opens: site.openingHours.opens,
        closes: site.openingHours.closes,
      },
      ...(site.social.length > 0 ? { sameAs: site.social } : {}),
      knowsAbout: ["Microsoft 365", "Microsoft Office", "Outlook", "OneDrive", "Antivirus", "Virus removal", "Malware removal", "Firewall setup"],
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.name,
      inLanguage: "en-AU",
      publisher: { "@id": `${site.url}/#business` },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-white px-4 py-3 font-semibold text-heading focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <div id="top" />
      <TopBar />
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <SupportedProducts />
        <Services />
        <CommonIssues />
        <HowItWorks />
        <WhyItGeek />
        <Pricing />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <EnquiryDialog />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
