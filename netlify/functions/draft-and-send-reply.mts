/**
 * Webhook target for the /consult/ form submission.
 *
 * Trigger: Netlify Forms outgoing webhook (configured in Netlify dashboard
 * for the `consult-request` form).
 *
 * The lead-facing email is sent by AC's Personal Sender (Gmail OAuth) via
 * an automation step — not by Resend. This function's job is to:
 *
 *   1. Parse Netlify Forms webhook payload
 *   2. Call Claude (Sonnet 4.6) for a personalized 2-4 sentence read
 *   3. Create or update AC contact, write all form fields + the AI paragraph
 *   4. Add the trigger tag `consult-form-submitted` LAST (this fires the
 *      AC automation, which sends the 1-on-1 email via Personal Sender)
 *   5. Send an internal alert email to Greg (via Resend) with full context
 *
 * Order matters: the trigger tag MUST be last so the AC automation sees
 * %AI_EMAIL_1_BODY% populated when it fires.
 *
 * Fallback for Claude failure: the contact is still created and tagged.
 * AC's automation has an If/Else: if %AI_EMAIL_1_BODY% is empty, send
 * the template Email 1 (a campaign send) instead of the AI 1-on-1.
 *
 * Webhook security: shared-secret query param `?token=...` matched
 * against env var FORM_WEBHOOK_SECRET.
 */

import type { Context } from '@netlify/functions'
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
  wrapEmail,
  type FormPayload,
} from './lib/prompt-email-1.mts'
import {
  createOrUpdateContact,
  addTagToContact,
  addContactToList,
  setFieldValue,
} from './lib/ac-client.mts'
import { sendEmail } from './lib/resend-client.mts'

const CLAUDE_MODEL = 'claude-sonnet-4-6'
const CALENDLY_URL = 'https://calendly.com/getner/activecampaign-strategy-session'
const AC_LIST_ID_CERT_LEADS = 4 // ac-cert-leads list
const AC_UI_BASE = 'https://accpgreggetner.activehosted.com'

type NetlifyFormsPayload = {
  form_name?: string
  data?: Record<string, string>
}

export default async (req: Request, _ctx: Context) => {
  if (req.method !== 'POST') {
    return json({ error: 'POST only' }, 405)
  }

  // Shared-secret check.
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
  } catch (err) {
    return json({ error: 'invalid json' }, 400)
  }

  // We only handle consult-request right now.
  if (payload.form_name !== 'consult-request') {
    console.log('Ignoring form:', payload.form_name)
    return json({ status: 'skipped', reason: 'wrong form' }, 200)
  }

  const form: FormPayload = payload.data || {}
  if (!form.email) {
    return json({ error: 'no email in submission' }, 400)
  }

  const firstName = (form.name || '').trim().split(/\s+/)[0] || 'there'
  const lastName = (form.name || '').trim().split(/\s+/).slice(1).join(' ')

  const acCfg = {
    apiUrl: Netlify.env.get('AC_API_URL') || '',
    apiKey: Netlify.env.get('AC_API_KEY') || '',
  }

  // Step 1: AC contact create/update + non-trigger tags + form-data fields.
  // We hold off on the trigger tag (`consult-form-submitted`) until after
  // Claude succeeds and the AI paragraph is written to the field — that way
  // the AC automation always has the body populated when it fires.
  let acContactId = ''
  try {
    if (!acCfg.apiUrl || !acCfg.apiKey) {
      throw new Error('AC_API_URL or AC_API_KEY not set')
    }
    acContactId = await createOrUpdateContact(acCfg, {
      email: form.email,
      firstName,
      lastName,
    })
    await addContactToList(acCfg, acContactId, AC_LIST_ID_CERT_LEADS)
    await addTagToContact(acCfg, acContactId, 'form-consult')

    await Promise.all([
      writeField(acCfg, acContactId, 'EXISTING_AC', form.existing_ac),
      writeField(acCfg, acContactId, 'LIST_SIZE', form.list_size),
      writeField(acCfg, acContactId, 'REVENUE_BAND', form.revenue_band),
      writeField(acCfg, acContactId, 'ENGAGEMENT_TYPE', form.engagement_type),
      writeField(acCfg, acContactId, 'TIMELINE', form.timeline),
      writeField(acCfg, acContactId, 'CONTEXT', form.context),
      writeField(acCfg, acContactId, 'LEAD_SOURCE', 'consult-form'),
      writeField(acCfg, acContactId, 'UTM_SOURCE', form.utm_source),
      writeField(acCfg, acContactId, 'UTM_MEDIUM', form.utm_medium),
      writeField(acCfg, acContactId, 'UTM_CAMPAIGN', form.utm_campaign),
      writeField(acCfg, acContactId, 'HTTP_REFERRER', form.referrer),
      writeField(acCfg, acContactId, 'LANDING_PAGE', form.landing_page),
    ])
  } catch (err) {
    console.error('AC contact create/update failed:', err)
    // Continue — we'll still try Claude + alert so Greg knows.
  }

  // Step 2: Claude generation.
  const claudeStart = Date.now()
  let aiParagraph: string | null = null
  let claudeError: string | null = null
  try {
    aiParagraph = await callClaude(form)
  } catch (err) {
    claudeError = String(err)
    console.error('Claude call failed:', err)
  }
  const generationSeconds = (Date.now() - claudeStart) / 1000

  // Step 3: Write AI body to AC (if Claude succeeded), then fire trigger tag.
  // Trigger tag is the LAST AC operation so the automation sees the body.
  if (acContactId) {
    try {
      if (aiParagraph) {
        await writeField(acCfg, acContactId, 'AI_EMAIL_1_BODY', aiParagraph)
        await writeField(
          acCfg,
          acContactId,
          'AI_EMAIL_1_SENT_AT',
          new Date().toISOString()
        )
      }
      // Trigger tag fires the AC automation. If AI body is empty, AC's
      // If/Else step routes to the template Email 1 fallback.
      await addTagToContact(acCfg, acContactId, 'consult-form-submitted')
    } catch (err) {
      console.error('AC final tag/field write failed:', err)
    }
  }

  // Step 4: Alert Greg with full context. Non-fatal if it fails.
  // The alert email shows the full wrapped preview so Greg can see what
  // AC's Personal Sender will actually send (or fall back to).
  const previewBody = aiParagraph
    ? wrapEmail({
        firstName,
        generatedParagraph: aiParagraph,
        calendlyUrl: CALENDLY_URL,
      }).body
    : undefined

  await alertGreg({
    reason: aiParagraph ? 'queued' : 'claude-failed',
    form,
    acContactId,
    generatedBody: previewBody,
    generationSeconds,
    err: claudeError || undefined,
  }).catch((e) => console.warn('Alert send failed:', e))

  return json(
    {
      status: aiParagraph ? 'ok' : 'partial',
      ai_generated: !!aiParagraph,
      generation_seconds: Number(generationSeconds.toFixed(2)),
      ac_contact_id: acContactId || null,
    },
    200
  )
}

