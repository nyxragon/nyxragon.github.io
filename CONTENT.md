# Content guide — nyxragon.in

Everything you edit lives in **`content/`**. You never need to open React components for routine updates.

## Draft rules (what the public sees)

| Location | Visible on nyxragon.in? |
|----------|-------------------------|
| `content/writeups/my-post.mdx` with `draft: false` | **Yes** |
| `content/writeups/my-post.mdx` with `draft: true` | **No** |
| `content/writeups/_drafts/*.mdx` | **No** (preview locally with `npm run dev` only) |

Drafts never appear on the live site after you push. They may show locally while developing — that is preview only.

## Write a new post

```bash
npm run new:writeup -- my-post-slug
```

Or copy `content/writeups/_template.mdx` into `content/writeups/` or `content/writeups/_drafts/`.

```yaml
---
title: Your Post Title
date: 2025-03-09
type: essay          # research | essay | note
topics: [security]
draft: true          # set false to publish
summary: One line for cards and SEO
---
```

- **Preview:** `npm run dev` → http://localhost:3000/writeups/my-post-slug/
- **Publish:** set `draft: false`, commit, push to `main`
- **Images:** add to `images/` folder → reference as `/images/your-file.jpg`

## What to edit

| Update | File |
|--------|------|
| Bio (homepage) | `content/about.md` |
| Social links (homepage) | `content/site.yaml` → `links` |
| Job / education | `content/experience.yaml` |
| What you're up to (homepage card) | `content/now.md` |
| New writeup | `content/writeups/` or `npm run new:writeup` |
| Talks + photos | `content/talks.yaml` + `images/` |
| Achievements | `content/achievements.yaml` |
| Site name, links, headline | `content/site.yaml` |

## Deploy

Push to `main` — GitHub Actions builds and deploys to nyxragon.in.

## Local dev

```bash
npm install
npm run dev
```
