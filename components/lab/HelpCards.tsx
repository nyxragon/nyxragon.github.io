/**
 * HelpCards — the §6 "People who can help" directory. One component, three
 * densities and three warmth families, so the whole section builds from a single
 * ```helpcards fence (parsed in MarkdownRenderer). Deliberately warmer and more
 * human than §4's cold escalation rail: monogram disks, chip-badge metadata, and
 * a big tap-to-call number (many people can't make a voice call about this — the
 * number is a real, pressable target, never buried in prose).
 *
 * 100% static text, zero client JS: a safety page must render every contact with
 * no scripting. No tabs/filters/hover-reveal.
 *
 * FENCE FORMAT — an options line, then cards split by a line of "---":
 *   tone: takedown | variant: cards
 *   ---
 *   ★ Meri Trustline (RATI Foundation)      ← line 1: name (★ prefix = hero)
 *   One warm sentence on what they do.        ← line 2: description (**bold**, [links])
 *   for: Anyone · a friend can call for you   ← who it's for
 *   tel: 6363176363 | WhatsApp and phone      ← number | channel note (split by |)
 *   hours: Mon to Fri, 9am to 5pm
 *   tags: Free | Confidential | Not an emergency line   ← chip badges (| split)
 *   stat: 981 of 1,137 reported links and accounts taken down, 2026   ← emerald strip
 *   link: Their latest report | https://...   ← label | url (rose, gets ↗ via global rule)
 *   warn: In the Gulf, possessing an image can itself be an offence.  ← amber caveat
 *   note: a quiet muted aside
 *
 * tone ∈ takedown (violet) | abroad (aqua) | talk (emerald)
 * variant ∈ cards (hero + 2-up grid) | list (slim rows) | lozenge (soft talk rows)
 */
import type { ReactNode } from "react";

export type HelpCard = {
  name: string;
  org?: string;
  featured?: boolean;
  mark?: string;
  desc?: string;
  forWho?: string;
  tel?: string;
  telNote?: string;
  hours?: string;
  tags?: string[];
  stat?: string;
  linkLabel?: string;
  linkUrl?: string;
  warn?: string;
  note?: string;
};

