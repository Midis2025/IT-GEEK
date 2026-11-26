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

const plans: Plan[] = [
  {
    name: "One-off Fix",
    icon: "plan-wrench",
    description: "One Microsoft 365 or virus problem, fixed remotely by a specialist.",
    price: "$99",
    unit: "/ issue",
    note: "AUD, inc. GST · No fix, no pay",
    features: [
      "Remote fix by a specialist",
      "Outlook, Teams, OneDrive & more",
      "Virus & malware removal",
      "Plain-English summary of the fix",
      "7-day follow-up support",
    ],
    cta: "Request support",
    topic: "One-off Fix ($99)",
  },
  {
    name: "Home Protect",
    icon: "plan-home",
    description: "Premium antivirus plus on-call Microsoft 365 help for your household.",
    price: "$19",
    unit: "/ month",
    note: "AUD, inc. GST · Up to 5 devices",
    features: [
      "Premium antivirus licence included",
      "Setup on up to 5 devices",
      "Priority Microsoft 365 help",
      "Monthly security health check",
      "Phishing & scam email checks",
    ],
    cta: "Get protected",
    topic: "Home Protect ($19/month)",
    featured: true,
  },
  {
    name: "Business Care",
    icon: "plan-building",
    description: "Managed Microsoft 365 and endpoint security for small teams.",
    price: "$39",
    unit: "/ user / month",
    note: "AUD, inc. GST · Minimum 3 users",
    features: [
      "Unlimited Microsoft 365 support",
      "Microsoft Defender management",
      "User onboarding & offboarding",
      "MFA, backup & security policies",
      "Dedicated account specialist",
    ],
    cta: "Talk to our team",
    topic: "Business Care ($39/user/month)",
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
            Most popular
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
          subtitle="Pay per fix or stay protected all year. Every plan is delivered by Microsoft 365 and security specialists."
        />
        <ul className="grid w-full max-w-[480px] items-stretch gap-6 lg:max-w-none lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </ul>
        <p className="text-center text-sm leading-[22px] text-muted">
          Larger team or a one-off project like a full Microsoft 365 migration?{" "}
          <a
            href="#contact"
            data-enquiry="Business Care ($39/user/month)"
            className="font-semibold text-brand underline-offset-4 hover:underline"
          >
            Talk to us about a tailored quote.
          </a>
        </p>
      </div>
    </section>
  );
}
