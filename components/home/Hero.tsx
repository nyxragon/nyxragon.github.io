import Image from "next/image";
import type { NowContent } from "@/lib/types";
import { Panel } from "@/components/ui/Panel";

export function Hero({
  name,
  tagline,
  headline,
  avatar,
  focus,
  meta,
}: {
  name: string;
  tagline: string;
  headline: string;
  avatar: string;
  focus: string[];
  meta?: string;
}) {
  return (
    <section className="relative animate-in">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        <div className="relative shrink-0 mx-auto md:mx-0">
          <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden avatar-ring">
            <Image
              src={avatar}
              alt={name}
              fill
              className="object-cover"
              sizes="128px"
              priority
            />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left min-w-0">
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-100 tracking-tight">
            {name}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {tagline}
          </p>
          <p className="mt-4 text-zinc-300 text-base md:text-lg max-w-xl leading-relaxed">
            {headline}
          </p>

          <div className="flex flex-wrap gap-2 mt-5 justify-center md:justify-start">
            {focus.slice(0, 4).map((item) => (
              <span key={item} className="focus-pill">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function UpToWidget({ now }: { now: NowContent }) {
  const items = (now.thinking ?? []).slice(0, 3);

  return (
    <Panel className="animate-in stagger-2 h-full">
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">
        On my mind lately
      </p>
      {items.length > 0 ? (
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li
              key={item}
              className="text-sm text-zinc-300 flex gap-2 leading-snug"
            >
              <span className="text-zinc-500 shrink-0">·</span>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zinc-500">Nothing listed right now.</p>
      )}
    </Panel>
  );
}

export function RoleCard({
  role,
  org,
}: {
  role: string;
  org: string;
}) {
  return (
    <Panel href="/experience/" className="animate-in stagger-2 h-full">
      <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">
        Current role
      </p>
      <p className="text-zinc-100 font-semibold">{role}</p>
      <p className="text-[var(--color-accent)] mt-0.5">{org}</p>
    </Panel>
  );
}
