/**
 * Webhook target for AC Certified Consultant directory leads, forwarded
 * via a Zapier zap that watches greg@getner.ai's Gmail for inbound
 * messages from website@activecampaign.com with the directory submission
 * subject line.
 *
 * Zapier parses the email body into structured fields and POSTs JSON here.
 * Expected payload shape:
 *   {
 *     "name": "Sabrina Herring",
 *     "email": "sabrina@example.com",
 *     "company": "JetStream Security",
 *     "phone": "8138103178",
 *     "context": "We are a seed-funded ...",
 *     "source": "ac-cert-directory"   // optional; we set it ourselves
 *   }
 *
 * Webhook security: shared-secret query param `?token=...` matched against
 * env var FORM_WEBHOOK_SECRET (same secret as the Netlify Forms webhook).
 */

import type { Context } from '@netlify/functions'
import { processLead } from './lib/lead-pipeline.mts'
import type { LeadPayload } from './lib/prompt-email-1.mts'

type DirectoryPayload = {
  name?: string
  email?: string
  company?: string
  phone?: string
  context?: string
}

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

  let payload: DirectoryPayload
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'invalid json' }, 400)
  }

  if (!payload.email) {
    return json({ error: 'no email in payload' }, 400)
  }

  const lead: LeadPayload = {
    source: 'ac-cert-directory',
    email: payload.email,
    name: payload.name,
    company: payload.company,
    phone: payload.phone,
    context: payload.context,
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