// Minimal **bold** + [label](url) inline rendering for descriptions.
function inline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1]) {
      const ext = /^https?:/.test(m[2]);
      nodes.push(
        <a key={key++} href={m[2]} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
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

// Split a name like "Meri Trustline (RATI Foundation)" into name + parenthetical org.
function splitName(raw: string): { name: string; org?: string; featured: boolean } {
  const featured = raw.startsWith("★");
  let s = featured ? raw.slice(1).trim() : raw.trim();
  let org: string | undefined;
  const paren = s.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (paren) {
    s = paren[1].trim();
    org = paren[2].trim();
  }
  return { name: s, org, featured };
}

// First letter for the monogram disk; a ♡ for the talk tone when there's no clean initial.
function monogram(name: string, tone: string): string {
  const letter = name.match(/[A-Za-z0-9]/);
  if (letter) return letter[0].toUpperCase();
  return tone === "talk" ? "♡" : "•";
}

function telHref(num: string): string {
  const cleaned = num.replace(/[^\d+]/g, "");
  return `tel:${cleaned}`;
}

function parse(raw: string): { tone: string; variant: string; cards: HelpCard[] } {
  const blocks = raw.split(/\n-{3,}\n/).map((b) => b.trim());
  let tone = "takedown";
  let variant = "cards";
  let start = 0;

  // The first block is an options block only when every token is a tone/variant
  // key we recognise (a contact card always leads with a name line). Options may
  // be one-per-line OR pipe-separated on one line: "tone: abroad | variant: list".
  const first = blocks[0] ?? "";
  if (/\btone\s*:/i.test(first) || /\bvariant\s*:/i.test(first)) {
    const optTokens = first.split(/[|\n]/).map((s) => s.trim()).filter(Boolean);
    const onlyOpts = optTokens.every((t) => /^(tone|variant)\s*:/i.test(t));
    if (onlyOpts) {
      optTokens.forEach((t) => {
        const idx = t.indexOf(":");
        const k = t.slice(0, idx).trim().toLowerCase();
        const v = t.slice(idx + 1).trim().toLowerCase();
        if (k === "tone") tone = v;
        if (k === "variant") variant = v;
      });
      start = 1;
    }
  }

  const cards: HelpCard[] = [];
  for (let i = start; i < blocks.length; i++) {
    const lines = blocks[i].split("\n").map((l) => l.replace(/\s+$/, ""));
    const nonEmpty = lines.filter((l) => l.trim());
    if (!nonEmpty.length) continue;
    const { name, org, featured } = splitName(nonEmpty[0]);
    const card: HelpCard = { name, org, featured };
    let descParts: string[] = [];
    for (let j = 1; j < nonEmpty.length; j++) {
      const line = nonEmpty[j].trim();
      const km = line.match(/^(for|tel|hours|tags|stat|link|warn|note|mark)\s*:\s*(.*)$/i);
      if (!km) {
        descParts.push(line);
        continue;
      }
      const key = km[1].toLowerCase();
      const val = km[2].trim();
      if (key === "for") card.forWho = val;
      else if (key === "mark") card.mark = val;
      else if (key === "hours") card.hours = val;
      else if (key === "warn") card.warn = val;
      else if (key === "note") card.note = val;
      else if (key === "tags") card.tags = val.split("|").map((s) => s.trim()).filter(Boolean);
      else if (key === "stat") card.stat = val;
      else if (key === "tel") {
        const [n, note] = val.split("|").map((s) => s.trim());
        card.tel = n;
        card.telNote = note || undefined;
      } else if (key === "link") {
        const [label, url] = val.split("|").map((s) => s.trim());
        card.linkLabel = label;
        card.linkUrl = url;
      }
    }
    if (descParts.length) card.desc = descParts.join(" ");
    cards.push(card);
  }
  return { tone, variant, cards };
}

function Tags({ tags }: { tags?: string[] }) {
  if (!tags?.length) return null;
  return (
    <div className="help-tags">
      {tags.map((t, i) => (
        <span className="help-tag" key={i}>
          {t}
        </span>
      ))}
    </div>
  );
}

function Num({ tel, telNote, big }: { tel?: string; telNote?: string; big?: boolean }) {
  if (!tel) return null;
  return (
    <a className={`help-num${big ? " help-num-big" : ""}`} href={telHref(tel)}>
      <span className="help-num-ic" aria-hidden="true">
        ☏
      </span>
      <span className="help-num-val">{tel}</span>
      {telNote && <span className="help-num-note">{telNote}</span>}
    </a>
  );
}

function Stat({ stat }: { stat?: string }) {
  if (!stat) return null;
  return (
    <div className="help-stat">
      <span className="help-stat-ic" aria-hidden="true">
        ✓
      </span>
      <span>{stat}</span>
    </div>
  );
}

function Mono({ name, tone }: { name: string; tone: string }) {
  return (
    <span className="help-mono" aria-hidden="true">
      {monogram(name, tone)}
    </span>
  );
}

// A full contact card (cards variant). The ★ card renders as the full-width hero.
function Card({ c, tone }: { c: HelpCard; tone: string }) {
  return (
    <div className={`help-card${c.featured ? " help-hero" : ""}`}>
      <div className="help-card-head">
        <Mono name={c.name} tone={tone} />
        <div className="help-card-id">
          {c.featured && <span className="help-eyebrow">Start here</span>}
          <span className="help-name">{c.name}</span>
          {c.org && <span className="help-org">{c.org}</span>}
        </div>
        {c.mark && <span className="help-mark">{c.mark}</span>}
      </div>
      {c.desc && <p className="help-desc">{inline(c.desc)}</p>}
      {c.forWho && (
        <p className="help-for">
          <span className="help-for-k" aria-hidden="true">
            FOR
          </span>
          {c.forWho}
        </p>
      )}
      <Num tel={c.tel} telNote={c.telNote} big={c.featured} />
      <Tags tags={c.tags} />
      {c.stat && <Stat stat={c.stat} />}
      {c.linkUrl && (
        <a className="help-link" href={c.linkUrl} target="_blank" rel="noopener noreferrer">
          {c.linkLabel || "More"}
        </a>
      )}
      {c.warn && (
        <p className="help-warn">
          <span aria-hidden="true">⚠</span> {inline(c.warn)}
        </p>
      )}
      {c.note && <p className="help-note">{inline(c.note)}</p>}
    </div>
  );
}

// A slim ladder row (list variant — the "hosted abroad" doors).
function Row({ c, tone }: { c: HelpCard; tone: string }) {
  return (
    <div className="help-row">
      <Mono name={c.name} tone={tone} />
      <div className="help-row-body">
        <span className="help-name">{c.name}</span>
        {c.org && <span className="help-org"> · {c.org}</span>}
        {c.mark && <span className="help-mark">{c.mark}</span>}
        {c.desc && <span className="help-row-desc"> {inline(c.desc)}</span>}
        <div className="help-row-meta">
          <Num tel={c.tel} telNote={c.telNote} />
          {c.linkUrl && (
            <a className="help-link" href={c.linkUrl} target="_blank" rel="noopener noreferrer">
              {c.linkLabel || "Open"}
            </a>
          )}
          <Tags tags={c.tags} />
        </div>
        {c.warn && (
          <p className="help-warn">
            <span aria-hidden="true">⚠</span> {inline(c.warn)}
          </p>
        )}
        {c.note && <p className="help-note">{inline(c.note)}</p>}
      </div>
    </div>
  );
}

// A soft, number-forward lozenge (lozenge variant — "someone to talk to").
function Lozenge({ c, tone }: { c: HelpCard; tone: string }) {
  return (
    <div className="help-loz">
      <Mono name={c.name} tone={tone} />
      <div className="help-loz-body">
        <span className="help-name">{c.name}</span>
        {c.org && <span className="help-org"> · {c.org}</span>}
        {c.mark && <span className="help-mark">{c.mark}</span>}
        {c.desc && <p className="help-loz-desc">{inline(c.desc)}</p>}
        {(c.hours || c.tags?.length) && (
          <p className="help-loz-meta">
            {c.hours}
            {c.hours && c.tags?.length ? " · " : ""}
            {c.tags?.join(" · ")}
          </p>
        )}
      </div>
      <Num tel={c.tel} telNote={c.telNote} big />
    </div>
  );
}

export function HelpCards({ content }: { content: string }) {
  const { tone, variant, cards } = parse(content);
  if (!cards.length) return null;

  // Hours live inside cards as a tag for the cards/list variants; the lozenge
  // surfaces hours itself, so nothing is lost.
  const withHoursTag = (c: HelpCard): HelpCard =>
    c.hours && variant !== "lozenge"
      ? { ...c, tags: [...(c.tags ?? []), c.hours] }
      : c;

  if (variant === "list") {
    return (
      <div className={`helpcards help-list`} data-tone={tone}>
        {cards.map((c, i) => (
          <Row key={i} c={withHoursTag(c)} tone={tone} />
        ))}
      </div>
    );
  }

  if (variant === "bullets") {
    // Matches the guide's own ✦ sparkle-bullet prose (bold heading + paragraph),
    // then the phone number as a proper call-to-action button. Lightest variant.
    return (
      <ul className="help-bullets" data-tone={tone}>
        {cards.map((c, i) => {
          const meta = [c.hours, ...(c.tags ?? [])].filter(Boolean).join(" · ");
          return (
            <li key={i}>
              <p className="help-b-text">
                <strong className="help-b-name">{c.name}.</strong>{" "}
                {c.desc && inline(c.desc)}
              </p>
              <p className="help-b-cta-row">
                {c.tel ? (
                  <a className="help-cta" href={telHref(c.tel)}>
                    <span className="help-cta-ic" aria-hidden="true">☏</span> Call {c.tel}
                  </a>
                ) : c.linkUrl ? (
                  <a className="help-cta" href={c.linkUrl} target="_blank" rel="noopener noreferrer">
                    {c.linkLabel || "Visit"} <span aria-hidden="true">→</span>
                  </a>
                ) : null}
                {meta && <span className="help-cta-note">{meta}</span>}
              </p>
              {c.stat && <Stat stat={c.stat} />}
            </li>
          );
        })}
      </ul>
    );
  }

  if (variant === "lozenge") {
    return (
      <div className={`helpcards help-lozenges`} data-tone={tone}>
        {cards.map((c, i) => (
          <Lozenge key={i} c={c} tone={tone} />
        ))}
      </div>
    );
  }

  // cards: hero (if any) spans full width, the rest flow in a 2-up grid.
  const hero = cards.find((c) => c.featured);
  const rest = cards.filter((c) => !c.featured);
  return (
    <div className={`helpcards help-grid`} data-tone={tone}>
      {hero && <Card c={withHoursTag(hero)} tone={tone} />}
      {rest.map((c, i) => (
        <Card key={i} c={withHoursTag(c)} tone={tone} />
      ))}
    </div>
  );
}
