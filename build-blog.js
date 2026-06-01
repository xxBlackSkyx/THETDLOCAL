#!/usr/bin/env node
/**
 * Blog Build Script: Markdown → HTML
 * Runs during Vercel deploy via vercel.json buildCommand
 * 
 * Usage: node build-blog.js
 * 
 * Reads .md files from blog/posts/ with YAML front matter
 * Renders to blog/*.html + updates blog/index.html
 */

const fs = require('fs');
const path = require('path');

// Simple markdown to HTML converter (no external deps)
function markdownToHtml(md) {
  let html = md
    // Headers
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    // Bold/italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    // Line breaks → paragraphs
    .replace(/\n\n+/g, '</p><p>')
    .replace(/^(.+)$/gm, (match) => {
      if (!match.match(/<[h|a|strong|em]/)) return `<p>${match}</p>`;
      return match;
    });
  
  return html;
}

// Parse YAML front matter
function parseFrontMatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;
  
  const yaml = match[1];
  const body = match[2];
  
  const meta = {};
  yaml.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key) {
      meta[key.trim()] = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
    }
  });
  
  return { meta, body };
}

// Read all posts
const postsDir = path.join(__dirname, 'blog', 'posts');
const posts = [];

if (fs.existsSync(postsDir)) {
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
  
  files.forEach(file => {
    const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const parsed = parseFrontMatter(content);
    
    if (parsed) {
      const slug = parsed.meta.slug || file.replace(/\.md$/, '');
      const html = markdownToHtml(parsed.body);
      
      posts.push({
        slug,
        title: parsed.meta.title || slug,
        description: parsed.meta.description || parsed.meta.meta_description || parsed.meta.excerpt || '',
        date: parsed.meta.date || new Date().toISOString().split('T')[0],
        author: parsed.meta.author || 'Tyler Davis',
        category: parsed.meta.category || 'Local SEO',
        html
      });
    }
  });
}

// Sort by date (newest first)
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

