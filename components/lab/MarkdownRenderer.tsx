import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { ReactNode } from "react";
import { ClickableTableRow } from "@/components/writeups/ClickableTableRow";
import { StepCards, type StepItem } from "@/components/lab/StepCards";
import { FactTiles, type Fact } from "@/components/lab/FactTiles";
import { EscalationPanel } from "@/components/lab/EscalationPanel";
import { HelpCards } from "@/components/lab/HelpCards";
import { AdvisoryCard, type AdvisoryLink } from "@/components/lab/AdvisoryCard";
import {
  HttpSteps,
  parseHttpRows,
  type HttpVariant,
} from "@/components/lab/HttpSteps";
import { AttackDiagram } from "@/components/lab/AttackDiagram";
import { CodeCallout, parseCodeCallout } from "@/components/lab/CodeCallout";

// react-markdown drops a fence's meta (the text after ```lang) by default. This
// tiny remark pass copies it onto the <pre> as data-src, so a code block can show
// where the snippet lives in the real source. Write it as:  ```java GroupResource.addChild()
interface MetaNode {
  type?: string;
  meta?: string | null;
  data?: { hProperties?: Record<string, unknown> };
  children?: MetaNode[];
}
function remarkCodeMeta() {
  return (tree: MetaNode) => {
    const walk = (node: MetaNode) => {
      if (node.type === "code" && node.meta) {
        node.data = node.data ?? {};
        node.data.hProperties = {
          ...(node.data.hProperties ?? {}),
          "data-src": node.meta.trim(),
        };
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

// [label](url) links inside the ```note fine-print box (server-side, no client JS).
function noteInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let k = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <a key={k++} href={m[2]} target="_blank" rel="noopener noreferrer">
        {m[1]}
      </a>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

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

// Rule-based colorizer for the plain code block — same philosophy as HttpSteps:
// color by meaning, not by a generic highlighter's keyword grammar. It colors
// method calls (name before "("), a small keyword set, strings, numbers, and
// line/trailing comments, reusing the .hljs-* theme classes. Unknown tokens stay
// plain, so it degrades gracefully for any language.
const CODE_KEYWORDS = new Set([
  "if", "else", "return", "for", "while", "do", "switch", "case", "break",
  "continue", "new", "void", "public", "private", "protected", "static",
  "final", "class", "interface", "enum", "extends", "implements", "import",
  "package", "throw", "throws", "try", "catch", "finally", "this", "super",
  "true", "false", "null", "const", "let", "var", "function", "type",
  "boolean", "int", "long", "String",
]);
const CODE_TOKEN =
  /(\s+)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d[\d_.]*\b)|([A-Za-z_$][\w$]*)(?=\s*\()|([A-Za-z_$][\w$]*)|([(){}[\];,.<>+\-=&|?:*/%!]+)/g;

function colorizeLine(code: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let m: RegExpExecArray | null;
  let k = 0;
  CODE_TOKEN.lastIndex = 0;
  while ((m = CODE_TOKEN.exec(code)) !== null) {
    const key = `${keyBase}-${k++}`;
    if (m[1]) out.push(m[1]);
    else if (m[2])
      out.push(<span key={key} className="hljs-string">{m[2]}</span>);
    else if (m[3])
      out.push(<span key={key} className="hljs-number">{m[3]}</span>);
    else if (m[4])
      out.push(
        <span key={key} className="hljs-title function_">{m[4]}</span>
      );
    else if (m[5])
      out.push(
        CODE_KEYWORDS.has(m[5]) ? (
          <span key={key} className="hljs-keyword">{m[5]}</span>
        ) : (
          m[5]
        )
      );
    else if (m[6])
      out.push(<span key={key} className="hljs-punctuation">{m[6]}</span>);
  }
  return out;
}

function colorizeCode(raw: string): ReactNode[] {
  const lines = raw.replace(/\n+$/, "").split("\n");
  const out: ReactNode[] = [];
  lines.forEach((line, i) => {
    // Peel a trailing // comment off the code (simple heuristic, not string-aware).
    const ci = line.indexOf("//");
    const codePart = ci >= 0 ? line.slice(0, ci) : line;
    const commentPart = ci >= 0 ? line.slice(ci) : "";
    out.push(...colorizeLine(codePart, `l${i}`));
    if (commentPart)
      out.push(
        <span key={`c${i}`} className="hljs-comment">{commentPart}</span>
      );
    if (i < lines.length - 1) out.push("\n");
  });
  return out;
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
    // A bold run that opens with "i reported" is the disclosure boast line in
    // the intro; render it as an accent highlight so it stands out.
    if (label.startsWith("i reported")) {
      return <strong className="reported-badge">{children}</strong>;
    }
    // The "within 2 hours" figure in the law callout is the piece's hero fact;
    // give it an amber marker highlight so the number jumps out of the callout.
    if (label === "within 2 hours") {
      return <strong className="law-time">{children}</strong>;
    }
    // A bold "Important" is the Red Hat severity rating; amber marker highlight.
    if (label === "important") {
      return <strong className="severity-important">{children}</strong>;
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
    const src =
      child && typeof child === "object" && "props" in child
        ? ((child as { props?: Record<string, unknown> }).props?.[
            "data-src"
          ] as string | undefined)
        : undefined;
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
    // ```attackdiagram renders the inline-SVG group-move escalation hero.
    if (typeof cls === "string" && cls.includes("language-attackdiagram")) {
      return <AttackDiagram />;
    }
    // ```codecallout renders an annotated source snippet with a missing-guard finding.
    if (typeof cls === "string" && cls.includes("language-codecallout")) {
      const raw = textOf(
        (child as { props?: { children?: ReactNode } }).props?.children
      );
      const { file, rows } = parseCodeCallout(raw);
      return <CodeCallout file={file} rows={rows} />;
    }
    // ```httpledger / ```httptimeline / ```httpcards / ```httpburp render the
    // HTTP request/response exploit steps in one of four visual variants (shared
    // parser). Authoring: "FLAG STATUS METHOD PATH [JSON body] | caption" per
    // line; FLAG * = the bug, ~ = a control; "--- label" = a segment divider.
    {
      const httpVariant: HttpVariant | null =
        typeof cls === "string"
          ? cls.includes("language-httpledger")
            ? "ledger"
            : cls.includes("language-httptimeline")
              ? "timeline"
              : cls.includes("language-httpcards")
                ? "cards"
                : cls.includes("language-httpburp")
                  ? "burp"
                  : null
          : null;
      if (httpVariant) {
        const raw = textOf(
          (child as { props?: { children?: ReactNode } }).props?.children
        );
        return <HttpSteps rows={parseHttpRows(raw)} variant={httpVariant} />;
      }
    }
    // A ```advisory fenced block renders the disclosure/credit hero card: the
    // Red Hat advisory as the primary CTA, with the upstream issue + fix PR as
    // quiet secondary chips below. Parsed as "key: value" lines; issue/fix take
    // "label | url". Static, no client JS.
    if (typeof cls === "string" && cls.includes("language-advisory")) {
      const raw = textOf(
        (child as { props?: { children?: ReactNode } }).props?.children
      );
      const fields: Record<string, string> = {};
      const links: AdvisoryLink[] = [];
      raw
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .forEach((line) => {
          const sep = line.indexOf(":");
          if (sep < 0) return;
          const key = line.slice(0, sep).trim().toLowerCase();
          const val = line.slice(sep + 1).trim();
          if (key === "issue" || key === "fix") {
            const bar = val.indexOf("|");
            if (bar >= 0) {
              links.push({
                label: val.slice(0, bar).trim(),
                url: val.slice(bar + 1).trim(),
              });
            }
          } else {
            fields[key] = val;
          }
        });
      return (
        <AdvisoryCard
          cve={fields.cve ?? ""}
          advisoryUrl={fields.advisory ?? "#"}
          credit={fields.credit}
          meta={fields.meta}
          links={links}
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
            {noteInline(body)}
          </p>
        </aside>
      );
    }
    // Real code block: a light labeled panel. The language (from ```lang) shows
    // as a quiet pill; rehype-highlight has already tokenized the code inside.
    const langMatch =
      typeof cls === "string" ? cls.match(/language-([\w-]+)/) : null;
    const lang = langMatch ? langMatch[1] : null;
    const raw = textOf(
      (child as { props?: { children?: ReactNode } })?.props?.children
    );
    // A source label can carry a link:  ```java Label | https://github.com/...#L1-L2
    const [srcLabel, srcHref] = src
      ? src.split("|").map((s) => s.trim())
      : [];
    return (
      <div className="codeblock">
        {(lang || srcLabel) && (
          <div className="cb-head">
            {srcLabel &&
              (srcHref ? (
                <a
                  className="cb-src"
                  href={srcHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {srcLabel}
                </a>
              ) : (
                <span className="cb-src">{srcLabel}</span>
              ))}
            {lang && <span className="cb-lang">{lang}</span>}
          </div>
        )}
        <pre>
          <code className={`hljs${lang ? ` language-${lang}` : ""}`}>
            {colorizeCode(raw)}
          </code>
        </pre>
      </div>
    );
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
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkCodeMeta]}
        rehypePlugins={[[rehypeHighlight, { detect: false, ignoreMissing: true }]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
