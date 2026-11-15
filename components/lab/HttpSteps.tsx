import type { ReactNode } from "react";

// Shared model for the HTTP request/response exploit-step blocks. Four visual
// variants (ledger / timeline / cards / burp) render the same parsed rows so the
// author can compare them. Pure server component, no client JS.
export type HttpStep = {
  kind: "step";
  status: string;
  method: string;
  path: string;
  body?: string;
  caption: string;
  role: "normal" | "control" | "bug";
};
export type HttpDivider = { kind: "divider"; label: string };
export type HttpRow = HttpStep | HttpDivider;
export type HttpVariant = "ledger" | "timeline" | "cards" | "burp";

const REASON: Record<string, string> = {
  "200": "OK",
  "201": "Created",
  "204": "No Content",
  "400": "Bad Request",
  "401": "Unauthorized",
  "403": "Forbidden",
  "404": "Not Found",
};

export function parseHttpRows(raw: string): HttpRow[] {
  return raw
    .split("\n")
    .map((l) => l.replace(/\s+$/, ""))
    .filter((l) => l.trim())
    .map((line): HttpRow => {
      const div = line.match(/^-{3,}\s*(.*)$/);
      if (div) return { kind: "divider", label: div[1].trim() };
      const m = line
        .trim()
        .match(
          /^([*~])?\s*(\d{3})\s+(GET|POST|PUT|PATCH|DELETE)\s+(\S+)(?:\s+(\{.*\}))?\s*\|\s*(.*)$/
        );
      if (!m) return { kind: "divider", label: "" };
      const [, flag, status, method, path, body, caption] = m;
      return {
        kind: "step",
        status,
        method,
        path,
        body: body || undefined,
        caption,
        role: flag === "*" ? "bug" : flag === "~" ? "control" : "normal",
      };
    });
}

const ok = (s: string) => Number(s) < 400;

function MethodBadge({ method }: { method: string }) {
  return (
    <span className={`hx-method hx-${method.toLowerCase()}`}>{method}</span>
  );
}
function StatusPill({ status }: { status: string }) {
  return (
    <span className={`hx-status ${ok(status) ? "hx-ok" : "hx-deny"}`}>
      {status}
    </span>
  );
}
function Tag({ role }: { role: "control" | "bug" }) {
  return <span className="hx-tag">{role === "bug" ? "the bug" : "control"}</span>;
}

// ── A: Request ledger ──────────────────────────────────────────────
function Ledger({ rows }: { rows: HttpRow[] }) {
  return (
    <ol className="httpsteps hx-ledger">
      {rows.map((r, i) =>
        r.kind === "divider" ? (
          <li key={i} className="hx-divider">
            {r.label && <span>{r.label}</span>}
          </li>
        ) : (
          <li key={i} className={`hx-step hx-${r.role}`}>
            {r.role !== "normal" && <Tag role={r.role} />}
            <div className="hx-line">
              <MethodBadge method={r.method} />
              <code className="hx-path">{r.path}</code>
              <StatusPill status={r.status} />
            </div>
            {r.body && <code className="hx-body">{r.body}</code>}
            <p className="hx-cap">{r.caption}</p>
          </li>
        )
      )}
    </ol>
  );
}

// ── B: Attack-chain timeline ───────────────────────────────────────
function Timeline({ rows }: { rows: HttpRow[] }) {
  let n = 0;
  return (
    <ol className="httpsteps hx-timeline">
      {rows.map((r, i) => {
        if (r.kind === "divider")
          return (
            <li key={i} className="hx-tl-divider">
              {r.label && <span>{r.label}</span>}
            </li>
          );
        const marker =
          r.role === "bug" ? "◆" : r.role === "control" ? "✕" : String(++n);
        return (
          <li key={i} className={`hx-tl-step hx-${r.role}`}>
            <span className="hx-node" aria-hidden="true">
              {marker}
            </span>
            <div className="hx-tl-body">
              <div className="hx-line">
                <MethodBadge method={r.method} />
                <code className="hx-path">{r.path}</code>
                <StatusPill status={r.status} />
                {r.role === "bug" && <Tag role="bug" />}
              </div>
              {r.body && <code className="hx-body">{r.body}</code>}
              <p className="hx-cap">{r.caption}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ── C: HTTP exchange cards ─────────────────────────────────────────
function Cards({ rows }: { rows: HttpRow[] }) {
  return (
    <div className="httpsteps hx-cards">
      {rows.map((r, i) =>
        r.kind === "divider" ? (
          <div key={i} className="hx-divider">
            {r.label && <span>{r.label}</span>}
          </div>
        ) : (
          <div key={i} className={`hx-card hx-${r.role}`}>
            {r.role !== "normal" && <Tag role={r.role} />}
            <div className="hx-card-head">
              <MethodBadge method={r.method} />
              <code className="hx-path">{r.path}</code>
              <StatusPill status={r.status} />
            </div>
            {r.body && <code className="hx-body">{r.body}</code>}
            <p className="hx-cap">
              <span className="hx-arrow" aria-hidden="true">
                →
              </span>
              {r.caption}
            </p>
          </div>
        )
      )}
    </div>
  );
}

// ── D: Burp-style raw request / response ───────────────────────────
function Burp({ rows }: { rows: HttpRow[] }) {
  return (
    <div className="httpsteps hx-burp">
      {rows.map((r, i) => {
        if (r.kind === "divider")
          return (
            <div key={i} className="hx-divider">
              {r.label && <span>{r.label}</span>}
            </div>
          );
        const hasBody = Boolean(r.body);
        return (
          <div key={i} className={`hx-ex hx-${r.role}`}>
            <p className="hx-ex-cap">
              {r.caption}
              {r.role === "bug" && <Tag role="bug" />}
              {r.role === "control" && <Tag role="control" />}
            </p>
            <div className="hx-ex-grid">
              <div className="hx-pane">
                <span className="hx-pane-tab">Request</span>
                <pre className="hx-raw">
                  <span className="hx-req-line">
                    <span className={`hx-m hx-${r.method.toLowerCase()}`}>
                      {r.method}
                    </span>{" "}
                    {r.path} HTTP/1.1
                  </span>
                  {"\n"}Host: keycloak.example
                  {"\n"}Authorization: Bearer «gadmin-token»
                  {hasBody && "\nContent-Type: application/json"}
                  {hasBody && "\n\n" + r.body}
                </pre>
              </div>
              <div className="hx-pane">
                <span className="hx-pane-tab">Response</span>
                <pre className="hx-raw">
                  <span className={ok(r.status) ? "hx-ok-t" : "hx-deny-t"}>
                    HTTP/1.1 {r.status} {REASON[r.status] ?? ""}
                  </span>
                </pre>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function HttpSteps({
  rows,
  variant,
}: {
  rows: HttpRow[];
  variant: HttpVariant;
}): ReactNode {
  if (variant === "timeline") return <Timeline rows={rows} />;
  if (variant === "cards") return <Cards rows={rows} />;
  if (variant === "burp") return <Burp rows={rows} />;
  return <Ledger rows={rows} />;
}
