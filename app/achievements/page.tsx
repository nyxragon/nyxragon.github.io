import { getAchievements } from "@/lib/content";
import { PageHeader } from "@/components/ui/Panel";

export const metadata = { title: "Achievements" };

export default function AchievementsPage() {
  const data = getAchievements();

  return (
    <div className="space-y-12">
      <PageHeader
        title="Achievements"
        subtitle="A few things I'm proud of."
      />

      {/* ── Certifications ── */}
      <section>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4 font-mono">
          Certifications
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {data.certifications.map((cert, i) => (
            <div
              key={cert.name}
              className="panel gradient-border animate-in p-5 flex items-start gap-4"
            >
              <span
                className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border tracking-widest mt-0.5"
                style={{
                  color: CERT_COLORS[i % CERT_COLORS.length].text,
                  borderColor: CERT_COLORS[i % CERT_COLORS.length].border,
                  background: CERT_COLORS[i % CERT_COLORS.length].bg,
                }}
              >
                {cert.issuer}
              </span>
              <div>
                <p className="font-semibold text-zinc-100">{cert.name}</p>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{cert.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CVEs ── */}
      <section>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4 font-mono">
          CVEs
        </p>
        <div className="space-y-3">
          {data.cves.map((cve) => (
            <div key={cve.target} className="panel animate-in p-5">
              <p className="font-semibold text-zinc-100">{cve.target}</p>
              <p className="text-sm text-zinc-500 mt-1 mb-3">{cve.description}</p>
              <div className="flex flex-wrap gap-2">
                {cve.ids.map((id) => (
                  <a
                    key={id}
                    href={`https://nvd.nist.gov/vuln/detail/${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full border no-underline transition-all text-[var(--color-accent)] border-[rgba(157,141,241,0.35)] bg-[rgba(157,141,241,0.08)] hover:bg-[rgba(157,141,241,0.18)] hover:border-[rgba(157,141,241,0.6)]"
                  >
                    {id} ↗
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Highlights ── */}
      <section>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4 font-mono">
          Highlights
        </p>
        <div className="space-y-3">
          {data.achievements.map((item, i) => (
            <div
              key={item.text}
              className="panel animate-in relative overflow-hidden p-5 pl-6"
            >
              {/* Colored left accent bar */}
              <span
                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
                style={{ background: HIGHLIGHT_COLORS[i % HIGHLIGHT_COLORS.length] }}
              />
              {/* Faded ordinal in background */}
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-8xl font-black text-white/[0.03] select-none pointer-events-none font-mono leading-none">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="relative">
                <p className="text-zinc-200 leading-relaxed">{item.text}</p>
                {item.subpoints && (
                  <ul className="mt-3 space-y-1 pl-3 border-l border-white/8">
                    {item.subpoints.map((sub) => (
                      <li key={sub} className="flex gap-2 text-sm text-zinc-400">
                        <span className="text-zinc-600 shrink-0">·</span>
                        {sub}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Hall of Fame ── */}
      <section>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1 font-mono">
          Hall of Fame
        </p>
        <p className="text-sm text-zinc-500 mb-5 max-w-xl">{data.hall_of_fame.intro}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {data.hall_of_fame.organizations.map((org) => (
            <div
              key={org}
              className="panel panel-hover p-3.5 flex items-center gap-2.5 group"
            >
              <span className="text-[var(--color-accent)] text-xs opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                ◈
              </span>
              <span className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors leading-snug">
                {org}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const HIGHLIGHT_COLORS = [
  "#9d8df1", // violet
  "#7eb8da", // cyan
  "#f472b6", // pink
];

const CERT_COLORS = [
  { text: "#9d8df1", border: "rgba(157,141,241,0.35)", bg: "rgba(157,141,241,0.1)" }, // violet
  { text: "#7eb8da", border: "rgba(126,184,218,0.35)", bg: "rgba(126,184,218,0.1)" }, // cyan
  { text: "#f472b6", border: "rgba(244,114,182,0.35)", bg: "rgba(244,114,182,0.1)" }, // pink
];
