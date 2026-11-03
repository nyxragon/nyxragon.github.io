/**
 * EscalationPanel — the §4 Cloudflare "last resort" block for sites that refuse.
 * A premium escalation RAIL: three uniform, color-coded cards telling a single
 * arc — DANGER (the site, red) -> HOPE (Cloudflare, emerald) -> THE LEVER (the
 * host, cyan) — above a focal CTA, a registrar aside, the "Remember" line, and an
 * NCSEI footnote. The rail nodes (icons, tags, names, subs, status) are fixed
 * design; the surrounding prose comes from the ```escalate fence (parsed in
 * MarkdownRenderer), six parts split by a line of "---":
 *   1. heading
 *   2. intro paragraph
 *   3. gloss line  (supports **bold**)
 *   4. cta:  label | url
 *   5. registrar aside
 *   6. remember line  (the bold "Remember:" label is added here)
 * On phones the rail reflows to a vertical ladder (chevrons rotate to point down).
 */
import type { ReactNode } from "react";

// Minimal **bold** → <strong> for panel prose.
function emph(text: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((p, i) =>
      p.startsWith("**") && p.endsWith("**") ? (
        <strong key={i}>{p.slice(2, -2)}</strong>
      ) : (
        <span key={i}>{p}</span>
      )
    );
}

const WarnIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" /><path d="M12 17h.01" />
  </svg>
);
const SunriseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v6" /><path d="m4.93 10.93 1.41 1.41" /><path d="M2 18h2" /><path d="M20 18h2" />
    <path d="m19.07 10.93-1.41 1.41" /><path d="M22 22H2" /><path d="m8 6 4-4 4 4" /><path d="M16 18a4 4 0 0 0-8 0" />
  </svg>
);
const KeyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5" /><path d="m21 2-9.6 9.6" /><path d="m15.5 7.5 3 3L22 7l-3-3" />
  </svg>
);
const BanIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="m4.9 4.9 14.2 14.2" />
  </svg>
);
const ArrowUpRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 7h10v10" /><path d="M7 17 17 7" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
  </svg>
);

export function EscalationPanel({
  heading,
  headingId,
  intro,
  gloss,
  ctaLabel,
  ctaUrl,
  registrar,
  remember,
}: {
  heading: string;
  headingId: string;
  intro: string;
  gloss: string;
  ctaLabel: string;
  ctaUrl: string;
  registrar: string;
  remember: string;
}) {
  return (
    <div className="escalate">
      <div className="escalate-eyebrow">&#9670;&nbsp;&nbsp;THE STRONGEST MOVE</div>
      {heading && (
        <h3 className="escalate-heading" id={headingId}>
          {heading}
        </h3>
      )}
      {intro && <p className="escalate-intro">{emph(intro)}</p>}
      {gloss && <p className="escalate-gloss">{emph(gloss)}</p>}

      <div className="escalate-rail">
        {/* DANGER — The Site */}
        <div className="escalate-node escalate-danger">
          <div className="escalate-head">
            <span className="escalate-icon"><WarnIcon /></span>
            <span className="escalate-tag">THE WALL</span>
          </div>
          <div className="escalate-node-name">The Site</div>
          <div className="escalate-node-sub">refuses every request</div>
          <div className="escalate-status">
            <span className="escalate-status-ic"><BanIcon /></span>the owner won&rsquo;t act
          </div>
        </div>

        <span className="escalate-chev escalate-chev-hope" aria-hidden="true">&#9654;</span>

        {/* HOPE — Cloudflare */}
        <div className="escalate-node escalate-hope">
          <div className="escalate-head">
            <span className="escalate-icon"><SunriseIcon /></span>
            <span className="escalate-tag">THE WAY IN</span>
          </div>
          <div className="escalate-node-name">Cloudflare</div>
          <div className="escalate-node-sub">report it under NCSEI</div>
          <div className="escalate-status">
            <span className="escalate-status-ic"><ArrowUpRightIcon /></span>forwarded to the host
          </div>
        </div>

        <span className="escalate-chev escalate-chev-cyan" aria-hidden="true">&#9654;</span>

        {/* LEVER — The Host */}
        <div className="escalate-node escalate-lever">
          <div className="escalate-head">
            <span className="escalate-icon"><KeyIcon /></span>
            <span className="escalate-tag">THE LEVER</span>
          </div>
          <div className="escalate-node-name">The Host</div>
          <div className="escalate-node-sub">stores the actual files</div>
          <div className="escalate-status">
            <span className="escalate-status-ic"><CheckCircleIcon /></span>it pulls the page down
          </div>
        </div>
      </div>

      <div className="escalate-cta-wrap">
        {ctaUrl && (
          <a className="escalate-cta" href={ctaUrl}>
            {ctaLabel || "Report it to Cloudflare"}
            <span aria-hidden="true"> &rarr;</span>
          </a>
        )}
        {registrar && <p className="escalate-registrar">{registrar}</p>}
      </div>

      {remember && (
        <p className="escalate-remember">
          <strong>Remember:</strong> {emph(remember)}
        </p>
      )}

      <p className="escalate-footnote">
        <span className="escalate-aster">*</span>&nbsp;NCSEI: non-consensual sexually explicit imagery
      </p>
    </div>
  );
}
