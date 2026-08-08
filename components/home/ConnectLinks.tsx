type ConnectLinksProps = {
  links: { label: string; url: string }[];
};

export function ConnectLinks({ links }: ConnectLinksProps) {
  const socialLinks = links.filter((l) => l.label !== "Website");

  if (socialLinks.length === 0) return null;

  return (
    <section className="animate-in">
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3 font-medium">
        Connect
      </p>
      <div className="flex flex-wrap gap-2">
        {socialLinks.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm text-zinc-300 hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent)] transition-all no-underline"
          >
            {link.label} ↗
          </a>
        ))}
      </div>
    </section>
  );
}
