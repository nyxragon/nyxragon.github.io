import type { ExperienceContent } from "@/lib/types";
import { MarkdownContent } from "@/components/ui/Panel";
import { CompanyLogo } from "@/components/ui/CompanyLogo";

export function GitTimeline({ data }: { data: ExperienceContent }) {
  return (
    <div className="space-y-10">
      {/* ── Work ── */}
      <section>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4 font-mono">
          Work
        </p>
        <div className="space-y-3">
          {data.experience.map((employer) => (
            <div key={employer.company} className="panel p-5 animate-in">
              {/* Company row */}
              <div className="flex items-center gap-3 mb-4">
                <CompanyLogo logo={employer.logo} name={employer.company} href={employer.url} />
                <div>
                  {employer.url && employer.url !== "#" ? (
                    <a
                      href={employer.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-zinc-100 hover:text-violet-200 no-underline text-base leading-tight"
                    >
                      {employer.company}
                    </a>
                  ) : (
                    <span className="font-semibold text-zinc-100 text-base leading-tight">
                      {employer.company}
                    </span>
                  )}
                  <p className="text-xs text-zinc-500 mt-0.5">{employer.location}</p>
                </div>
              </div>

              {/* Roles */}
              <div className="ml-12 flex flex-col gap-0">
                {employer.roles.map((role, i) => (
                  <div
                    key={`${employer.company}-${i}`}
                    className={i > 0 ? "border-t border-[var(--color-border)] pt-3 mt-3" : ""}
                  >
                    <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
                      <span className="text-sm font-medium text-zinc-200">
                        {role.title}
                      </span>
                      <span className="text-xs text-zinc-500 shrink-0 font-mono">
                        {role.dates}
                      </span>
                    </div>

                    {role.bullets && role.bullets.length > 0 && (
                      <ul className="mt-2 pl-3 border-l border-violet-500/20 space-y-2 list-none">
                        {role.bullets.map((bullet) => (
                          <li key={bullet} className="flex gap-2 text-xs text-zinc-400">
                            <span className="text-violet-500/60 shrink-0 mt-0.5">·</span>
                            <MarkdownContent content={bullet} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Education ── */}
      <section>
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4 font-mono">
          Education
        </p>
        <div className="space-y-3">
          {data.education.map((school) => (
            <div key={school.name} className="panel p-5 animate-in">
              <div className="flex items-start gap-3">
                <CompanyLogo logo={school.logo} name={school.name} href={school.url} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap justify-between gap-2">
                    <a
                      href={school.url}
                      target={school.url === "#" ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      className="font-semibold text-zinc-100 hover:text-violet-200 no-underline text-sm"
                    >
                      {school.name}
                    </a>
                    <span className="text-xs text-zinc-500 font-mono shrink-0">
                      {school.dates}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-0.5">{school.degree}</p>
                  <p className="text-xs text-zinc-500">{school.location}</p>
                  {school.notes && (
                    <ul className="mt-2 text-xs text-zinc-500 list-disc pl-4 space-y-0.5">
                      {school.notes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
