/**
 * Email 1 personalization prompt + email wrappers.
 *
 * Claude returns JSON: { subject, paragraph }.
 *   - subject: dynamic, references something specific from the lead's submission
 *   - paragraph: 2-4 sentence personalized read of their situation
 *
 * The lead-facing send happens via Resend directly from the lead-pipeline
 * (not via AC's Personal Sender). Reply-To is greg@getner.ai so replies land
 * in Greg's Gmail and continue normally.
 *
 * If Claude fails, wrapFallbackEmail() builds a plain "got your note" send
 * with no AI disclosure — just a fast acknowledgment so the lead hears
 * from someone within seconds.
 */

export type LeadSource =
  | 'consult-form' // /consult/ form on getner.ai
  | 'audit-form' // /audit/ Hyper-Pareto audit form
  | 'migration-form' // /free-migration/ assessment form
  | 'application-form' // Apply modal
  | 'contact-form' // generic Contact form
  | 'ai-terminal' // AI terminal email capture
  | 'ac-cert-directory' // AC consultants directory (via Zapier from Gmail)

export type LeadPayload = {
  source: LeadSource

  // Identity
  email: string
  name?: string
  company?: string
  phone?: string

  // Free-text "tell me about your situation" — Claude reads this primarily
  context?: string

  // Structured form fields (vary by source)
  existing_ac?: string
  list_size?: string
  revenue_band?: string
  engagement_type?: string
  timeline?: string
  business_type?: string
  primary_goal?: string
  current_platform?: string
  concern?: string
  experience?: string
  challenge?: string
  transcript?: string
  question_count?: string

  // Captured signals
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  http_referrer?: string
  landing_page?: string
}

export const SYSTEM_PROMPT = `You are an analytical AI reading an inbound consulting lead's submission to getner.ai. Greg Getner is an ActiveCampaign Certified Consultant. Submissions can come from a web form (consult, audit, migration, contact) or from the AC consultants directory (a free-text inquiry forwarded by ActiveCampaign).

Your output is a single JSON object with exactly two fields:

{
  "subject": "...",
  "paragraph": "..."
}

The lead will be told upfront in the body that this email was AI-drafted. Greg reviews drafts before they go out.

SUBJECT REQUIREMENTS:
- 30 to 70 characters
- References ONE specific thing from their submission — their company name, their stack, a phrase they wrote, or the situation they described. The lead should see the subject and immediately think "that's about me."
- Do NOT mention AI, "I read your form/note," or anything self-referential — the body discloses that
- No clickbait, no questions, no emojis, no exclamation marks
- Examples of GOOD subjects:
  * "JetStream Security: AC stack first, Marketo later"
  * "Quick read on your welcome-series 1.2% conversion"
  * "On the contractor-handoff AC cleanup"
  * "Bright Atlas — 500K list, agency build approach"
- Examples of BAD subjects:
  * "Got your form!" (generic)
  * "Re: Your inquiry" (generic, looks like a reply)
  * "AI-drafted: my read on your submission" (mentions AI)
  * "Quick question for {{firstname}}" (template-shaped)

PARAGRAPH REQUIREMENTS:
The paragraph is the body of the email — 2 to 4 sentences, conversational, the kind of read a sharp human would give after reading their submission once.

It must:

1. REFERENCE ONE SPECIFIC THING from their submission. Quote or paraphrase a phrase from their context/message. Don't summarize the whole thing — pick the sharpest signal.

2. RECOMMEND ONE TIER with a one-sentence reason grounded in their answers. Tiers:
   - Free audit ($0): read-only review, top 3 leverage moves. Right for: existing-ac users with smaller lists, "just exploring" timeline, anyone who wants a read before committing budget.
   - Paid audit ($147–$297): deeper diagnostic + 30-min walkthrough call. Right for: existing-ac users with revenue or established lists who want structured paid output.
   - Done-with-you ($300/hr, no minimum): senior strategist on call while their team builds. Right for: agencies, teams with internal capacity.
   - Done-for-you ($3K–$20K project): Greg plans, builds, ships. Right for: no internal capacity, urgent timelines, "ASAP" submissions, larger lists/revenue, or fast-growth companies that need to move now.

3. ASK ONE SPECIFIC CLARIFYING QUESTION. Specific to their situation, the kind of question that would meaningfully change your recommendation. Not generic ("what's your budget?").

PARAGRAPH CONSTRAINTS:
- 80 to 150 words.
- Plain text. No bullets, no markdown, no headers, no asterisks.
- Conversational. Confident, direct, no jargon, no corporate filler.
- Do NOT invent prices, numbers, statistics, dates, features, or client outcomes that weren't in their submission.
- Do NOT use greetings ("Hi", "Hello", "Dear") — wrapper handles that.
- Do NOT sign off — wrapper handles that.
- Do NOT address them by name — wrapper handles that.
- Do NOT mention Calendly or scheduling — wrapper handles that.

OUTPUT FORMAT:
- Return ONLY the JSON object. No prose before/after, no markdown fence, no preamble like "Here is the JSON:".
- Both fields must be valid JSON strings. Escape any internal quotes/newlines correctly.`

