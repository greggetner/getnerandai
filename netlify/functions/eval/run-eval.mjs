#!/usr/bin/env node
/**
 * Eval harness for the Email 1 personalization prompt.
 *
 * Loads sample-payloads.json, runs each through Claude (same prompt + model
 * the live function uses), prints subject + paragraph + heuristic checks so
 * you can scan for misses before deploying prompt changes.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... node netlify/functions/eval/run-eval.mjs
 *   ANTHROPIC_API_KEY=sk-ant-... node netlify/functions/eval/run-eval.mjs --id=fast-growth-ecom
 *   ANTHROPIC_API_KEY=sk-ant-... node netlify/functions/eval/run-eval.mjs --json
 *
 * Cost: ~$0.001-0.005 per case on Sonnet 4.6.
 */

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const CLAUDE_MODEL = 'claude-sonnet-4-6'

// Inline copies — keep in sync with lib/prompt-email-1.mts
async function loadPrompt() {
  const file = join(__dirname, '..', 'lib', 'prompt-email-1.mts')
  const src = await readFile(file, 'utf8')
  const sysMatch = src.match(/SYSTEM_PROMPT = `([\s\S]+?)`/)
  if (!sysMatch) throw new Error('Could not parse SYSTEM_PROMPT from prompt-email-1.mts')
  return sysMatch[1]
}

function describeSource(s) {
  switch (s) {
    case 'consult-form': return '/consult/ pre-qualification form on getner.ai'
    case 'audit-form': return '/audit/ Hyper-Pareto audit request on getner.ai'
    case 'migration-form': return '/free-migration/ migration assessment on getner.ai'
    case 'application-form': return 'Apply modal on getner.ai'
    case 'contact-form': return 'Contact form on getner.ai'
    case 'ai-terminal': return 'AI terminal email capture on getner.ai'
    case 'ac-cert-directory': return 'ActiveCampaign Certified Consultant directory (lead found Greg via the AC consultants directory)'
    default: return s
  }
}

function buildUserPrompt(form, source = 'consult-form') {
  const lines = []
  lines.push(`Submission source: ${describeSource(source)}`)
  lines.push('')
  lines.push(`Name: ${form.name || '(blank)'}`)
  if (form.company) lines.push(`Company: ${form.company}`)
  if (form.phone) lines.push(`Phone: ${form.phone}`)

  const structured = [
    ['Existing AC situation', form.existing_ac],
    ['List size', form.list_size],
    ['Monthly revenue band', form.revenue_band],
    ["What they're looking for", form.engagement_type],
    ['Timeline', form.timeline],
    ['Business type', form.business_type],
    ['Primary goal', form.primary_goal],
    ['Current platform', form.current_platform],
    ['AC experience', form.experience],
  ]
  for (const [label, val] of structured) if (val) lines.push(`${label}: ${val}`)

  const freeText = [
    ['What they wrote (context)', form.context],
    ['Concern', form.concern],
    ['Challenge', form.challenge],
    ['Transcript excerpt', form.transcript],
  ]
  if (freeText.some(([_, v]) => v)) {
    lines.push('')
    for (const [label, val] of freeText) if (val) lines.push(`${label}: ${val}`)
  }

  const signals = []
  if (form.utm_source) signals.push(`UTM source: ${form.utm_source}`)
  if (form.utm_medium) signals.push(`UTM medium: ${form.utm_medium}`)
  if (form.utm_campaign) signals.push(`UTM campaign: ${form.utm_campaign}`)
  if (form.referrer) signals.push(`HTTP referrer: ${form.referrer}`)
  if (form.http_referrer) signals.push(`HTTP referrer: ${form.http_referrer}`)
  if (signals.length) {
    lines.push('')
    lines.push('Captured signals (for awareness, do not reference in output):')
    for (const s of signals) lines.push(`- ${s}`)
  }

  lines.push('')
  lines.push('Return the JSON now.')
  return lines.join('\n')
}

