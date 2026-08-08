import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllWriteups, getWriteupEntry } from "@/lib/content";
import { Badge } from "@/components/ui/Panel";
import { MarkdownRenderer } from "@/components/lab/MarkdownRenderer";
import { formatDate, typeColor, typeLabel } from "@/lib/utils";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllWriteups().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getWriteupEntry(slug);
  if (!entry) return { title: "Not Found" };
  return {
    title: entry.title,
    description: entry.summary,
  };
}

export default async function WriteupPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getWriteupEntry(slug);

  if (!entry) notFound();

  return (
    <article>
      <Link
        href="/writeups/"
        className="text-xs text-zinc-500 hover:text-violet-300 no-underline mb-6 inline-block"
      >
        ← Writeups
      </Link>

      <header className="mb-8 animate-in">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {entry.draft && process.env.NODE_ENV === "development" && (
            <Badge className="text-amber-400/90 border-amber-400/25 bg-amber-400/8">
              preview only
            </Badge>
          )}
          <Badge className={typeColor(entry.type)}>
            {typeLabel(entry.type)}
          </Badge>
          <span className="text-xs text-zinc-500">
            {formatDate(entry.date)}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-100 tracking-tight">
          {entry.title}
        </h1>
        {entry.summary && (
          <p className="mt-2 text-zinc-400">{entry.summary}</p>
        )}
        {entry.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {entry.topics.map((topic) => (
              <span key={topic} className="text-xs text-zinc-500">
                #{topic}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="panel p-6 md:p-8 animate-in">
        <MarkdownRenderer content={entry.content} />
      </div>
    </article>
  );
}
