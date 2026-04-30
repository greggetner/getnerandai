# AC Automation: AC Certified Consultant Lead Nurture

Build this in ActiveCampaign → Automations → New Automation → Start from scratch.

---

## Setup (one-time)

### Lists
- Create list: **`ac-cert-leads`** (this is the trigger list for the automation)

### Tags
- `consult-booked` — applied when goal hits (any Calendly event booked)
- `consult-form-submitted` — applied if they submit `/consult/`
- `audit-form-submitted` — applied if they submit `/audit/`
- `replied-in-sequence` — applied if they reply to any email
- `nurture-completed` — applied at end of sequence (no booking)

### Custom field
- `lead_source` (text) — set to `ac-certified-consultant` when contact is added

---

## Automation flowchart

```
┌──────────────────────────────────────────────────────┐
│ TRIGGER                                              │
│ Subscribes to list "ac-cert-leads"                   │
│ (Run once per contact)                               │
└──────────────────────────┬───────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────┐
│ ACTION: Update contact field                         │
│ lead_source = "ac-certified-consultant"              │
└──────────────────────────┬───────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────┐
│ EMAIL 1 — "Got your note — quick question"           │
│ Send immediately                                     │
└──────────────────────────┬───────────────────────────┘
                           │
                           ▼
                   ┌───────────────┐
                   │  WAIT 1 day   │
                   └───────┬───────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   GOAL CHECK (1):      │
              │   Has tag              │
              │   "consult-booked"?    │
              └─────┬──────────────┬───┘
                YES │              │ NO
                    ▼              ▼
              ┌─────────┐    ┌────────────────────────┐
              │  EXIT   │    │ EMAIL 2 — "DwY vs DfY" │
              └─────────┘    └───────────┬────────────┘
                                         │
                                         ▼
                                 ┌───────────────┐
                                 │  WAIT 2 days  │
                                 └───────┬───────┘
                                         │
                                         ▼
                            ┌────────────────────────┐
                            │   GOAL CHECK (2):      │
                            │   Has tag              │
                            │   "consult-booked"?    │
                            └─────┬──────────────┬───┘
                              YES │              │ NO
                                  ▼              ▼
                            ┌─────────┐    ┌─────────────────────┐
                            │  EXIT   │    │ EMAIL 3 — "5–10%"   │
                            └─────────┘    └──────────┬──────────┘
                                                      │
                                                      ▼
                                              ┌───────────────┐
                                              │  WAIT 4 days  │
                                              └───────┬───────┘
                                                      │
                                                      ▼
                                         ┌────────────────────────┐
                                         │   GOAL CHECK (3):      │
                                         │   Has tag              │
                                         │   "consult-booked"?    │
                                         └─────┬──────────────┬───┘
                                           YES │              │ NO
                                               ▼              ▼
                                         ┌─────────┐    ┌─────────────────────┐
                                         │  EXIT   │    │ EMAIL 4 — "Clients" │
                                         └─────────┘    └──────────┬──────────┘
                                                                   │
                                                                   ▼
                                                           ┌───────────────┐
                                                           │  WAIT 7 days  │
                                                           └───────┬───────┘
                                                                   │
                                                                   ▼
                                                      ┌────────────────────────┐
                                                      │   GOAL CHECK (4):      │
                                                      │   Has tag              │
                                                      │   "consult-booked"?    │
                                                      └─────┬──────────────┬───┘
                                                        YES │              │ NO
                                                            ▼              ▼
                                                      ┌─────────┐    ┌────────────────────┐
                                                      │  EXIT   │    │ EMAIL 5 — "Closing"│
                                                      └─────────┘    └─────────┬──────────┘
                                                                               │
                                                                               ▼
                                                                  ┌────────────────────────┐
                                                                  │ ACTION: Add tag        │
                                                                  │ "nurture-completed"    │
                                                                  └────────────┬───────────┘
                                                                               │
                                                                               ▼
                                                                          ┌─────────┐
                                                                          │   END   │
                                                                          └─────────┘
```

