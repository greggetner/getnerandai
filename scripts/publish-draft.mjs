#!/usr/bin/env node
/**
 * publish-draft.mjs
 *
 * Step B of the content-automation pipeline:
 *   - Reads a markdown draft from content/drafts/
 *   - Converts it to a full HTML blog post matching the existing template
 *   - Writes /blog/{slug}.html
 *   - Inserts a new card at the top of /blog/index.html
 *   - Inserts a new item at the top of /blog/rss.xml
 *   - Marks the topic in content/topic-queue.json as "published"
 *   - Deletes the draft markdown file
 *
 * Usage:
 *   node scripts/publish-draft.mjs [draft-filename]
 *
 * If no argument is passed, publishes the oldest file in content/drafts/.
 */

import { readFile, writeFile, unlink, readdir } from 'node:fs/promises';
import path from 'node:path';
import { marked } from 'marked';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DRAFTS_DIR = path.join(ROOT, 'content/drafts');
const BLOG_DIR = path.join(ROOT, 'blog');
const QUEUE_PATH = path.join(ROOT, 'content/topic-queue.json');
const TEMPLATE_PATH = path.join(ROOT, 'scripts/lib/blog-post.template.html');

const WORDS_PER_MINUTE = 140; // calibrated to existing blog post read-time estimates

// ────────────────────────────────────────────────────────────────
// Front-matter parsing (YAML-ish but we control the format)
// ────────────────────────────────────────────────────────────────
function parseDraft(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n+([\s\S]*)$/);
  if (!match) throw new Error('Draft is missing YAML front matter.');
  const [, fmText, body] = match;
  const front = {};
  for (const line of fmText.split('\n')) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (!m) continue;
    const [, key, value] = m;
    let parsed = value.trim();
    if (parsed.startsWith('"') && parsed.endsWith('"')) parsed = JSON.parse(parsed);
    front[key] = parsed;
  }
  return { front, body: body.trim() };
}

// ────────────────────────────────────────────────────────────────
// Extract the H1 and the italic lede from the markdown body.
// The draft format (per the generator) always begins with:
//   # Title
//   (blank line)
//   *italic lede sentence(s)*
//   (blank line)
//   body...
// ────────────────────────────────────────────────────────────────
function extractTitleLedeBody(markdown) {
  const lines = markdown.split('\n');
  let i = 0;

  // Skip leading blank lines
  while (i < lines.length && lines[i].trim() === '') i++;
  if (!lines[i] || !lines[i].startsWith('# ')) {
    throw new Error('Draft body does not start with an H1 heading.');
  }
  const title = lines[i].replace(/^#\s+/, '').trim();
  i++;

  // Skip blank lines
  while (i < lines.length && lines[i].trim() === '') i++;

  // Optional italic lede line: *text* or *text...text*
  let lede = '';
  if (lines[i] && /^\*[^*].*\*\s*$/.test(lines[i])) {
    lede = lines[i].replace(/^\*|\*\s*$/g, '').trim();
    i++;
  }

  // Skip blank lines
  while (i < lines.length && lines[i].trim() === '') i++;

  const body = lines.slice(i).join('\n').trim();
  return { title, lede, body };
}

// ────────────────────────────────────────────────────────────────
// Markdown → HTML (using marked, with tweaks to match existing posts)
// ────────────────────────────────────────────────────────────────
function renderBody(markdown) {
  marked.use({
    gfm: true,
    breaks: false,
  });
  let html = marked.parse(markdown);

  // Existing posts indent every inline element by 6 spaces to match the surrounding
  // <div class="post-body"> structure. Normalize by adding leading whitespace to each top-level block.
  html = html
    .split('\n')
    .map(line => (line.trim() === '' ? '' : '      ' + line))
    .join('\n')
    .trim();

  return html;
}

// ────────────────────────────────────────────────────────────────
// Display date formatter: e.g. "April 24, 2026"
// ────────────────────────────────────────────────────────────────
function formatDisplayDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

// ────────────────────────────────────────────────────────────────
// RFC-822 date for RSS (e.g. "Fri, 24 Apr 2026 00:00:00 GMT")
// ────────────────────────────────────────────────────────────────
function formatRssDate(iso) {
  const d = new Date(iso);
  // Force 00:00:00 GMT on the publish date
  const utcDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  return utcDate.toUTCString().replace('GMT', 'GMT');
}

// ────────────────────────────────────────────────────────────────
// Apply template substitutions
// ────────────────────────────────────────────────────────────────
function renderFullHtml(template, vars) {
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    const re = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    out = out.replace(re, value);
  }
  return out;
}

// ────────────────────────────────────────────────────────────────
// Insert a new blog-post card at the top of /blog/index.html
// ────────────────────────────────────────────────────────────────
async function updateBlogIndex({ slug, title, displayDate, category, readTime, lede }) {
  const indexPath = path.join(BLOG_DIR, 'index.html');
  const raw = await readFile(indexPath, 'utf8');

  // Truncate lede to a reasonable excerpt length for the card
  const excerpt = lede.length > 260 ? lede.slice(0, 257).trimEnd() + '…' : lede;

  const cardHtml = `    <li class="blog-post-card">
      <div class="post-meta">${displayDate} · ${category} · ${readTime} min read</div>
      <h2><a href="/blog/${slug}.html">${escapeHtml(title)}</a></h2>
      <p class="excerpt">${escapeHtml(excerpt)}</p>
      <a class="read-more" href="/blog/${slug}.html">Read post →</a>
    </li>

`;

  const marker = '<ul class="blog-post-list">';
  if (!raw.includes(marker)) throw new Error(`Could not find "${marker}" in blog/index.html`);

  // Insert new card immediately after the opening <ul> line
  const inserted = raw.replace(
    marker + '\n',
    marker + '\n\n' + cardHtml,
  );

  await writeFile(indexPath, inserted, 'utf8');
}

