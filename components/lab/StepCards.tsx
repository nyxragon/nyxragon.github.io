"use client";

/**
 * StepCards — the §2 action playbook. Numbered cards, text always visible
 * (no hide-behind-hover: this is crisis guidance). Premium polish:
 *  · hover lift via shadow + accent brighten (desktop; degrades to static on touch)
 *  · scroll-into-view staggered fade/rise (IntersectionObserver, once)
 * Fed by a ```steps fence (parsed in MarkdownRenderer). One `!`-prefixed line
 * marks the urgent card (red accent). Body supports [links](url) and **bold**.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";

export type StepItem = { title: string; body: string; urgent?: boolean };

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1]) {
      const url = m[2];
      const ext = /^https?:/.test(url);
      nodes.push(
        <a
          key={key++}
          href={url}
          target={ext ? "_blank" : undefined}
          rel={ext ? "noopener noreferrer" : undefined}
        >
          {m[1]}
        </a>
      );
    } else {
      nodes.push(<strong key={key++}>{m[3]}</strong>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function StepCards({ items }: { items: StepItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false); // JS confirmed it can animate
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reduced-motion: leave cards in their default visible state, no animation.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    setArmed(true); // now safe to hide-then-reveal; no-JS keeps them visible
    const reveal = () => setInView(true);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          reveal();
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    // Failsafe: never leave the steps hidden if the observer stays silent.
    const t = window.setTimeout(reveal, 1400);
    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`step-cards${armed ? " anim" : ""}${inView ? " in" : ""}`}
    >
      {items.map((s, i) => (
        <div
          key={i}
          className={`step-card${s.urgent ? " urgent" : ""}`}
          style={{ ["--d" as string]: `${i * 70}ms` } as React.CSSProperties}
        >
          <div className="step-num" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </div>
          <div className="step-text">
            <div className="step-title">{renderInline(s.title)}</div>
            <div className="step-body">{renderInline(s.body)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
