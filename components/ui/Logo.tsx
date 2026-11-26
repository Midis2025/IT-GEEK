import Image from "next/image";
import logo from "@/public/brand/itgeek-logo.jpeg";

type LogoProps = {
  className?: string;
  /** Header: 44px tall on mobile/tablet, 52px on desktop. Footer: 48px. */
  variant?: "header" | "footer";
  /** Load eagerly (above the fold). */
  preload?: boolean;
};

/**
 * Official ITGeek logo from itgeek.com.au (public/brand/itgeek-logo.jpeg, 850×350).
 * The artwork is only published on a white background (no SVG/transparent version), so it is shown as-is on a
 * white plate — unaltered colours and proportions — which keeps the black web address legible on navy.
 */
export function Logo({ className = "", variant = "header", preload = false }: LogoProps) {
  const height = variant === "header" ? "h-11 lg:h-[52px]" : "h-12";
  return (
    <a href="#top" aria-label="ITGeek — back to top" className={`inline-flex shrink-0 rounded-lg ${className}`}>
      <Image
        src={logo}
        alt="ITGeek"
        sizes="(min-width: 64rem) 127px, 107px"
        quality={90}
        preload={preload}
        className={`${height} w-auto rounded-lg bg-white`}
      />
    </a>
  );
}
