# ActiveCampaign Implementation Plan — getner.ai

End-to-end build spec for the ACCPG account (`accpgreggetner.activehosted.com`,
internal ID `4123620`). Phased so you can ship in chunks. Phase 1 is the only
prerequisite for accepting leads — Phases 2 and 3 can ship independently.

**Status legend:** ✅ done · 🟡 partially done · ⬜ not started

---

## Phase 1 — Foundation (lists, tags, fields)

### 1A · Lists

Keep this minimal. Tags do segmentation work; lists are coarse buckets for
sender-domain isolation and bulk-marketing eligibility.

| List | Purpose | Status |
|---|---|---|
| `ac-cert-leads` | Inbound consulting leads (consult form, AC Cert directory referrals, manual adds). The list the 5-email nurture sends to. | ✅ Created |
| `audit-leads` | `/audit/` form submissions only. Separate so the audit confirmation sequence can target just them. | ⬜ Create |
| `migration-leads` | `/free-migration/` form submissions. Separate sequence later. | ⬜ Create |
| `clients-active` | Anyone you've actually billed. Excluded from prospecting/nurture. | ⬜ Create |

Don't create lists per service tier (DwY/DfY/etc.) — that's what tags are for.

### 1B · Tags

Tags do the heavy lifting. Group them by purpose; consistent prefixes
make filtering in AC's UI bearable as the list grows.

**Lifecycle (where they are in your funnel):**

| Tag | Set when | Status |
|---|---|---|
| `lifecycle-prospect` | Form submitted, no qualification yet | ⬜ |
| `lifecycle-qualified` | Has filled out a form OR booked a call | ⬜ |
| `lifecycle-call-booked` | Calendly event scheduled | ⬜ |
| `lifecycle-call-held` | You marked the call as held | ⬜ |
| `lifecycle-proposal-sent` | Proposal/quote went out | ⬜ |
| `lifecycle-client-active` | Engagement started | ⬜ |
| `lifecycle-client-past` | Engagement ended (renewable) | ⬜ |
| `lifecycle-disqualified` | Not a fit (note reason in deal/note) | ⬜ |

**Form-source (which form they came in through):**

| Tag | Source | Status |
|---|---|---|
| `form-consult` | `/consult/` form | ⬜ |
| `form-audit` | `/audit/` form | ⬜ |
| `form-migration` | `/free-migration/` form | ⬜ |
| `form-application` | Homepage Apply modal | ⬜ |
| `form-contact` | Homepage / `/free-migration/` Contact form | ⬜ |
| `form-ai-terminal` | Homepage AI terminal email capture | ⬜ |

**Lead source (where they came from before the form):**

| Tag | Set when | Status |
|---|---|---|
| `source-cert-directory` | UTM/referrer matches AC Certified Consultant directory | ⬜ |
| `source-search` | UTM medium = organic OR no UTM + search-engine referrer | ⬜ |
| `source-referral` | UTM medium = referral OR external non-search referrer | ⬜ |
| `source-direct` | No UTM, no referrer | ⬜ |
| `source-social` | UTM source matches LI/Twitter/etc. | ⬜ |

**Sequence/automation state (already exist):**

| Tag | Purpose | Status |
|---|---|---|
| `consult-form-submitted` | Triggers consult nurture | ✅ |
| `audit-form-submitted` | Triggers audit confirmation | ✅ |
| `consult-booked` | Goal/exit for consult nurture | ✅ |
| `replied-in-sequence` | Manual exit when a contact replies | ✅ |
| `nurture-completed` | End-of-sequence final state | ✅ |

**Engagement (computed automatically by AC behavior + custom automations):**

| Tag | Set when | Status |
|---|---|---|
| `engagement-active` | Opened/clicked anything in last 30d | ⬜ |
| `engagement-cold` | No opens/clicks in 90d | ⬜ |
| `engagement-replied-anytime` | Has ever replied to any send | ⬜ |

### 1C · Custom contact fields

**Already created (`%PERSTAG%` shown):**

| Field | Type | Tag |
|---|---|---|
| `Lead Source` | Dropdown | `%LEAD_SOURCE%` |
| `Existing AC Account` | Dropdown | `%EXISTING_AC%` |

**To create — form-data fields:**