---

## Goal step (the key piece)

In ActiveCampaign, a **Goal** is a special action you place once at the top of the
automation. When a contact triggers the goal, AC automatically jumps them out of
wherever they are in the sequence.

**Goal definition:**
- **Name:** "Booked consult call"
- **Trigger:** Has tag `consult-booked`
- **Position:** Top of automation, set to "Skip wait/email steps"
- **Action when goal hit:** End automation

This means you only need ONE goal step — the Yes branches in the flowchart above
are conceptual. Practically, AC handles the "skip ahead and exit" logic for you
once the tag is applied.

### What applies the `consult-booked` tag?

Three sources, all need to feed into AC:

1. **Calendly booking** — Calendly Zapier integration → AC: Add tag `consult-booked`
   when any event of type `activecampaign-strategy-session` or
   `activecampaign-migration-assessment` is booked, contact matched by email.

2. **`/consult/` form submission** — Netlify form webhook → Zapier → AC: Add tag
   `consult-form-submitted` AND `consult-booked` (form submission counts as
   a qualified lead, exit sequence).

3. **`/audit/` form submission** — same pattern → Zapier → AC: Add tag
   `audit-form-submitted` AND `consult-booked`.

(Optional 4th: contact replies to any email in sequence → AC's reply detection
applies `replied-in-sequence` tag → also counts as goal hit.)

---

## How to actually build it in AC

1. **Automations → New Automation → Start from scratch**
2. **Set trigger:** Subscribes to list "ac-cert-leads", run once per contact
3. **Add Goal action** at the top: "Has tag `consult-booked`" → Action: End automation
4. **Add Update contact field action:** `lead_source` = `ac-certified-consultant`
5. **Email 1** — create campaign, drop into automation, send immediately
6. **Wait 1 day**
7. **Email 2** — DwY vs DfY
8. **Wait 2 days**
9. **Email 3** — The 5–10% rule
10. **Wait 4 days**
11. **Email 4** — What clients find
12. **Wait 7 days**
13. **Email 5** — Closing the loop
14. **Add tag action:** `nurture-completed`
15. **End automation**

**Total elapsed time if no goal hit:** 14 days from list add to last email.

---

## Lead-capture pipeline (Gmail → AC)

The "AC Certified Consultant Contact Submission" Gmail message contains the
lead's name, email, company, and a short note. To get them into the
`ac-cert-leads` list automatically:

**Option A — Zapier (recommended):**
- Trigger: Gmail → New email matching subject "AC Certified Consultant Contact Submission"
- Step 1: Email Parser by Zapier → extract name, email, company, message
- Step 2: ActiveCampaign → "Create or Update Contact" with parsed fields
- Step 3: ActiveCampaign → "Add Contact to List" → `ac-cert-leads`
- Step 4: ActiveCampaign → "Update Contact Field" → `lead_source` = `ac-certified-consultant`

**Option B — Manual (start here while you validate the sequence):**
- When the Gmail comes in, hand-add the contact to the `ac-cert-leads` list in AC
- Takes ~30 seconds per lead, gives you a chance to scan the message first

Recommend running manual for the first 10–20 leads to validate copy, then
graduate to Zapier once the sequence is performing.

---

## Metrics to watch (in AC reports + Plausible)

**In AC:**
- Open rate per email (target: 50%+ on Email 1, 30%+ on Emails 2–5)
- Click rate per email (target: 15%+ on Email 1)
- Goal completion rate (target: 25%+ overall — this is what matters)
- Unsubscribe rate per email (kill any email that drives >2% unsubs)

**In Plausible (events already wired up):**
- `Consult Request Submitted` — measures `/consult/` form conversions
- `Audit Request Submitted` — measures `/audit/` form conversions
- Outbound clicks to Calendly URL — measures direct-book conversions

**Decision rule:** if any single email has <20% open rate, rewrite the subject.
If goal-completion sits below 15% after 30 leads, revise the sequence
(usually means too soft / too generic; tighten Email 2 specifically).
