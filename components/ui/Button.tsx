import type { ReactNode } from "react";
import type { EnquiryTopic } from "@/lib/enquiry";
import { ENQUIRY_HREF } from "@/lib/site";
import { Icon } from "./Icon";

type Variant = "primary" | "green" | "outline-dark" | "white";
type Size = "md" | "lg";

// One button system: 10px radius, solid fills without coloured glows, a 1px lift on hover for filled buttons.
const variants: Record<Variant, string> = {
  primary:
    "border border-transparent bg-brand text-white shadow-[0_1px_2px_rgb(10_20_48/0.12)] hover:-translate-y-px hover:bg-brand-hover",
  green:
    "border border-transparent bg-green-ink text-white shadow-[0_1px_2px_rgb(10_20_48/0.12)] hover:-translate-y-px hover:bg-green-ink-hover",
  "outline-dark": "border border-white/30 text-white hover:border-white/60 hover:bg-white/[0.06]",
  white: "border border-line bg-white text-heading hover:-translate-y-px hover:border-heading/25 hover:bg-subtle",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 gap-2 px-4 py-2 text-sm leading-5 lg:min-h-10",
  lg: "min-h-12 gap-2.5 px-6 py-3 text-[15px] leading-6",
};

type ButtonProps = {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  /** Icon file in /public/figma shown after the label. */
  icon?: string;
  className?: string;
  /** Opens the enquiry dialog with this topic preselected. */
  enquiry?: EnquiryTopic;
  href?: string;
};

export function Button({ children, variant = "primary", size = "lg", icon, className = "", enquiry, href }: ButtonProps) {
  return (
    <a
      href={href ?? ENQUIRY_HREF}
      data-enquiry={enquiry}
      className={`group inline-flex items-center justify-center rounded-[10px] text-center font-semibold sm:whitespace-nowrap transition-[background-color,border-color,translate,box-shadow] duration-200 active:translate-y-px ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
      {icon && (
        <Icon
          name={icon}
          size={18}
          className={icon.includes("arrow") ? "transition-transform duration-200 group-hover:translate-x-0.5" : ""}
        />
      )}
    </a>
  );
}
