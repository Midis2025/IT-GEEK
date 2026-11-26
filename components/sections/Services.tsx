import { Button } from "@/components/ui/Button";
import { CheckItem } from "@/components/ui/CheckItem";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { EnquiryTopic } from "@/lib/enquiry";

type Service = {
  id: string;
  dark: boolean;
  icon: string;
  chip: string;
  title: string;
  description: string;
  items: string[];
  cta: string;
  topic: EnquiryTopic;
};

const services: Service[] = [
  {
    id: "microsoft-365",
    dark: false,
    icon: "service-grid",
    chip: "Microsoft 365",
    title: "Microsoft 365 Support",
    description:
      "Setup and troubleshooting for the Microsoft Office apps and email your home or business runs on.",
    items: [
      "Outlook & email setup",
      "OneDrive help",
      "Excel, Word & PowerPoint",
      "OneNote, Access & Publisher",
      "Microsoft Office help",
      "Windows help & installation",
      "Software & driver installation",
      "Computer backup help",
    ],
    cta: "Get Microsoft 365 help",
    topic: "Microsoft 365 help",
  },
  {
    id: "antivirus",
    dark: true,
    icon: "service-shield",
    chip: "Security",
    title: "Antivirus & Malware Protection",
    description: "Remove infections and keep your devices protected with properly installed security software.",
    items: [
      "Virus & malware removal",
      "Spyware & adware removal",
      "Trojan removal",
      "Security software installation",
      "Internet security",
      "Firewall setup",
      "Password manager setup",
      "Browser ad blocker setup",
    ],
    cta: "Get antivirus help",
    topic: "Antivirus & security help",
  },
];

function ServiceCard({ s }: { s: Service }) {
  return (
    <article
      id={s.id}
      aria-labelledby={`${s.id}-title`}
      className={`anchor-target flex flex-col gap-7 rounded-[28px] p-6 sm:p-9 lg:row-span-5 lg:grid lg:grid-rows-subgrid lg:p-11 ${
        s.dark ? "on-dark surface-dark lift-dark" : "glass-light lift"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <span
          className={`flex size-16 items-center justify-center rounded-2xl ring-1 ring-inset ring-white/20 ${
            s.dark
              ? "bg-linear-to-br from-green-bright to-green-ink shadow-[0_10px_24px_-10px_rgb(34_197_94/0.6)]"
              : "bg-linear-to-br from-brand to-brand-hover shadow-[0_10px_24px_-10px_rgb(11_99_229/0.6)]"
          }`}
        >
          <Icon name={s.icon} size={32} />
        </span>
        <span
          className={`text-eyebrow rounded-full px-3.5 py-1.5 ${s.dark ? "bg-green-bright/16 text-green-bright" : "bg-brand-soft text-brand"}`}
        >
          {s.chip}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        <h3 id={`${s.id}-title`} className={`text-h3 ${s.dark ? "text-white" : "text-heading"}`}>
          {s.title}
        </h3>
        <p className={`text-base leading-[26px] ${s.dark ? "text-on-dark-muted" : "text-body"}`}>{s.description}</p>
      </div>

      <hr className={`border-0 border-t ${s.dark ? "border-white/10" : "border-line"}`} />

      <ul className="grid flex-1 content-start gap-x-6 gap-y-[18px] sm:grid-cols-2 lg:grid-cols-1 lg:gap-y-3.5 xl:grid-cols-2 xl:gap-y-[18px]">
        {s.items.map((item) => (
          <CheckItem key={item} text={item} dark={s.dark} />
        ))}
      </ul>

      <Button
        variant={s.dark ? "green" : "primary"}
        enquiry={s.topic}
        icon="arrow-right-white"
        className="self-stretch sm:self-start lg:self-end lg:justify-self-start"
      >
        {s.cta}
      </Button>
    </article>
  );
}

export function Services() {
  return (
    <section id="services" aria-labelledby="services-title" className="section-y bg-ambient">
      <div className="container-page flex flex-col gap-10 lg:gap-14">
        <SectionHeader
          id="services-title"
          eyebrow="What we do"
          title="Two specialties. Zero distractions."
          subtitle="This dedicated help desk handles Microsoft 365 and antivirus support — so you reach professional technicians focused on these areas."
        />
        <div data-reveal-group className="grid gap-6 lg:grid-cols-2">
          {services.map((s) => (
            <ServiceCard key={s.id} s={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
