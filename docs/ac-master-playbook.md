# Getner.ai — ActiveCampaign Master Playbook

Single canonical doc for setting up the AC backend tonight. Action-ordered.
Every value, tag name, and field spec needed is inline — no cross-doc
hopping required.

**Time budget:** ~3.5 hours of focused clicking, splittable across two
sessions if needed.

---

## Status snapshot

✅ **Done (shipped, deployed):**
- `/consult/`, `/audit/`, `/free-migration/`, homepage forms — live, with first-touch UTM/referrer/landing-page capture on every submit
- AC Cert Consultant badge in footer of all 4 main pages, linked to your directory profile
- ACCPG account verified as the right account
- Initial AC scaffolding (1 list `ac-cert-leads`, 5 tags, 2 custom fields)
- All form copy + email copy + paste-ready campaign drafts in `/docs/`
- Netlify Function `draft-and-send-reply.mts` built — generates AI Email 1, writes to AC, fires automation trigger, sends internal alert
- Eval harness (`npm run eval-email-1`) — 8 sample payloads ready to test prompt against

⬜ **Tonight's work** (this doc):
- Phase 1: AC contact management (lists, tags, fields, default First Name)
- Phase 2: AI Email 1 wiring (Gmail OAuth, env vars, Netlify webhook)
- Phase 3: Consult-lead nurture automation (paste 5 emails, build automation)
- Phase 4: Deals CRM (pipeline, stages, deal fields)
- Phase 5: Quick wins for other forms + lead-source auto-tagging

🤝 **Where I (Claude) can directly help:**
- Already shipped: form code, function code, prompt + eval harness, setup docs
- Tonight: prompt iteration once you have real test data, troubleshooting any function failures, drafting additional automation copy
- AC UI clicks: I cannot — the MCP connection to ACCPG is disconnected this session and AC's API doesn't support automation/campaign creation anyway. You drive the AC UI; I support from code/docs.

---

## Phase 1 — AC Contact Management Foundation

**Goal:** Lists, tags, and custom fields ready to receive form submissions.
**Time:** ~45 min
**You click in AC; I cannot reach the API this session.**

### 1A. Lists (Lists → Create)

| Name | Sender URL | Sender Reminder |
|---|---|---|
| ✅ `ac-cert-leads` | `https://getner.ai` | "You signed up at getner.ai for AC consulting, audit, or migration help." |
| ⬜ `audit-leads` | `https://getner.ai` | "You requested a free Hyper-Pareto audit at getner.ai/audit/" |
| ⬜ `migration-leads` | `https://getner.ai` | "You requested a free migration assessment at getner.ai/free-migration/" |
| ⬜ `clients-active` | `https://getner.ai` | "You're a current client of Getner & AI." |

### 1B. Tags (Lists → Manage Tags → Add)

Group by prefix. Don't worry about colors — naming is what matters.

**Lifecycle (where they are in your funnel):**
```
lifecycle-prospect          (form submitted, no qualification)
lifecycle-qualified         (filled form OR booked call)
lifecycle-call-booked       (Calendly event scheduled)
lifecycle-call-held         (call completed)
lifecycle-proposal-sent     (proposal/quote went out)
lifecycle-client-active     (engagement started)
lifecycle-client-past       (engagement ended)
lifecycle-disqualified      (not a fit)
```

**Form-source (which form they came in through):**
```
form-consult        (/consult/)
form-audit          (/audit/)
form-migration      (/free-migration/)
form-application    (Apply modal)
form-contact        (Contact form)
form-ai-terminal    (AI terminal email capture)
```

**Lead source (where they came from before the form):**
```
source-cert-directory   (UTM/referrer matches AC Cert directory)
source-search           (organic OR search-engine referrer)
source-referral         (UTM medium=referral OR external referrer)
source-direct           (no UTM, no referrer)
source-social           (UTM source = LI/Twitter/etc.)
```

