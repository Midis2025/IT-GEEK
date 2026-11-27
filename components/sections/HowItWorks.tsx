import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";

const steps = [
  {
    icon: "step-message",
    title: "Tell us what’s wrong",
    text: "Call us or send an online enquiry. A Microsoft 365 or security specialist reviews your issue and gets in touch.",
  },
  {
    icon: "step-monitor",
    title: "Secure remote session",
    text: "We connect using secure remote tools, and only access your device with your permission.",
  },
  {
    icon: "step-shield",
    title: "Fixed & protected",
    text: "We fix the problem, explain what happened in plain English and strengthen your setup to help stop it coming back.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="section-y bg-white">
      <div className="container-page flex flex-col gap-12 lg:gap-16">
        <SectionHeader
          id="how-title"
          align="split"
          index="03"
          eyebrow="How it works"
          title="Fixed in three simple steps"
          subtitle="No waiting around for a technician to drive over. Just convenient, secure remote help from a specialist."
        />
        <ol data-reveal-group className="grid gap-12 lg:grid-cols-3 lg:gap-12">
          {steps.map((step, i) => (
            <li key={step.title} className="flex flex-col">
              {/* Step marker and a hairline running on to the next step. */}
              <div className="flex items-center gap-4" aria-hidden="true">
                <span className="text-index flex h-8 shrink-0 items-center rounded-full border border-brand/25 bg-brand-soft px-3 text-brand">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`h-px flex-1 ${i < steps.length - 1 ? "bg-linear-to-r from-brand/35 to-line" : "bg-linear-to-r from-line to-transparent"}`}
                />
              </div>
              <span className="mt-8 flex size-12 items-center justify-center rounded-xl bg-brand ring-1 ring-white/15 ring-inset">
                <Icon name={step.icon} size={24} />
              </span>
              <h3 className="text-h4 mt-6 text-heading">
                <span className="sr-only">Step {i + 1}: </span>
                {step.title}
              </h3>
              <p className="mt-3 max-w-[380px] text-base leading-[26px] text-body">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