function parseClaudeJson(raw) {
  let s = raw.trim()
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error(`No JSON object: ${raw.slice(0, 200)}`)
  const json = s.slice(start, end + 1)
  const parsed = JSON.parse(json)
  if (typeof parsed.subject !== 'string' || typeof parsed.paragraph !== 'string') {
    throw new Error(`Missing subject/paragraph: ${JSON.stringify(parsed).slice(0, 200)}`)
  }
  return { subject: parsed.subject.trim(), paragraph: parsed.paragraph.trim() }
}

async function callClaude(systemPrompt, form, source) {
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
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: 'user', content: buildUserPrompt(form, source) }],
    }),
  })
  const elapsed = Date.now() - start
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Anthropic API ${res.status}: ${txt.slice(0, 500)}`)
  }
  const data = await res.json()
  const raw = data.content?.[0]?.text || ''
  let parsed
  let parseError = null
  try {
    parsed = parseClaudeJson(raw)
  } catch (e) {
    parseError = String(e)
    parsed = { subject: '', paragraph: raw }
  }
  return {
    subject: parsed.subject,
    paragraph: parsed.paragraph,
    parse_error: parseError,
    elapsed_ms: elapsed,
    input_tokens: data.usage?.input_tokens,
    output_tokens: data.usage?.output_tokens,
  }
}

function quickChecks(subject, paragraph, expectedTier) {
  const lower = paragraph.toLowerCase()
  const wordCount = paragraph.split(/\s+/).filter(Boolean).length
  const tierMatches = {
    'Free audit': /free audit/.test(lower),
    'Paid audit': /paid audit/.test(lower),
    'Done-with-you': /done-with-you|dwy|\$300\/hr|hourly/.test(lower),
    'Done-for-you': /done-for-you|dfy|\$3k|\$20k|build it|ship it|plan.+build/.test(lower),
  }
  return {
    subject_length: subject.length,
    subject_in_range: subject.length >= 25 && subject.length <= 80,
    subject_no_ai_mention: !/\bai\b|claude|gpt|assistant|chatbot|automated/i.test(subject),
    subject_no_template_brackets: !/\{\{|\}\}|<[^>]+>/.test(subject),
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
    const out = await callClaude(systemPrompt, c.form, c.source || 'consult-form')
    const checks = quickChecks(out.subject, out.paragraph, c.expected_tier)
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
      `${r.elapsed_ms}ms · ${r.input_tokens}→${r.output_tokens} tokens · subj ${r.checks.subject_length}ch ${r.checks.subject_in_range ? '✓' : '✗'} · body ${r.checks.word_count}w ${r.checks.in_range ? '✓' : '✗'}`
    )
    if (r.parse_error) console.log(`✗ JSON parse error: ${r.parse_error}`)
    const flags = []
    if (!r.checks.subject_in_range) flags.push(`✗ subject length out of range (${r.checks.subject_length})`)
    if (!r.checks.subject_no_ai_mention) flags.push('✗ subject mentions AI')
    if (!r.checks.subject_no_template_brackets) flags.push('✗ subject has template brackets')
    if (!r.checks.tier_matched) flags.push(`✗ expected tier "${r.expected_tier}" not mentioned`)
    if (r.checks.has_bullets) flags.push('✗ paragraph contains bullets')
    if (r.checks.has_greeting) flags.push('✗ paragraph has greeting')
    if (r.checks.has_signoff) flags.push('✗ paragraph has signoff')
    if (flags.length === 0) console.log('Flags: (none)')
    else for (const f of flags) console.log(`  ${f}`)
    console.log('')
    console.log(`SUBJECT: ${r.subject}`)
    console.log('')
    console.log(r.paragraph)
    console.log('')
  }

  const passed = results.filter((r) => {
    const c = r.checks
    return (
      !r.parse_error &&
      c.in_range &&
      c.subject_in_range &&
      c.subject_no_ai_mention &&
      c.subject_no_template_brackets &&
      c.tier_matched &&
      !c.has_bullets &&
      !c.has_greeting &&
      !c.has_signoff
    )
  }).length
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`${passed}/${results.length} passed all heuristic checks`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
