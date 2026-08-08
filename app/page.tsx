import Link from "next/link";
import {
  getAbout,
  getAllWriteups,
  getExperience,
  getNow,
  getSiteConfig,
} from "@/lib/content";
import { NavCards } from "@/components/home/NavCards";
import { Hero, RoleCard, UpToWidget } from "@/components/home/Hero";
import { MarkdownRenderer } from "@/components/lab/MarkdownRenderer";
import { Panel } from "@/components/ui/Panel";
import { formatDate } from "@/lib/utils";

const SOCIAL_STYLES: Record<string, string> = {
  GitHub:   "border-violet-500/40 text-violet-300 bg-violet-500/8 hover:border-violet-400 hover:text-violet-200 hover:bg-violet-500/15",
  X:        "border-emerald-500/40 text-emerald-300 bg-emerald-500/8 hover:border-emerald-400 hover:text-emerald-200 hover:bg-emerald-500/15",
  LinkedIn: "border-sky-500/40 text-sky-300 bg-sky-500/8 hover:border-sky-400 hover:text-sky-200 hover:bg-sky-500/15",
};

export default function HomePage() {
  const site = getSiteConfig();
  const about = getAbout();
  const now = getNow();
  const experience = getExperience();
  const currentRole = experience.experience[0]?.roles[0];
  const currentOrg = experience.experience[0]?.company;
  const writeupEntries = getAllWriteups().slice(0, 3);

  return (
    <div className="space-y-10">
      <Hero
        name={site.name}
        tagline={site.tagline}
        headline={site.headline}
        avatar={site.avatar}
        focus={site.focus ?? []}
        meta={`${about.role} · ${about.location}`}
      />

      <NavCards />

      <Panel className="animate-in" gradient>
        <MarkdownRenderer content={about.intro} />
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[var(--color-border)]">
          {site.links.filter((l) => l.label !== "Website").map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all no-underline ${SOCIAL_STYLES[link.label] ?? "border-[var(--color-border)] text-zinc-300 hover:text-white hover:border-white/30"}`}
            >
              {link.label} ↗
            </a>
          ))}
        </div>
      </Panel>

      <div className="grid md:grid-cols-2 gap-4">
        <RoleCard
          role={currentRole?.title ?? "Security Researcher"}
          org={currentOrg ?? "HackerOne"}
        />
        <UpToWidget now={now} />
      </div>

{writeupEntries.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">
              Recent writeups
            </h2>
            <Link
              href="/writeups/"
              className="text-xs text-zinc-500 hover:text-violet-300 no-underline"
            >
              View all writeups →
            </Link>
          </div>
          <div className="space-y-3">
            {writeupEntries.map((entry) => (
              <Panel
                key={entry.slug}
                href={`/writeups/${entry.slug}/`}
                className="animate-in group"
              >
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <p className="font-medium text-zinc-100 group-hover:text-violet-200 transition-colors">
                    {entry.title}
                  </p>
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed">
                  {entry.summary}
                </p>
                <p className="text-xs text-zinc-600 mt-2">
                  {formatDate(entry.date)}
                </p>
              </Panel>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
