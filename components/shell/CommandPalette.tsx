"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { NAV_ITEMS } from "@/lib/navigation";
import type { WriteupEntry } from "@/lib/types";

type CommandPaletteProps = {
  writeupEntries: Pick<WriteupEntry, "slug" | "title" | "summary">[];
};

export function CommandPalette({ writeupEntries }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const run = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="absolute left-1/2 top-[15%] -translate-x-1/2 w-[min(560px,calc(100%-2rem))]">
        <Command
          className="panel overflow-hidden shadow-2xl shadow-violet-950/20"
          label="Command palette"
        >
          <Command.Input
            placeholder="Jump to a page or search writeups..."
            className="w-full px-4 py-3 bg-transparent border-b border-[var(--color-border)] outline-none text-sm placeholder:text-zinc-500"
          />
          <Command.List className="max-h-72 overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-sm text-zinc-500 text-center">
              No results.
            </Command.Empty>

            <Command.Group heading="Pages">
              {NAV_ITEMS.map((item) => (
                <Command.Item
                  key={item.id}
                  value={`${item.label} ${item.description}`}
                  onSelect={() => run(item.href)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer aria-selected:bg-violet-500/12 aria-selected:text-violet-100 text-sm"
                >
                  <div>
                    <p>{item.label}</p>
                    <p className="text-xs text-zinc-500">{item.description}</p>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>

            {writeupEntries.length > 0 && (
              <Command.Group
                heading="Writeups"
                className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-zinc-500"
              >
                {writeupEntries.map((entry) => (
                  <Command.Item
                    key={entry.slug}
                    value={`${entry.title} ${entry.summary}`}
                    onSelect={() => run(`/writeups/${entry.slug}/`)}
                    className="px-3 py-2 rounded-lg cursor-pointer aria-selected:bg-violet-500/12 aria-selected:text-violet-100 text-sm"
                  >
                    {entry.title}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