// Generate HTML files
const blogDir = path.join(__dirname, 'blog');
posts.forEach(post => {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${post.title} | TD Local SEO</title>
    <meta name="description" content="${post.description}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://www.tdlocalseo.com/blog/${post.slug}/">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f8f9fa; }
        header { background: #fff; border-bottom: 1px solid #ddd; padding: 1rem 0; }
        nav { max-width: 1200px; margin: 0 auto; padding: 0 2rem; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-weight: bold; font-size: 1.5rem; color: #0066cc; text-decoration: none; }
        a { color: #0066cc; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .container { max-width: 800px; margin: 2rem auto; padding: 0 2rem; }
        h1 { margin: 1.5rem 0 0.5rem; }
        h2 { margin: 1.5rem 0 0.5rem; }
        h3 { margin: 1rem 0 0.5rem; }
        p { margin: 1rem 0; }
        .meta { color: #666; font-size: 0.9rem; margin: 1rem 0 2rem; }
        .back-link { margin: 2rem 0; }
    </style>
</head>
<body>
    <header>
        <nav>
            <a href="/" class="logo">TD Local SEO</a>
            <a href="/blog/">← Back to Blog</a>
        </nav>
    </header>
    <main class="container">
        <h1>${post.title}</h1>
        <div class="meta">
            <strong>${post.date}</strong> | ${post.author} | ${post.category}
        </div>
        <div class="content">
            ${post.html}
        </div>
        <div class="back-link">
            <a href="/blog/">← Back to all posts</a>
        </div>
    </main>
</body>
</html>`;
  
  fs.writeFileSync(path.join(blogDir, `${post.slug}.html`), htmlContent);
  console.log(`✓ Generated: /blog/${post.slug}.html`);
});

// Generate blog index
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Local SEO Blog | TD Local SEO</title>
    <meta name="description" content="Local SEO tips, strategies, and case studies for small businesses in Palm Coast, Flagler County, and beyond.">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://www.tdlocalseo.com/blog/">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f8f9fa; }
        header { background: #fff; border-bottom: 1px solid #ddd; padding: 1rem 0; }
        nav { max-width: 1200px; margin: 0 auto; padding: 0 2rem; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-weight: bold; font-size: 1.5rem; color: #0066cc; text-decoration: none; }
        a { color: #0066cc; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .container { max-width: 1000px; margin: 2rem auto; padding: 0 2rem; }
        h1 { margin-bottom: 1rem; color: #222; }
        .posts { display: grid; gap: 2rem; }
        .post { background: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: transform 0.2s; }
        .post:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.15); }
        .post-title { font-size: 1.5rem; margin-bottom: 0.5rem; }
        .post-meta { color: #666; font-size: 0.9rem; margin-bottom: 1rem; }
        .post-desc { color: #555; margin-bottom: 1rem; }
        .read-more { display: inline-block; margin-top: 1rem; font-weight: 600; }
    </style>
</head>
<body>
    <header>
        <nav>
            <a href="/" class="logo">TD Local SEO</a>
            <a href="/">← Back Home</a>
        </nav>
    </header>
    <main class="container">
        <h1>📚 Local SEO Blog</h1>
        <p style="color: #666; margin-bottom: 2rem;">Tips, strategies, and case studies for small business owners in Palm Coast, Flagler County, and beyond.</p>
        
        <div class="posts">
            ${posts.map(post => `
            <div class="post">
                <h2 class="post-title"><a href="/blog/${post.slug}/">${post.title}</a></h2>
                <div class="post-meta">${post.date} | ${post.category}</div>
                <p class="post-desc">${post.description}</p>
                <a href="/blog/${post.slug}/" class="read-more">Read More →</a>
            </div>
            `).join('')}
        </div>

        ${posts.length === 0 ? '<p style="color: #999; margin: 2rem 0;">More posts coming soon!</p>' : ''}
    </main>
</body>
</html>`;

fs.writeFileSync(path.join(blogDir, 'index.html'), indexHtml);
console.log(`✓ Updated: /blog/index.html with ${posts.length} posts`);

// Generate blog/sitemap.xml
const sitemapUrls = posts.map(post => `
  <url>
    <loc>https://www.tdlocalseo.com/blog/${post.slug}/</loc>
    <lastmod>${post.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('');

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.tdlocalseo.com/blog/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>${sitemapUrls}
</urlset>`;

fs.writeFileSync(path.join(blogDir, 'sitemap.xml'), sitemapXml);
console.log(`✓ Generated: /blog/sitemap.xml with ${posts.length} posts`);

console.log('\n✅ Blog build complete!');

// Generate root sitemap.xml (replaces static file — www canonical URLs)
const today = new Date().toISOString().split('T')[0];
const staticPages = [
  { loc: 'https://www.tdlocalseo.com/', lastmod: today, changefreq: 'weekly', priority: '1.0' },
  { loc: 'https://www.tdlocalseo.com/blog/', lastmod: today, changefreq: 'daily', priority: '0.9' },
  { loc: 'https://www.tdlocalseo.com/about/', lastmod: today, changefreq: 'monthly', priority: '0.7' },
];
const staticEntries = staticPages.map(p => `
  <url>
    <loc>${p.loc}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('');

const blogEntries = posts.map(post => `
  <url>
    <loc>https://www.tdlocalseo.com/blog/${post.slug}/</loc>
    <lastmod>${post.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

const rootSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticEntries}${blogEntries}
</urlset>`;

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), rootSitemap);
console.log(`✓ Regenerated: /sitemap.xml with ${staticPages.length} static + ${posts.length} blog pages`);

// Auto-inject 3 newest posts into homepage blog cards on every build
const homepagePath = path.join(__dirname, 'index.html');
if (fs.existsSync(homepagePath) && posts.length > 0) {
  const recent = [...posts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const icons  = ['ico-b', 'ico-g', 'ico-a'];
  const emojis = ['&#128220;', '&#128203;', '&#128506;'];
  const delays = ['d1', 'd2', 'd3'];

  const cardsHtml = recent.map((post, i) => {
    const lower = post.title.toLowerCase();
    const cta = lower.includes('case study') ? 'Read Case Study' :
                 (lower.includes('guide') || lower.includes('checklist') ||
                  lower.includes('how to') || lower.includes('how long') ||
                  lower.includes('how much')) ? 'Read Guide' : 'Read Article';
    const desc = post.description || '';
    const descTrim = desc.length > 120 ? desc.slice(0, 120) + '...' : (desc || 'Read the full article on our blog.');
    return `      <div class="card reveal ${delays[i]}">
        <div class="card-ico ${icons[i]}">${emojis[i]}</div>
        <h3>${post.title}</h3>
        <p>${descTrim}</p>
        <a href="/blog/${post.slug}/" class="card-link">${cta} &rarr;</a>
      </div>`;
  }).join('\n');

  const top4 = [...posts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  const footerLinks = top4.map(p => {
    const t = p.title.length > 45 ? p.title.slice(0, 45) + '...' : p.title;
    return `      <a href="/blog/${p.slug}/">${t}</a>`;
  }).join('\n');

  let homeHtml = fs.readFileSync(homepagePath, 'utf8');

  homeHtml = homeHtml.replace(
    /<!-- BLOG-CARDS-START -->[\s\S]*?<!-- BLOG-CARDS-END -->/,
    `<!-- BLOG-CARDS-START -->\n    <div class="cards-row">\n${cardsHtml}\n    </div>\n    <!-- BLOG-CARDS-END -->`
  );

  homeHtml = homeHtml.replace(
    /<!-- FOOTER-BLOG-START -->[\s\S]*?<!-- FOOTER-BLOG-END -->/,
    `<!-- FOOTER-BLOG-START -->\n${footerLinks}\n      <!-- FOOTER-BLOG-END -->`
  );

  fs.writeFileSync(homepagePath, homeHtml);
  console.log(`✓ Homepage: injected ${recent.length} blog cards + ${top4.length} footer links`);
}