// ────────────────────────────────────────────────────────────────
// Insert a new item at the top of /blog/rss.xml
// ────────────────────────────────────────────────────────────────
async function updateRss({ slug, title, lede, isoDate }) {
  const rssPath = path.join(BLOG_DIR, 'rss.xml');
  const raw = await readFile(rssPath, 'utf8');

  const rfcDate = formatRssDate(isoDate);
  const itemXml = `    <item>
      <title>${escapeXml(title)}</title>
      <link>https://getner.ai/blog/${slug}.html</link>
      <guid isPermaLink="true">https://getner.ai/blog/${slug}.html</guid>
      <pubDate>${rfcDate}</pubDate>
      <author>greg@getner.ai (Greg Getner)</author>
      <description><![CDATA[${lede}]]></description>
    </item>

`;

  // Find the first <item> tag — insert our new item before it.
  // Fall back to inserting before </channel> if no existing items.
  const firstItemIdx = raw.indexOf('    <item>');
  if (firstItemIdx !== -1) {
    const inserted = raw.slice(0, firstItemIdx) + itemXml + raw.slice(firstItemIdx);
    // Also update lastBuildDate
    const newRaw = inserted.replace(
      /<lastBuildDate>.*?<\/lastBuildDate>/,
      `<lastBuildDate>${rfcDate}</lastBuildDate>`,
    );
    await writeFile(rssPath, newRaw, 'utf8');
  } else {
    const closing = '</channel>';
    const inserted = raw.replace(closing, itemXml + closing);
    await writeFile(rssPath, inserted, 'utf8');
  }
}

// ────────────────────────────────────────────────────────────────
// Small escape helpers
// ────────────────────────────────────────────────────────────────
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ────────────────────────────────────────────────────────────────
// Pick a draft — argv[2] or the oldest file in content/drafts/
// ────────────────────────────────────────────────────────────────
async function resolveDraftPath() {
  const arg = process.argv[2];
  if (arg) {
    const maybe = arg.startsWith('/') ? arg : path.join(DRAFTS_DIR, arg);
    return maybe;
  }
  const entries = await readdir(DRAFTS_DIR);
  const mdFiles = entries.filter(e => e.endsWith('.md')).sort();
  if (!mdFiles.length) throw new Error('No drafts in content/drafts/.');
  return path.join(DRAFTS_DIR, mdFiles[0]);
}

// ────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────
async function main() {
  const draftPath = await resolveDraftPath();
  const draftFilename = path.basename(draftPath);
  const slug = draftFilename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
  console.log(`→ Publishing: ${draftFilename} → /blog/${slug}.html`);

  // Parse draft
  const raw = await readFile(draftPath, 'utf8');
  const { front, body: markdownBody } = parseDraft(raw);
  const { title, lede, body } = extractTitleLedeBody(markdownBody);
  const wordCount = parseInt(front.word_count, 10) || body.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));

  const today = new Date().toISOString().slice(0, 10);
  const isoDate = today;
  const displayDate = formatDisplayDate(today);
  const category = front.category || 'ActiveCampaign';
  const bodyHtml = renderBody(body);

  // Render full HTML
  const template = await readFile(TEMPLATE_PATH, 'utf8');
  const html = renderFullHtml(template, {
    TITLE: escapeHtml(title),
    DESCRIPTION: escapeHtml(lede),
    SLUG: slug,
    CATEGORY: escapeHtml(category),
    ISO_DATE: isoDate,
    DISPLAY_DATE: displayDate,
    READ_TIME: String(readTime),
    LEDE: escapeHtml(lede),
    BODY_HTML: bodyHtml,
  });

  // Write the blog post
  const postPath = path.join(BLOG_DIR, `${slug}.html`);
  await writeFile(postPath, html, 'utf8');
  console.log(`✓ Wrote ${path.relative(ROOT, postPath)} (${wordCount} words, ${readTime} min)`);

  // Update blog index
  await updateBlogIndex({ slug, title, displayDate, category, readTime, lede });
  console.log('✓ Inserted card in blog/index.html');

  // Update RSS
  await updateRss({ slug, title, lede, isoDate });
  console.log('✓ Inserted item in blog/rss.xml');

  // Update topic queue
  const queueRaw = await readFile(QUEUE_PATH, 'utf8');
  const queue = JSON.parse(queueRaw);
  const topic = queue.find(t => t.id === front.topic_id);
  if (topic) {
    topic.status = 'published';
    topic.published_at = new Date().toISOString();
    await writeFile(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n', 'utf8');
    console.log(`✓ Updated queue: ${topic.id} → published`);
  }

  // Delete draft
  await unlink(draftPath);
  console.log(`✓ Deleted ${path.relative(ROOT, draftPath)}`);

  console.log('\nDone. Preview at http://localhost:8888/blog/' + slug + '.html');
}

main().catch(err => {
  console.error('Publish failed:', err);
  process.exit(1);
});