**Sequence/automation state — already exist:**
```
✅ consult-form-submitted    (triggers consult nurture)
✅ audit-form-submitted      (triggers audit confirmation)
✅ consult-booked            (Calendly booking goal/exit)
✅ replied-in-sequence       (manual exit when they reply)
✅ nurture-completed         (end-of-sequence final state)
```

**Engagement (set later by automations):**
```
engagement-active           (opened/clicked in last 30d)
engagement-cold             (no opens/clicks in 90d)
engagement-replied-anytime  (ever replied to any send)
```

### 1C. Custom contact fields

**Already created:**
- ✅ `Lead Source` — Dropdown, `%LEAD_SOURCE%`
- ✅ `Existing AC Account` — Dropdown, `%EXISTING_AC%`

**Form-data fields (Contacts → Manage Fields → Add Field):**

| Field title | Type | Tag | Used by | Options |
|---|---|---|---|---|
| `List Size` | Dropdown | `%LIST_SIZE%` | consult, audit, migration, application | `Not yet on AC / Under 10K / 10K–50K / 50K–100K / 100K–500K / 500K–1M / 1M–5M / 5M–10M / 10M+` |
| `Revenue Band` | Dropdown | `%REVENUE_BAND%` | consult | `Not tracking yet / Under $10K/mo / $10K–$50K/mo / $50K–$100K/mo / $100K–$500K/mo / $500K+/mo` |
| `Engagement Type` | Dropdown | `%ENGAGEMENT_TYPE%` | consult | `Free audit / Paid audit ($147–$297) / Done-with-you ($300/hr) / Done-for-you ($3K–$20K project) / Not sure — recommend` |
| `Timeline` | Dropdown | `%TIMELINE%` | consult, application | `ASAP — this week / Within 30 days / 60–90 days / Just exploring` |
| `Context` | Paragraph | `%CONTEXT%` | consult, audit, migration, contact | — |
| `Business Type` | Dropdown | `%BUSINESS_TYPE%` | audit | `Life / business coach / Course creator / online educator / E-commerce / retail brand / Software / SaaS company / Content creator / influencer / B2B service / Agency / service provider / Entertainment / music industry / Other` |
| `Primary Goal` | Dropdown | `%PRIMARY_GOAL%` | audit | `Identify my highest-impact activities (Hyper-Pareto analysis) / Improve deliverability & inbox placement / Increase email engagement (opens / clicks) / Generate more revenue from ActiveCampaign / Fix automation performance issues / Get an expert second opinion on my current setup / Other` |
| `Current Platform` | Dropdown | `%CURRENT_PLATFORM%` | migration | `Mailchimp / Klaviyo / ConvertKit / HubSpot / Other` |
| `Concern` | Paragraph | `%CONCERN%` | migration | — |
| `Experience` | Dropdown | `%EXPERIENCE%` | application | `New to ActiveCampaign (just getting started) / Somewhat experienced (been using it 6+ months) / Very experienced (power user, advanced features) / Expert level (know the platform inside & out)` |
| `Challenge` | Paragraph | `%CHALLENGE%` | application | — |
| `Transcript` | Paragraph | `%TRANSCRIPT%` | ai-terminal | — |
| `Question Count` | Number | `%QUESTION_COUNT%` | ai-terminal | — |

**AI-system fields (for the Personal Sender Email 1):**

| Field title | Type | Tag |
|---|---|---|
| `AI Email 1 Body` | Paragraph | `%AI_EMAIL_1_BODY%` |
| `AI Email 1 Sent At` | Date/time | `%AI_EMAIL_1_SENT_AT%` |

**Capture-data fields (populated by `/scripts/utm-capture.js`):**

