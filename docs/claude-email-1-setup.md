# Claude Email 1 — Setup & Operation (Personal Sender path)

End-to-end setup for the AI-personalized first reply on the `/consult/`
form. The lead-facing email is sent by AC's Personal Sender via your
connected Gmail — so the email lands in the lead's primary inbox as a
real 1:1 from greg@getner.ai, not a service email.

## Flow

```
Lead submits /consult/ form
         ↓
Netlify Forms accepts (data → form inbox)
         ↓
Netlify outgoing webhook → /.netlify/functions/draft-and-send-reply
         ↓
   ┌─────┴─────┐
   ↓           ↓
Claude      AC: create contact + write all form fields
   ↓                                ↓
AC: write %AI_EMAIL_1_BODY% field   │
   ↓                                │
AC: add tag "consult-form-submitted" (TRIGGERS automation)
   ↓
AC automation:
   If %AI_EMAIL_1_BODY% is empty (Claude failed):
     → Send template Email 1 (campaign send)
   Else:
     → Send 1-on-1 email via Personal Sender (Gmail)
       Subject + wrapper hardcoded in AC, %AI_EMAIL_1_BODY% inline
   ↓
Wait 1 day → Email 2 → ... continues sequence
```

Internal alert email (separate, via Resend) goes to greg@getner.ai
with the form data, AC contact link, and a preview of what was queued.

---

## What the lead sees (sent from your Gmail)

```
From: Greg Getner <greg@getner.ai>
Subject: Got your note — my AI read your form already

Hi Sarah,

Quick note before I read your form myself — this email was drafted by my
AI assistant in 4.2 seconds, the moment you hit submit. Here's what it
picked up from your answers:

[Claude-generated 2-4 sentence read of their specific situation, tier
recommendation with reasoning, and one specific clarifying question.]

I'll review this thread personally before any call — but if you want to
see what an AI assistant like this one could do for your own AC account,
that's exactly the kind of automation I build with the done-with-you and
done-for-you tiers.

Calendar's here if you want to talk:
https://calendly.com/getner/activecampaign-strategy-session

— Greg
(and Claude)
```

Replies go right back into your Gmail thread.

---

## One-time setup

### 1. Connect Gmail to AC (Personal Sender)

AC dashboard → Settings → Personal Email (or "Sender Settings" →
"Personal Email") → Connect → choose Gmail → OAuth flow → grant
permission. Done.

This connects greg@getner.ai's Gmail account so AC can send on your
behalf via Gmail's API. No DNS changes needed for the lead-facing
send (Gmail handles its own SPF/DKIM).

### 2. Env vars in Netlify

Site → Environment variables → add (Production scope):

| Key | Value | Where to get it |
|---|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-…` | console.anthropic.com → API Keys (already set) |
| `AC_API_URL` | `https://accpgreggetner.api-us1.com` | AC → Settings → Developer (the "URL" field). Trim trailing slash. |
| `AC_API_KEY` | (long token) | AC → Settings → Developer (the "Key" field) |
| `FORM_WEBHOOK_SECRET` | (your generated string, e.g. from `openssl rand -hex 24`) | self-generated; reused below |
| `RESEND_API_KEY` | `re_…` | resend.com → API Keys. **Optional — only needed for internal alert emails** |
| `EMAIL_FROM` | `Greg Getner <greg@getner.ai>` | literal value, used by the Resend alert |
| `ALERT_EMAIL` | `greg@getner.ai` (default) | optional override — where alerts go |

**Resend is now optional** for the lead-facing send (Personal Sender
handles that). You'd only keep Resend for:
- Internal alert emails to greg@getner.ai
- Other transactional sends (form receipts, etc.) — future work

If you don't want internal alerts, leave `RESEND_API_KEY` unset and the
function silently skips the alert. The lead-facing flow still works.

### 3. AC custom fields (additional to Phase 1 of the implementation plan)

| Field title | Type | Tag |
|---|---|---|
| `AI Email 1 Body` | Paragraph text | `%AI_EMAIL_1_BODY%` |
| `AI Email 1 Sent At` | Date/time | `%AI_EMAIL_1_SENT_AT%` |

No new tags needed — the existing `consult-form-submitted` tag is the
trigger. (Earlier docs mentioned an `ai-email-1-sent` tag — that's no
longer used; the AC automation branches on whether the field is empty
instead.)

### 4. Netlify Forms outgoing webhook

Netlify dashboard → Forms → `consult-request` form → Settings & usage →
Form notifications → **Add notification** → **Outgoing webhook**:

- URL: `https://getner.ai/.netlify/functions/draft-and-send-reply?token=<FORM_WEBHOOK_SECRET value>`
- Event: New form submission

(Token in the URL is the shared secret. Rotating = update env var + this URL.)

### 5. Build the AC automation Email 1 step

In your consult-lead nurture automation (Phase 2A in the implementation
plan), the Email 1 node becomes an **If/Else** + **Send 1-on-1 email**.

#### If/Else condition

```
Condition: %AI_EMAIL_1_BODY% is empty
  YES branch: Send campaign "Template Email 1"  (the original campaign
              draft you've already pasted into AC; this is the fallback)
  NO branch:  Send 1-on-1 email "AI Email 1"   (Personal Sender via Gmail)
```

Both branches converge on the existing "Wait 1 day → Email 2" path.

#### Configure the "Send 1-on-1 email" step (the AI version)

