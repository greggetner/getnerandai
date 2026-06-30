---
topic_id: lead-scoring-in-ac
title: "Lead Scoring in ActiveCampaign: Building the Scoring Model"
category: Platform
platform: ac
drafted_at: 2026-06-30T15:23:26.917Z
word_count: 1586
---

# Lead Scoring in ActiveCampaign: Building the Scoring Model

*You're sitting on one of ActiveCampaign's most powerful features, but you're not using it because you don't know what numbers to assign to which behaviors.*

I open ActiveCampaign accounts every week. Course creators with six-figure launches. Membership sites doing eight figures. DTC brands running complex automations across hundreds of segments. The lead scoring feature is sitting there, ignored or half-configured with arbitrary point values someone set three years ago and never touched again.

The flexibility is the problem. ActiveCampaign gives you the entire scoring engine — positive signals, negative signals, decay rules, threshold triggers — but no framework for what actually matters. So most operators skip it entirely and fall back on tagging everything, building bloated segment conditions, or worse: treating every contact the same regardless of engagement level.

## Why Lead Scoring Actually Matters in Your Account

Lead scoring gives you a single numeric field — `Contact Score` — that updates automatically based on behavior. That number becomes a filter you can use everywhere: segment conditions, automation start triggers, conditional content blocks, deal stage advancement, and campaign send criteria.

The alternative is building parallel tagging systems that try to approximate engagement level. I've seen accounts with tags like `Engaged-Q1-2024` and `High-Intent-Webinar` and `Cold-Reactivation-Target` all trying to do what a scoring model does automatically. Those tags require manual maintenance. They go stale. Someone forgets to remove the old ones when adding new ones, and six months later you've got contacts with contradictory engagement tags.

A scoring model runs continuously in the background. Contact opens three emails in a week? Score goes up. Contact goes dark for sixty days? Score decays. No automation required. No tag cleanup sprint required.

## The Two-Part Scoring Framework

Every scoring model needs two inputs: signals that add points and signals that subtract them.

**Positive signals** are engagement behaviors that indicate interest, intent, or proximity to purchase. Opens, clicks, form submissions, page visits, webinar attendance, reply activity. In ActiveCampaign you configure these under **Contacts → Manage Scoring → Edit Rules**.

**Negative signals** are absence or disengagement behaviors. No opens in sixty days. Unsubscribed from a list. Clicked "not interested" on a survey. Abandoned cart three times without purchase. These subtract points.

Most accounts I audit only configure positive signals. The score climbs forever. A contact who was highly engaged two years ago still has a score of 95 even though they haven't opened an email in eighteen months. That score is useless for segmentation.

Decay matters more than most operators realize. ActiveCampaign lets you subtract points automatically when a contact hasn't performed a specific action within a timeframe. You set this per rule. A contact who opened an email might get `+2` points, but if they don't open anything in the next `30` days, they lose `-1` point per week until the score stabilizes.

## What to Score: The Engagement Layer

Start with email engagement. This is universal across every business model — courses, memberships, DTC, coaching programs, content businesses.

Here's the model I use in most accounts:

- **Email open (any campaign or automation):** `+1` point
- **Email click (any link):** `+3` points
- **Reply to any email:** `+5` points

Set decay rules for inactivity:

- **No email open in `30` days:** `-2` points per week
- **No click in `60` days:** `-5` points

In ActiveCampaign you configure this by creating a rule for "Opens an email" with a value of `1`, then adding a decay rule to that same action with a negative value and a time threshold. Do the same for clicks and replies.

The specific point values matter less than the relative weight. A click should be worth more than an open. A reply should be worth more than a click. Decay should be slower than accumulation so a single burst of activity doesn't immediately evaporate.

## What to Score: The Intent Layer

Email engagement tells you someone is paying attention. Intent signals tell you they're considering a purchase.

These are business-specific, but the common patterns:

- **Visited pricing page:** `+10` points
- **Visited sales page for primary offer:** `+8` points
- **Watched product demo video (tracked via site tracking or Vimeo/Wistia integration):** `+7` points
- **Downloaded lead magnet directly related to paid offer:** `+5` points
- **Attended live webinar or workshop:** `+12` points

ActiveCampaign's site tracking makes this possible. You add the tracking script to your site, then create scoring rules based on "Visits a page" with URL conditions. You can match exact URLs or use "contains" logic for dynamic product pages.

