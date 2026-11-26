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
    <section id="how-it-works" aria-labelledby="how-title" className="section-y bg-ambient">
      <div className="container-page flex flex-col gap-10 lg:gap-14">
        <SectionHeader
          id="how-title"
          eyebrow="How it works"
          title="Fixed in three simple steps"
          subtitle="No waiting around for a technician to drive over. Just convenient, secure remote help from a specialist."
        />
        <ol data-reveal-group className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className={`glass-light lift relative flex flex-col gap-5 rounded-[20px] p-6 sm:p-8 ${
                // Discreet dashed connector across the gap to the next step (desktop/tablet row layout only).
                i < steps.length - 1
                  ? "md:after:absolute md:after:top-[60px] md:after:left-full md:after:w-6 md:after:border-t-2 md:after:border-dashed md:after:border-brand/30"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex size-14 items-center justify-center rounded-[14px] bg-linear-to-br from-brand to-brand-hover shadow-[0_10px_24px_-10px_rgb(11_99_229/0.6)] ring-1 ring-white/20 ring-inset">
                  <Icon name={step.icon} size={26} />
                </span>
                <span className="text-eyebrow rounded-full bg-brand-soft px-3 py-1.5 text-brand ring-1 ring-brand/10 ring-inset">
                  Step {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-h4 text-heading">{step.title}</h3>
              <p className="text-base leading-[26px] text-body">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
