/**
 * Customer testimonials shown in the Reviews section.
 *
 * Add ONLY genuine reviews that the customer and ITGeek have approved for publication. Never invent names, quotes,
 * locations or ratings. The Figma sample reviews (Sarah M., David L., Priya K.) were removed for this reason.
 *
 * While this list is empty:
 *  - the Reviews section and its footer link are hidden everywhere (production builds and the dev server alike);
 *  - developers can opt in to a labelled “Preview only” layout placeholder on the dev server only, with
 *    NEXT_PUBLIC_SHOW_REVIEW_PLACEHOLDER=true in .env.local. It can never appear in a production build.
 */
export type Testimonial = {
  quote: string;
  name: string;
  /** e.g. "Small business owner · Brisbane" — only with the customer's permission. */
  role: string;
  initials: string;
  /** Star rating the customer actually gave (1–5). Omit if none. */
  rating?: number;
  /** Where the review was originally published (e.g. Google review URL) — for internal verification. */
  source?: string;
};

export const approvedTestimonials: Testimonial[] = [];

/** Opt-in, dev-only layout preview while no approved testimonials exist. Never true in a production build. */
export const showTestimonialPreview =
  approvedTestimonials.length === 0 &&
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_SHOW_REVIEW_PLACEHOLDER === "true";

/** Whether the Reviews section (and its footer link) renders. */
export const showTestimonials = approvedTestimonials.length > 0 || showTestimonialPreview;
