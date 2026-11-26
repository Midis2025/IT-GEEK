import { Icon } from "./Icon";

/** Figma "Check Item" — Theme=Dark for navy surfaces. */
export function CheckItem({ text, dark = false }: { text: string; dark?: boolean }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={`mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-full ${dark ? "bg-green-bright/16" : "bg-green-soft"}`}
      >
        <Icon name={dark ? "check-green-dark" : "check-green"} size={14} />
      </span>
      <span className={`text-base leading-[26px] ${dark ? "text-on-dark-muted" : "text-body"}`}>{text}</span>
    </li>
  );
}
