"use client";

import { useEffect } from "react";

const STAGGER_MS = 80;
const MAX_STAGGER_STEPS = 5;

/**
 * Reveals [data-reveal] elements (and the children of [data-reveal-group], staggered) once, as they enter the
 * viewport. Hiding is CSS-only and keyed on html.js-reveal, which the inline script in app/layout.tsx sets and
 * removes again if this controller never starts — so content can never stay hidden.
 */
export function RevealController() {
  useEffect(() => {
    const w = window as Window & { __revealReady?: boolean };
    w.__revealReady = true;

    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-group]"));
    document.querySelectorAll<HTMLElement>("[data-reveal-group]").forEach((group) => {
      Array.from(group.children).forEach((child, i) => {
        (child as HTMLElement).style.setProperty("--reveal-delay", `${Math.min(i, MAX_STAGGER_STEPS) * STAGGER_MS}ms`);
      });
    });

    const reveal = (el: Element) => el.setAttribute("data-revealed", "");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      targets.forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return null;
}
