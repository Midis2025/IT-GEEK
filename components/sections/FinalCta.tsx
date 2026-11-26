import { Button } from "@/components/ui/Button";
import { site, withBasePath } from "@/lib/site";

export function FinalCta() {
  return (
    <section id="contact" aria-labelledby="cta-title" className="bg-white pb-16 md:pb-20 lg:pb-28">
      <div className="container-page">
        <div className="on-dark relative isolate flex flex-col gap-8 overflow-hidden rounded-[24px] bg-brand p-7 sm:rounded-[32px] sm:p-12 lg:flex-row lg:items-center lg:justify-between lg:gap-14 lg:p-[72px]">
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

          <div className="flex max-w-[828px] flex-col gap-4 text-white">
            <h2 id="cta-title" className="text-h2">
              Stuck right now? Let’s get it sorted.
            </h2>
            <p className="text-lead">
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
            <p className="text-center text-sm leading-[22px] text-white">{site.hours}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
