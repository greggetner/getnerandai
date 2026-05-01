#!/usr/bin/env node
/**
 * Eval harness for the Email 1 personalization prompt.
 *
 * Loads sample-payloads.json, runs each through Claude (same prompt + model
 * the live function uses), prints outputs side-by-side with expected tier so
 * you can scan for misses before deploying prompt changes.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... node netlify/functions/eval/run-eval.mjs
 *   ANTHROPIC_API_KEY=sk-ant-... node netlify/functions/eval/run-eval.mjs --id=fast-growth-ecom
 *   ANTHROPIC_API_KEY=sk-ant-... node netlify/functions/eval/run-eval.mjs --json
 *
 * Cost: ~$0.001-0.005 per case on Sonnet 4.6. Eight cases = ~$0.03 per full run.
 */

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const CLAUDE_MODEL = 'claude-sonnet-4-6'

// Inline copy of the prompt (mts file isn't directly node-runnable). Keep in sync.
async function loadPrompt() {
  const file = join(__dirname, '..', 'lib', 'prompt-email-1.mts')
  const src = await readFile(file, 'utf8')
  const sysMatch = src.match(/SYSTEM_PROMPT = `([\s\S]+?)`/)
  if (!sysMatch) throw new Error('Could not parse SYSTEM_PROMPT from prompt-email-1.mts')
  return sysMatch[1]
}

function buildUserPrompt(form) {
  const f = (k, dflt = '(blank)') => form[k] || dflt
  return `Form submission:

Name: ${f('name')}
Company: ${f('company')}
Existing AC situation: ${f('existing_ac')}
List size: ${f('list_size')}
Monthly revenue band: ${f('revenue_band')}
What they're looking for: ${f('engagement_type')}
Timeline: ${f('timeline')}
What's broken / what they want: ${f('context')}

Captured signals (for your awareness, do not reference in the output):
- UTM source: ${f('utm_source')}
- UTM medium: ${f('utm_medium')}
- HTTP referrer: ${f('referrer')}

Write the paragraph now.`
}

async function callClaude(systemPrompt, form) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('Missing ANTHROPIC_API_KEY env var')
    process.exit(1)
  }
  const start = Date.now()
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 400,
      system: systemPrompt,
      messages: [{ role: 'user', content: buildUserPrompt(form) }],
    }),
  })
  const elapsed = Date.now() - start
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Anthropic API ${res.status}: ${txt.slice(0, 500)}`)
  }
  const data = await res.json()
  return {
    paragraph: data.content?.[0]?.text || '',
    elapsed_ms: elapsed,
    input_tokens: data.usage?.input_tokens,
    output_tokens: data.usage?.output_tokens,
  }
}

function quickChecks(paragraph, expectedTier) {
  const lower = paragraph.toLowerCase()
  const wordCount = paragraph.split(/\s+/).filter(Boolean).length
  const tierMatches = {
    'Free audit': /free audit/.test(lower),
    'Paid audit': /paid audit/.test(lower),
    'Done-with-you': /done-with-you|dwy|\$300\/hr|hourly/.test(lower),
    'Done-for-you': /done-for-you|dfy|\$3k|\$20k|build it|ship it|plan.+build/.test(lower),
  }
  return {
    word_count: wordCount,
    in_range: wordCount >= 60 && wordCount <= 180,
    tier_matched: tierMatches[expectedTier] === true,
    has_bullets: /^\s*[-*•]/m.test(paragraph),
    has_greeting: /^(hi|hello|dear|hey)\b/i.test(paragraph.trim()),
    has_signoff: /—\s*greg|sincerely|best,|cheers,/i.test(paragraph),
  }
}

async function main() {
  const args = process.argv.slice(2)
  const idArg = args.find((a) => a.startsWith('--id='))?.slice('--id='.length)
  const jsonOut = args.includes('--json')

  const systemPrompt = await loadPrompt()
  const all = JSON.parse(
    await readFile(join(__dirname, 'sample-payloads.json'), 'utf8')
  )
  const cases = idArg ? all.filter((c) => c.id === idArg) : all
  if (idArg && cases.length === 0) {
    console.error(`No case with id "${idArg}"`)
    process.exit(1)
  }

  const results = []
  for (const c of cases) {
    const out = await callClaude(systemPrompt, c.form)
    const checks = quickChecks(out.paragraph, c.expected_tier)
    results.push({ id: c.id, expected_tier: c.expected_tier, ...out, checks })
  }

  if (jsonOut) {
    console.log(JSON.stringify(results, null, 2))
    return
  }

  for (const r of results) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Case: ${r.id}`)
    console.log(`Expected tier: ${r.expected_tier}`)
    console.log(
      `${r.elapsed_ms}ms · ${r.input_tokens}→${r.output_tokens} tokens · words: ${r.checks.word_count} ${r.checks.in_range ? '✓' : '✗'}`
    )
    const flags = []
    if (!r.checks.tier_matched) flags.push(`✗ expected tier "${r.expected_tier}" not mentioned`)
    if (r.checks.has_bullets) flags.push('✗ contains bullets')
    if (r.checks.has_greeting) flags.push('✗ has greeting')
    if (r.checks.has_signoff) flags.push('✗ has signoff')
    if (flags.length === 0) console.log('Flags: (none)')
    else for (const f of flags) console.log(`  ${f}`)
    console.log('')
    console.log(r.paragraph)
    console.log('')
  }

  const passed = results.filter((r) => {
    const c = r.checks
    return c.in_range && c.tier_matched && !c.has_bullets && !c.has_greeting && !c.has_signoff
  }).length
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`${passed}/${results.length} passed all heuristic checks`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
