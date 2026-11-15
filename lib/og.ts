import type { WriteupEntry } from "./types";

// Derive the share-card eyebrow + headline for a writeup.
// Priority: explicit `cardEyebrow` / `cardTitle` front-matter, then a sensible
// fallback — a "PREFIX: rest" title splits into eyebrow + headline (e.g. a CVE
// id), otherwise the first topic (or "WRITEUP") becomes the eyebrow and the
// full title the headline.
export function cardCopy(entry: WriteupEntry | null): {
  eyebrow: string;
  headline: string;
} {
  const title = entry?.title ?? "";

  // Explicit overrides. If a post sets cardTitle but no cardEyebrow, it gets NO
  // eyebrow (empty) rather than an auto-invented one.
  if (entry?.cardTitle || entry?.cardEyebrow) {
    return {
      eyebrow: (entry.cardEyebrow ?? "").toUpperCase(),
      headline: entry.cardTitle ?? stripLeadLabel(title),
    };
  }

  const colon = title.indexOf(":");
  if (colon > 0 && colon < 24) {
    const headline = title.slice(colon + 1).trim();
    return {
      eyebrow: title.slice(0, colon).trim(),
      headline: headline.charAt(0).toUpperCase() + headline.slice(1),
    };
  }

  return {
    eyebrow: (entry?.topics[0] ?? "WRITEUP").toUpperCase(),
    headline: title,
  };
}

function stripLeadLabel(title: string): string {
  const colon = title.indexOf(":");
  return colon > 0 && colon < 24 ? title.slice(colon + 1).trim() : title;
}
