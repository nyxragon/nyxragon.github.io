"use client";

import { useEffect, useRef } from "react";

/**
 * Ambient aurora backdrop. The drifting blobs are pure CSS (see globals.css);
 * here we add a gentle cursor parallax on top by translating the whole layer.
 * Disabled entirely when the user prefers reduced motion.
 */
export function AuroraBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        const el = ref.current;
        if (el) el.style.transform = `translate3d(${x * 22}px, ${y * 22}px, 0)`;
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="workspace-bg"
      aria-hidden
      style={{ transition: "transform 0.5s ease-out" }}
    >
      <div className="grid-overlay" />
    </div>
  );
}
