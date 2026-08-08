import type { NavItem } from "./types";

export const NAV_ITEMS: NavItem[] = [
  {
    id: "home",
    label: "Home",
    href: "/",
    description: "Start here",
  },
  {
    id: "experience",
    label: "Experience",
    href: "/experience/",
    description: "Roles, research, and education",
  },
  {
    id: "writeups",
    label: "Writeups",
    href: "/writeups/",
    description: "Security writeups, research notes, and occasional thoughts.",
  },
  {
    id: "talks",
    label: "Talks",
    href: "/talks/",
    description: "Conference talks and workshops",
  },
  {
    id: "achievements",
    label: "Achievements",
    href: "/achievements/",
    description: "Acknowledgements and certifications",
  },
];

export const ALL_NAV_ITEMS = NAV_ITEMS;

export const WRITEUPS_SUBTITLE =
  "Security writeups, research notes, and occasional thoughts.";
