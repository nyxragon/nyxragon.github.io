import { getAllWriteups, getWriteupsForDevPreview } from "@/lib/content";
import { PageHeader, Panel, Badge } from "@/components/ui/Panel";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Writeups" };

const isDev = process.env.NODE_ENV === "development";

export default function WriteupsPage() {
  const entries = isDev ? getWriteupsForDevPreview() : getAllWriteups();

  return (
    <div>
      <PageHeader
        title="Writeups"
        subtitle="Security writeups, research notes, and occasional thoughts."
      />

      {isDev && (
        <p className="text-xs text-zinc-500 mb-6 -mt-4">
          Draft entries are visible here in local preview only.
        </p>
      )}

      {entries.length === 0 ? (
        <Panel>
          <p className="text-zinc-400 text-sm">
            No writeups yet. Add one in{" "}
            <code className="text-violet-300">content/writeups/</code> or run{" "}
            <code className="text-violet-300">npm run new:writeup</code>.
          </p>
        </Panel>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Panel
              key={entry.slug}
              href={`/writeups/${entry.slug}/`}
              className="animate-in"
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h2 className="font-semibold text-zinc-100">{entry.title}</h2>
                {entry.draft && isDev && (
                  <Badge className="text-amber-400/90 border-amber-400/25 bg-amber-400/8">
                    preview only
                  </Badge>
                )}
              </div>
              {entry.summary && (
                <p className="text-sm text-zinc-400 mb-2">{entry.summary}</p>
              )}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-zinc-500">
                  {formatDate(entry.date)}
                </span>
                {entry.topics.map((topic) => (
                  <span key={topic} className="text-xs text-zinc-500">
                    #{topic}
                  </span>
                ))}
              </div>
            </Panel>
          ))}
        </div>
      )}

      <p className="mt-8 text-xs text-zinc-600">
        See CONTENT.md in the repo for how to add entries.
      </p>
    </div>
  );
}
