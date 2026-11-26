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
    <section id="faq" aria-labelledby="faq-title" className="section-y bg-white">
      <div className="container-page flex flex-col gap-10 lg:gap-12">
        <SectionHeader id="faq-title" eyebrow="FAQ" title="Questions, answered" />
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-4">
          {faqs.map((item, i) => {
            const isOpen = open.has(i);
            return (
              <div
                key={item.q}
                className={`rounded-2xl border bg-white transition-colors duration-200 ${isOpen ? "border-brand/40" : "border-line hover:border-brand/25"}`}
              >
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => toggle(i)}
                    className="flex w-full items-center gap-6 rounded-2xl px-5 py-5 text-left sm:px-7 sm:py-6"
                  >
                    <span className="text-h5 flex-1 text-heading">{item.q}</span>
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200 ${isOpen ? "bg-brand" : "bg-brand-soft"}`}
                    >
                      <Icon name={isOpen ? "faq-minus" : "faq-plus"} size={18} />
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-a-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  className={`grid transition-[grid-template-rows,margin] duration-300 ease-out ${isOpen ? "-mt-2 grid-rows-[1fr] sm:-mt-3" : "grid-rows-[0fr]"}`}
                >
                  <div className="overflow-hidden" inert={!isOpen}>
                    <p className="px-5 pb-6 text-base leading-[26px] text-body sm:px-7">{item.a}</p>
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
