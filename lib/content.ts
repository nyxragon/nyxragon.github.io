import fs from "fs";
import path from "path";
import matter from "gray-matter";
import yaml from "js-yaml";
import type {
  AboutContent,
  AchievementsContent,
  ExperienceContent,
  NowContent,
  SiteConfig,
  TalksContent,
  WriteupEntry,
  WriteupType,
} from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");
const WRITEUPS_DIR = path.join(CONTENT_DIR, "writeups");

function readFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

function readYaml<T>(filePath: string): T {
  return yaml.load(readFile(filePath)) as T;
}

function isProductionBuild(): boolean {
  return process.env.NODE_ENV === "production";
}

function resolveWriteupType(data: Record<string, unknown>): WriteupType {
  if (data.type && typeof data.type === "string") {
    return data.type as WriteupType;
  }
  const legacyMap: Record<string, WriteupType> = {
    seedling: "note",
    budding: "essay",
    evergreen: "research",
  };
  if (data.status && typeof data.status === "string") {
    return legacyMap[data.status] || "note";
  }
  return "note";
}

export function getSiteConfig(): SiteConfig {
  return readYaml<SiteConfig>(path.join(CONTENT_DIR, "site.yaml"));
}

export function getAbout(): AboutContent {
  const { data } = matter(readFile(path.join(CONTENT_DIR, "about.md")));
  return data as AboutContent;
}

export function getNow(): NowContent {
  const { data } = matter(readFile(path.join(CONTENT_DIR, "now.md")));
  return {
    last_updated: (data.last_updated as string) || "",
    thinking: (data.thinking as string[]) || [],
    reading: (data.reading as string[]) || [],
    building: (data.building as string[]) || [],
  };
}

export function getExperience(): ExperienceContent {
  return readYaml<ExperienceContent>(path.join(CONTENT_DIR, "experience.yaml"));
}

export function getAchievements(): AchievementsContent {
  return readYaml<AchievementsContent>(
    path.join(CONTENT_DIR, "achievements.yaml")
  );
}

export function getTalks(): TalksContent {
  const raw = readYaml<{ talks?: TalksContent["talks"]; broadcasts?: TalksContent["talks"] }>(
    path.join(CONTENT_DIR, "talks.yaml")
  );
  return { talks: raw.talks ?? raw.broadcasts ?? [] };
}

function parseWriteupFile(filePath: string): WriteupEntry {
  const raw = readFile(filePath);
  const { data, content } = matter(raw);
  const slug = path.basename(filePath, path.extname(filePath));

  return {
    slug,
    title: (data.title as string) || slug,
    date: (data.date as string) || "",
    type: resolveWriteupType(data as Record<string, unknown>),
    topics: (data.topics as string[]) || [],
    draft: Boolean(data.draft),
    summary: (data.summary as string) || "",
    content: content.trim(),
  };
}

function collectWriteupFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  const entries: string[] = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory() && entry.name !== "_drafts") {
      entries.push(...collectWriteupFiles(fullPath));
      continue;
    }

    if (
      entry.isFile() &&
      (entry.name.endsWith(".mdx") || entry.name.endsWith(".md")) &&
      !entry.name.startsWith("_")
    ) {
      entries.push(fullPath);
    }
  }

  return entries;
}

function collectDraftFiles(): string[] {
  const draftsDir = path.join(WRITEUPS_DIR, "_drafts");
  if (!fs.existsSync(draftsDir)) return [];

  return fs
    .readdirSync(draftsDir)
    .filter(
      (f) =>
        (f.endsWith(".mdx") || f.endsWith(".md")) && !f.startsWith("_")
    )
    .map((f) => path.join(draftsDir, f));
}

export function getAllWriteupEntries(includeDrafts = false): WriteupEntry[] {
  const files = [
    ...collectWriteupFiles(WRITEUPS_DIR),
    ...(includeDrafts && !isProductionBuild() ? collectDraftFiles() : []),
  ];

  const entries = files.map(parseWriteupFile);

  return entries
    .filter((entry) => !entry.draft)
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

/** Published writeups only — safe for homepage and production */
export function getAllWriteups(): WriteupEntry[] {
  return getAllWriteupEntries(false);
}

/** Dev preview: includes drafts from _drafts/ */
export function getWriteupsForDevPreview(): WriteupEntry[] {
  if (isProductionBuild()) return getAllWriteups();
  const files = [...collectWriteupFiles(WRITEUPS_DIR), ...collectDraftFiles()];
  const seen = new Set<string>();
  return files
    .map(parseWriteupFile)
    .filter((e) => {
      if (seen.has(e.slug)) return false;
      seen.add(e.slug);
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getWriteupEntry(slug: string): WriteupEntry | null {
  const candidates = [
    path.join(WRITEUPS_DIR, `${slug}.mdx`),
    path.join(WRITEUPS_DIR, `${slug}.md`),
    path.join(WRITEUPS_DIR, "_drafts", `${slug}.mdx`),
    path.join(WRITEUPS_DIR, "_drafts", `${slug}.md`),
  ];

  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) continue;
    const entry = parseWriteupFile(filePath);
    if (isProductionBuild() && entry.draft) return null;
    return entry;
  }

  return null;
}

export function getWriteupSlugs(): string[] {
  return getAllWriteups().map((entry) => entry.slug);
}

export const getWriteup = getWriteupEntry;
