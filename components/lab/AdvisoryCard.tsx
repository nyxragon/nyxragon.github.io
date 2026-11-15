import type { ReactNode } from "react";

// Parsed from a ```advisory fenced block (see MarkdownRenderer). The Red Hat
// advisory is the hero CTA (this is the credited disclosure); the upstream
// issue and fix PR sit below as quiet secondary chips. Server-rendered, no JS.
export type AdvisoryLink = { label: string; url: string };

export function AdvisoryCard({
  cve,
  advisoryUrl,
  credit,
  meta,
  links,
}: {
  cve: string;
  advisoryUrl: string;
  credit?: string;
  meta?: string;
  links: AdvisoryLink[];
}): ReactNode {
  return (
    <aside className="advisory" aria-label={`${cve} disclosure`}>
      <div className="advisory-top">
        <span className="advisory-seal" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2.5 5 5.2v5.3c0 4.3 2.9 8.3 7 9.5 4.1-1.2 7-5.2 7-9.5V5.2L12 2.5Z" />
            <path d="m8.8 12 2.1 2.1 4.3-4.4" />
          </svg>
        </span>
        <div className="advisory-head">
          <span className="advisory-eyebrow">Disclosed &amp; credited</span>
          <span className="advisory-cve">{cve}</span>
        </div>
      </div>

      <a className="advisory-cta" href={advisoryUrl} target="_blank" rel="noopener noreferrer">
        <span className="advisory-cta-label">Read the Red Hat advisory</span>
        <svg className="advisory-cta-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      </a>

      {(credit || meta) && (
        <p className="advisory-credit">
          {credit && (
            <>
              Credited to <strong>{credit}</strong>
            </>
          )}
          {credit && meta && <span className="advisory-dot" aria-hidden="true" />}
          {meta && <span className="advisory-meta">{meta}</span>}
        </p>
      )}

      {links.length > 0 && (
        <div className="advisory-links">
          {links.map((l, i) => (
            <a key={i} className="advisory-link" href={l.url} target="_blank" rel="noopener noreferrer">
              {l.label}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17 17 7M9 7h8v8" />
              </svg>
            </a>
          ))}
        </div>
      )}
    </aside>
  );
}
