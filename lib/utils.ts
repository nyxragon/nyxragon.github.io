export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Strip markdown bold markers for simple inline rendering */
export function stripMarkdownBold(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, "$1");
}

export function typeLabel(type: string): string {
  const labels: Record<string, string> = {
    research: "Research",
    essay: "Essay",
    note: "Note",
  };
  return labels[type] || type;
}

export function typeColor(type: string): string {
  const colors: Record<string, string> = {
    research: "text-violet-300 border-violet-400/25 bg-violet-400/8",
    essay: "text-slate-300 border-slate-400/25 bg-slate-400/8",
    note: "text-zinc-400 border-zinc-400/25 bg-zinc-400/8",
  };
  return colors[type] || "text-zinc-400 border-zinc-400/25 bg-zinc-400/8";
}
