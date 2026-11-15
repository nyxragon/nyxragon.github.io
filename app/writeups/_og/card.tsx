import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// ── Shared social-card renderer (Open Graph / Twitter), 1200x630 ──────
// One source of truth for every writeup's share card: a minimal, on-theme card
// with an eyebrow (mono), a gradient headline, an accent rule, and the byline.
// No in-article hero. The background is the synthesized "rich, not milky"
// gradient stack (see notes below). Each route's opengraph-image.tsx passes its
// own eyebrow + headline and re-exports `size`/`contentType`.
//
// Satori constraints honoured here: no filter:blur; radial-gradient only with
// KEYWORD sizing (closest-side / farthest-corner); ONE gradient per layer, so
// each is its own full-size div; fonts need real bytes; background-clip:text ok.

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Resolve assets from the project root. A URL relative to import.meta.url
// mis-resolves under Turbopack (it silently loads wrong bytes), so use cwd.
const OG_DIR = join(process.cwd(), "app", "writeups", "_og");
const font = (file: string) => readFileSync(join(OG_DIR, "_fonts", file));
// Zero-mean film-grain tile — dithers the 8-bit banding without lifting
// luminance (a grey veil would re-introduce the "milky" look).
const NOISE =
  "data:image/png;base64," +
  readFileSync(join(OG_DIR, "_assets", "noise.png")).toString("base64");

// Site tokens (globals.css)
const BG = "#080611"; // cool violet-tinted near-black (not neutral grey)
const INK = "#d6d6e0"; // --color-text
const MUTED = "#8a8a99"; // --color-muted
// Headline: the masthead gradient is lavender -> pink -> teal, but the teal end
// is low-value and goes muddy over a lit zone, so keep only the two highest-
// luminance brand hues (lavender -> pink): vivid AND legible over the dark zone.
const TITLE_GRADIENT =
  "linear-gradient(100deg, #cdbcff 0%, #b3a8ff 26%, #ff7ab0 68%, #ff5fa2 100%)";

// Background, synthesized from three independent takes (web research + two
// designers). Principles they agreed on:
//  - Richness = high-chroma hues at partial alpha on near-black (emitted light),
//    NEVER a grey/white film (the "milky" bug: lifts blacks + desaturates).
//  - Darken ONLY with the bg near-black (value down, not saturation down).
//  - Fade to rgba(sameColor,0), never `transparent` (= rgba(0,0,0,0) grey halo).
//  - Route a hue toward dark THROUGH adjacent hues to dodge the brown/grey mud.
//  - Keep a genuinely near-black rest zone behind the heading (value contrast).
//  - One dominant hue (violet) + one accent (aqua); peaks separated so nothing
//    stacks into a blown corner.
const BASE_GRADIENT =
  "linear-gradient(145deg, #080611 0%, #0a0715 52%, #0e0a1b 100%)";
const WASHES: string[] = [
  // 1 - hero violet light, hotspot OFF the right edge (no on-canvas blowout);
  //     dies by 72% so it never reaches the center-left heading zone.
  "radial-gradient(farthest-corner at 100% 50%, rgba(139,124,255,0.50) 0%, rgba(120,95,230,0.18) 40%, rgba(120,95,230,0) 72%)",
  // 2 - magenta depth in the empty lower-right; routed pink -> orchid -> fade.
  "radial-gradient(farthest-corner at 86% 92%, rgba(255,95,162,0.42) 0%, rgba(205,86,196,0.16) 40%, rgba(225,70,150,0) 68%)",
  // 3 - aqua complementary accent, tightly contained mid-right (closest-side).
  "radial-gradient(closest-side at 84% 70%, rgba(52,224,212,0.26) 0%, rgba(52,224,212,0.06) 55%, rgba(52,224,212,0) 85%)",
  // 4 - dark rest zone behind the heading: NEAR-BLACK (value down, not a veil).
  "radial-gradient(farthest-corner at 24% 46%, rgba(4,3,10,0.78) 0%, rgba(4,3,10,0.34) 32%, rgba(4,3,10,0) 58%)",
];
// Subtle top-lit hairline (the premium "glass surface" tell).
const TOP_SHEEN =
  "linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 12%)";

