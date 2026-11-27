import { Button } from "@/components/ui/Button";
import { site, withBasePath } from "@/lib/site";

export function FinalCta() {
  return (
    <section id="contact" aria-labelledby="cta-title" className="bg-subtle pb-16 md:pb-20 lg:pb-24">
      <div className="container-page">
        <div data-reveal className="on-dark relative isolate flex flex-col gap-8 overflow-hidden rounded-3xl bg-[linear-gradient(125deg,var(--color-navy-900)_0%,var(--color-navy-800)_50%,var(--color-brand)_150%)] p-7 shadow-[0_24px_48px_-28px_rgb(3_8_26/0.5)] ring-1 ring-white/10 ring-inset sm:p-12 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:px-16 lg:py-16 xl:px-20">
          <img
            src={withBasePath("/figma/cta-ring-left.svg")}
            alt=""
            aria-hidden="true"
            width={300}
            height={300}
            className="pointer-events-none absolute -bottom-[210px] -left-[120px] -z-10 max-w-none"
          />
          <img
            src={withBasePath("/figma/cta-ring-right.svg")}
            alt=""
            aria-hidden="true"
            width={520}
            height={520}
            className="pointer-events-none absolute -top-[260px] -right-[180px] -z-10 max-w-none"
          />
          {/* Ambient highlights and a faint grid, kept to the edges. */}
          <div aria-hidden="true" className="tech-grid pointer-events-none absolute inset-0 -z-10" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-48 -bottom-56 -z-10 size-[640px] bg-[radial-gradient(closest-side,rgb(11_99_229/0.4),transparent)]"
          />

          <div className="flex max-w-[720px] flex-col gap-4 text-white">
            <h2 id="cta-title" className="text-h2">
              Stuck right now? Let’s get it sorted.
            </h2>
            <p className="text-lead text-on-dark-muted">
              Talk to a Microsoft 365 or antivirus specialist about secure remote help — and if we can’t fix it, you
              don’t pay (terms apply).
            </p>
          </div>

          <div className="flex w-full shrink-0 flex-col items-center gap-3.5 sm:w-auto sm:min-w-[228px] sm:items-stretch">
            <Button variant="white" enquiry="Microsoft 365 help" icon="cta-arrow-dark" className="w-full">
              Get help now
            </Button>
            <Button href={site.phoneHref} variant="outline-dark" icon="cta-phone" className="w-full">
              Call {site.phoneDisplay}
            </Button>
            <p className="text-center text-sm leading-[22px] text-on-dark-muted">{site.hours}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