- **Type:** Send 1-on-1 email (uses your connected Gmail)
- **Subject:**
  ```
  Got your note — my AI read your form already
  ```
- **Body** — paste this exactly into AC's body editor (plain text mode);
  the `%AI_EMAIL_1_BODY%` merge tag is where Claude's paragraph lands:

  ```
  Hi %FIRSTNAME%,

  Quick note before I read your form myself — this email was drafted by my AI assistant in a few seconds, the moment you hit submit. Here's what it picked up from your answers:

  %AI_EMAIL_1_BODY%

  I'll review this thread personally before any call — but if you want to see what an AI assistant like this one could do for your own AC account, that's exactly the kind of automation I build with the done-with-you and done-for-you tiers.

  Calendar's here if you want to talk:
  https://calendly.com/getner/activecampaign-strategy-session

  — Greg
  (and Claude)

  Greg Getner
  Boutique ActiveCampaign Management
  getner.ai · greg@getner.ai
  ```

  *(The function code in `/netlify/functions/lib/prompt-email-1.mts` has
  the same wrapper for internal previews. If you change the wrapper here,
  change it there too — they need to stay in sync so the alert email
  preview matches what was actually sent.)*

> **Why "in a few seconds" instead of the actual time:** AC can't read
> the generation duration into the email at send time, only the body
> field. The internal alert email shows the precise generation time for
> your records; the lead just sees "in a few seconds" which is honest
> and removes a sync requirement.

---

## Local testing — run the eval before deploying prompt changes

```bash
# .env file in repo root needs ANTHROPIC_API_KEY=sk-ant-...
npm run eval-email-1
```

Runs all 8 sample payloads through Sonnet 4.6, prints each output with
heuristic checks (wrong tier mentioned, bullets/markdown, greeting/signoff,
word count). Cost: ~$0.03 per full run.

```bash
# Single case
npm run eval-email-1 -- --id=fast-growth-ecom
# JSON output
npm run eval-email-1 -- --json > /tmp/eval-out.json
```

---

## Production verification after deploy

1. Submit a real test on `https://getner.ai/consult/` with your own email
2. Check Netlify function logs — should see `status: ok, ai_generated: true`
3. Within ~30s, AC's Personal Sender should deliver the AI email to your test inbox **from your Gmail**
4. In AC, verify contact created with all field values (including `AI Email 1 Body` populated)
5. Reply to the lead-facing email — your reply should land in **your normal Gmail inbox**, not via AC's reply forwarding
6. Internal alert email arrives at `greg@getner.ai` from Resend with full form data + preview

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| 403 from webhook | `?token=` missing or doesn't match `FORM_WEBHOOK_SECRET` |
| 500 with "ANTHROPIC_API_KEY not set" | env var not deployed; redeploy after adding to Netlify |
| Lead never gets an email | AC Personal Sender disconnected (re-OAuth in AC settings), OR automation If/Else routed to fallback but fallback campaign isn't built |
| Lead got the FALLBACK template instead of AI version | `%AI_EMAIL_1_BODY%` was empty when automation fired — check function logs for Claude error or AC field-write failure |
| Lead got both AI email AND template Email 1 | If/Else not configured correctly — both branches need to converge to a single Wait 1 day → Email 2 path, not duplicate sends |
| Internal alert never arrives | `RESEND_API_KEY` not set, OR Resend domain (getner.ai) not verified (alerts use Resend) |
| AC contact missing | `AC_API_URL` ends with trailing slash (trim it), or `AC_API_KEY` is wrong (use the Token from AC Developer settings) |

---

## Cost & latency

- Claude Sonnet 4.6 call: ~1500 input + 200 output tokens = ~$0.005 per email
- Resend (alerts only): free tier covers 100/day
- Personal Sender: counts against your Gmail daily quota (~500/day personal, ~2000/day Workspace) — invisible at current volume
- Latency end-to-end: typically 10–40 seconds from form submit to lead receiving the email (AC automation has slight polling delay)

---

## Why Personal Sender vs Resend transactional

| Dimension | Resend (transactional) | Personal Sender (Gmail) |
|---|---|---|
| Deliverability | Good (proper DKIM/SPF) | **Best — primary inbox, no "via" notation** |
| Authenticity | Looks service-y in headers | **Looks identical to a 1:1 Gmail email** |
| Reply handling | reply-to → forward → Gmail | **Direct into your Gmail thread** |
| Brand fit ("Greg reads every form personally") | OK | **Stronger — the email IS from your Gmail** |
| AI-disclosure framing | Works | **Stronger — disclosure paired with obvious-personal-email** |
| Latency | ~5s | ~10–40s |
| Volume cap | High | ~500/day personal Gmail |

Personal Sender wins on every dimension that matters for inbound 1:1
nurture. Latency penalty is real but well within "magic" range.

---

## When to evolve

- **After 50 sends:** review `AI Email 1 Body` field across contacts. If quality varies, iterate `SYSTEM_PROMPT` in `netlify/functions/lib/prompt-email-1.mts`, run eval, redeploy.
- **After 200 sends:** extend the same pattern to `/audit/` and `/free-migration/` forms with their own prompts.
- **If reply rates dip:** A/B by toggling the If/Else to send template-only for a slice of leads. Compare reply rates over 2 weeks.
- **If you cross ~50 leads/day:** consider Workspace upgrade for higher Gmail send quota, OR fall back to Resend for sends that can't fit personal-quota.
