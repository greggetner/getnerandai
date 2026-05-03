/**
 * Shared lead-processing pipeline. Used by:
 *   - draft-and-send-reply.mts (Netlify Forms webhook → consult/audit/migration/contact)
 *   - process-directory-lead.mts (Zapier webhook → AC consultants directory)
 *
 * Flow per submission:
 *   1. Upsert AC contact by email
 *   2. Subscribe to ac-cert-leads list
 *   3. Add source-specific tag(s)
 *   4. Write all matching custom fields (only those with values)
 *   5. Call Claude → { subject, paragraph } JSON
 *   6. Write AI body + sent-at to AC
 *   7. Send lead-facing email via Resend (AI version, or fallback if Claude failed)
 *   8. Add trigger tag LAST (fires AC nurture automation; only for sources that route into one)
 *   9. Send internal alert to Greg with full context + preview
 *
 * The trigger tag is added last so the AC automation sees a fully-populated
 * contact (AI body, all fields, source tags) at the moment it fires.
 */

import {
  SYSTEM_PROMPT,
  buildUserPrompt,
  parseClaudeJson,
  wrapEmail,
  wrapFallbackEmail,
  type LeadPayload,
  type LeadSource,
} from './prompt-email-1.mts'
import {
  createOrUpdateContact,
  addTagToContact,
  addContactToList,
  setFieldValue,
} from './ac-client.mts'
import { sendEmail } from './resend-client.mts'

const CLAUDE_MODEL = 'claude-sonnet-4-6'
const CALENDLY_URL = 'https://calendly.com/getner/activecampaign-strategy-session'
const AC_UI_BASE = 'https://accpgreggetner.activehosted.com'

// AC list IDs (per-source). ac-cert-leads is dedicated to AC directory leads
// only; consult-leads catches consult/contact/application/ai-terminal.
const AC_LIST_AC_CERT_LEADS = 4
const AC_LIST_AUDIT_LEADS = 5
const AC_LIST_MIGRATION_LEADS = 6
const AC_LIST_CONSULT_LEADS = 8

type SourceConfig = {
  listId: number // AC list to subscribe the contact to
  sourceTag: string // form-X attribution tag
  triggerTag?: string // AC automation trigger (only for sources that have a nurture)
  extraTags?: string[] // additional tags to apply (e.g. source-cert-directory)
  description: string
}

const SOURCE_CONFIG: Record<LeadSource, SourceConfig> = {
  'consult-form': {
    listId: AC_LIST_CONSULT_LEADS,
    sourceTag: 'form-consult',
    triggerTag: 'consult-form-submitted',
    description: '/consult/ form',
  },
  'ac-cert-directory': {
    listId: AC_LIST_AC_CERT_LEADS,
    sourceTag: 'form-consult',
    triggerTag: 'consult-form-submitted',
    extraTags: ['source-cert-directory'],
    description: 'AC consultants directory',
  },
  'audit-form': {
    listId: AC_LIST_AUDIT_LEADS,
    sourceTag: 'form-audit',
    triggerTag: 'audit-form-submitted',
    description: '/audit/ form',
  },
  'migration-form': {
    listId: AC_LIST_MIGRATION_LEADS,
    sourceTag: 'form-migration',
    description: '/free-migration/ form',
  },
  'application-form': {
    listId: AC_LIST_CONSULT_LEADS,
    sourceTag: 'form-application',
    description: 'Apply modal',
  },
  'contact-form': {
    listId: AC_LIST_CONSULT_LEADS,
    sourceTag: 'form-contact',
    description: 'Contact form',
  },
  'ai-terminal': {
    listId: AC_LIST_CONSULT_LEADS,
    sourceTag: 'form-ai-terminal',
    description: 'AI terminal',
  },
}

