import type { Metadata } from "next";
import { getAllWriteups, getSiteConfig } from "@/lib/content";
import { Sidebar, MobileNav } from "@/components/shell/Sidebar";
import { CommandPalette } from "@/components/shell/CommandPalette";
import "./globals.css";

const site = getSiteConfig();

export const metadata: Metadata = {
  title: {
    default: `${site.name} · ${site.handle}`,
    template: `%s · ${site.handle}`,
  },
  description: site.description,
  metadataBase: new URL(site.url),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const writeupEntries = getAllWriteups().map((e) => ({
    slug: e.slug,
    title: e.title,
    summary: e.summary,
  }));

  return (
    <html lang="en">
      <body className="antialiased relative">
        <div className="workspace-bg" aria-hidden>
          <div className="grid-overlay" />
        </div>

        <div className="relative z-10 flex min-h-dvh">
          <Sidebar
            avatar={site.avatar}
            name={site.name}
            handle={site.handle}
          />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg)]/85 backdrop-blur-md">
              <div className="flex items-center gap-2 md:hidden">
                <span className="status-dot" aria-hidden />
                <p className="text-xs text-zinc-400">{site.name}</p>
              </div>
              <p className="hidden md:block text-xs text-zinc-500">
                {site.name}
              </p>
              <p className="text-[10px] text-zinc-600 hidden sm:block px-2 py-1 rounded-md border border-[var(--color-border)] bg-white/[0.02]">
                ⌘K
              </p>
            </header>
            <main className="flex-1 px-4 md:px-8 py-6 md:py-10 pb-24 md:pb-10 max-w-5xl w-full mx-auto">
              {children}
            </main>
          </div>
        </div>
        <MobileNav />
        <CommandPalette writeupEntries={writeupEntries} />
      </body>
    </html>
  );
}
