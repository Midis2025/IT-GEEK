import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { approvedTestimonials, showTestimonialPreview, showTestimonials } from "@/lib/testimonials";

/** Dev-only placeholder card: no names, quotes or ratings — just the layout, clearly labelled. */
function PreviewCard({ n }: { n: number }) {
  return (
    <li>
      <div className="flex h-full min-h-[300px] flex-col gap-5 rounded-[20px] border-2 border-dashed border-brand/30 bg-white/70 p-6 sm:p-8">
        <span className="text-eyebrow self-start rounded-full bg-amber/18 px-3 py-1.5 text-heading">Preview only</span>
        <p className="text-lead flex-1 text-body">
          Approved customer review {n} goes here. Add genuine, approved testimonials in{" "}
          <code className="rounded bg-subtle px-1.5 py-0.5 text-sm text-heading">lib/testimonials.ts</code>.
        </p>
        <hr className="border-0 border-t border-line" />
        <p className="text-sm leading-[22px] text-muted">Not shown in production builds until real reviews are added.</p>
      </div>
    </li>
  );
}

export function Testimonials() {
  // Production: hidden entirely until genuine, approved reviews exist. Dev server: labelled layout preview.
  if (!showTestimonials) return null;

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="section-y bg-subtle">
      <div className="container-page flex flex-col items-center gap-10 lg:gap-14">
        <SectionHeader
          id="reviews-title"
          eyebrow="Reviews"
          title="Trusted by Aussie homes and small businesses"
          subtitle="Real problems, sorted. Here’s what customers say about working with ITGeek."
        />
        <ul className="grid w-full max-w-[640px] gap-6 lg:max-w-none lg:grid-cols-3">
          {showTestimonialPreview
            ? [1, 2, 3].map((n) => <PreviewCard key={n} n={n} />)
            : approvedTestimonials.map((r) => (
                <li key={r.name}>
                  <figure className="flex h-full flex-col gap-5 rounded-[20px] border border-line bg-white p-6 shadow-card sm:p-8">
                    {r.rating ? (
                      <div className="flex gap-1" role="img" aria-label={`${r.rating} out of 5 stars`}>
                        {Array.from({ length: Math.round(r.rating) }, (_, i) => (
                          <Icon key={i} name="star" size={18} />
                        ))}
                      </div>
                    ) : null}
                    <blockquote className="text-lead flex-1 text-heading">
                      <p>“{r.quote}”</p>
                    </blockquote>
                    <hr className="border-0 border-t border-line" />
                    <figcaption className="flex items-center gap-3">
                      <span
                        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm leading-5 font-semibold text-brand"
                        aria-hidden="true"
                      >
                        {r.initials}
                      </span>
                      <span>
                        <span className="block text-base leading-6 font-semibold text-heading">{r.name}</span>
                        <span className="block text-sm leading-[22px] text-muted">{r.role}</span>
                      </span>
                    </figcaption>
                  </figure>
                </li>
              ))}
        </ul>
      </div>
    </section>
  );
}
