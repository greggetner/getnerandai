# Claude Email 1 — Setup & Operation

End-to-end setup for the AI-personalized first reply on the `/consult/` form.

The lead submits the form → Netlify Forms accepts it → Netlify fires an
outgoing webhook to `/.netlify/functions/draft-and-send-reply` → that function
calls Claude (Sonnet 4.6) for a personalized 2–4 sentence read of their form,
wraps it in a fixed disclosure template, sends via Resend, and creates the AC
contact tagged `consult-form-submitted` + `ai-email-1-sent`. AC's automation
sees `ai-email-1-sent` and skips the template Email 1, going straight to the
1-day wait → Email 2.

---

## What the lead sees

```
Subject: Got your note — my AI read your form already

Hi Sarah,

Quick note before I read your form myself — this email was drafted by my
AI assistant in 4 seconds, the moment you hit submit. Here's what it
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

---

## One-time setup

### 1. API keys & env vars in Netlify

Site settings → Environment variables → add (Production scope):

| Key | Value | Where to get it |
|---|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-…` | console.anthropic.com → API Keys (already set per probe-brain.mts) |
| `RESEND_API_KEY` | `re_…` | resend.com → API Keys |
| `EMAIL_FROM` | `Greg Getner <greg@getner.ai>` | literal value |
| `AC_API_URL` | `https://accpgreggetner.api-us1.com` | AC → Settings → Developer (the "URL" field) |
| `AC_API_KEY` | (long token) | AC → Settings → Developer (the "Key" field) |
| `FORM_WEBHOOK_SECRET` | (your generated string, e.g. from `openssl rand -hex 24`) | self-generated; reused below |
| `ALERT_EMAIL` | `greg@getner.ai` (optional) | where internal alert emails go on every send (or send-failure). Defaults to greg@getner.ai. |

### 2. Resend domain verification

1. resend.com → Domains → Add `getner.ai`
2. Resend gives you 3 DNS records (SPF include, DKIM CNAMEs, return-path). Add at GoDaddy.
3. **SPF gotcha:** Resend wants `include:_spf.resend.com` added to your apex SPF. Current SPF is `v=spf1 include:spf.improvmx.com ~all`. **Update to:** `v=spf1 include:spf.improvmx.com include:_spf.resend.com ~all`. Single record, two includes.
4. Wait for Resend to verify (10–60 min).

> Note: this works alongside AC's branded sending domain (`em-4123620.cmd.emsend1.com`). AC uses its own return-path subdomain so it doesn't collide with Resend's apex SPF. Three senders (ImprovMX inbound, AC marketing, Resend transactional) coexist cleanly.

### 3. AC custom fields (additional to Phase 1 of the implementation plan)

Add 2 more to track what the AI sent:

| Field title | Type | Tag |
|---|---|---|
| `AI Email 1 Body` | Paragraph text | `%AI_EMAIL_1_BODY%` |
| `AI Email 1 Sent At` | Date/time | `%AI_EMAIL_1_SENT_AT%` |

And one more tag:

- `ai-email-1-sent` — set by the function on success; AC automation branches on this

### 4. Netlify Forms outgoing webhook

Netlify dashboard → Forms → `consult-request` form → Settings & usage →
Form notifications → **Add notification** → **Outgoing webhook**:

- URL: `https://getner.ai/.netlify/functions/draft-and-send-reply?token=<FORM_WEBHOOK_SECRET value>`
- Event to trigger: New form submission

(URL embeds the secret as a query param. Rotating it = update the env var + this URL.)

### 5. AC automation — branch on `ai-email-1-sent`

In the consult-lead nurture automation (Phase 2A in the implementation plan),
right after the `consult-form-submitted` trigger, insert an **If/else** node:

```
If: contact has tag "ai-email-1-sent"
  → THEN: skip directly to "Wait 1 day" → Email 2
  → ELSE: send the template Email 1 → Wait 1 day → Email 2
```

Both branches converge on the existing Email 2 / 3 / 4 / 5 sequence.

---

## Local testing — run the eval before deploying prompt changes

```bash
# .env file in repo root needs ANTHROPIC_API_KEY=sk-ant-...
npm run eval-email-1
```

Runs all 8 sample payloads, prints each Claude output side-by-side with the
expected tier, and flags issues (wrong tier mentioned, bullets/markdown
in output, greeting/signoff present, word count out of range). Cost: ~$0.03
per full run.

Single case:
```bash
npm run eval-email-1 -- --id=fast-growth-ecom
```

JSON output (for piping into other tools):
```bash
npm run eval-email-1 -- --json > /tmp/eval-out.json
```

---

## Production verification after deploy

1. Submit a real test on `https://getner.ai/consult/` with your own email
2. Within ~30s you should receive the AI-generated reply
3. Check Netlify function logs for `status: ok, sent: true, generation_seconds: X.XX`
4. Verify AC contact was created with all field values populated
5. Verify `consult-form-submitted` + `ai-email-1-sent` tags applied

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| 403 from webhook | `?token=` missing or doesn't match `FORM_WEBHOOK_SECRET` |
| 500 with "ANTHROPIC_API_KEY not set" | env var not deployed; redeploy after adding to Netlify |
| Email never arrives | Resend domain not verified, or SPF didn't include `_spf.resend.com` |
| AC contact missing | `AC_API_URL` should end with no trailing slash; `AC_API_KEY` should be the API Token from AC's developer settings |
| Lead got both Claude email AND template Email 1 | AC automation if/else not wired — verify the branch on `ai-email-1-sent` tag |
| Lead got NO email at all | Check Netlify function logs; if `sent: false, reason: claude-failed` then the AC automation should still fire template Email 1 — verify the if/else else-branch routes to Email 1 |

---

## Cost & latency

- Claude Sonnet 4.6 call: ~1500 input + 200 output tokens = ~$0.005 per email
- Resend: free tier covers 100/day, 3K/month; $20/month for 50K
- Netlify Function invocation: free tier covers 125K/month
- Latency end-to-end: typically 3–8 seconds from form submit to Resend send

---

## When to evolve

- **After 50 sends:** review the AI Email 1 Body field across all contacts in AC. If quality varies, iterate the prompt — adjust SYSTEM_PROMPT in `netlify/functions/lib/prompt-email-1.mts`, run the eval, redeploy.
- **After 200 sends:** consider extending the same pattern to the `/audit/` and `/free-migration/` forms. Each gets its own prompt + tier-recommendation logic.
- **If reply rates lag the template version:** A/B by toggling `ai-email-1-sent` tagging off temporarily and comparing reply rates on a 50/50 split. Don't rely on intuition — measure.
