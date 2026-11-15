import type { ReactNode } from "react";

// Annotated source snippet (```codecallout). Code lines carry comments as muted
// side-notes (not bright inline // comments), and a `!` line renders as a red
// "finding" callout for a missing guard rather than a code comment. Pure server
// component, no client JS.
// Authoring per line:
//   file: <label>                       -> header filename
//   <code> | <comment>                  -> code line with side-note (comment optional)
//   ! <symbol> | <note>                 -> the missing-guard finding
type CCRow =
  | { kind: "code"; code: string; comment?: string }
  | { kind: "finding"; sym: string; note: string };

export function parseCodeCallout(raw: string): {
  file?: string;
  rows: CCRow[];
} {
  let file: string | undefined;
  const rows: CCRow[] = [];
  raw
    .split("\n")
    .map((l) => l.replace(/\s+$/, ""))
    .filter((l) => l.trim())
    .forEach((line) => {
      const f = line.match(/^file:\s*(.*)$/i);
      if (f) {
        file = f[1].trim();
        return;
      }
      const bang = line.match(/^!\s*([^|]+?)\s*\|\s*(.*)$/);
      if (bang) {
        rows.push({ kind: "finding", sym: bang[1].trim(), note: bang[2].trim() });
        return;
      }
      const bar = line.indexOf("|");
      if (bar >= 0) {
        rows.push({
          kind: "code",
          code: line.slice(0, bar).trim(),
          comment: line.slice(bar + 1).trim() || undefined,
        });
      } else {
        rows.push({ kind: "code", code: line.trim() });
      }
    });
  return { file, rows };
}

export function CodeCallout({
  file,
  rows,
}: {
  file?: string;
  rows: CCRow[];
}): ReactNode {
  return (
    <div className="codecallout">
      {file && (
        <div className="cc-head">
          <span className="cc-file">{file}</span>
          <span className="cc-lang">java</span>
        </div>
      )}
      <div className="cc-body">
        {rows.map((r, i) =>
          r.kind === "finding" ? (
            <div key={i} className="cc-finding">
              <span className="cc-finding-tag">missing</span>
              <code className="cc-sym">{r.sym}</code>
              <span className="cc-note">{r.note}</span>
            </div>
          ) : (
            <div key={i} className="cc-row">
              <code className="cc-code">{r.code}</code>
              {r.comment && <span className="cc-comment">{r.comment}</span>}
            </div>
          )
        )}
      </div>
    </div>
  );
}
