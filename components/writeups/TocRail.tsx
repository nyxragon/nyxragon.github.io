"use client";

import { useEffect, useState } from "react";

export type TocRailItem = { id: string; num: string; label: string };

/**
 * Sticky "On this page" rail for wide screens. Section-level (h2) only, with
 * short labels, and an IntersectionObserver-driven active highlight (the
 * standard docs pattern — Stripe/Vercel/Docusaurus). Lives in the margin that
 * would otherwise be dead space.
 */
export function TocRail({ items }: { items: TocRailItem[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const onscreen = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );
        if (onscreen[0]) setActive(onscreen[0].target.id);
      },
      // Activate a section as its heading nears the top of the viewport.
      { rootMargin: "-12% 0px -78% 0px", threshold: 0 }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav
      aria-label="On this page"
      className="sticky top-20 self-start max-h-[calc(100dvh-7rem)] overflow-y-auto"
    >
      <p className="font-mono text-[11px] uppercase tracking-wider text-[#8a8375] mb-3">
        On this page
      </p>
      <ul className="space-y-0.5 text-sm">
        {items.map((item) => {
          const on = active === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={on ? "location" : undefined}
                className={`flex gap-2.5 rounded-md border-l-2 pl-3 pr-2 py-1.5 no-underline leading-snug transition-colors ${
                  on
                    ? "border-[var(--color-accent)] text-[#f6efe1]"
                    : "border-transparent text-[#a39c8b] hover:text-[#e9e0cf]"
                }`}
              >
                <span
                  className={`shrink-0 font-mono text-xs tabular-nums ${
                    on
                      ? "text-[var(--color-accent)]"
                      : "text-[var(--color-accent)]/55"
                  }`}
                >
                  {item.num}
                </span>
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