// LeadPayload key → AC contact custom-field perstag.
// Only writes fields that have non-empty values.
const FIELD_MAP: Array<[keyof LeadPayload, string]> = [
  ['existing_ac', 'EXISTING_AC'],
  ['list_size', 'LIST_SIZE'],
  ['revenue_band', 'REVENUE_BAND'],
  ['engagement_type', 'ENGAGEMENT_TYPE'],
  ['timeline', 'TIMELINE'],
  ['context', 'CONTEXT'],
  ['business_type', 'BUSINESS_TYPE'],
  ['primary_goal', 'PRIMARY_GOAL'],
  ['current_platform', 'CURRENT_PLATFORM'],
  ['concern', 'CONCERN'],
  ['experience', 'EXPERIENCE'],
  ['challenge', 'CHALLENGE'],
  ['transcript', 'TRANSCRIPT'],
  ['question_count', 'QUESTION_COUNT'],
  ['utm_source', 'UTM_SOURCE'],
  ['utm_medium', 'UTM_MEDIUM'],
  ['utm_campaign', 'UTM_CAMPAIGN'],
  ['utm_term', 'UTM_TERM'],
  ['utm_content', 'UTM_CONTENT'],
  ['http_referrer', 'HTTP_REFERRER'],
  ['landing_page', 'LANDING_PAGE'],
]

export type ProcessLeadResult = {
  status: 'ok' | 'partial' | 'error'
  ai_generated: boolean
  ai_subject?: string
  generation_seconds?: number
  ac_contact_id: string | null
  resend_email_id?: string
  error?: string
}

