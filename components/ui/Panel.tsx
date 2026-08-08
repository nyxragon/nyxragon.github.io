import Link from "next/link";
import { cn } from "@/lib/utils";

type PanelProps = {
  children: React.ReactNode;
  className?: string;
  href?: string;
  gradient?: boolean;
};

export function Panel({ children, className, href, gradient }: PanelProps) {
  const classes = cn(
    "panel panel-hover transition-colors duration-200 p-5",
    gradient && "gradient-border",
    className
  );

  if (href) {
    return (
      <Link href={href} className={cn(classes, "block no-underline")}>
        {children}
      </Link>
    );
  }

  return <div className={classes}>{children}</div>;
}

export function PageHeader({
  title,
  subtitle,
  kicker,
}: {
  title: string;
  subtitle?: string;
  kicker?: string;
}) {
  return (
    <header className="mb-8 animate-in">
      {kicker && (
        <p className="font-mono text-xs uppercase tracking-widest text-violet-400 mb-2">
          {kicker}
        </p>
      )}
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-50">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-zinc-400 max-w-2xl">{subtitle}</p>
      )}
    </header>
  );
}

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono border",
        className
      )}
    >
      {children}
    </span>
  );
}

export function MarkdownContent({ content }: { content: string }) {
  // Simple markdown bold rendering for experience bullets
  const parts = content.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
