import Image from "next/image";
import logo from "@/public/brand/itgeek-logo.png";

type LogoProps = {
  className?: string;
  /** Header: 44px tall on mobile/tablet, 52px on desktop. Footer: 48px. */
  variant?: "header" | "footer";
  /** Load eagerly (above the fold). */
  preload?: boolean;
};

/**
 * Official ITGeek logo (public/brand/itgeek-logo.png, 850×350, transparent background).
 * Created from the official itgeek.com.au JPEG (kept as public/brand/itgeek-logo.jpeg) by removing only the white
 * background; artwork, colours and proportions are unchanged.
 */
export function Logo({ className = "", variant = "header", preload = false }: LogoProps) {
  const height = variant === "header" ? "h-11 lg:h-[52px]" : "h-12";
  return (
    <a href="#top" aria-label="ITGeek — back to top" className={`inline-flex shrink-0 ${className}`}>
      <Image
        src={logo}
        alt="ITGeek"
        sizes="(min-width: 64rem) 127px, 107px"
        quality={90}
        preload={preload}
        className={`${height} w-auto`}
      />
    </a>
  );
}
