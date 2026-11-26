"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { navLinks, site } from "@/lib/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  // Highlight the nav link of the section currently in view.
  useEffect(() => {
    const sections = navLinks
      .map((l) => document.querySelector<HTMLElement>(l.href))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Close the mobile menu on Escape or when the viewport grows to desktop.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const mq = window.matchMedia("(min-width: 64rem)");
    const onMq = () => mq.matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [open]);

  return (
    <header className="on-dark sticky top-0 z-40 border-b border-white/8 bg-navy-900">
      <div className="container-page flex h-[72px] items-center justify-between gap-4 lg:h-20">
        <Logo preload />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  aria-current={active === link.href ? "true" : undefined}
                  className={`rounded-md py-2 text-[15px] leading-6 font-medium transition-colors hover:text-white ${active === link.href ? "text-white" : "text-on-dark-muted"}`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 lg:gap-6">
          <a
            href={site.phoneHref}
            className="flex items-center gap-2 rounded-lg py-2 text-sm leading-5 font-semibold text-white transition-colors hover:text-green-bright max-lg:size-11 max-lg:justify-center"
          >
            <Icon name="phone-green" size={18} />
            <span className="max-lg:sr-only">
              <span className="sr-only">Call </span>
              {site.phoneDisplay}
            </span>
          </a>
          <Button size="md" enquiry="Microsoft 365 help" className="max-[389px]:hidden max-sm:px-3.5">
            <span className="sm:hidden">Get help</span>
            <span className="max-sm:hidden">Get help now</span>
          </Button>
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-lg text-white hover:bg-white/8 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        hidden={!open}
        className="border-t border-white/8 bg-navy-900 lg:hidden"
        onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}
      >
        <nav aria-label="Mobile" className="container-page py-4">
          <ul className="flex flex-col">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="flex min-h-12 items-center rounded-lg px-2 text-base font-medium text-white hover:bg-white/6"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col gap-3 border-t border-white/8 pt-4 sm:flex-row">
            <Button enquiry="Microsoft 365 help" icon="arrow-right-white" className="w-full sm:w-auto">
              Get help now
            </Button>
            <Button href={site.phoneHref} variant="outline-dark" icon="cta-phone" className="w-full sm:w-auto">
              Call {site.phoneDisplay}
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
