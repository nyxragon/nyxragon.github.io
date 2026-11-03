import { notFound } from "next/navigation";
import Link from "next/link";
import { getShareSlugs, getWriteupEntryByShare } from "@/lib/content";
import { Badge } from "@/components/ui/Panel";
import { MarkdownRenderer } from "@/components/lab/MarkdownRenderer";
import { TocRail, type TocRailItem } from "@/components/writeups/TocRail";
import { typeColor, typeLabel } from "@/lib/utils";

// ── Unlisted share-preview route ───────────────────────────────────
// A draft carrying a `share:` token in its front-matter is served live here at
// /writeups/drafts/<token>/ — a secret link to hand to contacts before the real
// publish. It is NOT in the writeups index (that excludes all drafts) and is
// noindexed below, so search engines never surface it. The clean
// /writeups/<slug>/ stays reserved for the eventual silent publish.

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = getShareSlugs().map((slug) => ({ slug }));
  // output: "export" needs at least one static param for a dynamic route;
  // a placeholder resolves to notFound() when no draft has a share token.
  return slugs.length > 0 ? slugs : [{ slug: "_none" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getWriteupEntryByShare(slug);
  // noindex/nofollow regardless — this URL must never be indexed.
  const robots = { index: false, follow: false };
  if (!entry) return { title: "Not Found", robots };
  return {
    title: entry.title,
    description: entry.summary,
    robots,
  };
}

const HEADING_ID = /\s*\{#([\w-]+)\}\s*$/;
const SECTION_NUM = /^(\d+)\.\s+(.*)$/;

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
    if (/^jump to what you need/i.test(fullLabel)) continue;
    if (/^at a glance/i.test(fullLabel)) continue;
    if (!num) continue;
    items.push({
      id,
      num: num.padStart(2, "0"),
      label: RAIL_LABELS[num] ?? fullLabel,
    });
  }
  return items;
}

export default async function DraftPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getWriteupEntryByShare(slug);

  if (!entry) notFound();

  const toc = buildToc(entry.content);
  const railItems = [{ id: "intro", num: "00", label: "Intro" }, ...toc];

  return (
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
            <Badge className={typeColor(entry.type)}>{typeLabel(entry.type)}</Badge>
            <span className="text-xs text-[#a39c8b]">Draft</span>
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
