import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";

const features = [
  { icon: "why-badge-check", title: "Professional technicians", text: "Secure support and a clear scope of work on every job." },
  { icon: "why-lock", title: "Your OK comes first", text: "Nothing on your device is accessed without your permission." },
  { icon: "why-map-pin", title: "Australian business", text: "IT Geek Pty Ltd supports Aussie homes and businesses." },
  { icon: "why-message", title: "Plain-English help", text: "No jargon — we explain what went wrong and how to avoid it." },
];

// Service benefits from the official website (no unverified numbers): online support, Microsoft Office/Outlook/
// OneDrive help, virus & malware removal (/services/) and “No fix, no pay” (/plans-and-pricing/, terms apply).
const stats = [
  { value: "Remote", label: "IT support without a home visit" },
  { value: "M365", label: "Outlook, Office & OneDrive help" },
  { value: "Secure", label: "Virus & malware removal" },
  { value: "No fix", label: "No pay — terms apply" },
];

export function WhyItGeek() {
  return (
    <section id="why-itgeek" aria-labelledby="why-title" className="section-y on-dark relative isolate overflow-hidden bg-navy-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-64 right-[-18%] -z-10 size-[820px] bg-[radial-gradient(closest-side,rgb(11_99_229/0.16),transparent)]"
      />
      <div aria-hidden="true" className="tech-grid pointer-events-none absolute inset-0 -z-10" />
      <div className="container-page grid items-center gap-12 xl:grid-cols-[minmax(0,640px)_minmax(0,560px)] xl:justify-between xl:gap-20">
        <div className="flex flex-col gap-10">
          <SectionHeader
            id="why-title"
            align="left"
            dark
            index="04"
            eyebrow="Why ITGeek"
            title="Specialist help, explained in plain English."
            subtitle="This help desk focuses on two areas: Microsoft 365 and online security. That focus means clearer answers, fewer repeat problems and advice you can trust."
          />
          <ul data-reveal-group className="grid gap-x-10 gap-y-8 border-t border-white/10 pt-10 sm:grid-cols-2">
            {features.map((f) => (
              <li key={f.title} className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-green-bright/12 ring-1 ring-green-bright/20 ring-inset">
                  <Icon name={f.icon} size={20} />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-h5 text-white">{f.title}</h3>
                  <p className="text-sm leading-[22px] text-on-dark-muted">{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* One panel split by hairlines (1px grid gaps over a lighter backing). */}
        <dl
          data-reveal-group
          className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 min-[360px]:grid-cols-2"
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="flex flex-col-reverse justify-end gap-2 bg-navy-900 px-5 py-6 transition-colors duration-200 hover:bg-navy-800 sm:px-8 sm:py-10"
            >
              <dt className="text-base leading-[26px] text-on-dark-muted">{s.label}</dt>
              <dd className="flex flex-col gap-3">
                <span aria-hidden="true" className="text-index text-green-bright/80">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-stat whitespace-nowrap text-white">{s.value}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
