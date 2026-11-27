"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { faqs } from "@/lib/faq";

export function Faq() {
  // First item open by default, as in the design.
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <section id="faq" aria-labelledby="faq-title" className="section-y border-t border-line bg-subtle">
      <div className="container-page grid gap-10 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-16 xl:grid-cols-[minmax(0,440px)_minmax(0,820px)] xl:justify-between">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeader id="faq-title" align="left" index="07" eyebrow="FAQ" title="Questions, answered" />
        </div>
        <div data-reveal-group className="flex w-full flex-col border-t border-line">
          {faqs.map((item, i) => {
            const isOpen = open.has(i);
            return (
              <div key={item.q} className="border-b border-line">
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => toggle(i)}
                    className="group flex w-full items-center gap-6 rounded-lg py-5 text-left sm:py-6"
                  >
                    <span className={`text-h5 flex-1 transition-colors duration-200 group-hover:text-brand ${isOpen ? "text-brand" : "text-heading"}`}>
                      {item.q}
                    </span>
                    <span
                      className={`relative flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${isOpen ? "border-brand bg-brand" : "border-line bg-white group-hover:border-brand/40"}`}
                    >
                      {/* Plus turns into minus: cross-fade with a quarter turn. */}
                      <Icon
                        name="faq-plus"
                        size={18}
                        className={`absolute transition-[opacity,rotate] duration-300 ${isOpen ? "rotate-90 opacity-0" : "opacity-100"}`}
                      />
                      <Icon
                        name="faq-minus"
                        size={18}
                        className={`absolute transition-[opacity,rotate] duration-300 ${isOpen ? "opacity-100" : "-rotate-90 opacity-0"}`}
                      />
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-a-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <div className={`overflow-hidden transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`} inert={!isOpen}>
                    <p className="max-w-[720px] pr-12 pb-6 text-base leading-[26px] text-body">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