export async function processLead(payload: LeadPayload): Promise<ProcessLeadResult> {
  if (!payload.email) {
    return {
      status: 'error',
      ai_generated: false,
      ac_contact_id: null,
      error: 'no email in payload',
    }
  }

  const cfg = SOURCE_CONFIG[payload.source]
  if (!cfg) {
    return {
      status: 'error',
      ai_generated: false,
      ac_contact_id: null,
      error: `unknown source: ${payload.source}`,
    }
  }

  const firstName = (payload.name || '').trim().split(/\s+/)[0] || 'there'
  const lastName = (payload.name || '').trim().split(/\s+/).slice(1).join(' ')

  const acCfg = {
    apiUrl: Netlify.env.get('AC_API_URL') || '',
    apiKey: Netlify.env.get('AC_API_KEY') || '',
  }

  // Step 1: AC contact + non-trigger tags + fields.
  // Hold the trigger tag until AFTER Claude + Resend so the automation sees
  // a fully-populated contact when it fires.
  let acContactId = ''
  try {
    if (!acCfg.apiUrl || !acCfg.apiKey) {
      throw new Error('AC_API_URL or AC_API_KEY not set')
    }
    acContactId = await createOrUpdateContact(acCfg, {
      email: payload.email,
      firstName,
      lastName,
      phone: payload.phone,
    })
    await addContactToList(acCfg, acContactId, cfg.listId)
    await addTagToContact(acCfg, acContactId, cfg.sourceTag)
    if (cfg.extraTags) {
      for (const t of cfg.extraTags) {
        await addTagToContact(acCfg, acContactId, t)
      }
    }

    await Promise.all([
      writeField(acCfg, acContactId, 'LEAD_SOURCE', payload.source),
      ...FIELD_MAP.map(([key, perstag]) =>
        writeField(acCfg, acContactId, perstag, payload[key] as string | undefined)
      ),
    ])
  } catch (err) {
    console.error('AC contact create/update failed:', err)
  }

  // Step 2: Claude generation.
  const claudeStart = Date.now()
  let aiResult: { subject: string; paragraph: string } | null = null
  let claudeError: string | null = null
  try {
    aiResult = await callClaude(payload)
  } catch (err) {
    claudeError = String(err)
    console.error('Claude call failed:', err)
  }
  const generationSeconds = (Date.now() - claudeStart) / 1000

  // Step 3: Write AI body to AC if Claude succeeded.
  if (acContactId && aiResult) {
    try {
      await writeField(acCfg, acContactId, 'AI_EMAIL_1_BODY', aiResult.paragraph)
      await writeField(acCfg, acContactId, 'AI_EMAIL_1_SENT_AT', new Date().toISOString())
    } catch (err) {
      console.warn('AI body write failed:', err)
    }
  }

  // Build the wrapped email up front so the internal alert can show the
  // exact subject + body the lead received (or would have received if
  // Resend isn't configured).
  const wrap = aiResult
    ? wrapEmail({
        firstName,
        subject: aiResult.subject,
        paragraph: aiResult.paragraph,
        calendlyUrl: CALENDLY_URL,
      })
    : wrapFallbackEmail({ firstName, calendlyUrl: CALENDLY_URL })
  const fromAddress = Netlify.env.get('EMAIL_FROM') || 'Greg Getner <greg@getner.ai>'

  // Step 4: Lead-facing send via Resend.
  let resendEmailId: string | undefined
  let sendError: string | undefined
  let sendStatus: 'sent' | 'skipped' | 'failed' = 'skipped'
  const resendKey = Netlify.env.get('RESEND_API_KEY')
  if (!resendKey) {
    console.warn('RESEND_API_KEY not set; skipping lead-facing send')
  } else {
    try {
      const sent = await sendEmail({
        apiKey: resendKey,
        from: fromAddress,
        to: payload.email,
        replyTo: 'greg@getner.ai',
        subject: wrap.subject,
        text: wrap.body,
        headers: {
          'X-Entity-Source': aiResult ? 'getner-ai-email-1' : 'getner-ai-email-1-fallback',
          'X-Lead-Source': payload.source,
        },
      })
      resendEmailId = sent.id
      sendStatus = 'sent'
    } catch (err) {
      sendError = String(err)
      sendStatus = 'failed'
      console.error('Resend send failed:', err)
    }
  }

  // Step 5: Trigger tag (LAST AC operation; only if this source routes into a nurture).
  if (acContactId && cfg.triggerTag) {
    try {
      await addTagToContact(acCfg, acContactId, cfg.triggerTag)
    } catch (err) {
      console.warn('Trigger tag add failed:', err)
    }
  }

  // Step 6: Internal alert to Greg — confirms what was sent (or what would have been).
  await alertGreg({
    payload,
    cfg,
    acContactId,
    aiResult,
    claudeError,
    sendError,
    sendStatus,
    resendEmailId,
    fromAddress,
    sentSubject: wrap.subject,
    sentBody: wrap.body,
    generationSeconds,
  }).catch((e) => console.warn('Internal alert failed:', e))

  return {
    status: aiResult ? 'ok' : 'partial',
    ai_generated: !!aiResult,
    ai_subject: aiResult?.subject,
    generation_seconds: Number(generationSeconds.toFixed(2)),
    ac_contact_id: acContactId || null,
    resend_email_id: resendEmailId,
    error: claudeError || sendError || undefined,
  }
}

