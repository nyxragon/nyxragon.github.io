import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllWriteups, getWriteupEntry, getWriteupsForDevPreview } from "@/lib/content";
import { Badge } from "@/components/ui/Panel";
import { MarkdownRenderer } from "@/components/lab/MarkdownRenderer";
import { TocRail, type TocRailItem } from "@/components/writeups/TocRail";
import { formatDate, typeColor, typeLabel } from "@/lib/utils";

export const dynamicParams = false;

export async function generateStaticParams() {
  // Production export lists published posts only; in dev, include _drafts so
  // draft URLs are previewable (dynamicParams=false would 404/500 them otherwise).
  const entries =
    process.env.NODE_ENV === "production"
      ? getAllWriteups()
      : getWriteupsForDevPreview();
  const slugs = entries.map((entry) => ({ slug: entry.slug }));
  // output: "export" requires at least one static param for a dynamic route —
  // fall back to a placeholder that resolves to notFound() when there are no
  // published writeups yet (e.g. everything is still a draft).
  return slugs.length > 0 ? slugs : [{ slug: "_none" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getWriteupEntry(slug);
  if (!entry) return { title: "Not Found" };
  return {
    title: entry.title,
    description: entry.summary,
  };
}

// ── Table of contents (wide-screen side rail) ──────────────────────
// Section-level (h2) only, with SHORT labels — a narrow rail can't carry full
// section titles (they wrapped into a messy stack). Ids mirror MarkdownRenderer.
const HEADING_ID = /\s*\{#([\w-]+)\}\s*$/;
const SECTION_NUM = /^(\d+)\.\s+(.*)$/;

// Short rail labels keyed by section number. Presentation only — the article's
// real headings are untouched; these just keep the rail to one line each.
const RAIL_LABELS: Record<string, string> = {
  "1": "Stop it spreading",
  "2": "If you're threatened",
  "3": "The 2-hour law",
  "4": "Get it removed",
  "5": "Remove from search engines",
  "6": "People who'll help",
  "7": "Protect yourself",
  "8": "Help someone else",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(HEADING_ID, "")
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function buildToc(markdown: string): TocRailItem[] {
  const items: TocRailItem[] = [];
  let inFence = false;
  for (const line of markdown.split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    // h2 only
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (!m) continue;
    if (/^###/.test(line)) continue;
    const rawText = m[1];
    const explicit = rawText.match(HEADING_ID);
    const id = explicit ? explicit[1] : slugify(rawText);
    const text = rawText.replace(HEADING_ID, "").trim();
    const numMatch = text.match(SECTION_NUM);
    const num = numMatch ? numMatch[1] : null;
    const fullLabel = numMatch ? numMatch[2] : text;
    // Skip the inline "Jump to what you need" TOC heading and the "At a glance"
    // summary — the rail is the contents, those aren't reader destinations.
    if (/^jump to what you need/i.test(fullLabel)) continue;
    if (/^at a glance/i.test(fullLabel)) continue;
    // Numbered sections only in the rail (keeps it to the 9-step spine).
    if (!num) continue;
    items.push({
      id,
      num: num.padStart(2, "0"),
      label: RAIL_LABELS[num] ?? fullLabel,
    });
  }
  return items;
}

export default async function WriteupPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getWriteupEntry(slug);

  if (!entry) notFound();

  const toc = buildToc(entry.content);
  // The rail gets a "00 Intro" entry at the top (links to the masthead). The
  // intro itself stays as-is — no numbered section opener.
  const railItems = [{ id: "intro", num: "00", label: "Intro" }, ...toc];

  return (
    // < 1280px: a single centered reading column at the prose measure.
    // ≥ 1280px: a two-track grid — reading column + a sticky section rail that
    // fills what was dead margin. The prose measure stays capped (.prose
    // max-width) so lines never run long regardless of track width.
    <div className="writeup-shell">
      <article className="writeup min-w-0">
        <Link
          href="/writeups/"
          className="text-xs text-[#8a8375] hover:text-[var(--color-accent)] no-underline mb-6 inline-block transition-colors"
        >
          ← Writeups
        </Link>

        <header id="intro" className="animate-in scroll-mt-20">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {entry.draft && process.env.NODE_ENV === "development" && (
              <Badge className="text-amber-400/90 border-amber-400/25 bg-amber-400/8">
                preview only
              </Badge>
            )}
            <Badge className={typeColor(entry.type)}>
              {typeLabel(entry.type)}
            </Badge>
            <span className="text-xs text-[#a39c8b]">
              {formatDate(entry.date)}
            </span>
          </div>
          <h1 className="text-3xl md:text-[2.6rem] font-extrabold tracking-tight inline-block text-gradient leading-[1.12] pb-1">
            {entry.title}
          </h1>
          {entry.summary && (
            <p className="mt-3 text-lg text-[#c4bcac] leading-relaxed">
              {entry.summary}
            </p>
          )}
        </header>

        {/* Hairline between masthead and body — a quiet "chapter start" */}
        <div className="mt-8 pt-8 border-t border-[rgba(242,232,216,0.09)] animate-in">
          <MarkdownRenderer content={entry.content} />
        </div>
      </article>

      {toc.length > 0 && (
        <aside className="hidden min-[1280px]:block">
          <TocRail items={railItems} />
        </aside>
      )}
    </div>
  );
}