| Field | Type | Tag | Used by | Options |
|---|---|---|---|---|
| `List Size` | Dropdown | `%LIST_SIZE%` | consult, audit, migration, application | Not yet on AC / Under 10K / 10K–50K / 50K–100K / 100K–500K / 500K–1M / 1M–5M / 5M–10M / 10M+ |
| `Revenue Band` | Dropdown | `%REVENUE_BAND%` | consult | Not tracking yet / Under $10K/mo / $10K–$50K/mo / $50K–$100K/mo / $100K–$500K/mo / $500K+/mo |
| `Engagement Type` | Dropdown | `%ENGAGEMENT_TYPE%` | consult | Free audit / Paid audit ($147–$297) / Done-with-you ($300/hr) / Done-for-you ($3K–$20K project) / Not sure — recommend |
| `Timeline` | Dropdown | `%TIMELINE%` | consult, application | ASAP — this week / Within 30 days / 60–90 days / Just exploring |
| `Context` | Paragraph | `%CONTEXT%` | consult, audit, migration, contact | — |
| `Business Type` | Dropdown | `%BUSINESS_TYPE%` | audit | Life / business coach / Course creator / online educator / E-commerce / retail brand / Software / SaaS company / Content creator / influencer / B2B service / Agency / service provider / Entertainment / music industry / Other |
| `Primary Goal` | Dropdown | `%PRIMARY_GOAL%` | audit | Identify my highest-impact activities (Hyper-Pareto analysis) / Improve deliverability & inbox placement / Increase email engagement (opens / clicks) / Generate more revenue from ActiveCampaign / Fix automation performance issues / Get an expert second opinion on my current setup / Other |
| `Current Platform` | Dropdown | `%CURRENT_PLATFORM%` | migration | Mailchimp / Klaviyo / ConvertKit / HubSpot / Other |
| `Concern` | Paragraph | `%CONCERN%` | migration | — |
| `Experience` | Dropdown | `%EXPERIENCE%` | application | New to ActiveCampaign (just getting started) / Somewhat experienced (been using it 6+ months) / Very experienced (power user, advanced features) / Expert level (know the platform inside & out) |
| `Challenge` | Paragraph | `%CHALLENGE%` | application | — |
| `Transcript` | Paragraph (large) | `%TRANSCRIPT%` | ai-terminal | — |
| `Question Count` | Number | `%QUESTION_COUNT%` | ai-terminal | — |

**To create — capture-data fields (populated by `/scripts/utm-capture.js`):**

| Field | Type | Tag |
|---|---|---|
| `UTM Source` | Text | `%UTM_SOURCE%` |
| `UTM Medium` | Text | `%UTM_MEDIUM%` |
| `UTM Campaign` | Text | `%UTM_CAMPAIGN%` |
| `UTM Term` | Text | `%UTM_TERM%` |
| `UTM Content` | Text | `%UTM_CONTENT%` |
| `HTTP Referrer` | Text | `%HTTP_REFERRER%` |
| `Landing Page` | Text | `%LANDING_PAGE%` |

**One-time:** Set First Name field's **default value** to `there` so `%FIRSTNAME%`
never renders blank in personalization.

### 1D · Groups (team permissions)

Solo operator → just the default `Admin` group with you in it. AC's "Groups"
are user-permission groups, not contact segments. Skip until you hire.

---

## Phase 2 — Automations

Build in this order. Each is independent.

### 2A · Consult-Lead Nurture (5-email sequence)

**Trigger:** Tag added → `consult-form-submitted`
**Send to:** `ac-cert-leads` list
**Reference:** `/docs/ac-cert-leads-sequence.md` + `/docs/email-campaigns-paste-ready.md` + `/docs/ac-cert-leads-automation.md`

**Steps:**

```
[Trigger: tag "consult-form-submitted" added]
        ↓
[Goal: tag "consult-booked" → end automation]
[Goal: tag "replied-in-sequence" → end automation]
        ↓
[Send: Email 1 — Day 0]
        ↓
[Wait 1 day]
        ↓
[Send: Email 2 — Day 1]
        ↓
[Wait 2 days]
        ↓
[Send: Email 3 — Day 3]
        ↓
[Wait 4 days]
        ↓
[Send: Email 4 — Day 7]
        ↓
[Wait 7 days]
        ↓
[Send: Email 5 — Day 14]
        ↓
[Add tag: "nurture-completed"]
        ↓
[End]
```

**Calendly booking → tag `consult-booked`:** wire via Calendly's native AC
integration (cleanest) or Zapier. See deals section for the corresponding
deal stage move.

### 2B · Audit-Lead Confirmation

**Trigger:** Tag added → `audit-form-submitted`
**Single email** confirming receipt + 2–3 day ETA + soft mention of paid audit.
**Optional Day 7 follow-up** if no response.

### 2C · Migration-Lead Confirmation

**Trigger:** Tag added → `form-migration` (or list subscribe to `migration-leads`)
**Single email** confirming receipt + Calendly migration assessment link.

### 2D · Lead-Source Tagging (auto-classify on entry)

**Trigger:** Field changes → `UTM Source` updated, OR `HTTP Referrer` updated
**If/else logic:**

```
IF utm_source = "ac-cert-directory" OR HTTP Referrer contains "activecampaign.com"
  → Add tag "source-cert-directory"
ELSE IF utm_medium = "referral" OR (referrer not empty AND not a search engine)
  → Add tag "source-referral"
ELSE IF utm_medium = "organic" OR referrer contains "google.com" / "bing.com" / "duckduckgo.com"
  → Add tag "source-search"
ELSE IF referrer empty AND utm_source empty
  → Add tag "source-direct"
ELSE
  → Add tag "source-other"
```

### 2E · Lifecycle-Stage Auto-Tagging

**Trigger:** Tag added → `consult-booked` → add `lifecycle-call-booked`, remove `lifecycle-prospect` / `lifecycle-qualified`
**Trigger:** Deal moved to "Won" → add `lifecycle-client-active`
**Trigger:** Deal moved to "Lost" → add `lifecycle-disqualified`

