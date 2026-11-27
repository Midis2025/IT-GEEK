import type { ReactNode } from "react";

type EyebrowProps = { children: ReactNode; tone?: "brand" | "green"; index?: string };

/** Small-caps section label with an accent rule and an optional monospaced section index ("01"). */
export function Eyebrow({ children, tone = "brand", index }: EyebrowProps) {
  const toneClass = tone === "green" ? "text-green-bright" : "text-brand";
  return (
    <p className={`text-eyebrow eyebrow ${toneClass}`}>
      {index && (
        <span aria-hidden="true" className="text-index -mr-1 opacity-70">
          {index}
        </span>
      )}
      <span>{children}</span>
    </p>
  );
}

type SectionHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  id?: string;
  /**
   * center: stacked and centred · left: stacked, left-aligned ·
   * split: title left, intro right on large screens (stacked below lg).
   */
  align?: "center" | "left" | "split";
  dark?: boolean;
  /** Two-digit section number shown before the eyebrow. */
  index?: string;
};

export function SectionHeader({ eyebrow, title, subtitle, id, align = "center", dark = false, index }: SectionHeaderProps) {
  const titleClass = `text-h2 ${dark ? "text-white" : "text-heading"}`;
  const subtitleClass = `text-lead ${dark ? "text-on-dark-muted" : "text-body"}`;
  const label = (
    <Eyebrow tone={dark ? "green" : "brand"} index={index}>
      {eyebrow}
    </Eyebrow>
  );

  if (align === "split") {
    return (
      <div
        data-reveal
        className={`grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-16 xl:gap-24`}
      >
        <div className="flex flex-col gap-4">
          {label}
          <h2 id={id} className={`${titleClass} max-w-[620px]`}>
            {title}
          </h2>
        </div>
        {subtitle && <p className={`${subtitleClass} max-w-[560px] lg:justify-self-end lg:pb-1`}>{subtitle}</p>}
      </div>
    );
  }

  const center = align === "center";
  return (
    <div data-reveal className={`flex flex-col gap-4 ${center ? "mx-auto max-w-[760px] items-center text-center" : "items-start"}`}>
      {label}
      <h2 id={id} className={`${titleClass} ${center ? "" : "max-w-[620px]"}`}>
        {title}
      </h2>
      {subtitle && <p className={`${subtitleClass} ${center ? "max-w-[680px]" : "max-w-[600px]"}`}>{subtitle}</p>}
    </div>
  );
}
