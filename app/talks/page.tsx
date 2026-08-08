import { getTalks } from "@/lib/content";
import { PageHeader, Panel } from "@/components/ui/Panel";
import { ImageCarousel } from "@/components/broadcasts/ImageCarousel";
import type { Talk } from "@/lib/types";

export const metadata = { title: "Talks" };

function TalkCard({ talk }: { talk: Talk }) {
  return (
    <Panel className="animate-in overflow-hidden !p-0">
      <div className="grid md:grid-cols-2 gap-0">
        <div className="p-4 md:p-5">
          <ImageCarousel images={talk.images} />
        </div>
        <div className="p-5 md:p-6 flex flex-col justify-center border-t md:border-t-0 md:border-l border-[var(--color-border)]">
          <h2 className="text-xl font-semibold text-zinc-100 mb-2">
            {talk.title}
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {talk.description}
          </p>
        </div>
      </div>
    </Panel>
  );
}

export default function TalksPage() {
  const { talks } = getTalks();
  const talkEntries = talks.filter((t) => t.type === "talk" || !t.type);
  const sessionEntries = talks.filter((t) => t.type === "session");

  return (
    <div className="space-y-12">
      <PageHeader
        title="Talks"
        subtitle="Conference sessions, workshops, and fireside conversations."
      />

      {/* ── Talks ── */}
      {talkEntries.length > 0 && (
        <section>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4 font-mono">
            Talks
          </p>
          <div className="grid gap-6">
            {talkEntries.map((talk) => (
              <TalkCard key={talk.id} talk={talk} />
            ))}
          </div>
        </section>
      )}

      {/* ── Sessions ── */}
      {sessionEntries.length > 0 && (
        <section>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4 font-mono">
            Sessions
          </p>
          <div className="grid gap-6">
            {sessionEntries.map((talk) => (
              <TalkCard key={talk.id} talk={talk} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