### 2F · Cold Re-engagement (long-term)

**Trigger:** Tag `nurture-completed` + 90 days elapsed AND no opens/clicks since
**Single email:** "Checking in — anything changed?"
**Then:** add `engagement-cold`, exit.

### 2G · New Client Onboarding

**Trigger:** Deal moved to "Won"
- Welcome email with kickoff steps
- Add tag `lifecycle-client-active`
- Subscribe to `clients-active` list
- Unsubscribe from `ac-cert-leads`, `audit-leads`, `migration-leads`

---

## Phase 3 — Deals CRM

### 3A · Pipeline structure

**One pipeline: `Consulting`.** Tier is a custom field, not a separate pipeline.
Multiple pipelines per service tier fragments your forecast and is overkill at
your volume.

**Stages (with default win probabilities for forecasting):**

| Order | Stage | Probability | What it means |
|---|---|---|---|
| 1 | New Inquiry | 5% | Form submitted, no qualification yet |
| 2 | Qualified | 15% | Form filled OR call booked |
| 3 | Discovery Held | 30% | Strategy session completed |
| 4 | Proposal Sent | 50% | Written proposal/quote out |
| 5 | Negotiating | 75% | Active back-and-forth on terms |
| 6 | Won | 100% | Signed/paid |
| 7 | Lost | 0% | Closed dead — capture reason in custom field |

### 3B · Custom deal fields

| Field | Type | Options / Notes |
|---|---|---|
| `Service Tier` | Dropdown | Free Audit / Paid Audit ($147–$297) / Done-with-you ($300/hr) / Done-for-you ($3K–$20K) / Other |
| `Loss Reason` | Dropdown | Price / Timing / Fit / Ghosted / Won by competitor / Re-evaluating / Other |
| `Project Start Date` | Date | When work actually begins |
| `Estimated Close Date` | Date | Forecast |
| `Lead Source Form` | Text | Mirrors contact's form-source — for deal-level reporting |
| `Hours Estimate` | Number | DwY engagement size |
| `Project Value` | Currency | Built-in deal value field if AC has one; else custom |

### 3C · Deal automations

**Trigger:** Tag added → `consult-booked`
- Action: Create new deal in `Consulting` pipeline at stage `Qualified`
- Set `Lead Source Form` from contact's form-source tag

**Trigger:** Calendly event status = `Held`
- Action: Move deal to `Discovery Held`
- (Wire via Calendly + Zapier if no native trigger)

**Trigger:** Deal moved to `Won`
- Action: Add tag `lifecycle-client-active` to contact
- Action: Subscribe to `clients-active` list, unsubscribe from prospecting lists
- Trigger automation 2G (onboarding sequence)

**Trigger:** Deal moved to `Lost`
- Action: Add tag `lifecycle-disqualified`
- Action: Send yourself an internal task: "Review loss reason: %DEAL_LOSS_REASON%"

### 3D · Pipeline reporting

Once 10+ deals are in: AC's pipeline reports give you weighted forecast
(value × probability), conversion rate per stage, and average days in stage.
Use that to find the leakiest stage and fix it first.

---

## Build order — recommended sequencing

1. **Phase 1A + 1B + 1C** — lists, tags, fields. ~30 min in AC's UI.
2. **Phase 2A** — consult-lead nurture (paste 5 campaigns + build automation in visual builder). Refer to `/docs/email-campaigns-paste-ready.md` and `/docs/ac-cert-leads-automation.md`. ~1 hour.
3. **Phase 3A + 3B** — pipeline + deal fields. ~15 min.
4. **Phase 3C** — deal automations. ~30 min.
5. **Phase 2B + 2C** — audit and migration confirmations. ~30 min.
6. **Phase 2D + 2E** — auto-tagging (lead source + lifecycle). ~45 min.
7. **Phase 2F + 2G** — long-term re-engagement and onboarding. ~30 min.

Total: ~4 hours of clicking, spread over a day.

---

## What NOT to build (yet)

- **Per-tier pipelines.** One pipeline + tier custom field. Don't fragment.
- **Deep segmentation.** Tags + 1–2 lists handle this until you have >500 contacts.
- **Lead scoring (AC's points system).** Useful at >100 leads/month. Not yet.
- **SMS / Conversations.** Email-only is the brand promise. Don't add channels for the sake of having them.
- **Automation maps with >10 branches.** AC's UI gets unmanageable past ~10 nodes; refactor into linked sub-automations before you ever cross that.

---

## External integrations to wire when ready

| Integration | Purpose | Setup |
|---|---|---|
| Calendly → AC | Auto-tag `consult-booked` on booking | Calendly → Integrations → AC → connect with API URL + key |
| Zapier (Gmail → AC) | Auto-create contact from "AC Certified Consultant Contact Submission" emails | Memory recommends 10–20 leads manually first |
| Zapier (Gmail label → AC) | Auto-tag `replied-in-sequence` from a Gmail filter label | Build after consult automation is live |
| Netlify forms → AC | Auto-create contact from form submissions | Zapier (Netlify Forms trigger → AC create-or-update contact); maps form fields to AC custom fields per the schema above |
