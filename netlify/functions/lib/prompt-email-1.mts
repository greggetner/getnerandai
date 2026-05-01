/**
 * Email 1 personalization prompt.
 *
 * Claude generates ONLY the middle paragraph of the email — the human-feeling
 * "what your AI assistant picked up from your form" read. The wrapper text
 * around that paragraph is fixed (disclosure + CTA + signature) so only the
 * situational read varies.
 *
 * IMPORTANT — wrapper sync: the actual lead-facing send happens in AC's
 * automation builder via "Send 1-on-1 email" (Personal Sender / Gmail).
 * That AC step has the wrapper text hardcoded with a %AI_EMAIL_1_BODY%
 * merge tag where the paragraph goes. The wrapEmail() function below
 * builds the same email shape for internal alerts/previews so Greg sees
 * exactly what AC will send. If you change the wrapper here, change it
 * in AC's automation step too — see /docs/claude-email-1-setup.md for
 * the canonical paste-ready text.
 */

export type FormPayload = {
  name?: string
  email?: string
  company?: string
  existing_ac?: string
  list_size?: string
  revenue_band?: string
  engagement_type?: string
  timeline?: string
  context?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  referrer?: string
  landing_page?: string
}

export const SYSTEM_PROMPT = `You are an analytical AI reading an inbound consulting lead's pre-qualification form submitted to getner.ai. Greg Getner is an ActiveCampaign Certified Consultant. Your output is ONE paragraph — 2 to 4 sentences — that will appear inside an email Greg's AI assistant (you) sends back to the lead the moment they hit submit. The lead will be told upfront that this paragraph was AI-generated.

Your paragraph must:

1. REFERENCE ONE SPECIFIC THING. Pull a concrete detail from their \`context\` field (or another form answer if context is empty). Quote or paraphrase a phrase. Do not summarize the whole form — pick the sharpest signal in their answers.

2. RECOMMEND ONE TIER with a one-sentence reason grounded in their answers. Tiers:
   - Free audit ($0): read-only review, top 3 leverage moves. Right for: existing-ac users with smaller lists, "just exploring" timeline, anyone who wants a read before committing budget.
   - Paid audit ($147–$297): deeper diagnostic + 30-min walkthrough call. Right for: existing-ac users with revenue or established lists who want structured paid output.
   - Done-with-you ($300/hr, no minimum): senior strategist on call while their team builds. Right for: agencies, teams with internal capacity.
   - Done-for-you ($3K–$20K project): Greg plans, builds, ships. Right for: no internal capacity, urgent timelines, "ASAP" submissions, larger lists/revenue.

3. ASK ONE SPECIFIC CLARIFYING QUESTION. Not generic ("what's your budget?") — specific to their situation, the kind of question that would meaningfully change your recommendation.

CONSTRAINTS:
- 80 to 150 words total.
- Plain text. No bullets, no markdown, no headers, no asterisks.
- Conversational. Sounds like a sharp human read their form. Confident, direct, no jargon, no corporate filler.
- Do NOT invent prices, numbers, statistics, dates, features, or client outcomes.
- Do NOT use greetings ("Hi", "Hello", "Dear") — those are in the wrapper.
- Do NOT sign off — wrapper handles that.
- Do NOT address them by name — wrapper already did.
- Do NOT mention Calendly or scheduling — wrapper handles that too.
- Output ONLY the paragraph. No prefatory remarks like "Here is the paragraph:".`

export function buildUserPrompt(form: FormPayload): string {
  const data = {
    name: form.name || '(blank)',
    company: form.company || '(blank)',
    existing_ac: form.existing_ac || '(blank)',
    list_size: form.list_size || '(blank)',
    revenue_band: form.revenue_band || '(blank)',
    engagement_type: form.engagement_type || '(blank)',
    timeline: form.timeline || '(blank)',
    context: form.context || '(blank)',
    utm_source: form.utm_source || '(blank)',
    utm_medium: form.utm_medium || '(blank)',
    referrer: form.referrer || '(blank)',
  }

  return `Form submission:

Name: ${data.name}
Company: ${data.company}
Existing AC situation: ${data.existing_ac}
List size: ${data.list_size}
Monthly revenue band: ${data.revenue_band}
What they're looking for: ${data.engagement_type}
Timeline: ${data.timeline}
What's broken / what they want: ${data.context}

Captured signals (for your awareness, do not reference in the output):
- UTM source: ${data.utm_source}
- UTM medium: ${data.utm_medium}
- HTTP referrer: ${data.referrer}

Write the paragraph now.`
}

export function wrapEmail(opts: {
  firstName: string
  generatedParagraph: string
  calendlyUrl: string
}): { subject: string; preheader: string; body: string } {
  // Match the AC automation step's wrapper text exactly. AC can't read
  // generation duration into a 1-on-1 send, so we use "a few seconds" in
  // both places. The precise time is shown in the internal alert status
  // line for monitoring.
  const subject = 'Got your note — my AI read your form already'
  const preheader = `Drafted by my AI assistant in a few seconds. I'll read it personally too.`

  const body = `Hi ${opts.firstName},

Quick note before I read your form myself — this email was drafted by my AI assistant in a few seconds, the moment you hit submit. Here's what it picked up from your answers:

${opts.generatedParagraph.trim()}

I'll review this thread personally before any call — but if you want to see what an AI assistant like this one could do for your own AC account, that's exactly the kind of automation I build with the done-with-you and done-for-you tiers.

Calendar's here if you want to talk:
${opts.calendlyUrl}

— Greg
(and Claude)

Greg Getner
Boutique ActiveCampaign Management
getner.ai · greg@getner.ai`

  return { subject, preheader, body }
}
