import { Icon } from "@/components/ui/Icon";

const products = [
  { icon: "mail-blue", label: "Outlook" },
  { icon: "product-onedrive", label: "OneDrive" },
  { icon: "product-excel", label: "Excel" },
  { icon: "product-word", label: "Word & PowerPoint" },
  { icon: "product-antivirus", label: "Antivirus & security software" },
];

export function SupportedProducts() {
  return (
    <section aria-labelledby="products-title" className="border-b border-line bg-subtle py-10">
      <div className="container-page flex flex-col items-center gap-5">
        <p id="products-title" className="text-center text-sm leading-5 font-semibold text-body">
          Specialist support for the Microsoft 365 apps and security tools your day depends on
        </p>
        <ul data-reveal-group className="flex max-w-[1040px] flex-wrap justify-center gap-2.5 sm:gap-3">
          {products.map((p) => (
            <li
              key={p.label}
              className="glass-light lift flex items-center gap-2 rounded-full py-2.5 pr-[18px] pl-4 text-sm leading-5 font-semibold text-heading hover:translate-y-[-2px]"
            >
              <Icon name={p.icon} size={18} />
              {p.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
