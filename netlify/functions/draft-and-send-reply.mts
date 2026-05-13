/**
 * Webhook target for Netlify Forms submissions on getner.ai.
 *
 * Trigger: Netlify outgoing webhook configured per form (consult-request,
 * audit-request, migration-assessment, contact). Each form name maps to
 * a LeadSource in form-name → source below.
 *
 * The actual lead-handling logic (AC writes, Claude, Resend send) lives in
 * lib/lead-pipeline.mts, which is shared with process-directory-lead.mts
 * (the Zapier endpoint for AC consultants directory leads).
 *
 * Webhook security: shared-secret query param `?token=...` matched against
 * env var FORM_WEBHOOK_SECRET.
 *
 * IMPORTANT: We return 200 immediately and process the lead in the background
 * using ctx.waitUntil(). This prevents Netlify from retrying the webhook when
 * the pipeline takes >10s (Claude + AC + Resend), which was causing duplicate
 * emails to be sent to leads.
 */

import type { Context } from '@netlify/functions'
import { processLead } from './lib/lead-pipeline.mts'
import type { LeadPayload, LeadSource } from './lib/prompt-email-1.mts'

type NetlifyFormsPayload = {
  form_name?: string
  data?: Record<string, string>
}

const FORM_NAME_TO_SOURCE: Record<string, LeadSource> = {
  'consult-request': 'consult-form',
  'audit-request': 'audit-form',
  'migration-assessment': 'migration-form',
  contact: 'contact-form',
}

// Email format validator
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Idempotency: track recently processed emails to catch any duplicate
// webhook deliveries from the same function instance within 5 minutes.
const recentLeads = new Map<string, number>()
const DEDUP_WINDOW_MS = 5 * 60 * 1000

export default async (req: Request, ctx: Context) => {
  if (req.method !== 'POST') {
    return json({ error: 'POST only' }, 405)
  }

  const expected = Netlify.env.get('FORM_WEBHOOK_SECRET')
  if (!expected) {
    console.error('FORM_WEBHOOK_SECRET not set; refusing to run')
    return json({ error: 'misconfigured' }, 500)
  }
  const url = new URL(req.url)
  if (url.searchParams.get('token') !== expected) {
    console.warn('Bad webhook token from', req.headers.get('x-forwarded-for'))
    return json({ error: 'forbidden' }, 403)
  }

  let payload: NetlifyFormsPayload
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'invalid json' }, 400)
  }

  const source = FORM_NAME_TO_SOURCE[payload.form_name || '']
  if (!source) {
    console.log('Ignoring unmapped form:', payload.form_name)
    return json({ status: 'skipped', reason: 'unmapped form_name' }, 200)
  }

  const data = payload.data || {}
  if (!data.email) {
    return json({ error: 'no email in submission' }, 400)
  }

  // Validate email format.
  if (!EMAIL_RE.test(data.email)) {
    return json({ error: 'invalid email address' }, 400)
  }

  // Idempotency check: if same email processed recently from this instance,
  // skip silently. Prevents duplicates from same-instance webhook retries.
  const lastSeen = recentLeads.get(data.email)
  if (lastSeen && Date.now() - lastSeen < DEDUP_WINDOW_MS) {
    console.log('Duplicate webhook for', data.email, '-- skipping')
    return json({ status: 'duplicate', reason: 'already processing' }, 200)
  }
  recentLeads.set(data.email, Date.now())

  // Map Netlify Forms field names → LeadPayload.
  const lead: LeadPayload = {
    source,
    email: data.email,
    name: data.name,
    company: data.company,
    phone: data.phone,
    context: data.context ? data.context.slice(0, 2000) : data.context,
    existing_ac: data.existing_ac,
    list_size: data.list_size,
    revenue_band: data.revenue_band,
    engagement_type: data.engagement_type,
    timeline: data.timeline,
    business_type: data.business_type,
    primary_goal: data.primary_goal,
    current_platform: data.current_platform,
    concern: data.concern,
    experience: data.experience,
    challenge: data.challenge ? data.challenge.slice(0, 2000) : data.challenge,
    transcript: data.transcript ? data.transcript.slice(0, 3000) : data.transcript,
    question_count: data.question_count,
    utm_source: data.utm_source,
    utm_medium: data.utm_medium,
    utm_campaign: data.utm_campaign,
    utm_term: data.utm_term,
    utm_content: data.utm_content,
    http_referrer: data.referrer || data.http_referrer,
    landing_page: data.landing_page,
  }

  // Return 200 immediately so Netlify doesn't retry the webhook.
  // Process the lead in the background via ctx.waitUntil().
  // This is the key fix for duplicate sends -- Netlify was retrying because
  // the pipeline (Claude + AC + Resend) took >10s to complete.
  ctx.waitUntil(
    processLead(lead).catch((err) => {
      console.error('Background lead processing failed for', lead.email, ':', err)
    })
  )

  return json({ status: 'accepted' }, 200)
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
