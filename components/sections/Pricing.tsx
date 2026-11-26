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
  unit: string;
  note: string;
  features: string[];
  cta: string;
  topic: EnquiryTopic;
  featured?: boolean;
};

// Source: https://itgeek.com.au/plans-and-pricing/ (prices exclude GST and card processing fees).
const plans: Plan[] = [
  {
    name: "Online support",
    icon: "plan-wrench",
    description: "Best for software issues, configuration, updates, virus removal and general troubleshooting.",
    price: "A$70",
    unit: "/ hour",
    note: "From AUD 70 · Excl. GST · Business days 9am–6pm",
    features: [
      "Professional technicians",
      "Secure remote tools",
      "Clear scope of work",
      "Microsoft Office & email help",
      "Virus & malware removal",
    ],
    cta: "Request support",
    topic: "Online support (from A$70/hour)",
  },
  {
    name: "Smart Care annual",
    icon: "plan-home",
    description: "ITGeek Smart Care annual online support plans, on a one-year contract.",
    price: "A$299",
    unit: "/ year",
    note: "From AUD 299 · Excl. GST · One-year contract",
    features: [
      "Basic — A$299 / year",
      "Standard — A$499 / year",
      "Premium — A$699 / year",
      "Online support available 24/7/365",
      "No fix, no pay — terms apply",
    ],
    cta: "Ask about annual plans",
    topic: "Smart Care annual plan (from A$299/year)",
    featured: true,
  },
  {
    name: "Onsite support",
    icon: "plan-building",
    description: "Onsite visits during business hours, within ITGeek’s service coverage area.",
    price: "A$70",
    unit: "/ hour",
    note: "From AUD 70 + A$150 call-out fee · Excl. GST",
    features: [
      "Business days, 9am–6pm",
      "Professional technicians",
      "Clear scope of work",
      "Parts, travel and weekend surcharges extra",
      "Contact us to confirm coverage",
    ],
    cta: "Talk to our team",
    topic: "Onsite support (from A$70/hour)",
  },
];

function PlanCard({ plan }: { plan: Plan }) {
  const dark = !!plan.featured;
  return (
    <li
      className={`flex flex-col gap-6 rounded-3xl p-7 sm:p-9 lg:p-7 xl:p-9 ${
        dark ? "on-dark bg-navy-900 shadow-floating lg:-my-1" : "border border-line bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className={`flex size-12 items-center justify-center rounded-xl ${dark ? "bg-brand" : "bg-brand-soft"}`}>
          <Icon name={plan.icon} size={24} />
        </span>
        {dark && (
          <span className="rounded-full bg-green-bright/16 px-3 py-1.5 text-sm leading-5 font-semibold text-green-bright">
            Annual plans
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className={`text-h4 ${dark ? "text-white" : "text-heading"}`}>{plan.name}</h3>
        <p className={`text-sm leading-[22px] lg:min-h-[66px] xl:min-h-[44px] ${dark ? "text-on-dark-muted" : "text-body"}`}>{plan.description}</p>
      </div>

      <div className="flex flex-col gap-0.5">
        <p className="flex flex-wrap items-baseline gap-x-1.5">
          <span className={`text-price ${dark ? "text-white" : "text-heading"}`}>{plan.price}</span>
          <span className={`text-base leading-[26px] ${dark ? "text-on-dark-muted" : "text-muted"}`}>{plan.unit}</span>
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
        className="w-full"
      >
        {plan.cta}
        <span className="sr-only"> — {plan.name} plan</span>
      </Button>
    </li>
  );
}

export function Pricing() {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="section-y bg-white">
      <div className="container-page flex flex-col items-center gap-10 lg:gap-14">
        <SectionHeader
          id="pricing-title"
          eyebrow="Pricing"
          title="Simple, upfront pricing"
          subtitle="Pay by the hour or choose an annual plan. Prices exclude GST and any card processing fees charged by your bank."
        />
        <ul className="grid w-full max-w-[480px] items-stretch gap-6 lg:max-w-none lg:grid-cols-3">
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
