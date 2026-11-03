import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";
import { ClickableTableRow } from "@/components/writeups/ClickableTableRow";
import { StepCards, type StepItem } from "@/components/lab/StepCards";
import { FactTiles, type Fact } from "@/components/lab/FactTiles";
import { EscalationPanel } from "@/components/lab/EscalationPanel";
import { HelpCards } from "@/components/lab/HelpCards";

// Trailing `{#custom-id}` on a heading overrides the auto-slug (e.g. `## … {#talk}`).
const HEADING_ID = /\s*\{#([\w-]+)\}\s*$/;
// Leading "N. " on a section heading → rendered as a quiet accent index.
const SECTION_NUM = /^(\d+)\.\s+(.*)$/;

function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (typeof node === "object" && "props" in node) {
    return textOf((node as { props?: { children?: ReactNode } }).props?.children);
  }
  return "";
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(HEADING_ID, "")
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Split a leading "N." off a heading so the number can be styled as an accent.
// Returns the original children untouched when there's no leading number.
function headingContent(text: string, children: ReactNode): ReactNode {
  const num = text.match(SECTION_NUM);
  if (!num) return children ?? text;
  return (
    <>
      <span className="prose-h-num" aria-hidden="true">
        {num[1].padStart(2, "0")}
      </span>
      <span>{num[2]}</span>
    </>
  );
}

function makeHeading(Tag: "h2" | "h3") {
  return function Heading({ children }: { children?: ReactNode }) {
    const raw = textOf(children);
    const explicit = raw.match(HEADING_ID);
    const id = explicit ? explicit[1] : slugify(raw);
    // Flatten to styled text only when there's an explicit id or a section
    // number; otherwise keep the original nodes (preserves any inline markup).
    const text = explicit ? raw.replace(HEADING_ID, "") : raw;
    const inner = explicit
      ? headingContent(text, text)
      : headingContent(raw, children);
    return <Tag id={id}>{inner}</Tag>;
  };
}

const components: Components = {
  h2: makeHeading("h2"),
  h3: makeHeading("h3"),
  // The recurring "The honest part:" caveat label gets its own accent class
  // (bold + warm amber via .honest-label) so it reads as a candid aside.
  strong({ children }) {
    const label = textOf(children).replace(/\s+/g, " ").trim().toLowerCase();
    if (label === "the honest part:" || label === "the honest part") {
      return <strong className="honest-label">{children}</strong>;
    }
    return <strong>{children}</strong>;
  },
  // The under-18 Take It Down route is boxed as its own protective callout,
  // given a distinct tint (.callout-minor) so it stands apart from the info cards.
  blockquote({ children }) {
    const t = textOf(children).toLowerCase();
    const minor =
      t.includes("take it down instead") || t.includes("under 18 in the image");
    return (
      <blockquote className={minor ? "callout-minor" : undefined}>
        {children}
      </blockquote>
    );
  },
  // Wrap tables so wide ones scroll horizontally on small screens
  // instead of blowing out the reading column.
  table({ children }) {
    return (
      <div className="prose-table-wrap">
        <table>{children}</table>
      </div>
    );
  },
  // Rows whose first cell is a link become clickable across the whole row.
  tr: ClickableTableRow,
  // A ```chips fenced block renders its comma-separated items as pill chips
  // (e.g. the StopNCII partner list). Everything else stays a normal code block.
  pre({ children }) {
    const child = Array.isArray(children) ? children[0] : children;
    const cls =
      child && typeof child === "object" && "props" in child
        ? ((child as { props?: { className?: string } }).props?.className ?? "")
        : "";
    // A ```escalate fenced block renders the §4 Cloudflare "last resort" panel:
    // a premium escalation rail (the site -> Cloudflare -> the host) above a focal
    // CTA, a registrar aside, the "Remember" line, and an NCSEI footnote. The rail
    // nodes are fixed design in EscalationPanel; the prose comes from six parts
    // split by a line of "---":
    //   heading / intro / gloss / cta (label|url) / registrar / remember
    if (typeof cls === "string" && cls.includes("language-escalate")) {
      const raw = textOf(
        (child as { props?: { children?: ReactNode } }).props?.children
      );
      const [
        headingRaw = "",
        introRaw = "",
        glossRaw = "",
        ctaRaw = "",
        registrarRaw = "",
        rememberRaw = "",
      ] = raw.split(/\n-{3,}\n/).map((s) => s.trim());
      const [ctaLabel = "", ctaUrl = ""] = ctaRaw
        .split("|")
        .map((s) => s.trim());
      return (
        <EscalationPanel
          heading={headingRaw}
          headingId={slugify(headingRaw)}
          intro={introRaw}
          gloss={glossRaw}
          ctaLabel={ctaLabel}
          ctaUrl={ctaUrl}
          registrar={registrarRaw}
          remember={rememberRaw}
        />
      );
    }
    // A ```helpcards fenced block renders the §6 "People who can help" directory:
    // warm contact cards / slim rows / soft talk lozenges (tone × variant), parsed
    // in HelpCards. Static, no client JS.
    if (typeof cls === "string" && cls.includes("language-helpcards")) {
      const raw = textOf(
        (child as { props?: { children?: ReactNode } }).props?.children
      );
      return <HelpCards content={raw} />;
    }
    // A ```facts fenced block renders a row of key-fact tiles. "BIG | caption" per line.
    if (typeof cls === "string" && cls.includes("language-facts")) {
      const raw = textOf(
        (child as { props?: { children?: ReactNode } }).props?.children
      );
      const items: Fact[] = raw
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((line) => {
          const bar = line.indexOf("|");
          const big = (bar >= 0 ? line.slice(0, bar) : line).trim();
          const caption = bar >= 0 ? line.slice(bar + 1).trim() : "";
          return { big, caption };
        });
      return <FactTiles items={items} />;
    }
    // A ```steps fenced block renders a numbered action-card playbook (§2).
    // One item per line: "Title | body". A leading "!" marks the urgent card.
    if (typeof cls === "string" && cls.includes("language-steps")) {
      const raw = textOf(
        (child as { props?: { children?: ReactNode } }).props?.children
      );
      const items: StepItem[] = raw
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((line) => {
          const urgent = line.startsWith("!");
          const rest = urgent ? line.slice(1) : line;
          const bar = rest.indexOf("|");
          const title = (bar >= 0 ? rest.slice(0, bar) : rest).trim();
          const body = bar >= 0 ? rest.slice(bar + 1).trim() : "";
          return { title, body, urgent };
        });
      return <StepCards items={items} />;
    }
    if (typeof cls === "string" && cls.includes("language-chips")) {
      const raw = textOf(
        (child as { props?: { children?: ReactNode } }).props?.children
      );
      const all = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const hasMore = all.some((t) => /^and more$/i.test(t));
      const platforms = all.filter((t) => !/^and more$/i.test(t));
      return (
        <ul className="chip-list">
          {platforms.map((t, i) => {
            // A chip can be a plain name or a `[label](#anchor)` jump link.
            const link = t.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
            return (
              <li key={i} className="chip">
                {link ? <a href={link[2]}>{link[1]}</a> : t}
                {hasMore && i === platforms.length - 1 && (
                  <span className="chip-more">, and more…</span>
                )}
              </li>
            );
          })}
        </ul>
      );
    }
    // A ```note fenced block renders a quiet amber "fine print" card with a
    // notepad icon — used for the legal disclaimer at the foot of the guide.
    // Format: "Bold lead. | body text" (split on the first "|").
    if (typeof cls === "string" && cls.includes("language-note")) {
      const raw = textOf(
        (child as { props?: { children?: ReactNode } }).props?.children
      );
      const bar = raw.indexOf("|");
      const lead = (bar >= 0 ? raw.slice(0, bar) : "").trim();
      const body = (bar >= 0 ? raw.slice(bar + 1) : raw).trim();
      return (
        <aside className="guide-note" role="note">
          <svg
            className="guide-note-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
            <path d="M9.5 7.5h5M9.5 11h5M9.5 14.5h3" />
          </svg>
          <p>
            {lead && <strong>{lead} </strong>}
            {body}
          </p>
        </aside>
      );
    }
    return <pre>{children}</pre>;
  },
};

export function MarkdownRenderer({
  content,
  className = "prose",
}: {
  content: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
