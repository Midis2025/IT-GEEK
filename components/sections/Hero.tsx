import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { refundPolicyUrl, site, withBasePath } from "@/lib/site";

const tickets = [
  { icon: "ticket-mail", tile: "bg-brand-soft", title: "Outlook not syncing", meta: "Microsoft 365 · Fixed remotely", done: true },
  { icon: "product-excel", tile: "bg-brand-soft", title: "Excel file won’t open", meta: "Microsoft 365 · Resolved", done: true },
  { icon: "ticket-bug", tile: "bg-red-soft", title: "Trojan found on laptop", meta: "Antivirus · Device secured", done: true },
  { icon: "product-word", tile: "bg-brand-soft", title: "Word keeps crashing", meta: "Office · Tech connected", done: false },
];

/**
 * Example support-desk composition. From sm up the two floating elements overlap the main card only where it has
 * empty padding: the hours badge sits half over the card's top edge (the card's 48px top padding keeps 24px clear
 * below it), and the scan card overlaps 32px into the card's 48px bottom padding (16px clear of the last ticket).
 * Below sm everything stacks in normal flow, so nothing can collide or overflow.
 */
function SupportDeskVisual() {
  return (
    <div className="relative mx-auto flex w-full max-w-[520px] flex-col sm:block sm:pt-6 sm:pb-[68px]" aria-hidden="true">
      {/* Hours badge: in flow on phones, half over the card's top edge from sm up. */}
      <div className="float-slow mb-3 flex items-center gap-2 self-end rounded-full border border-white/70 bg-white/[0.97] py-2.5 pr-4 pl-3 shadow-[0_24px_48px_-20px_rgb(3_8_26/0.5)] sm:absolute sm:top-0 sm:right-6 sm:z-10 sm:mb-0">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand">
          <Icon name="pill-clock" size={16} />
        </span>
        <span className="text-sm leading-5 font-semibold whitespace-nowrap text-heading">{site.hours}</span>
      </div>

      {/* Support desk card */}
      <div className="glass-blur rounded-[20px] border border-white/70 bg-white/[0.92] p-4 shadow-[0_24px_48px_-20px_rgb(3_8_26/0.5)] ring-1 ring-brand/10 sm:ml-12 sm:px-6 sm:pt-12 sm:pb-12 lg:ml-10 lg:px-5 xl:ml-12 xl:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-h5 text-heading">Today’s fixes</p>
            <p className="text-sm leading-[22px] text-muted">ITGeek remote support desk</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green-soft py-1 pr-3 pl-2.5 text-sm leading-5 font-semibold text-green-ink">
            <Icon name="live-dot" size={8} />
            Example
          </span>
        </div>
        <ul className="mt-4 flex flex-col gap-3">
          {tickets.map((t) => (
            <li key={t.title} className="flex items-center gap-3.5 rounded-[14px] border border-line/70 bg-subtle/80 py-3 pr-3 pl-3">
              <span className={`hidden size-10 shrink-0 items-center justify-center rounded-[10px] xs:flex ${t.tile}`}>
                <Icon name={t.icon} size={20} />
              </span>
              <span className="min-w-0 flex-1 text-sm">
                <span className="block leading-5 font-semibold text-heading">{t.title}</span>
                <span className="block leading-[22px] text-body">{t.meta}</span>
              </span>
              {t.done ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-soft py-1 pr-2.5 pl-2 text-sm leading-5 font-semibold text-green-ink">
                  <Icon name="check-green" size={14} />
                  Fixed
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-amber/18 px-2.5 py-1 text-sm leading-5 font-semibold whitespace-nowrap text-heading">
                  In progress
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Threat scan card: in flow on phones; from sm up it overlaps only the card's empty bottom padding. */}
      <div className="float-slow-delayed mt-3 flex w-full flex-col gap-3.5 rounded-2xl border border-white/70 bg-white/[0.97] p-[18px] shadow-[0_24px_48px_-20px_rgb(3_8_26/0.5)] sm:absolute sm:bottom-0 sm:left-0 sm:z-10 sm:mt-0 sm:w-[300px]">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-green-soft">
            <Icon name="scan-shield" size={24} />
          </span>
          <span className="min-w-0 text-sm">
            <span className="block leading-5 font-semibold text-heading">Threat scan complete</span>
            <span className="block leading-[22px] text-muted">Malware removed · Protected</span>
          </span>
        </div>
        <span className="block h-1.5 rounded bg-linear-to-r from-green to-green-bright" />
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="on-dark relative isolate overflow-hidden bg-navy-900">
      {/* Background glows (Figma "Glow" ellipses) */}
      <img
        src={withBasePath("/figma/glow-right.svg")}
        alt=""
        aria-hidden="true"
        width={1040}
        height={1040}
        className="pointer-events-none absolute -top-[420px] -right-[220px] -z-10 max-w-none opacity-80"
      />
      <img
        src={withBasePath("/figma/glow-left.svg")}
        alt=""
        aria-hidden="true"
        width={880}
        height={880}
        className="pointer-events-none absolute top-[180px] -left-[360px] -z-10 max-w-none opacity-60"
      />
      {/* Faint technology grid and a slowly drifting ambient light — kept behind the dashboard, away from the copy. */}
      <div aria-hidden="true" className="tech-grid pointer-events-none absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-4%] right-[-6%] -z-10 size-[720px] bg-[radial-gradient(closest-side,rgb(11_99_229/0.18),transparent)] will-change-transform motion-safe:animate-[ambient-drift_18s_ease-in-out_infinite]"
      />

      <div className="container-page grid items-center gap-12 pt-10 pb-14 sm:pt-16 md:gap-14 md:pb-20 lg:grid-cols-[minmax(0,1fr)_420px] lg:justify-between lg:gap-12 lg:pt-20 lg:pb-24 xl:grid-cols-[minmax(0,680px)_520px] xl:pt-24 xl:pb-28">
        <div className="flex flex-col items-start">
          <p className="inline-flex max-w-full items-center gap-2.5 rounded-2xl border border-white/12 bg-white/[0.04] py-1.5 pr-4 pl-1.5 text-sm leading-5 font-medium text-white sm:rounded-full">
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green-bright/16 px-2.5 py-1 text-green-bright">
              <Icon name="hero-tag-shield" size={14} />
              Specialists
            </span>
            <span className="min-w-0">Microsoft 365 support &amp; antivirus protection</span>
          </p>

          <h1 id="hero-title" className="text-h1 mt-7 max-w-[660px] text-white">
            Microsoft 365 &amp; antivirus experts <br className="hidden lg:block" />
            who <span className="text-green-bright">fix it fast.</span>
          </h1>

          <p className="text-lead mt-6 max-w-[580px] text-on-dark-muted">
            This ITGeek help desk is dedicated to two things: Microsoft 365 and antivirus protection. From Outlook,
            OneDrive and Office headaches to malware and online threats, our specialists sort it out remotely — no
            waiting for a home visit.
          </p>

          <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button enquiry="Microsoft 365 help" icon="arrow-right-white">
              Get help now
            </Button>
            <Button variant="outline-dark" enquiry="Free quote" icon="hero-security-shield">
              Request a free quote
            </Button>
          </div>

          <ul className="mt-10 flex w-full flex-wrap items-center gap-x-7 gap-y-3 border-t border-white/10 pt-6 text-sm leading-[22px] text-on-dark-muted">
            <li className="flex items-center gap-2">
              <Icon name="hero-tag-shield" size={18} />
              Secure remote help
            </li>
            <li className="flex items-center gap-2">
              <Icon name="clock-green" size={18} />
              {site.hours}
            </li>
            <li className="flex items-center gap-2">
              <Icon name="hero-badge-check" size={18} />
              <span>
                No fix, no pay —{" "}
                <a href={refundPolicyUrl} className="underline underline-offset-2 transition-colors hover:text-white">
                  terms apply
                </a>
              </span>
            </li>
          </ul>
        </div>

        <SupportDeskVisual />
      </div>
    </section>
  );
}
