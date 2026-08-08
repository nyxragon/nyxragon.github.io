"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type SidebarProps = {
  avatar: string;
  name: string;
  handle: string;
};

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Sidebar({ avatar, name, handle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bg-elevated)]/90 backdrop-blur-sm min-h-dvh p-6">
      <Link href="/" className="mb-8 no-underline group">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden avatar-ring shrink-0">
            <Image
              src={avatar}
              alt={name}
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-zinc-100 truncate group-hover:text-violet-200 transition-colors text-sm">
              {name}
            </p>
            <p className="text-[11px] text-zinc-500 truncate">{handle}</p>
          </div>
        </div>
      </Link>

      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "px-3 py-2 rounded-lg text-sm transition-all no-underline",
                active
                  ? "bg-violet-500/10 text-violet-100 border border-violet-500/20"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] border border-transparent"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-[var(--color-border)]">
        <p className="text-[11px] text-zinc-600 leading-relaxed">
          Press{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-[var(--color-border)] text-zinc-500">
            ⌘K
          </kbd>{" "}
          to jump anywhere.
        </p>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]/95 backdrop-blur-md">
      <div className="flex overflow-x-auto px-2 py-2 gap-1 scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "shrink-0 px-3 py-2 rounded-lg text-xs font-medium no-underline transition-colors",
                active
                  ? "bg-violet-500/12 text-violet-200 border border-violet-500/20"
                  : "text-zinc-400"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
