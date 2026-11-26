import { withBasePath } from "@/lib/site";

type IconProps = {
  /** File name (without extension) in /public/figma — exported from the Figma design. */
  name: string;
  size: number;
  className?: string;
};

/** Decorative icon exported from Figma. Meaning is always carried by adjacent text. */
export function Icon({ name, size, className }: IconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static SVGs need no optimisation
    <img
      src={withBasePath(`/figma/${name}.svg`)}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      decoding="async"
      className={`block shrink-0 ${className ?? ""}`}
      style={{ width: size, height: size }}
    />
  );
}
