import type { ReactNode } from "react";

type EyebrowProps = { children: ReactNode; tone?: "brand" | "green" };

export function Eyebrow({ children, tone = "brand" }: EyebrowProps) {
  const toneClass = tone === "green" ? "bg-green-bright/16 text-green-bright" : "bg-brand-soft text-brand";
  return <p className={`text-eyebrow inline-flex rounded-full px-3.5 py-1.5 ${toneClass}`}>{children}</p>;
}

type SectionHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  id?: string;
  align?: "center" | "left";
  dark?: boolean;
};

export function SectionHeader({ eyebrow, title, subtitle, id, align = "center", dark = false }: SectionHeaderProps) {
  const center = align === "center";
  return (
    <div data-reveal className={`flex flex-col gap-4 ${center ? "mx-auto max-w-[800px] items-center text-center" : "items-start"}`}>
      <Eyebrow tone={dark ? "green" : "brand"}>{eyebrow}</Eyebrow>
      <h2 id={id} className={`text-h2 ${dark ? "text-white" : "text-heading"} ${center ? "" : "max-w-[600px]"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-lead max-w-[720px] ${dark ? "text-on-dark-muted" : "text-body"} ${center ? "" : "max-w-[600px]"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