For the accounts I work in, intent scoring separates window-shoppers from people actually evaluating a purchase. A contact with a score of `40` built entirely from email opens is different from a contact with a score of `40` who visited your sales page three times last week.

## What to Score: The Conversion Layer

Once someone converts — purchases, books a call, joins a membership, enrolls in a course — their score should reflect that status.

- **Completed purchase (any product):** `+25` points
- **Booked sales call or strategy session:** `+20` points
- **Started trial or joined free challenge:** `+10` points

You trigger these rules using tags or list membership changes. In ActiveCampaign: create a rule for "Tag is added" and specify your purchase tag (e.g., `purchase-complete` or `customer-active`), then assign the point value.

I also configure negative conversion signals:

- **Refund processed:** `-30` points
- **Cancelled subscription:** `-20` points
- **No-showed on booked call:** `-10` points

This keeps your scoring model current. A contact who purchased, refunded, then went dark for ninety days shouldn't have the same score as an active customer.

## What to Score: The Disengagement Layer

Negative signals prevent score inflation and let you identify contacts who've checked out.

- **No email open in `60` days:** `-10` points
- **No site visit in `90` days:** `-8` points
- **Unsubscribed from any list:** `-50` points (effectively zeroing them out)
- **Marked email as spam:** `-100` points (nuclear option; you want this contact at the bottom)

In the accounts I run, the disengagement layer does two things: it pulls down scores for contacts who've drifted away, and it creates a clear segmentation threshold. Any contact below a score of `20` is cold. Between `20` and `50` is warm. Above `50` is hot. You can filter campaigns and automations accordingly.

## Sample 0–100 Scoring Model

Here's a complete reference model. You'll adapt the point values and actions to your business, but the structure holds:

**Engagement actions:**
- Email open: `+1`
- Email click: `+3`
- Reply to email: `+5`

**Intent actions:**
- Pricing page visit: `+10`
- Sales page visit: `+8`
- Case study or testimonial page visit: `+5`
- Lead magnet download (high-intent topic): `+6`
- Webinar registration: `+8`
- Webinar attendance: `+12`

**Conversion actions:**
- Purchase (any product): `+25`
- Sales call booked: `+20`
- Trial started: `+10`

**Disengagement actions:**
- No open in `30` days: `-2` per week
- No click in `60` days: `-5` total
- No site visit in `90` days: `-8` total
- Unsubscribed: `-50`
- Spam complaint: `-100`

**Negative conversion actions:**
- Refund: `-30`
- Subscription cancelled: `-20`
- Call no-show: `-10`

In ActiveCampaign, set this up under **Contacts → Manage Scoring**. Each rule is a separate line. Actions that add points use positive integers. Decay and negative behaviors use negative integers. You can create time-based decay by adding a rule with a threshold (e.g., "Has not opened an email in the last `30` days").

## Using the Score in Automations and Segments

Once your scoring model is live, the `Contact Score` field updates automatically. Now you filter everything through it.

**In segments:** create a condition for "Contact score is greater than `50`" to build a hot leads segment. Use "Contact score is less than `20`" for a cold reactivation segment. Layer these with other conditions — list membership, tag presence, custom field values — to get precise.

**In automations:** use an "If/Else" condition to branch based on score. If someone enters a nurture sequence with a score above `60`, skip the education emails and send them straight to the pitch. If their score is below `30`, send them re-engagement content before any offer.

**In campaigns:** filter your audience by score before sending promotional emails. Don't send your big launch campaign to contacts scoring below `25`. They're not engaged enough to convert, and sending to cold contacts damages deliverability.

**In conditional content:** use the score to show different content blocks within the same email. High scorers see case studies and testimonials. Low scorers see foundational content and re-engagement hooks. ActiveCampaign's conditional content blocks support score-based conditions.

The model runs itself. You configure it once, let it accumulate data for thirty days, then start using the score as a filter everywhere. Every few months, audit the point values. If you notice inflation — average scores creeping above `70` — increase your decay rates or reduce your positive signal values. If scores are too low — most contacts below `30` — your positive signals are too conservative or your decay is too aggressive.

---

Your scoring model is only as useful as the framework underneath it. Arbitrary point values create arbitrary scores. A structured model — engagement, intent, conversion, and disengagement layers with balanced weights and active decay — gives you a single number that actually means something.

If you want a second set of eyes on your ActiveCampaign scoring setup (or lack thereof), request a free audit at [https://getner.ai/audit/](https://getner.ai/audit/).