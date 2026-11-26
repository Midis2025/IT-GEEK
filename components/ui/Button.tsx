import type { ReactNode } from "react";
import type { EnquiryTopic } from "@/lib/enquiry";
import { ENQUIRY_HREF } from "@/lib/site";
import { Icon } from "./Icon";

type Variant = "primary" | "green" | "outline-dark" | "white";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-white shadow-[0_8px_20px_-10px_rgb(11_99_229/0.7)] hover:-translate-y-px hover:bg-brand-hover hover:shadow-[0_12px_26px_-10px_rgb(11_99_229/0.75)]",
  green:
    "bg-green-ink text-white shadow-[0_8px_20px_-10px_rgb(21_128_61/0.7)] hover:-translate-y-px hover:bg-green-ink-hover hover:shadow-[0_12px_26px_-10px_rgb(21_128_61/0.75)]",
  "outline-dark": "border-[1.5px] border-white/35 text-white hover:border-white/70 hover:bg-white/[0.06]",
  white: "border border-line bg-white text-heading hover:-translate-y-px hover:border-heading/25 hover:bg-subtle",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 gap-2 px-[18px] py-2.5 text-sm leading-5 lg:min-h-10",
  lg: "min-h-14 gap-2 px-[26px] py-4 text-base leading-6",
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
          size={size === "lg" ? 20 : 18}
          className={icon.includes("arrow") ? "transition-transform duration-200 group-hover:translate-x-0.5" : ""}
        />
      )}
    </a>
  );
}
