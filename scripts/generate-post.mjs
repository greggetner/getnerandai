#!/usr/bin/env node
/**
 * generate-post.mjs
 *
 * Step A of the content-automation pipeline:
 *   - Reads content/topic-queue.json
 *   - Picks the next topic with status: "queued"
 *   - Calls Claude API with a voice-calibrated, anti-hallucination prompt
 *   - Writes the markdown draft to content/drafts/YYYY-MM-DD-slug.md
 *   - Updates the topic status to "drafted"
 *
 * No email, no cron, no auto-publish yet. Run manually:
 *
 *   node --env-file=.env scripts/generate-post.mjs
 *
 * Requires .env with ANTHROPIC_API_KEY.
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const QUEUE_PATH = path.join(ROOT, 'content/topic-queue.json');
const DRAFTS_DIR = path.join(ROOT, 'content/drafts');

// ────────────────────────────────────────────────────────────────
// Voice reference — a ~400 word excerpt from Greg's existing
// "5 ActiveCampaign Automation Mistakes" post. Calibrates the tone.
// ────────────────────────────────────────────────────────────────
const VOICE_REFERENCE = `
I've been in ActiveCampaign accounts for twenty-three years. Coaches doing $8M a year.
Grammy winners. NYT columnists. DTC brands sending a million emails a week. The
builder has changed. The mistakes haven't.

Almost every time I'm brought in to audit a stalled program, I find at least three
of these five. Usually four. The automations look professional on the canvas. They
still leak money.

---

This one costs real dollars. You build a 7-email nurture sequence for a $2,000
offer. Someone buys on day 3. ActiveCampaign happily keeps sending them the
remaining four emails — the pitch, the scarcity reminder, the "last chance" panic
email — even though they're already a customer.

Best case: they feel like you're not paying attention. Worst case — and I've seen
this four times in the last year — they reply asking why you're still selling them
the thing they already bought, ask for a refund, and churn before they've even
used the product.

**The fix:** every revenue-oriented automation needs a **goal** configured, not
just a tag at the end. Goals evaluate on every contact action. The moment the
purchase-complete tag or list membership fires, the contact jumps directly to the
goal step and skips the rest of the sequence.

I configure goals as the second or third step in the automation, not at the end.
That way a single goal is reachable from anywhere in the flow.
`.trim();

// ────────────────────────────────────────────────────────────────
// Prompt builder
// ────────────────────────────────────────────────────────────────
function buildPrompt(topic) {
  const affiliateBlock = topic.affiliate_opportunity
    ? `
AFFILIATE MENTION:
Include ONE natural reference to ${topic.affiliate_opportunity.name} in the post.
Placement: ${topic.affiliate_opportunity.placement_hint}
Format as a markdown link: [${topic.affiliate_opportunity.name}](${topic.affiliate_opportunity.url})
Do NOT force it if it doesn't fit the flow. Better to omit than to shoehorn.
`.trim()
    : 'No affiliate mentions required. Keep the post clean.';

  return `You are writing a blog post for Greg Getner's site — getner.ai, a boutique ActiveCampaign consulting practice. Greg has 23 years of experience in retention marketing. His audience is operators running 7-figure+ coaching businesses, course creators, online businesses, DTC brands, and content creators who manage their own ActiveCampaign programs.

## TOPIC

**Working title:** ${topic.title}
**Category:** ${topic.category}
**Angle:** ${topic.angle}
**SEO keywords to land naturally:** ${topic.keywords.join(', ')}

## TARGET LENGTH

1200–1600 words.

## STRUCTURE

1. Opening: 2–3 short paragraphs. Lead with a specific observation, a common pattern, or a blunt statement. NO "In today's digital world…" openings. NO generic listicle intros. Get to the point in two sentences.
2. Body: 3–7 sections with H2 headings. Each section makes one clear point, gives specifics, and tells the reader what to do. Use sub-H3 headings only if a section has sub-topics.
3. Closing: 1–2 paragraphs that tie back to the opening problem. Followed by ONE call-to-action sentence pointing to Greg's free ActiveCampaign audit at https://getner.ai/audit/.

## VOICE (reference from an existing Greg post)

${VOICE_REFERENCE}

Match this voice: direct, confident, plural-first-person ("I see this pattern", "in most accounts I audit", "in the programs I run"), declarative sentences, no hedging, no filler phrases, no "It's important to note that…".

## HARD RULES

- **No fabricated specifics about real clients.** Never write sentences like "I worked with a brand that did $12M". Use generalized framing: "in most accounts I audit", "a common pattern", "the programs I run". The plural/generalized first-person is fine and expected.
- **No claims about your own business volume, throughput, or client counts.** Do NOT write sentences like "I audit 40 accounts a month", "I've worked with over 200 brands", "My clients generate $X in revenue", "I open at least N accounts a week". If Greg's scale needs to be referenced, stay qualitative: "in the programs I run", "across the accounts I've worked in" — no specific counts, ever.
- **No fabricated quantitative performance ranges.** Do NOT invent conversion rates, open rates, click rates, revenue lifts, or percentage gains. Do NOT write "sequences convert at 0.8–2%", "drives a 40–80% lift", "67% of marketers". These pattern like authority but they're fabricated unless you can cite a real public source (which you cannot inside this prompt).
- **Acceptable quantitative references.** You MAY use: (a) Gmail Postmaster thresholds (\`0.30%\` user-reported spam rate), (b) authentication records (SPF, DKIM, DMARC), (c) specific ActiveCampaign feature parameters (\`Wait 24 hours\`, \`Wait until specific day/time\`), (d) clearly hypothetical/illustrative examples introduced with "if..." or "say..." ("if your welcome series has 7 emails and 2 produce the bulk of your revenue, the other 5 are dead weight").
- **No made-up ActiveCampaign features.** Only reference features that actually exist: goal steps, conditional branches, conditional content blocks, predictive sending, deal pipelines, tags, custom fields, custom objects (higher plans), site tracking, automations, segments, lists, forms, landing pages, campaigns, deep data integration, SMS add-on, machine learning optimized send time, attribution reports, event tracking, webhook actions. If you're unsure about a specific feature name or behavior, use generic language.
- **Use code formatting** (backticks in markdown) for specific AC feature names, tag conventions, field names, and numeric thresholds. Example: \`Wait until specific day/time\`, \`src-webinar\` tag convention, \`> 0.30%\` Gmail spam rate.
- **Every section must tell the reader what to DO**, not just describe a thing. Actionable over descriptive.
- **Avoid marketing buzzwords:** leverage, synergy, optimize (unless referring to a specific AC feature), unleash, supercharge, game-changing, revolutionize.

## BAD EXAMPLES (do not write)

- "I open forty ActiveCampaign accounts a month" — invented specific about Greg's own volume
- "Sequences convert at 0.8–2% while well-structured ones convert at 6–12%" — fabricated performance range
- "I worked with a course creator who did \\$1.2M last year" — invented specific client
- "67% of marketers say X" — made-up industry stat
- "These lifts compound to 40–80% revenue gains" — fabricated lift range

## GOOD EXAMPLES (do write)

- "In most accounts I audit, the welcome series stops at five emails and nothing happens between them"
- "A well-structured welcome series performs meaningfully better than a generic one"
- "Gmail's Postmaster Tools shows user-reported spam rates; anything above \`0.30%\` triggers throttling"
- "If your welcome series has seven emails and two generate the bulk of the revenue, the other five are dead weight"
- "The pattern I see across the accounts I work in: email one always pitches, and nothing in the sequence ever recovers"

${affiliateBlock}

## OUTPUT FORMAT

Pure markdown. No HTML. No YAML front-matter. No meta descriptions or SEO blocks. No wrapper.

Start with a top-level heading (\`# Title\`) then a one-sentence italicized lede (a single italic paragraph under the title, using markdown \`*italic*\` formatting). Then the body.

Do NOT include the words "Meta Description:" or "SEO keywords:" or "Published:" anywhere. The output should be drop-in-ready as a blog post body.

Begin now.`;
}

// ────────────────────────────────────────────────────────────────
// Claude API call
// ────────────────────────────────────────────────────────────────
async function callClaude(prompt, apiKey) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content = data.content?.[0]?.text;
  if (!content) {
    throw new Error(`Unexpected Anthropic response shape: ${JSON.stringify(data).slice(0, 500)}`);
  }
  return content;
}

// ────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────
async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('Missing ANTHROPIC_API_KEY. Run with: node --env-file=.env scripts/generate-post.mjs');
    process.exit(1);
  }

  // 1. Load queue
  const queueRaw = await readFile(QUEUE_PATH, 'utf8');
  const queue = JSON.parse(queueRaw);

  // 2. Pick next queued topic
  const topic = queue.find(t => t.status === 'queued');
  if (!topic) {
    console.log('No queued topics remain. Add more to content/topic-queue.json.');
    return;
  }

  console.log(`→ Drafting: "${topic.title}" [${topic.category}]`);

  // 3. Build prompt + call Claude
  const prompt = buildPrompt(topic);
  const markdown = await callClaude(prompt, apiKey);

  // 4. Write draft
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const slug = topic.id;
  const draftFilename = `${today}-${slug}.md`;
  const draftPath = path.join(DRAFTS_DIR, draftFilename);

  const wordCount = markdown.trim().split(/\s+/).length;
  const frontMatter = [
    '---',
    `topic_id: ${topic.id}`,
    `title: ${JSON.stringify(topic.title)}`,
    `category: ${topic.category}`,
    `drafted_at: ${new Date().toISOString()}`,
    `word_count: ${wordCount}`,
    topic.affiliate_opportunity ? `affiliate: ${topic.affiliate_opportunity.name}` : null,
    '---',
    '',
  ].filter(Boolean).join('\n');

  await writeFile(draftPath, frontMatter + '\n\n' + markdown.trimStart(), 'utf8');
  console.log(`✓ Wrote draft: ${path.relative(ROOT, draftPath)} (${wordCount} words)`);

  // 5. Update queue
  topic.status = 'drafted';
  topic.drafted_at = new Date().toISOString();
  await writeFile(QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n', 'utf8');
  console.log(`✓ Updated queue: ${topic.id} → drafted`);
}

main().catch(err => {
  console.error('Generator failed:', err);
  process.exit(1);
});