export function buildUserPrompt(p: LeadPayload): string {
  const lines: string[] = []
  lines.push(`Submission source: ${describeSource(p.source)}`)
  lines.push('')
  lines.push(`Name: ${p.name || '(blank)'}`)
  if (p.company) lines.push(`Company: ${p.company}`)
  if (p.phone) lines.push(`Phone: ${p.phone}`)

  const structured: Array<[string, string | undefined]> = [
    ['Existing AC situation', p.existing_ac],
    ['List size', p.list_size],
    ['Monthly revenue band', p.revenue_band],
    ["What they're looking for", p.engagement_type],
    ['Timeline', p.timeline],
    ['Business type', p.business_type],
    ['Primary goal', p.primary_goal],
    ['Current platform', p.current_platform],
    ['AC experience', p.experience],
  ]
  for (const [label, val] of structured) {
    if (val) lines.push(`${label}: ${val}`)
  }

  // Free-text fields — AI reads these primarily. Include all that have content;
  // an audit-form lead may have `concern` instead of `context`, etc.
  const freeText: Array<[string, string | undefined]> = [
    ["What they wrote (context)", p.context],
    ['Concern', p.concern],
    ['Challenge', p.challenge],
    ['Transcript excerpt', p.transcript],
  ]
  const anyFreeText = freeText.some(([_, v]) => v)
  if (anyFreeText) {
    lines.push('')
    for (const [label, val] of freeText) {
      if (val) lines.push(`${label}: ${val}`)
    }
  }

  // Captured signals (don't reference in output)
  const signals: string[] = []
  if (p.utm_source) signals.push(`UTM source: ${p.utm_source}`)
  if (p.utm_medium) signals.push(`UTM medium: ${p.utm_medium}`)
  if (p.utm_campaign) signals.push(`UTM campaign: ${p.utm_campaign}`)
  if (p.http_referrer) signals.push(`HTTP referrer: ${p.http_referrer}`)
  if (signals.length) {
    lines.push('')
    lines.push('Captured signals (for awareness, do not reference in output):')
    for (const s of signals) lines.push(`- ${s}`)
  }

  lines.push('')
  lines.push('Return the JSON now.')
  return lines.join('\n')
}

function describeSource(s: LeadSource): string {
  switch (s) {
    case 'consult-form':
      return '/consult/ pre-qualification form on getner.ai'
    case 'audit-form':
      return '/audit/ Hyper-Pareto audit request on getner.ai'
    case 'migration-form':
      return '/free-migration/ migration assessment on getner.ai'
    case 'application-form':
      return 'Apply modal on getner.ai'
    case 'contact-form':
      return 'Contact form on getner.ai'
    case 'ai-terminal':
      return 'AI terminal email capture on getner.ai'
    case 'ac-cert-directory':
      return 'ActiveCampaign Certified Consultant directory (lead found Greg via the AC consultants directory)'
  }
}

/**
 * Parse Claude's JSON output. Tolerates markdown fences and minor preambles
 * that Sonnet occasionally emits despite the prompt's "no preamble" rule.
 */
export function parseClaudeJson(raw: string): { subject: string; paragraph: string } {
  let s = raw.trim()
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start === -1 || end === -1) {
    throw new Error(`Claude output had no JSON object: ${raw.slice(0, 200)}`)
  }
  const json = s.slice(start, end + 1)
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error(`Claude output JSON parse failed: ${json.slice(0, 200)}`)
  }
  const obj = parsed as { subject?: unknown; paragraph?: unknown }
  if (typeof obj.subject !== 'string' || typeof obj.paragraph !== 'string') {
    throw new Error(`Claude output missing subject/paragraph: ${JSON.stringify(parsed).slice(0, 200)}`)
  }
  return { subject: obj.subject.trim(), paragraph: obj.paragraph.trim() }
}

/**
 * Build the lead-facing email when Claude succeeded. Sent via Resend.
 * Reply-To is greg@getner.ai so the lead's reply lands in Greg's Gmail.
 */
export function wrapEmail(opts: {
  firstName: string
  subject: string
  paragraph: string
  calendlyUrl: string
}): { subject: string; body: string } {
  const body = `Hi ${opts.firstName},

Heads up — this email was AI-drafted the second you hit submit. The read below is real; I (Greg, the human) wrote the prompt and review every send, but the words came from the AI assistant I built into my pipeline so you'd get a useful response in 4 seconds instead of waiting two business days for me.

${opts.paragraph.trim()}

Two ways to take this further:
→ Reply with your answer to the question above (lands in my Gmail, I'll reply personally within a business day)
→ Or grab time directly: ${opts.calendlyUrl}

— Greg

Greg Getner · Boutique ActiveCampaign Management
greg@getner.ai · getner.ai · AC Certified Consultant

P.S. The thing you just experienced — AI assistant reading inbound leads, drafting personalized first replies in your voice, alerting you so you can intervene — is exactly what I build for AC clients. If that's interesting, hit reply with "how" and I'll walk you through the build.`
  return { subject: opts.subject, body }
}

/**
 * Build the lead-facing email when Claude failed. No AI disclosure (no AI
 * involved in this send), just a fast human acknowledgment.
 */
export function wrapFallbackEmail(opts: {
  firstName: string
  calendlyUrl: string
}): { subject: string; body: string } {
  return {
    subject: 'Got your note — Greg here',
    body: `Hi ${opts.firstName},

Got your submission. My usual flow is for an AI assistant to draft a read of your message within seconds, but it hiccupped this time — nothing to worry about, I just wanted you to hear from someone fast.

I'll personally review what you sent and reply within one business day. If you'd rather skip the wait, grab time directly:
${opts.calendlyUrl}

— Greg

Greg Getner · Boutique ActiveCampaign Management
greg@getner.ai · getner.ai · AC Certified Consultant`,
  }
}
