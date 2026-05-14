# Blog Posts Directory

Drop markdown files here (`.md` extension). They'll be auto-converted to HTML on the next deploy.

## Format

Each markdown file should have YAML front matter:

```yaml
---
title: "Your Post Title"
description: "Short description for meta tags"
slug: "post-slug-for-url"
date: "2026-05-14"
author: "Tyler Davis"
category: "Local SEO"
---

# Your Post Title

Content here...
```

## Build Process

During Vercel deploy, the `build-blog.js` script:
1. Reads all `.md` files from this directory
2. Parses YAML front matter + markdown content
3. Renders each as HTML → `../post-slug.html`
4. Updates `../index.html` with links to all posts

## Example

Create `seo-mistakes-2026.md`:
```yaml
---
title: "5 SEO Mistakes Small Businesses Make in 2026"
slug: "seo-mistakes-2026"
date: "2026-05-14"
---

Your content...
```

Result: `/blog/seo-mistakes-2026.html` is live.