async function callClaude(
  payload: LeadPayload
): Promise<{ subject: string; paragraph: string }> {
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
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(payload) }],
    }),
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Anthropic API ${res.status}: ${txt.slice(0, 500)}`)
  }
  const data = await res.json()
  const raw = data?.content?.[0]?.text
  if (!raw || typeof raw !== 'string') {
    throw new Error('Anthropic returned no text content')
  }
  return parseClaudeJson(raw)
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

async function alertGreg(opts: {
  payload: LeadPayload
  cfg: SourceConfig
  acContactId: string
  aiResult: { subject: string; paragraph: string } | null
  claudeError: string | null
  sendError?: string
  sendStatus: 'sent' | 'skipped' | 'failed'
  resendEmailId?: string
  fromAddress: string
  sentSubject: string
  sentBody: string
  generationSeconds: number
}): Promise<void> {
  const resendKey = Netlify.env.get('RESEND_API_KEY')
  if (!resendKey) return

  const alertTo = Netlify.env.get('ALERT_EMAIL') || 'greg@getner.ai'
  const p = opts.payload

  const aiTag = opts.aiResult
    ? `AI drafted (${opts.generationSeconds.toFixed(1)}s)`
    : opts.claudeError
      ? `AI FAILED — fallback used`
      : 'AI skipped'
  const sendTag =
    opts.sendStatus === 'sent'
      ? `sent via Resend (id: ${opts.resendEmailId || 'unknown'})`
      : opts.sendStatus === 'failed'
        ? `Resend SEND FAILED — lead got nothing, manual reply needed`
        : `Resend skipped (RESEND_API_KEY missing)`
  const status = `${aiTag} · ${sendTag}`

  const subjectPrefix =
    opts.sendStatus === 'sent'
      ? '[Lead·sent]'
      : opts.sendStatus === 'failed'
        ? '[Lead·SEND FAILED]'
        : '[Lead·skipped]'
  const subject = `${subjectPrefix} ${p.name || '(no name)'} · ${p.company || '(no co)'} · ${opts.cfg.description}`

  const acLink = opts.acContactId
    ? `${AC_UI_BASE}/app/contacts/${opts.acContactId}`
    : '(AC contact create failed)'

  const sections: string[] = [
    `Status: ${status}`,
    `Source: ${opts.cfg.description}`,
    '',
    `Lead: ${p.name || '(blank)'} <${p.email}>`,
    `Company: ${p.company || '(blank)'}`,
    `Phone: ${p.phone || '(blank)'}`,
    `AC contact: ${acLink}`,
    '',
    'Submission:',
    `  Context: ${p.context || '(blank)'}`,
    `  Existing AC: ${p.existing_ac || '(blank)'}`,
    `  List size: ${p.list_size || '(blank)'}`,
    `  Revenue band: ${p.revenue_band || '(blank)'}`,
    `  Looking for: ${p.engagement_type || '(blank)'}`,
    `  Timeline: ${p.timeline || '(blank)'}`,
    `  Business type: ${p.business_type || '(blank)'}`,
    `  Primary goal: ${p.primary_goal || '(blank)'}`,
    `  Current platform: ${p.current_platform || '(blank)'}`,
    `  Concern: ${p.concern || '(blank)'}`,
    `  Experience: ${p.experience || '(blank)'}`,
    `  Challenge: ${p.challenge || '(blank)'}`,
    '',
    'Capture data:',
    `  UTM source: ${p.utm_source || '(blank)'}`,
    `  UTM medium: ${p.utm_medium || '(blank)'}`,
    `  UTM campaign: ${p.utm_campaign || '(blank)'}`,
    `  HTTP referrer: ${p.http_referrer || '(blank)'}`,
    `  Landing page: ${p.landing_page || '(blank)'}`,
  ]

  if (opts.claudeError) {
    sections.push('', '─── CLAUDE ERROR ───', opts.claudeError)
  }
  if (opts.sendError) {
    sections.push('', '─── RESEND ERROR ───', opts.sendError)
  }

  // Always include the full sent (or would-have-sent) email so the alert is
  // a real confirmation of what landed in the lead's inbox.
  const sentHeader =
    opts.sendStatus === 'sent'
      ? '─── What the lead just received via Resend ───'
      : opts.sendStatus === 'failed'
        ? '─── What we TRIED to send (Resend rejected it) ───'
        : '─── What we WOULD have sent (Resend not configured) ───'

  sections.push(
    '',
    sentHeader,
    `From:     ${opts.fromAddress}`,
    `To:       ${p.email}`,
    `Reply-To: greg@getner.ai`,
    `Subject:  ${opts.sentSubject}`,
    '',
    opts.sentBody
  )

  await sendEmail({
    apiKey: resendKey,
    from: opts.fromAddress,
    to: alertTo,
    subject,
    text: sections.join('\n'),
    headers: { 'X-Entity-Source': 'getner-ai-internal-alert' },
  })
}
