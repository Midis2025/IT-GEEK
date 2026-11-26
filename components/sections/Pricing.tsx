import { Button } from "@/components/ui/Button";
import { CheckItem } from "@/components/ui/CheckItem";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { EnquiryTopic } from "@/lib/enquiry";

type Plan = {
  name: string;
  icon: string;
  description: string;
  price: string;
  /** Billing period, e.g. "/ hour" — omitted while billing terms are unconfirmed. */
  unit?: string;
  note: string;
  features: string[];
  cta: string;
  topic: EnquiryTopic;
  featured?: boolean;
};

// A$99 headline price requested for this campaign. Billing frequency, GST treatment and any extra fees are pending
// client confirmation (lib/site.ts → launchChecks "pricing"), so no period, GST or fee is shown.
const BILLING_NOTE = "AUD · Contact us to confirm billing details";

const plans: Plan[] = [
  {
    name: "Online support",
    icon: "plan-wrench",
    description: "Best for software issues, configuration, updates, virus removal and general troubleshooting.",
    price: "A$99",
    note: BILLING_NOTE,
    features: [
      "Professional technicians",
      "Secure remote tools",
      "Clear scope of work",
      "Microsoft Office & email help",
      "Virus & malware removal",
    ],
    cta: "Request support",
    topic: "Online support (A$99)",
  },
  {
    name: "Smart Care annual",
    icon: "plan-home",
    description: "ITGeek Smart Care online support plan, with support available around the clock.",
    price: "A$99",
    note: BILLING_NOTE,
    features: [
      "Professional technicians",
      "Secure remote tools",
      "Clear scope of work",
      "Online support available 24/7/365",
      "No fix, no pay — terms apply",
    ],
    cta: "Ask about annual plans",
    topic: "Smart Care annual plan (A$99)",
    featured: true,
  },
  {
    name: "Onsite support",
    icon: "plan-building",
    description: "Onsite visits during business hours, within ITGeek’s service coverage area.",
    price: "A$99",
    note: BILLING_NOTE,
    features: [
      "Business days, 9am–6pm",
      "Professional technicians",
      "Clear scope of work",
      "Hardware, printer & network setup",
      "Ask us about coverage and extra fees",
    ],
    cta: "Talk to our team",
    topic: "Onsite support (A$99)",
  },
];

function PlanCard({ plan }: { plan: Plan }) {
  const dark = !!plan.featured;
  return (
    <li
      className={`flex flex-col gap-6 rounded-3xl p-7 sm:p-9 lg:row-span-6 lg:grid lg:grid-rows-subgrid lg:p-7 xl:p-9 ${
        dark ? "on-dark surface-dark lift-dark" : "glass-light lift"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={`flex size-12 items-center justify-center rounded-xl ring-1 ring-inset ${
            dark
              ? "bg-linear-to-br from-brand to-brand-hover shadow-[0_10px_24px_-10px_rgb(11_99_229/0.7)] ring-white/20"
              : "bg-brand-soft ring-brand/10"
          }`}
        >
          <Icon name={plan.icon} size={24} />
        </span>
        {dark && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-bright/14 px-3 py-1.5 text-sm leading-5 font-semibold text-green-bright ring-1 ring-green-bright/30 ring-inset">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-green-bright" />
            Annual plans
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className={`text-h4 ${dark ? "text-white" : "text-heading"}`}>{plan.name}</h3>
        <p className={`text-sm leading-[22px] ${dark ? "text-on-dark-muted" : "text-body"}`}>{plan.description}</p>
      </div>

      <div className="flex flex-col gap-0.5">
        <p className="flex flex-wrap items-baseline gap-x-1.5">
          <span className={`text-price ${dark ? "text-white" : "text-heading"}`}>{plan.price}</span>
          {plan.unit ? (
            <span className={`text-base leading-[26px] ${dark ? "text-on-dark-muted" : "text-muted"}`}>{plan.unit}</span>
          ) : null}
        </p>
        <p className={`text-sm leading-[22px] ${dark ? "text-on-dark-muted" : "text-muted"}`}>{plan.note}</p>
      </div>

      <hr className={`border-0 border-t ${dark ? "border-white/12" : "border-line"}`} />

      <ul className="flex flex-1 flex-col gap-3.5">
        {plan.features.map((f) => (
          <CheckItem key={f} text={f} dark={dark} />
        ))}
      </ul>

      <Button
        variant={dark ? "primary" : "white"}
        enquiry={plan.topic}
        icon={dark ? "plan-arrow-white" : "plan-arrow-dark"}
        className={`w-full lg:self-end ${dark ? "border border-transparent" : ""}`}
      >
        {plan.cta}
        <span className="sr-only"> — {plan.name} plan</span>
      </Button>
    </li>
  );
}

export function Pricing() {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="section-y bg-ambient">
      <div className="container-page flex flex-col items-center gap-10 lg:gap-14">
        <SectionHeader
          id="pricing-title"
          eyebrow="Pricing"
          title="Simple, upfront pricing"
          subtitle="Online, annual and onsite support options. Contact us to confirm billing details for your situation."
        />
        <ul data-reveal-group className="grid w-full max-w-[480px] items-stretch gap-6 lg:max-w-none lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </ul>
        <p className="text-center text-sm leading-[22px] text-muted">
          Business with multiple devices? Custom plans are available.{" "}
          <a
            href="#contact"
            data-enquiry="Free quote"
            className="font-semibold text-brand underline-offset-4 hover:underline"
          >
            Talk to us about a tailored quote.
          </a>
        </p>
      </div>
    </section>
  );
}
