import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { refundPolicyUrl, site, withBasePath } from "@/lib/site";

const tickets = [
  { icon: "ticket-mail", tile: "bg-brand-soft", title: "Outlook not syncing", meta: "Microsoft 365 · Fixed remotely", done: true },
  { icon: "ticket-video", tile: "bg-brand-soft", title: "Teams sign-in loop", meta: "Microsoft 365 · Resolved", done: true },
  { icon: "ticket-bug", tile: "bg-red-soft", title: "Trojan found on laptop", meta: "Antivirus · Device secured", done: true },
  { icon: "ticket-key", tile: "bg-brand-soft", title: "Office activation error", meta: "Licensing · Tech connected", done: false },
];

function SupportDeskVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[496px] pt-10 pb-[98px]" aria-hidden="true">
      {/* Support desk card */}
      <div className="rounded-[20px] bg-white p-4 shadow-floating sm:ml-14 sm:p-6 lg:ml-0 lg:p-5 xl:ml-14 xl:p-6">
        <div className="flex items-center justify-between gap-3 pb-1">
          <div>
            <p className="text-h5 text-heading">Today’s fixes</p>
            <p className="text-sm leading-[22px] text-muted">ITGeek remote support desk</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-soft py-1 pr-3 pl-2.5 text-sm leading-5 font-semibold text-green-ink">
            <Icon name="live-dot" size={8} />
            Example
          </span>
        </div>
        <ul className="mt-3 flex flex-col gap-3">
          {tickets.map((t) => (
            <li key={t.title} className="flex items-center gap-3.5 rounded-[14px] bg-subtle py-3 pr-3.5 pl-3">
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
                <span className="shrink-0 rounded-full bg-amber/18 py-1 pr-2.5 pl-2 text-sm leading-5 font-semibold whitespace-nowrap text-heading">
                  In progress
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Response pill */}
      <div className="absolute top-0 right-0 flex items-center gap-2 rounded-full bg-white py-2.5 pr-4 pl-3 shadow-floating">
        <span className="flex size-7 items-center justify-center rounded-full bg-brand">
          <Icon name="pill-clock" size={16} />
        </span>
        <span className="text-sm leading-5 font-semibold whitespace-nowrap text-heading">{site.hours}</span>
      </div>

      {/* Threat scan card */}
      <div className="absolute bottom-2.5 left-0 flex w-[300px] max-w-[calc(100%-1.5rem)] flex-col gap-3.5 rounded-2xl bg-white p-[18px] shadow-floating">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-green-soft">
            <Icon name="scan-shield" size={24} />
          </span>
          <span className="min-w-0 text-sm">
            <span className="block leading-5 font-semibold text-heading">Threat scan complete</span>
            <span className="block leading-[22px] text-muted">Malware removed · Protected</span>
          </span>
        </div>
        <span className="block h-1.5 rounded bg-green-bright" />
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
        className="pointer-events-none absolute -top-[420px] -right-[220px] -z-10 max-w-none"
      />
      <img
        src={withBasePath("/figma/glow-left.svg")}
        alt=""
        aria-hidden="true"
        width={880}
        height={880}
        className="pointer-events-none absolute top-[180px] -left-[360px] -z-10 max-w-none"
      />

      <div className="container-page grid items-center gap-12 pt-10 pb-14 sm:pt-16 md:gap-14 md:pb-20 lg:grid-cols-[minmax(0,1fr)_420px] lg:justify-between lg:gap-10 lg:pt-20 lg:pb-24 xl:grid-cols-[minmax(0,640px)_496px] xl:pt-24 xl:pb-[120px]">
        <div className="flex flex-col items-start gap-6 sm:gap-7">
          <p className="inline-flex max-w-full items-center gap-2.5 rounded-2xl border sm:rounded-full border-white/12 bg-white/6 py-1.5 pr-4 pl-1.5 text-sm leading-5 font-semibold text-white">
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green-bright/16 px-2.5 py-1 text-green-bright">
              <Icon name="hero-tag-shield" size={14} />
              Specialists
            </span>
            <span className="min-w-0">Microsoft 365 support &amp; antivirus protection</span>
          </p>

          <h1 id="hero-title" className="text-h1 max-w-[640px] text-white">
            Microsoft 365 &amp; antivirus experts <br className="hidden lg:block" />
            who <span className="text-green-bright">fix it fast.</span>
          </h1>

          <p className="text-lead max-w-[600px] text-on-dark-muted">
            This ITGeek help desk is dedicated to two things: Microsoft 365 and antivirus protection. From Outlook,
            Teams and OneDrive headaches to malware and online threats, our specialists sort it out remotely — no
            waiting for a home visit.
          </p>

          <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
            <Button enquiry="Microsoft 365 help" icon="arrow-right-white">
              Get help now
            </Button>
            <Button variant="outline-dark" enquiry="Free quote" icon="hero-security-shield">
              Request a free quote
            </Button>
          </div>

          <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 text-sm leading-[22px] text-on-dark-muted">
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
