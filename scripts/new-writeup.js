#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const slug = process.argv[2];

if (!slug) {
  console.error("Usage: npm run new:writeup -- my-post-slug");
  process.exit(1);
}

const safeSlug = slug
  .toLowerCase()
  .replace(/[^a-z0-9-]/g, "-")
  .replace(/-+/g, "-")
  .replace(/^-|-$/g, "");

const today = new Date().toISOString().slice(0, 10);
const templatePath = path.join(process.cwd(), "content/writeups/_template.mdx");
const targetPath = path.join(
  process.cwd(),
  "content/writeups/_drafts",
  `${safeSlug}.mdx`
);

if (!fs.existsSync(templatePath)) {
  console.error("Template not found at content/writeups/_template.mdx");
  process.exit(1);
}

fs.mkdirSync(path.dirname(targetPath), { recursive: true });

if (fs.existsSync(targetPath)) {
  console.error(`File already exists: ${targetPath}`);
  process.exit(1);
}

let template = fs.readFileSync(templatePath, "utf8");
template = template.replace("Your Post Title", safeSlug.replace(/-/g, " "));
template = template.replace("YYYY-MM-DD", today);

fs.writeFileSync(targetPath, template);
console.log(`Created draft: ${targetPath}`);
