/**
 * Webhook target for the /consult/ form submission.
 *
 * Trigger: Netlify Forms outgoing webhook (configured in Netlify dashboard
 * for the `consult-request` form). Optionally, other forms can trigger this
 * once their content/prompts are ready.
 *
 * Flow on success:
 *   1. Parse Netlify Forms webhook payload
 *   2. Call Claude (Sonnet 4.6) for a personalized 2-4 sentence read of the form
 *   3. Wrap that paragraph in the disclosure email template
 *   4. Send via Resend
 *   5. Create or update AC contact, write all form fields, tag with
 *      `consult-form-submitted` + `ai-email-1-sent`
 *
 * On Claude or Resend failure: AC contact still gets created and tagged with
 * `consult-form-submitted` (no `ai-email-1-sent` tag). The AC automation's
 * if/else branch then fires the standard template Email 1 as fallback.
 *
 * Webhook security: shared-secret query param `?token=...` matched against
 * env var FORM_WEBHOOK_SECRET. Rotate by changing the env var + the URL
 * configured in Netlify Forms.
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

  // Always do AC contact create/update first — even if Claude/Resend fail,
  // we still want the lead in AC for the standard nurture sequence to fire.
  const acCfg = {
    apiUrl: Netlify.env.get('AC_API_URL') || '',
    apiKey: Netlify.env.get('AC_API_KEY') || '',
  }
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
    await addTagToContact(acCfg, acContactId, 'consult-form-submitted')
    await addTagToContact(acCfg, acContactId, 'form-consult')

    // Write form-data fields (best-effort, silent if missing).
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
    // Don't fail the function — Claude+Resend can still proceed.
  }

  // Claude generate + Resend send. If either fails, fall back silently
  // (AC's standard Email 1 will fire from the automation).
  const claudeStart = Date.now()
  let aiParagraph: string
  try {
    aiParagraph = await callClaude(form)
  } catch (err) {
    console.error('Claude call failed:', err)
    await alertGreg({
      reason: 'claude-failed',
      form,
      acContactId,
      err: String(err),
    }).catch((e) => console.warn('Alert send failed:', e))
    return json({ status: 'partial', sent: false, reason: 'claude-failed' }, 200)
  }
  const generationSeconds = (Date.now() - claudeStart) / 1000

  const wrapped = wrapEmail({
    firstName,
    generatedParagraph: aiParagraph,
    generationSeconds,
    calendlyUrl: CALENDLY_URL,
  })

  try {
    const resendKey = Netlify.env.get('RESEND_API_KEY')
    if (!resendKey) throw new Error('RESEND_API_KEY not set')
    await sendEmail({
      apiKey: resendKey,
      from: Netlify.env.get('EMAIL_FROM') || 'Greg Getner <greg@getner.ai>',
      replyTo: 'greg@getner.ai',
      to: form.email,
      subject: wrapped.subject,
      text: wrapped.body,
      headers: { 'X-Entity-Source': 'getner-ai-consult-form' },
    })
  } catch (err) {
    console.error('Resend send failed:', err)
    await alertGreg({
      reason: 'resend-failed',
      form,
      acContactId,
      err: String(err),
      generatedBody: wrapped.body,
    }).catch((e) => console.warn('Alert send failed:', e))
    return json({ status: 'partial', sent: false, reason: 'resend-failed' }, 200)
  }

  // Tag `ai-email-1-sent` so the AC automation skips the template Email 1
  // and starts at the Day-1 wait → Email 2.
  if (acContactId) {
    try {
      await addTagToContact(acCfg, acContactId, 'ai-email-1-sent')
      await writeField(acCfg, acContactId, 'AI_EMAIL_1_BODY', wrapped.body)
      await writeField(
        acCfg,
        acContactId,
        'AI_EMAIL_1_SENT_AT',
        new Date().toISOString()
      )
    } catch (err) {
      console.error('AC tag/field after-send failed (non-fatal):', err)
    }
  }

  // Alert Greg with the form + what the AI sent. Non-fatal if it fails.
  await alertGreg({
    reason: 'sent',
    form,
    acContactId,
    generatedBody: wrapped.body,
    generationSeconds,
  }).catch((e) => console.warn('Alert send failed:', e))

  return json(
    {
      status: 'ok',
      sent: true,
      generation_seconds: Number(generationSeconds.toFixed(2)),
      ac_contact_id: acContactId || null,
    },
    200
  )
}

async function alertGreg(opts: {
  reason: 'sent' | 'claude-failed' | 'resend-failed'
  form: FormPayload
  acContactId: string
  generatedBody?: string
  generationSeconds?: number
  err?: string
}): Promise<void> {
  const resendKey = Netlify.env.get('RESEND_API_KEY')
  if (!resendKey) return // silently skip if not configured

  const alertTo = Netlify.env.get('ALERT_EMAIL') || 'greg@getner.ai'
  const f = opts.form

  const status =
    opts.reason === 'sent'
      ? `AI replied (${(opts.generationSeconds || 0).toFixed(1)}s)`
      : opts.reason === 'claude-failed'
        ? 'AI FAILED — manual reply needed'
        : 'AI generated reply but SEND FAILED — manual reply needed'

  const subject = `[Lead] ${f.name || '(no name)'} · ${f.company || '(no co)'} · ${status}`

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
      opts.reason === 'sent'
        ? '─── What was sent to the lead ───'
        : '─── What Claude generated (NOT sent — Resend failed) ───',
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
