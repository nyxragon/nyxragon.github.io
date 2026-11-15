import { getAllWriteups, getWriteupEntry } from "@/lib/content";
import { ogCard, size, contentType } from "../_og/card";
import { cardCopy } from "@/lib/og";

export const alt = "A writeup by Abhijeet Ingle (nyxragon).";
export { size, contentType };

// Generate a card for every published writeup. Drafts live in _drafts/ and are
// excluded from production builds, so a still-draft post emits no orphan image,
// and its card starts generating automatically once it is published.
export function generateStaticParams() {
  return getAllWriteups().map((entry) => ({ slug: entry.slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { eyebrow, headline } = cardCopy(getWriteupEntry(slug));
  return ogCard({ eyebrow, headline });
}
