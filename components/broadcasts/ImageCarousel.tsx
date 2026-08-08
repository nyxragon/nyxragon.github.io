"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { TalkImage } from "@/lib/types";

const SLIDE_MS = 3500;

export function ImageCarousel({ images }: { images: TalkImage[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());

  const visibleImages = useMemo(
    () => images.filter((img) => !failedUrls.has(img.url)),
    [images, failedUrls]
  );

  const count = visibleImages.length;
  const safeIndex = count > 0 ? index % count : 0;

  // Auto-advance
  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, [count, paused]);

  const go = (delta: number) => {
    setIndex((i) => {
      const next = (i + delta + count) % count;
      return next;
    });
  };

  if (count === 0) {
    return (
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-violet-950/20 border border-violet-500/20 flex items-center justify-center">
        <p className="font-mono text-xs text-zinc-500">transmission archived</p>
      </div>
    );
  }

  return (
    <div
      className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black border border-[var(--color-border)] group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Cross-fade all slides */}
      {visibleImages.map((img, i) => (
        <Image
          key={img.url}
          src={img.url}
          alt={img.alt}
          fill
          className={`object-contain transition-opacity duration-700 ${
            i === safeIndex ? "opacity-100" : "opacity-0"
          }`}
          sizes="(max-width: 768px) 100vw, 50vw"
          onError={() =>
            setFailedUrls((prev) => new Set(prev).add(img.url))
          }
        />
      ))}

      {/* Bottom gradient for dot visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

      {count > 1 && (
        <>
          {/* Prev / Next */}
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-violet-600/70 transition-colors border border-white/10 md:opacity-0 md:group-hover:opacity-100 text-base leading-none"
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-violet-600/70 transition-colors border border-white/10 md:opacity-0 md:group-hover:opacity-100 text-base leading-none"
            aria-label="Next image"
          >
            ›
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
            {visibleImages.map((img, i) => (
              <button
                key={img.url}
                type="button"
                onClick={() => setIndex(i)}
                className={`rounded-full transition-all ${
                  i === safeIndex
                    ? "w-4 h-1.5 bg-violet-400"
                    : "w-1.5 h-1.5 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>

          {/* Auto-play progress bar */}
          {!paused && (
            <div
              key={`${safeIndex}-progress`}
              className="absolute bottom-0 left-0 h-0.5 bg-violet-500/70"
              style={{
                animation: `carousel-progress ${SLIDE_MS}ms linear forwards`,
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
