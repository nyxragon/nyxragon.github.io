export type SiteConfig = {
  name: string;
  handle: string;
  tagline: string;
  headline: string;
  description: string;
  url: string;
  avatar: string;
  links: { label: string; url: string }[];
  focus: string[];
  mantra: string;
};

export type AboutContent = {
  intro: string;
  role: string;
  location: string;
};

export type NowContent = {
  last_updated: string;
  thinking: string[];
  reading: string[];
  building: string[];
};

export type ExperienceRole = {
  title: string;
  dates: string;
  bullets: string[];
};

export type ExperienceEmployer = {
  company: string;
  url: string;
  logo?: string;
  location: string;
  roles: ExperienceRole[];
};

export type EducationEntry = {
  name: string;
  url: string;
  logo?: string;
  location: string;
  degree: string;
  dates: string;
  notes?: string[];
};

export type ExperienceContent = {
  experience: ExperienceEmployer[];
  education: EducationEntry[];
};

export type AchievementItem = {
  text: string;
  subpoints?: string[];
};

export type CveEntry = {
  target: string;
  description: string;
  ids: string[];
};

export type AchievementsContent = {
  achievements: AchievementItem[];
  hall_of_fame: {
    intro: string;
    organizations: string[];
  };
  cves: CveEntry[];
  certifications: { name: string; issuer: string; description: string }[];
};

export type TalkImage = {
  url: string;
  alt: string;
};

export type Talk = {
  id: string;
  type: "talk" | "session";
  title: string;
  topic: string;
  description: string;
  images: TalkImage[];
};

export type TalksContent = {
  talks: Talk[];
};

export type WriteupType = "research" | "essay" | "note";

export type WriteupEntry = {
  slug: string;
  title: string;
  date: string;
  type: WriteupType;
  topics: string[];
  draft: boolean;
  summary: string;
  content: string;
};

export type NavItem = {
  id: string;
  label: string;
  href: string;
  description: string;
};
