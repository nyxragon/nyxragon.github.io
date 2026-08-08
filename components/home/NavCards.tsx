import Link from "next/link";
import { NAV_ITEMS } from "@/lib/navigation";

const NAV_ACCENTS: Record<string, string> = {
  experience: "bg-violet-500",
  writeups: "bg-cyan-500",
  talks: "bg-fuchsia-500",
  achievements: "bg-amber-500",
};

export function NavCards() {
  return (
    <section className="animate-in stagger-1">
      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3 font-medium font-mono">
        Explore
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {NAV_ITEMS.filter((item) => item.id !== "home").map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="panel panel-hover p-4 no-underline group flex items-center gap-4"
          >
            <span
              className={`${NAV_ACCENTS[item.id] ?? "bg-violet-500"} space-card-accent opacity-60 group-hover:opacity-100 transition-opacity`}
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-zinc-100 group-hover:text-violet-200 transition-colors text-sm">
                {item.label}
              </p>
              <p className="text-xs text-zinc-500 leading-snug mt-0.5">
                {item.description}
              </p>
            </div>
            <span className="text-zinc-600 group-hover:text-violet-400 transition-all group-hover:translate-x-0.5 text-sm shrink-0">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
