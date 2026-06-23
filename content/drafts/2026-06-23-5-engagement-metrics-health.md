---
topic_id: 5-engagement-metrics-health
title: "The 5 Engagement Metrics That Tell You Your List Is Healthy"
category: Analytics
platform: ac
drafted_at: 2026-06-23T15:44:28.532Z
word_count: 1366
---

# The 5 Engagement Metrics That Tell You Your List Is Healthy

*Open rate hasn't told you the truth since Apple Mail Privacy Protection rolled out in 2021, and click rate only tells you what happened two weeks after the problem started.*

I've been doing this for twenty-three years. The accounts I audit are almost always watching the wrong numbers. They see open rates holding at 40%, they assume the list is fine, and six months later they can't figure out why deliverability fell off a cliff or revenue-per-send dropped by half.

By the time click rate dips, you're already bleeding. The early signals—the ones that actually predict list health—are hiding in metrics most operators never pull. Here are the five I check first.

## Reply Rate on Relational Content

This is the earliest signal you'll get that your list still cares.

Once a quarter, I send a plain-text campaign from the founder's name asking a single question. No pitch. No link. Just a question that invites a real answer. "What's the biggest challenge you're facing with [topic] right now?" or "What made you sign up in the first place?"

If the list is healthy, you'll get replies from 0.5–2% of delivered contacts. Not clicks. Replies.

If you're under 0.2%, the list doesn't see you as a human anymore. You've trained them that your emails are transactional noise, not relational content. If you're above 3%, you've probably got a small, highly engaged list or you just sent something that triggered an emotional response (which is fine, but not sustainable as a baseline).

**What to do:** create a campaign in ActiveCampaign, write a plain-text email from your actual inbox address (use `Reply Tracking` enabled), and ask one question. Send it to your entire engaged segment—contacts who've opened or clicked in the last 90 days. Wait 48 hours. Count the replies in the campaign report under the `Replies` tab.

If you're under 0.5%, your content has drifted into broadcast mode. You need to reintroduce relational storytelling, kill the hyper-formatted emails, and stop pitching in every send.

## Unsubscribe Rate Trend

The absolute number doesn't matter as much as the direction.

A healthy list holds between 0.05% and 0.15% unsubscribe rate per campaign. That's normal attrition. People change jobs, lose interest, move on. If you're under 0.05%, your list might be too disengaged to even bother unsubscribing—they've already mentally tuned out. If you're consistently above 0.20%, you're burning the list faster than you're building it.

But the trend is what tells you when something breaks. I look at a rolling 30-day average in the `Reports` tab, filtered by campaigns only (not automations, since those fire on different cohorts). If the trend climbs week-over-week for three consecutive weeks, something in your content or frequency changed and the list is rejecting it.

**What to do:** in ActiveCampaign, go to `Reports` > `Campaigns`, export the last 30 campaigns, and calculate the average unsubscribe rate. Compare it to the previous 30. If it's climbed more than 50% (say, from 0.10% to 0.16%), audit the last four weeks of sends. Look for frequency spikes, sudden format changes, or a shift in voice. Roll one variable back and watch the trend for another week.

The worst thing you can do is ignore it and keep sending.

## Soft Bounce Rate Trend

Soft bounces are your canary in the coal mine for deliverability problems.

A soft bounce means the receiving server rejected the email temporarily—mailbox full, server overloaded, or increasingly common: the server is throttling you because your sender reputation is sliding. One-off soft bounces are noise. A rising soft bounce rate is a red flag.

Healthy programs hold under 1% soft bounce per campaign. If you're creeping toward 2–3%, Gmail or Outlook is already filtering you more aggressively. By the time you hit 5%, you're landing in spam for a meaningful chunk of your list.

I check this weekly. In ActiveCampaign, go to `Reports` > `Campaigns`, open the last five sends, and note the soft bounce count. Divide by delivered contacts. If the percentage is climbing week-over-week, your sender reputation is degrading.

**What to do:** first, confirm your authentication is clean—`SPF`, `DKIM`, and `DMARC` records in your DNS. ActiveCampaign's `Settings` > `Advanced` > `Email Authentication` will show you the status. If those are green and soft bounces are still climbing, you've got an engagement problem masquerading as a deliverability problem. Gmail and Outlook throttle senders whose lists don't engage.

Cut your broadcast frequency by 30% for two weeks and re-engagement the bottom 40% of your list with a dedicated winback automation. Soft bounces should stabilize within 10 days.

## Cohort Engagement Distribution

This tells you whether new subscribers are behaving like your old ones—or whether you're importing decay.

Segment your list into cohorts by the month they subscribed. In ActiveCampaign, create a segment with conditions: `Subscription Date` is between `first day of month X` and `last day of month X`. Do this for the last six months. Now look at the 30-day engagement rate for each cohort—contacts who opened or clicked at least once in the last 30 days, divided by total cohort size.

Healthy cohorts decay predictably. Month one: 40–60% engaged. Month three: 25–40%. Month six: 15–25%. The absolute numbers matter less than the pattern. If your most recent cohort (month one) is engaging at 20%, but your six-month cohort is still at 18%, your new subscribers are dead on arrival. You're acquiring the wrong people, or your welcome automation isn't doing its job.

**What to do:** pull the cohort engagement data for the last six months. If month-one engagement is below 35%, audit your lead sources. Look at the forms, landing pages, and ads feeding your list. You're either attracting cold traffic that doesn't know you, or your opt-in copy is overselling what you actually deliver.

If month-one is healthy but engagement drops off a cliff by month two, your welcome automation is the problem. Add a `goal` step after the first three emails that moves engaged contacts (those who've clicked at least once) into a different branch. Let them graduate into your regular broadcast rotation. Keep the unengaged contacts in a longer nurture track with relational content and no pitch for 30 days.

## Sends Per Engaged Contact

This is the efficiency metric no one tracks.

Take your total campaign sends in the last 30 days. Divide by the number of unique contacts who opened or clicked at least once in that same period. If you're sending five campaigns a week to 10,000 contacts, that's 200,000 sends. If only 2,000 contacts engaged, your sends-per-engaged-contact is 100:1. You sent 100 emails to get one person to care.

Healthy programs run between 8:1 and 20:1. Anything above 30:1 means you're carpet-bombing a mostly dead list. You're training Gmail to think you're a spammer, and you're paying for the privilege.

**What to do:** in ActiveCampaign, go to `Reports` > `Campaigns`, export the last 30 days of sends, and sum total delivered emails. Then create a segment: `Has opened or clicked a campaign in the last 30 days`. The segment size is your unique engaged contacts. Divide total sends by that number.

If you're above 25:1, you need to shrink your broadcast audience immediately. Create a segment called `Engaged - 90 Days` with conditions: `Has opened or clicked a campaign in the last 90 days`. Send only to that segment for the next 60 days. Move everyone else into a re-engagement automation—three emails over three weeks, plain-text, asking if they still want to hear from you. If they don't engage, suppress them from campaigns and let them sit in automations only.

This will cut your send volume and it will hurt your ego. It will also stabilize your deliverability and triple your revenue per send.

---

Open rate hasn't been reliable for three years. Click rate is a lagging indicator. The metrics that matter are the ones that tell you whether your list still sees you as a person worth hearing from—and whether you're burning the relationship faster than you're building it.

If you're not sure where your program sits, I'll audit it for free and show you exactly which of these five is breaking: [getner.ai/audit](https://getner.ai/audit/)