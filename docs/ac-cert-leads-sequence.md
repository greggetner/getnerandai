# AC Certified Consultant Lead Sequence

Reference doc for setting up the inbound-lead nurture in ActiveCampaign.

**Trigger:** Manual list add to `ac-cert-leads` (eventual: Zapier → Gmail filter on
"AC Certified Consultant Contact Submission" subject → AC API contact create + list add).

**Goal step:** Contact books any Calendly session → exit sequence + tag `consult-booked`.

**Service tiers referenced in copy:**
- Free audit — `/audit/` — $0, ~2–3 days
- Paid audit — $147–$297 (deeper review, walkthrough call)
- Done-with-you — $300/hr, no minimum
- Done-for-you — $3K–$20K project

**Pre-qualify form:** `https://getner.ai/consult/`
**Booking link:** `https://calendly.com/getner/activecampaign-strategy-session`

---

## Email 1 — Day 0 (immediate, ~5 min after list add)

**Subject:** Got your note — quick question before we talk

**Preheader:** Two-minute form so I don't waste your first 30 minutes.

**Body:**

Hi {{first_name}},

ActiveCampaign sent your message my way. Thanks for taking the step.

Before I block out time on the calendar, I want to make sure I'm the right fit for what you're trying to fix. There are four ways I work with people:

- **Free audit** — read-only review of your account, top 3 leverage moves. No cost.
- **Paid audit** — deeper diagnostic + 30-min walkthrough. $147–$297.
- **Done-with-you** — strategic guidance while your team builds. $300/hr, no minimum.
- **Done-for-you** — I plan it, build it, ship it. $3K–$20K depending on scope.

Two-minute form here so I can come back with a recommendation and a calendar link instead of a guessing-game discovery call:

→ **https://getner.ai/consult/**

If you'd rather skip the form and just talk, my calendar is here:
→ **https://calendly.com/getner/activecampaign-strategy-session**

Either works.

— Greg

Greg Getner
Boutique ActiveCampaign Management
getner.ai · greg@getner.ai

---

## Email 2 — Day 1 (24 hours later, only if not booked)

**Subject:** DwY vs DfY — which one are you?

**Preheader:** A short framework so you don't have to ask the question on the call.

**Body:**

Hi {{first_name}},

Most of the AC leads I get land in one of two camps. Quick decoder so you can self-sort before we connect:

**You're done-with-you ($300/hr) if:**
- You have someone in-house who can build (you, a marketing coordinator, a VA)
- You want a senior strategist on call to review work and steer direction
- You'd rather pay hourly for ad-hoc help than commit to a project
- You like keeping institutional knowledge inside your team

**You're done-for-you ($3K–$20K project) if:**
- You don't have time or internal capacity to build it yourself
- You want welcome / nurture / win-back / migration handed back working
- You'd rather pay a fixed price and get out of the weeds
- You're behind on revenue and need it shipped, not workshopped

**You're audit-first (free or paid) if:**
- You're not sure what's broken or where the leverage is
- You want a second opinion before committing budget
- You inherited the AC account and need someone to map it

If you already know which one you are, the form takes two minutes:

→ **https://getner.ai/consult/**

— Greg

---

## Email 3 — Day 3 (only if not booked)

**Subject:** The 5–10% rule (no ask in this one)

**Preheader:** Just a quick read on how I think about AC accounts.

**Body:**

Hi {{first_name}},

No ask in this email — just sharing how I work, in case it's useful.

Every AC account I've audited reveals the same pattern: roughly **5–10% of activity drives 90% of results.** Sometimes it's two emails in a welcome series. Sometimes it's a single segment. Sometimes it's three automations doing all the work while twelve others produce noise.

The job, almost always, is the same:

1. Find the 5–10% that's working
2. Double down on it
3. Stop carrying the dead weight

That's it. That's the whole methodology.

If you want me to do that for your account at no cost, the free audit is here:

→ **https://getner.ai/audit/**

If you've already decided you want to talk, the form is here:

→ **https://getner.ai/consult/**

Either way — no rush. I'll be here.

— Greg

---

## Email 4 — Day 7 (only if not booked)

**Subject:** What clients usually find

**Preheader:** Two real outcomes from the audit. Then I'll stop emailing for a week.

**Body:**

Hi {{first_name}},

Two examples of what comes out of the audit, since the abstract version doesn't always land:

**Course creator, ~$1.2M/yr.** Greg found that 2 of 7 welcome emails generated 95% of revenue. Killed the other 5, doubled down on the winners. **Result: +67% revenue, 71% less work.**

**Business coach.** Only 3 of 12 automations were driving 87% of conversions. Paused the other 9, perfected the 3. **Result: same revenue, 75% less complexity.**

The point isn't the numbers. The point is the pattern: most accounts are doing far more than they need to, and the consolidation always pays off.

A few ways to take the next step, smallest to biggest:

1. **Free audit** (no cost, no call required): https://getner.ai/audit/
2. **Pre-qualify form** (you tell me what you want, I recommend a path): https://getner.ai/consult/
3. **Direct booking** (you already know): https://calendly.com/getner/activecampaign-strategy-session

I'll send one more in a week, then I'll stop.

— Greg

---

## Email 5 — Day 14 (final, only if not booked)

**Subject:** Closing the loop

**Preheader:** Last email — I'll get out of your inbox.

**Body:**

Hi {{first_name}},

Last one from me on this thread. I know how cold inboxes work and I'd rather close the loop cleanly than nag.

If you want to talk now or later, three doors are open:

- **Free audit** — no call needed: https://getner.ai/audit/
- **Pre-qualify form** — I read it personally: https://getner.ai/consult/
- **Direct booking** — straight to my calendar: https://calendly.com/getner/activecampaign-strategy-session

If timing is just off, hit reply with a date and I'll set a reminder to come back to you then.

If you went a different direction, no problem — I appreciate you letting ActiveCampaign make the intro.

— Greg

Greg Getner
Boutique ActiveCampaign Management
getner.ai · greg@getner.ai

---

## Notes on tone & delivery

- **Send time:** 9–10am Eastern, Tuesday–Thursday preferred for emails 2–5. Email 1 fires immediately on list add.
- **From name:** "Greg Getner" (not "Getner & AI" — these are personal-feeling 1:1 emails)
- **Reply-to:** greg@getner.ai
- **Plain-text mode:** All five emails should send as plain text (or minimal HTML). No header images, no fancy templates. The whole point is "this is a person writing to a person."
- **No tracking pixels** on these emails. The Calendly link click and form-submit tags are enough signal.
- **Personalization fallback:** if `{{first_name}}` is empty, AC's conditional content should fall back to "there" — never `{{first_name}}` showing literally.
- **Exit triggers** (any of these = goal hit, exit sequence):
  - Books any Calendly event
  - Submits `/consult/` form
  - Submits `/audit/` form
  - Replies to any email in the sequence
