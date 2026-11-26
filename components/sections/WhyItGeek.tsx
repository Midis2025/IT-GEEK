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
        className="pointer-events-none absolute -top-64 right-[-18%] -z-10 size-[820px] bg-[radial-gradient(closest-side,rgb(11_99_229/0.18),transparent)]"
      />
      <div className="container-page grid items-center gap-12 xl:grid-cols-[minmax(0,620px)_500px] xl:justify-between xl:gap-20">
        <div className="flex flex-col gap-10">
          <SectionHeader
            id="why-title"
            align="left"
            dark
            eyebrow="Why ITGeek"
            title="Expert help, made simple."
            subtitle="This help desk focuses on two areas: Microsoft 365 and online security. That focus means clearer answers, fewer repeat problems and advice you can trust."
          />
          <ul data-reveal-group className="grid gap-8 sm:grid-cols-2">
            {features.map((f) => (
              <li key={f.title} className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-green-bright/14 ring-1 ring-green-bright/25 ring-inset">
                  <Icon name={f.icon} size={22} />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-h5 text-white">{f.title}</h3>
                  <p className="text-sm leading-[22px] text-on-dark-muted">{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <dl data-reveal-group className="glass-dark grid grid-cols-1 gap-3 rounded-[28px] p-3 min-[360px]:grid-cols-2">
          {stats.map((s) => (
            <div
              key={s.label}
              className="glass-dark lift-dark flex flex-col-reverse justify-end gap-1 rounded-[20px] px-4 py-5 sm:px-6 sm:py-8"
            >
              <dt className="text-base leading-[26px] text-on-dark-muted">{s.label}</dt>
              <dd className="text-stat whitespace-nowrap text-white">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