const fullLayer = (bg: string, extra?: Record<string, unknown>) => ({
  position: "absolute" as const,
  top: 0,
  left: 0,
  width: size.width,
  height: size.height,
  backgroundImage: bg,
  ...extra,
});

// Headline auto-size: keep short titles big, step down for long ones so they
// never overflow the card (a CVE-length line stays 72; a full long title fits).
function headlineSize(headline: string): number {
  const n = headline.length;
  if (n <= 58) return 72;
  if (n <= 78) return 54;
  return 46;
}

// Pre-wrap the headline into explicit lines so Satori never runs its own
// line-breaker. Satori mis-measures the space at an auto-wrap candidate and
// renders it double-width (the "Your  Options" gap); giving it hard newlines
// (whiteSpace: pre-wrap) removes every wrap decision, so spacing is uniform.
// ~0.52em average advance for Outfit Heavy; keep a little margin under maxWidth.
function wrapHeadline(headline: string, fontSize: number, maxWidth: number): string {
  const maxChars = Math.floor(maxWidth / (fontSize * 0.52));
  const lines: string[] = [];
  let line = "";
  for (const word of headline.split(" ")) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.join("\n");
}

export function ogCard({
  eyebrow,
  headline,
}: {
  eyebrow: string;
  headline: string;
}): ImageResponse {
  const titleSize = headlineSize(headline);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: BG,
          backgroundImage: BASE_GRADIENT,
          padding: "76px 84px",
          position: "relative",
        }}
      >
        {WASHES.map((bg, i) => (
          <div key={i} style={fullLayer(bg)} />
        ))}
        <div style={fullLayer(`url(${NOISE})`, { backgroundRepeat: "repeat", opacity: 0.06 })} />
        <div style={fullLayer(TOP_SHEEN)} />

        {/* top row: eyebrow only (domain is redundant — the share unfurl shows
            the domain already, and the byline carries the handle). */}
        <div style={{ display: "flex", alignItems: "center", minHeight: 34 }}>
          {eyebrow ? (
            <div
              style={{
                fontFamily: "JetBrains Mono",
                fontSize: 26,
                letterSpacing: 2,
                color: "#9d8fff",
              }}
            >
              {eyebrow}
            </div>
          ) : null}
        </div>

        {/* headline + rule */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              // Hard-wrapped lines (whiteSpace: pre-wrap) so Satori never runs
              // its own line-breaker — see wrapHeadline for why.
              whiteSpace: "pre-wrap",
              fontFamily: "OutfitHeavy",
              fontSize: titleSize,
              lineHeight: 1.08,
              letterSpacing: -1,
              maxWidth: 940,
              backgroundImage: TITLE_GRADIENT,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            {wrapHeadline(headline, titleSize, 940)}
          </div>
          <div
            style={{
              marginTop: 34,
              width: 128,
              height: 5,
              borderRadius: 3,
              backgroundImage: "linear-gradient(90deg, #8b7cff, rgba(139,124,255,0))",
            }}
          />
        </div>

        {/* byline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontFamily: "OutfitSemi",
            fontSize: 26,
            color: INK,
          }}
        >
          Abhijeet Ingle
          <span style={{ color: MUTED, margin: "0 12px" }}>·</span>
          <span style={{ fontFamily: "JetBrains Mono", fontSize: 23, color: MUTED }}>
            nyxragon
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "OutfitHeavy", data: font("Outfit-800.ttf"), weight: 400, style: "normal" },
        { name: "OutfitSemi", data: font("Outfit-600.ttf"), weight: 400, style: "normal" },
        { name: "JetBrains Mono", data: font("JetBrainsMono-500.ttf"), weight: 400, style: "normal" },
      ],
    }
  );
}