async function alertGreg(opts: {
  reason: 'queued' | 'claude-failed'
  form: FormPayload
  acContactId: string
  generatedBody?: string
  generationSeconds?: number
  err?: string
}): Promise<void> {
  const resendKey = Netlify.env.get('RESEND_API_KEY')
  if (!resendKey) return // silently skip if Resend not configured

  const alertTo = Netlify.env.get('ALERT_EMAIL') || 'greg@getner.ai'
  const f = opts.form

  const status =
    opts.reason === 'queued'
      ? `AI drafted (${(opts.generationSeconds || 0).toFixed(1)}s) — AC Personal Sender will send`
      : 'AI FAILED — AC will fall back to template Email 1; consider a manual reply'

  const subject = `[Lead] ${f.name || '(no name)'} · ${f.company || '(no co)'} · ${opts.reason === 'queued' ? 'AI queued' : 'AI failed'}`

  const acLink = opts.acContactId
    ? `${AC_UI_BASE}/app/contacts/${opts.acContactId}`
    : '(AC contact create failed)'

  const sections: string[] = [
    `Status: ${status}`,
    '',
    `Lead: ${f.name || '(blank)'} <${f.email || '(no email)'}>`,
    `Company: ${f.company || '(blank)'}`,
    `AC contact: ${acLink}`,
    '',
    'Form answers:',
    `  Existing AC: ${f.existing_ac || '(blank)'}`,
    `  List size: ${f.list_size || '(blank)'}`,
    `  Revenue band: ${f.revenue_band || '(blank)'}`,
    `  Looking for: ${f.engagement_type || '(blank)'}`,
    `  Timeline: ${f.timeline || '(blank)'}`,
    `  Context: ${f.context || '(blank)'}`,
    '',
    'Capture data:',
    `  UTM source: ${f.utm_source || '(blank)'}`,
    `  UTM medium: ${f.utm_medium || '(blank)'}`,
    `  UTM campaign: ${f.utm_campaign || '(blank)'}`,
    `  Referrer: ${f.referrer || '(blank)'}`,
    `  Landing page: ${f.landing_page || '(blank)'}`,
  ]

  if (opts.err) {
    sections.push('', '─── ERROR ───', opts.err)
  }
  if (opts.generatedBody) {
    sections.push(
      '',
      '─── Preview of what AC will send via Personal Sender ───',
      '(Wrapper text in code; AC automation step has matching wrapper. The %AI_EMAIL_1_BODY% paragraph below has been written to the contact and the trigger tag is fired.)',
      '',
      opts.generatedBody
    )
  }

  await sendEmail({
    apiKey: resendKey,
    from: Netlify.env.get('EMAIL_FROM') || 'Greg Getner <greg@getner.ai>',
    to: alertTo,
    subject,
    text: sections.join('\n'),
    headers: { 'X-Entity-Source': 'getner-ai-internal-alert' },
  })
}

async function callClaude(form: FormPayload): Promise<string> {
  const apiKey = Netlify.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set')

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
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(form) }],
    }),
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Anthropic API ${res.status}: ${txt.slice(0, 500)}`)
  }
  const data = await res.json()
  const paragraph = data?.content?.[0]?.text
  if (!paragraph || typeof paragraph !== 'string') {
    throw new Error('Anthropic returned no text content')
  }
  return paragraph
}

async function writeField(
  cfg: { apiUrl: string; apiKey: string },
  contactId: string,
  perstag: string,
  value?: string
): Promise<void> {
  if (!value || !contactId) return
  try {
    await setFieldValue(cfg, contactId, perstag, value)
  } catch (err) {
    console.warn(`Set ${perstag} failed (non-fatal):`, err)
  }
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
