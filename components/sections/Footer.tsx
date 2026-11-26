import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { site } from "@/lib/site";
import { showTestimonials } from "@/lib/testimonials";

const columns = [
  {
    heading: "Microsoft 365",
    links: [
      { label: "Outlook & email support", href: "#microsoft-365" },
      { label: "Teams support", href: "#microsoft-365" },
      { label: "OneDrive & SharePoint", href: "#microsoft-365" },
      { label: "Licensing & activation", href: "#microsoft-365" },
      { label: "Setup & migration", href: "#microsoft-365" },
    ],
  },
  {
    heading: "Antivirus",
    links: [
      { label: "Virus & malware removal", href: "#antivirus" },
      { label: "Ransomware response", href: "#antivirus" },
      { label: "Antivirus setup & renewals", href: "#antivirus" },
      { label: "Microsoft Defender", href: "#antivirus" },
      { label: "Security health check", href: "#antivirus" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About ITGeek", href: "#why-itgeek" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
      // Only linked while the Reviews section renders (approved testimonials, or the dev preview).
      ...(showTestimonials ? [{ label: "Reviews", href: "#reviews" }] : []),
      { label: "FAQ", href: "#faq" },
      { label: "Contact", href: "#contact" },
    ],
  },
];

const contact = [
  { icon: "phone-green", label: site.phoneDisplay, href: site.phoneHref },
  { icon: "footer-mail", label: site.email, href: `mailto:${site.email}` },
  { icon: "clock-green", label: site.hours },
  { icon: "footer-map-pin", label: site.serviceArea },
];

// Official policy pages (lib/site.ts → legal).
const legal = site.legal;

export function Footer() {
  return (
    <footer className="on-dark bg-navy-900 pt-16 pb-10 lg:pt-20">
      <div className="container-page flex flex-col gap-10 lg:gap-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-[360px_repeat(3,minmax(0,1fr))] lg:gap-16">
          <div className="col-span-2 flex flex-col gap-6 sm:col-span-3 lg:col-span-1">
            <Logo variant="footer" className="self-start" />
            <p className="max-w-[360px] text-sm leading-[22px] text-on-dark-muted">
              Australia’s Microsoft 365 and antivirus specialists. Fast, friendly remote support for homes and small
              businesses.
            </p>
            <ul className="flex flex-col gap-3 text-sm leading-[22px] text-white max-lg:gap-0">
              {contact.map((c) => (
                <li key={c.label}>
                  {c.href ? (
                    <a href={c.href} className="flex w-fit items-center gap-2.5 transition-colors hover:text-green-bright max-lg:min-h-11">
                      <Icon name={c.icon} size={18} />
                      {c.label}
                    </a>
                  ) : (
                    <span className="flex w-fit items-center gap-2.5 max-lg:min-h-11">
                      <Icon name={c.icon} size={18} />
                      {c.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {columns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h2 className="text-eyebrow text-white">{col.heading}</h2>
              <ul className="mt-[18px] flex flex-col gap-1">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="inline-flex min-h-8 items-center text-sm leading-[22px] text-on-dark-muted transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <hr className="border-0 border-t border-white/10" />

        <div className="flex flex-col gap-4 text-sm leading-[22px] text-on-dark-muted">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <p>
              © {new Date().getFullYear()} {site.legalName} · {site.domain} · All rights reserved.
            </p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {legal.map((l) => (
                <li key={l.id}>
                  <a href={l.href} className="transition-colors hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <p className="opacity-70">
            Microsoft, Microsoft 365, Outlook, Teams, OneDrive, SharePoint, Excel, Word, PowerPoint and Microsoft Defender
            are trademarks of the Microsoft group of companies. ITGeek is an independent support provider and is not
            affiliated with or endorsed by Microsoft. Other antivirus brand names are trademarks of their respective
            owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
