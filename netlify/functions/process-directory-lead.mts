/**
 * Webhook target for AC Certified Consultant directory leads.
 *
 * TRIGGER OPTIONS — choose one and configure it:
 *
 * OPTION A — Zapier (current/original approach):
 *   A Zapier zap watches greg@getner.ai's Gmail for inbound messages from
 *   website@activecampaign.com with subject "A submission from the
 *   ActiveCampaign consultants directory", parses the email body into
 *   structured fields, and POSTs JSON here.
 *
 *   Expected Zapier JSON payload shape:
 *     {
 *       "name":    "Sabrina Herring",
 *       "email":   "sabrina@example.com",
 *       "company": "JetStream Security",
 *       "phone":   "8138103178",
 *       "context": "We are a seed-funded ..."
 *     }
 *
 * OPTION B — Gmail filter + raw email forwarding (not yet set up):
 *   MANUAL SETUP REQUIRED: A Gmail filter on greg@getner.ai (or a Google
 *   Apps Script) must forward emails from website@activecampaign.com with
 *   subject "A submission from the ActiveCampaign consultants directory"
 *   to this function's endpoint as a raw HTTP POST. The function will then
 *   parse the plain-text email body itself (see parseAcDirectoryEmail below).
 *
 *   Until that forwarding is set up, this function will not fire
 *   automatically for AC directory leads. The Zapier path (Option A) remains
 *   the live approach.
 *
 * Webhook security: shared-secret query param `?token=...` matched against
 * env var FORM_WEBHOOK_SECRET (same secret as the Netlify Forms webhook).
 */

import type { Context } from '@netlify/functions'
import { processLead } from './lib/lead-pipeline.mts'
import type { LeadPayload } from './lib/prompt-email-1.mts'

// ─── Types ───────────────────────────────────────────────────────────────────

/** Pre-parsed payload — what Zapier (Option A) POSTs here. */
type DirectoryPayload = {
  name?: string
  email?: string
  company?: string
  phone?: string
  context?: string
}

/**
 * Raw inbound email format — what a Gmail filter / Google Apps Script
 * (Option B) would POST here. The body is the plain-text email content from
 * ActiveCampaign. This function parses it into DirectoryPayload fields.
 *
 * Expected body keys from AC directory email:
 *   Name, Company, Email Address, Phone,
 *   What are you looking to accomplish?
 */
type RawEmailPayload = {
  subject?: string
  body?: string       // plain-text body of the forwarded email
  from?: string       // sender address (should be website@activecampaign.com)
  // Zapier sometimes sends these as top-level fields too:
  name?: string
  email?: string
  company?: string
  phone?: string
  context?: string
}

// ─── Email body parser ────────────────────────────────────────────────────────

/**
 * Parses the plain-text body of an AC consultants directory submission email.
 *
 * The email body looks like:
 *   Name: Sabrina Herring
 *   Company: JetStream Security
 *   Email Address: sabrina@example.com
 *   Phone: 813-810-3178
 *   What are you looking to accomplish? We are a seed-funded startup ...
 *
 * Lines may be separated by \n or \r\n; the label and value are separated by
 * a colon + optional whitespace. Multi-line answers (context field) are
 * captured by reading everything until the next label or end of body.
 */
function parseAcDirectoryEmail(body: string): DirectoryPayload {
  const result: DirectoryPayload = {}
  if (!body) return result

  // Normalise line endings.
  const lines = body.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')

  // Walk line-by-line; collect label → value(s).
  let currentKey: keyof DirectoryPayload | null = null
  let currentValue: string[] = []

  const flush = () => {
    if (currentKey && currentValue.length) {
      result[currentKey] = currentValue.join(' ').trim()
    }
    currentKey = null
    currentValue = []
  }

  for (const raw of lines) {
    const line = raw.trim()

    // Detect label lines ("Label: value" or "Label?" followed by value on same line).
    const labelMatch = line.match(/^([^:?]+[?:]?)\s*:\s*(.*)$/)
    if (labelMatch) {
      const label = labelMatch[1].trim().toLowerCase()
      const rest = labelMatch[2].trim()

      if (label === 'name') {
        flush()
        currentKey = 'name'
        currentValue = rest ? [rest] : []
        continue
      }
      if (label === 'company') {
        flush()
        currentKey = 'company'
        currentValue = rest ? [rest] : []
        continue
      }
      if (label === 'email address' || label === 'email') {
        flush()
        currentKey = 'email'
        currentValue = rest ? [rest] : []
        continue
      }
      if (label === 'phone') {
        flush()
        currentKey = 'phone'
        currentValue = rest ? [rest] : []
        continue
      }
      if (
        label.startsWith('what are you looking') ||
        label.startsWith('looking to accomplish') ||
        label === 'context'
      ) {
        flush()
        currentKey = 'context'
        currentValue = rest ? [rest] : []
        continue
      }

      // Unknown label — flush current and skip.
      flush()
      continue
    }

    // Continuation line for multi-line values (e.g. long "context" answers).
    if (currentKey && line) {
      currentValue.push(line)
    }
  }
  flush()

  return result
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async (req: Request, _ctx: Context) => {
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

  let raw: RawEmailPayload
  try {
    raw = await req.json()
  } catch {
    return json({ error: 'invalid json' }, 400)
  }

  // Detect whether this is a raw email forward (Option B) or a Zapier
  // pre-parsed payload (Option A).
  //
  // Option B: payload has a "body" field (the raw email text).
  // Option A: payload has name/email/company/etc. directly.
  let parsed: DirectoryPayload
  if (raw.body) {
    // Option B: raw email — parse the body text.
    console.log('process-directory-lead: received raw email body, parsing…')
    parsed = parseAcDirectoryEmail(raw.body)

    // Validate sender to reduce spam risk.
    if (raw.from && !raw.from.includes('activecampaign.com')) {
      console.warn('process-directory-lead: unexpected sender:', raw.from)
      return json({ error: 'unexpected sender' }, 403)
    }
  } else {
    // Option A: Zapier pre-parsed — use fields directly.
    parsed = {
      name: raw.name,
      email: raw.email,
      company: raw.company,
      phone: raw.phone,
      context: raw.context,
    }
  }

  if (!parsed.email) {
    return json({ error: 'no email in payload' }, 400)
  }

  const lead: LeadPayload = {
    source: 'ac-cert-directory',
    email: parsed.email,
    name: parsed.name,
    company: parsed.company,
    phone: parsed.phone,
    context: parsed.context,
  }

  const result = await processLead(lead)
  return json(result, result.status === 'error' ? 500 : 200)
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
