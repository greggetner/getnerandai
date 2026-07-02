---
topic_id: klaviyo-five-segments
title: "The 5 Klaviyo Segments Every Store Should Build First"
category: Segments
platform: klaviyo
drafted_at: 2026-07-02T15:06:41.474Z
word_count: 1320
---

# The 5 Klaviyo Segments Every Store Should Build First

*You have sixty-three segments in Klaviyo, and when it's time to send a campaign you still can't answer "who should get this email?"*

I see this in almost every Klaviyo account I audit. Segments named `promo_april_test_2`, `VIP_MAYBE`, `engaged_90days_old_version`. Dozens of one-off definitions built for a single send and never deleted. The segment library becomes a junk drawer, and when you need to answer basic questions—who's actually reading our emails? who's bought before? who should we stop mailing?—you're building from scratch every time.

Most stores need five core segments. Build these right, use them consistently, and you'll have clean answers to the questions that actually matter.

## 1. Engaged Subscribers (30–60 Days)

This is your primary sending audience for most campaigns. The definition: anyone who's opened or clicked an email in the last 30 to 60 days. Not 90. Not 180. Recent engagement predicts future engagement, and sending to people who haven't touched an email in three months destroys your deliverability metrics and trains Gmail to assume your mail isn't wanted.

**How to build it in Klaviyo:**

Create a new segment. Add two conditions under "What someone has done (or not done)":

- `What someone has done` > `Opened Email` > `at least once` > `in the last 30 days`
- OR (set to "OR", not "AND")
- `What someone has done` > `Clicked Email` > `at least once` > `in the last 30 days`

Name it `Engaged 30d` or `Core Engaged`. Use this as your default audience for newsletters, promotions, product launches, and content campaigns.

In the programs I run, this is the segment that gets nearly everything. If you're sending a weekly newsletter and you're not filtering to engaged subscribers, you're training inbox providers that a large portion of your list doesn't want your mail. Once Gmail decides that, your engaged subscribers stop seeing you too.

## 2. Customers (All-Time Buyers)

You need a clean, reliable definition of "has bought from us, ever." Klaviyo makes this dead simple, but I still find accounts using a dozen proxy definitions—`ordered_yes` tags, list uploads, manual CSV imports—instead of the native metric condition.

**How to build it:**

Create a segment with one condition:

- `What someone has done` > `Placed Order` > `at least once` > `over all time`

Name it `Customers - All Time`. 

This is your most valuable segment. Use it to suppress buyers from prospect-focused campaigns. Use it to build sub-segments (recent buyers, lapsed customers, high-AOV). Use it as the inclusion condition for customer-only offers, restocks on products they've purchased, and loyalty plays.

And use it to exclude people from flows that only make sense for non-buyers. If you're running a first-purchase incentive campaign and you send it to existing customers, you're lighting money on fire.

## 3. Lapsed Customers

These are people who bought once (or multiple times) and haven't come back. The exact lookback window depends on your purchase cycle, but for most DTC brands, 90 to 180 days is the right range. For supplements or consumables, it might be 45 days. For furniture, it might be a year. Use your median time between orders as the baseline.

**How to build it:**

Create a segment with two conditions:

- `What someone has done` > `Placed Order` > `at least once` > `over all time`
- AND
- `What someone has not done` > `Placed Order` > `in the last 90 days` (or your chosen window)

Name it `Lapsed Customers - 90d` (adjust the label to match your window).

This segment is your reactivation target. Send them a "we miss you" campaign. Offer a win-back discount. Show them new products that didn't exist when they last bought. Remind them why they bought in the first place.

The mistake I see: stores treat lapsed customers the same as never-purchased subscribers. They're not. Someone who's already given you money once is infinitely more likely to do it again than someone who never has. Segment them separately, message them differently, and give them reasons to come back.

## 4. Never-Purchased Subscribers

These are people on your list who haven't bought yet. They're signed up, they might be engaged, but they've never converted. This is your prospect universe.

**How to build it:**

Create a segment with one condition:

- `What someone has not done` > `Placed Order` > `over all time`

Name it `Never Purchased`.

Layer this with your engaged segment to create `Engaged Non-Buyers`—the subset of prospects who are still opening and clicking but haven't pulled the trigger. That's your highest-intent prospect audience, and it's where most of your conversion-focused campaigns should go.

In the accounts I work in, this segment often reveals that 60% to 80% of the list has never bought. That's not inherently bad, but if you're not treating prospects and customers differently, you're wasting both opportunities. Prospects need education, social proof, objection handling, and incentive. Customers need retention, cross-sell, and reasons to come back.

## 5. Suppression Segment (Poor Engagement)

This is the segment you send to almost never. It's the inverse of your engaged segment: people who haven't opened or clicked in 60+ days (or 90, depending on how conservative you want to be). These profiles drag down your sender reputation, cost you money on your Klaviyo plan, and train inbox providers that your mail isn't wanted.

**How to build it:**

Create a segment with two conditions:

- `What someone has not done` > `Opened Email` > `in the last 60 days`
- AND
- `What someone has not done` > `Clicked Email` > `in the last 60 days`

Name it `Disengaged 60d` or `Suppression List`.

Use this segment as an exclusion on most campaigns. When you're building a campaign in Klaviyo and choosing recipients, add this segment to the "Exclude" section. 

The only time you should mail this segment: a dedicated sunset flow or re-engagement campaign. One last attempt to wake them up before you stop sending entirely. If they don't engage with that, suppress them from future sends or remove them from your list. Continuing to mail unengaged profiles is expensive and destructive.

## What Gets Sent to Each Segment

The segments only matter if you use them consistently. Here's the decision tree I follow in the programs I run:

- **Newsletter, content, general announcements:** `Engaged 30d` only. Exclude `Disengaged 60d`.
- **Promotions and sales:** `Engaged 30d`, sometimes segmented further into `Engaged Non-Buyers` (prospect offer) and `Engaged Customers` (loyalty offer). Exclude `Disengaged 60d`.
- **New product launch:** `Engaged 30d` or `Customers - All Time` depending on whether it's a prospect play or a customer-first launch.
- **Win-back campaigns:** `Lapsed Customers - 90d`, and consider excluding anyone already in an active flow.
- **Re-engagement / sunset:** `Disengaged 60d` only, and only once or twice before full suppression.

Most campaigns should go to engaged subscribers only. If you're not filtering to engagement, you're training Gmail and Apple that most of your list doesn't care. Once that signal is set, your engaged subscribers stop seeing you in the primary tab—or stop seeing you at all.

## Build These Five, Then Build Everything Else on Top

You don't need sixty-three segments. You need five that answer the core questions: Who's paying attention? Who's bought? Who used to buy and stopped? Who's never bought? Who should we stop mailing?

Build these five first. Name them clearly. Use them on every campaign. Layer them together when you need more precision—`Engaged 30d AND Customers - All Time` for engaged buyers, `Engaged 30d AND Never Purchased` for engaged prospects. But start with these definitions, because every other segment you build should reference one of them.

The accounts that perform well aren't the ones with the most segments. They're the ones that know exactly who they're talking to, every time they send.

If you want a second set of eyes on your Klaviyo setup—segments, flows, deliverability, and everything else—grab a free audit at https://getner.ai/audit/.