| Field title | Type | Tag |
|---|---|---|
| `UTM Source` | Text | `%UTM_SOURCE%` |
| `UTM Medium` | Text | `%UTM_MEDIUM%` |
| `UTM Campaign` | Text | `%UTM_CAMPAIGN%` |
| `UTM Term` | Text | `%UTM_TERM%` |
| `UTM Content` | Text | `%UTM_CONTENT%` |
| `HTTP Referrer` | Text | `%HTTP_REFERRER%` |
| `Landing Page` | Text | `%LANDING_PAGE%` |

### 1D. Personalization fallback (one-time)

Contacts → Manage Fields → First Name → Set default value → `there`.
Result: contacts with no first name receive "Hi there," not "Hi ,".

### 1E. Groups (skip)

Solo operator — keep the default `Admin` group only. AC Groups are user-
permission groups, not contact segments. Add others when you hire.

---

## Phase 2 — AI Email 1 Infrastructure

**Goal:** AI generates personalized first reply, sent via your Gmail, alert
to you on every submission.
**Time:** ~30 min
**Reference:** Full setup detail in `/docs/claude-email-1-setup.md`

### 2A. Connect Gmail to AC (Personal Sender)

AC dashboard → Settings → Personal Email (or "Sender Settings" → "Personal
Email") → Connect → choose Gmail → OAuth → grant permission.

This connects greg@getner.ai's Gmail so AC can send 1-on-1 on your behalf.
No DNS changes needed.

### 2B. Netlify env vars

Site settings → Environment variables → add (Production scope):

| Key | Value | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | already set | from probe-brain.mts era |
| `AC_API_URL` | `https://accpgreggetner.api-us1.com` | from AC → Settings → Developer (trim trailing slash) |
| `AC_API_KEY` | (long token) | from same screen |
| `FORM_WEBHOOK_SECRET` | run `openssl rand -hex 24` | generated random secret |
| `RESEND_API_KEY` | optional | only if you want internal alert emails |
| `EMAIL_FROM` | `Greg Getner <greg@getner.ai>` | for Resend alerts |
| `ALERT_EMAIL` | `greg@getner.ai` | optional override |

### 2C. Netlify Forms outgoing webhook

Netlify → Forms → `consult-request` → Settings & usage → Form notifications →
Add notification → **Outgoing webhook**:

- URL: `https://getner.ai/.netlify/functions/draft-and-send-reply?token=<your FORM_WEBHOOK_SECRET value>`
- Event: New form submission

### 2D. Akismet spam filter (one click)

Netlify → Forms → Spam filtering → enable Akismet. Free, no UX cost,
catches ~95% of spam beyond the existing honeypot.

### 2E. Test before going live

Submit a test form on `https://getner.ai/consult/` with your own email.

Verify within 60 seconds:
1. Netlify function logs show `status: ok, ai_generated: true`
2. AC contact created with all fields populated
3. Internal alert email arrives in your Gmail with form data + AI preview
4. Tag `consult-form-submitted` is on the contact

You won't see the lead-facing email yet — the AC automation isn't built.
That comes next.

### 2F. Iterate the prompt locally before going live

Add `ANTHROPIC_API_KEY=sk-ant-...` to `.env` (gitignored).

```bash
npm run eval-email-1            # all 8 cases
npm run eval-email-1 -- --id=fast-growth-ecom    # one case
```

Review outputs against expected tier. Edit `SYSTEM_PROMPT` in
`/netlify/functions/lib/prompt-email-1.mts`. Re-run. Push when satisfied.
Cost: ~$0.03 per full run.

---

## Phase 3 — Consult-Lead Nurture Automation

**Goal:** 5-email sequence triggered by form submission, with AI Email 1
sent via Personal Sender + template Email 1 as fallback.
**Time:** ~1.5 hours
**References:** `/docs/email-campaigns-paste-ready.md` for Emails 2-5 copy

### 3A. Paste campaign drafts

Campaigns → New → Standard → **Plain text mode** → for each of Emails 2-5:

1. Paste subject + preheader + body from `/docs/email-campaigns-paste-ready.md`
2. Per-email settings:
   - From: `Greg Getner <greg@getner.ai>`
   - Reply-to: `greg@getner.ai`
   - Send to list: `ac-cert-leads`
   - Open tracking: **OFF**
   - Link tracking: **OFF**
   - Google Analytics: **OFF**
3. Save as draft (don't schedule — automation triggers it)

Also create **template Email 1** as fallback (using the original Email 1 copy
from `/docs/email-campaigns-paste-ready.md`). This is what fires when Claude
fails to generate the AI version.

### 3B. Build the automation in the visual builder

Automations → Create → start from scratch.

```
[Trigger: Tag is added — consult-form-submitted]
        ↓
[Goals (sit at top of automation, exits anywhere)]
  ├─ Tag added: consult-booked → end automation
  └─ Tag added: replied-in-sequence → end automation
        ↓
[If/Else: Is %AI_EMAIL_1_BODY% empty?]
  ├─ NO branch: [Send 1-on-1 email via Personal Sender]
  │             Subject: Got your note — my AI read your form already
  │             Body: (paste exact wrapper from /docs/claude-email-1-setup.md
  │                   section 5 — uses %FIRSTNAME% and %AI_EMAIL_1_BODY%)
  │             Sender: Your Gmail (already connected in 2A)
  │
  └─ YES branch: [Send campaign: Template Email 1]
        ↓
[Both branches converge here]
        ↓
[Wait 1 day]
        ↓
[Send campaign: Email 2]
        ↓
[Wait 2 days]
        ↓
[Send campaign: Email 3]
        ↓
[Wait 4 days]
        ↓
[Send campaign: Email 4]
        ↓
[Wait 7 days]
        ↓
[Send campaign: Email 5]
        ↓
[Add tag: nurture-completed]
        ↓
[End]
```

**Activate the automation when ready.**

### 3C. Verify with a test submission

Submit `/consult/` again with a different test email (not the one you used
for the function test). Within ~60 seconds:

1. Test inbox receives the AI-personalized email **from your Gmail** with
   the disclosure framing
2. AC contact has `consult-form-submitted` tag
3. AC automation report shows the lead in the "wait 1 day" step

Reply to the email to test the path back into your Gmail thread (no AC
forwarding involved — this is the magic of Personal Sender).

---

## Phase 4 — Deals CRM Pipeline

**Goal:** Every booked call creates a deal you can forecast and report on.
**Time:** ~30 min

### 4A. Pipeline + stages

Deals → Manage Pipelines → Create new → name: `Consulting`.

Stages (in order, with default win probabilities):

| # | Stage | Probability | Meaning |
|---|---|---|---|
| 1 | New Inquiry | 5% | Form submitted |
| 2 | Qualified | 15% | Call booked OR form-with-clear-intent |
| 3 | Discovery Held | 30% | Strategy call done |
| 4 | Proposal Sent | 50% | Written proposal/quote out |
| 5 | Negotiating | 75% | Active back-and-forth on terms |
| 6 | Won | 100% | Signed/paid |
| 7 | Lost | 0% | Closed dead — capture reason |

### 4B. Custom deal fields (Deals → Manage Fields)

| Field | Type | Options/Notes |
|---|---|---|
| `Service Tier` | Dropdown | `Free Audit / Paid Audit ($147–$297) / Done-with-you ($300/hr) / Done-for-you ($3K–$20K) / Other` |
| `Loss Reason` | Dropdown | `Price / Timing / Fit / Ghosted / Won by competitor / Re-evaluating / Other` |
| `Project Start Date` | Date | When work begins |
| `Estimated Close Date` | Date | Forecast close |
| `Lead Source Form` | Text | Mirrors contact's form-source tag |
| `Hours Estimate` | Number | DwY engagement size |

### 4C. Deal automations

**Automation 1: "Booking → Deal"**
- Trigger: Tag `consult-booked` added
- Action: Create deal in `Consulting` pipeline at stage `Qualified`
- Set fields: copy contact's `form-source` tag value to `Lead Source Form`

**Automation 2: "Won → Onboarding"**
- Trigger: Deal moved to stage `Won`
- Actions:
  - Add tag `lifecycle-client-active` to the contact
  - Subscribe contact to `clients-active` list
  - Unsubscribe from `ac-cert-leads`, `audit-leads`, `migration-leads`
  - (Future: trigger an onboarding sequence here)

**Automation 3: "Lost → Reason Capture"**
- Trigger: Deal moved to stage `Lost`
- Action: Add tag `lifecycle-disqualified` to contact
- Action: Send yourself a task: "Review loss reason: %DEAL_LOSS_REASON%"

### 4D. Wire Calendly → AC for the booking trigger

Calendly → Integrations → ActiveCampaign → connect with API URL + key
(same as Netlify's `AC_API_URL` and `AC_API_KEY`).

Configure on `activecampaign-strategy-session` event:
- On "Event Scheduled" → AC: Add tag `consult-booked` to contact (match by email)
- Optional: Add to list `ac-cert-leads` if not already

This fires Automation 1 ("Booking → Deal") above. Now every Calendly booking
creates a deal you can track.

---

## Phase 5 — Other-Form Quick Wins

**Goal:** Audit/migration form submissions get a confirmation. Lead-source
auto-tagging based on UTM/referrer. Solid foundation for tracking.
**Time:** ~30 min (or split off — these are independent of Phase 1-4)

### 5A. Audit-Lead confirmation automation

**Trigger:** Tag `audit-form-submitted` added
**Steps:**
1. Send a single confirmation email — paste copy:

```
Subject: Got your audit request — here's what's next

Hi %FIRSTNAME%,

Thanks for the audit request. I read every one personally.

I'll get back to you within 2-3 business days with the read-only audit:
top 3 leverage moves on your AC account, free of charge.

While you wait, two things:

1. If you want to talk before the audit comes back, my calendar is here:
   https://calendly.com/getner/activecampaign-strategy-session

2. If you'd prefer a deeper paid audit ($147–$297) instead — bigger
   scope, walkthrough call — just hit reply and let me know.

— Greg

Greg Getner
Boutique ActiveCampaign Management
getner.ai · greg@getner.ai
```

2. Add tag `lifecycle-prospect`

### 5B. Migration-Lead confirmation automation

**Trigger:** Tag `form-migration` added
**Steps:** Send a single confirmation, similar structure, pointing at the
migration-assessment Calendly link instead.

### 5C. Lead-source auto-tagging

**Trigger:** Tag `form-consult` (or `form-audit`, etc.) added — fires once per form submission

**Steps (an If/Else chain or sequential if-this-then-that nodes):**

```
If %UTM_SOURCE% contains "ac-cert" OR %HTTP_REFERRER% contains "activecampaign.com"
  → Add tag source-cert-directory
Else if %UTM_MEDIUM% = "referral" OR (%HTTP_REFERRER% not empty AND not search engine)
  → Add tag source-referral
Else if %UTM_MEDIUM% = "organic" OR %HTTP_REFERRER% contains "google.com" OR "bing.com" OR "duckduckgo.com"
  → Add tag source-search
Else if %UTM_SOURCE% in ("linkedin", "twitter", "x.com", "facebook")
  → Add tag source-social
Else if %UTM_SOURCE% empty AND %HTTP_REFERRER% empty
  → Add tag source-direct
Else
  → Add tag source-other
```

### 5D. Lifecycle stage auto-tagging

These are small automations that keep the lifecycle tags accurate.

- **Trigger:** Tag `consult-booked` added → add `lifecycle-call-booked`, remove `lifecycle-prospect` and `lifecycle-qualified`
- **Trigger:** Deal moved to `Won` → add `lifecycle-client-active` (already in Phase 4 — same automation)
- **Trigger:** Deal moved to `Lost` → add `lifecycle-disqualified`

---

## Tonight's checklist (printable)

Copy this into your todo app or print it.

**Phase 1 — Foundation (~45 min)**
- [ ] Create 3 lists: `audit-leads`, `migration-leads`, `clients-active`
- [ ] Create lifecycle tags (8)
- [ ] Create form-source tags (6)
- [ ] Create lead-source tags (5)
- [ ] Create engagement tags (3 — set by automation, just create them)
- [ ] Create form-data fields (13)
- [ ] Create AI-system fields (2)
- [ ] Create capture-data fields (7)
- [ ] Set First Name field default → `there`

**Phase 2 — AI Email 1 Wiring (~30 min)**
- [ ] Connect Gmail to AC Personal Sender (OAuth)
- [ ] Set Netlify env vars (`AC_API_URL`, `AC_API_KEY`, `FORM_WEBHOOK_SECRET`)
- [ ] Optional: set `RESEND_API_KEY` for internal alerts
- [ ] Enable Akismet in Netlify Forms
- [ ] Configure Netlify outgoing webhook for `consult-request`
- [ ] Test: submit `/consult/` form → check function logs + AC contact + alert email

**Phase 3 — Nurture Automation (~1.5 hr)**
- [ ] Paste 5 campaign drafts (Emails 1-5) including template Email 1 fallback
- [ ] Build automation: trigger + goals + If/Else + 5 sends + waits
- [ ] Activate automation
- [ ] Test: submit `/consult/` with new email → verify AI Email 1 arrives via Gmail

**Phase 4 — Deals CRM (~30 min)**
- [ ] Create Consulting pipeline + 7 stages
- [ ] Create 6 custom deal fields
- [ ] Build "Booking → Deal" automation
- [ ] Build "Won → Onboarding" automation
- [ ] Build "Lost → Reason Capture" automation
- [ ] Connect Calendly to AC; map event → tag

**Phase 5 — Quick Wins (~30 min)**
- [ ] Audit-lead confirmation automation
- [ ] Migration-lead confirmation automation
- [ ] Lead-source auto-tagging automation
- [ ] Lifecycle-stage auto-tagging automation

---

## Where I (Claude) can help in real-time tonight

| Task | How I help |
|---|---|
| Field options / dropdown values | Already in this doc — copy-paste ready |
| Campaign copy (Emails 1-5) | Already in `/docs/email-campaigns-paste-ready.md` |
| AI Email 1 wrapper for AC's automation step | In `/docs/claude-email-1-setup.md` section 5 |
| Function not behaving | Paste the Netlify function log; I'll diagnose |
| Eval prompt iteration | Run `npm run eval-email-1`, share outputs, I'll iterate the prompt |
| AC API doesn't take a payload | I'll check the AC API docs and rewrite the function call |
| Calendly Webhook Setup | Tell me the exact button names you see; I'll guide |
| Deliverability check on first AI email | Send test, paste headers (Show Original in Gmail) — I'll audit SPF/DKIM/DMARC alignment |
| Spam-flagged on Gmail | Iterate copy + headers based on what triggered |
| AC error messages | Paste the JSON error; I'll translate |
| New automation I haven't drafted | Tell me the trigger + goal; I'll draft the steps + copy |

**What I can't do:**
- Click buttons in AC (no working MCP this session; AC API doesn't expose automation creation anyway)
- Click buttons in Netlify
- OAuth flows
- DNS at GoDaddy

---

## Reference docs (deeper dives)

- `/docs/claude-email-1-setup.md` — full Personal Sender wiring + wrapper text
- `/docs/email-campaigns-paste-ready.md` — paste-ready Emails 1-5
- `/docs/ac-cert-leads-sequence.md` — original 5-email copy (markdown source)
- `/docs/ac-cert-leads-automation.md` — flowchart for the consult nurture
- `/docs/ac-implementation-plan.md` — earlier phased build plan (now superseded by this playbook)
