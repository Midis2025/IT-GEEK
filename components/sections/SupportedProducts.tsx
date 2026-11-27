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
    <section aria-labelledby="products-title" className="border-b border-line bg-subtle py-8 lg:py-7">
      <div className="container-page flex flex-col items-center gap-5 lg:flex-row lg:justify-between lg:gap-10">
        <p
          id="products-title"
          className="max-w-[340px] text-center text-sm leading-[22px] font-semibold text-body lg:max-w-[300px] lg:text-left xl:max-w-[360px]"
        >
          Specialist support for the Microsoft 365 apps and security tools your day depends on
        </p>
        <ul data-reveal-group className="flex flex-wrap justify-center gap-2 sm:gap-2.5 lg:justify-end">
          {products.map((p) => (
            <li
              key={p.label}
              className="flex items-center gap-2 rounded-[10px] border border-line bg-white py-2 pr-4 pl-3 text-sm leading-5 font-semibold text-heading transition-colors duration-200 hover:border-brand/30"
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
