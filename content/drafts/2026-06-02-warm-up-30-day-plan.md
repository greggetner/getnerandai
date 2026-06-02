---
topic_id: warm-up-30-day-plan
title: "Warming a New IP or Sending Domain: The 30-Day Plan"
category: Deliverability
drafted_at: 2026-06-02T17:15:15.126Z
word_count: 1235
---

# Warming a New IP or Sending Domain: The 30-Day Plan

*Spin up a new sending domain wrong and you'll spend the next six months crawling out of the spam folder—here's the 30-day ramp that actually works.*

## The Problem With Going Zero to Full Blast

Most operators treat a new sending domain like flipping a light switch. They configure SPF and DKIM, import their entire list, and fire off a broadcast to 80,000 contacts on day one. Gmail sees a brand-new domain suddenly blasting volume and flags it immediately. Not as spam—yet—but as untrusted. Your emails land in the promotions tab if you're lucky, spam if you're not, and now you're starting from a reputational hole that takes months to climb out of.

I've opened accounts where the operator burned through two domains in four months doing exactly this. By the third domain, even their engaged subscribers weren't seeing emails. ISPs have long memories.

The alternative is a structured domain warm-up: a 30-day plan that builds sender reputation incrementally by proving to ISPs that real humans want your mail. It's not complicated, but it is high-stakes. Miss a threshold and you're set back weeks.

## Days 1–3: Your Most Engaged 500

Start with the smallest, cleanest cohort you have. In ActiveCampaign, build a segment using these filters:

- Has opened or clicked any email in the last 30 days
- Sort by engagement score (highest first)
- Limit to 500 contacts

Send one email per day for three days. Not a welcome series. Not a pitch. A single broadcast or a short automation that delivers value and expects nothing. A useful resource, a case study, a How I Built This-style breakdown—something your best subscribers would forward.

**What to watch:** Open rate and user-reported spam rate in Gmail Postmaster Tools. If you're above `0.10%` spam complaints in the first 72 hours, your segmentation is bad. You're either including stale contacts or sending content that doesn't match what they signed up for. Pause and tighten the list.

Soft bounces should be near zero. If you're seeing `> 2%` soft bounce rate, your segment accidentally included suppressed or invalid addresses. Pull them out before day four.

## Days 4–10: Scale to Your Top 5,000

Expand the segment to your top 5,000 engaged contacts. Same criteria—opened or clicked in the last 30 to 60 days, sorted by engagement. Send daily or every other day, depending on your normal cadence. If you typically send three times a week, send three times a week. The goal is to mimic your mature sending pattern at lower volume.

**What to watch:** Soft bounce rate should stay under `1%`. User-reported spam rate in Gmail Postmaster Tools should stay under `0.10%`. If you hit `0.30%`, Gmail starts throttling. You won't see it as hard bounces—emails just won't arrive, or they'll land in spam silently.

Watch your domain reputation in Postmaster. It should show as "Low" on day one (new domains always do) and start climbing toward "Medium" by day seven. If it stays low or drops to "Bad," stop immediately. You've either got list hygiene issues or a content mismatch.

## Days 11–21: Double Every Three Days

Now you ramp. Every three days, double your sending volume:

- Days 11–13: 10,000 contacts
- Days 14–16: 20,000 contacts  
- Days 17–19: 40,000 contacts  
- Days 20–21: 80,000 contacts

Pull from progressively older engagement cohorts. Days 11–13 should include anyone who opened or clicked in the last 90 days. Days 14–16, expand to 120 days. By days 20–21, you're including anyone who's engaged in the last six months.

**Do not include unengaged contacts yet.** If someone hasn't opened an email in six months, they're dead weight during a warm-up. They drag down your engagement metrics and increase the chance someone marks you as spam because they forgot they subscribed.

**What to watch:** Soft bounce rate creeping up is normal as you expand the cohort, but it should stay under `2%`. If you hit `3%` or higher, you're pulling in stale addresses. Tighten your segment date range.

Gmail domain reputation in Postmaster should be climbing toward "Medium" or "High" by day 18. If it's stuck at "Low" or drops, pause the ramp for 48 hours and send only to your top 5,000 again. Let the metrics recover, then resume.

User-reported spam rate is your kill switch. If you cross `0.20%`, pause immediately. Above `0.30%`, Gmail throttles hard and you're looking at weeks of recovery time.

## Days 22–30: Full Volume, With Guardrails

You're now at or near your full list size. For the final nine days, send at normal volume and cadence, but continue excluding unengaged contacts. If your total list is 150,000 and only 90,000 have engaged in the last six months, keep sending to the 90,000.

After day 30, you can cautiously reintroduce older segments—contacts who haven't engaged in 9 or 12 months—but do it in small batches (5–10% of total volume per week) and watch spam rates closely.

**What to watch:** Domain reputation in Gmail Postmaster should be "Medium" or "High" by day 25. Anything lower means your warm-up didn't establish trust. Keep volume conservative and let reputation build naturally over the next two weeks before attempting full-list sends.

Soft bounce rates should stabilize under `1%`. User-reported spam should stay under `0.10%`. If you're clean through day 30 at these thresholds, your domain is warmed and you can operate normally.

## When to Pause (and How Long)

If at any point you hit these thresholds, stop sending immediately:

- User-reported spam rate `> 0.20%` in Gmail Postmaster
- Soft bounce rate `> 3%`  
- Domain reputation drops to "Low" or "Bad" in Postmaster after it had been climbing

Pause for 48 to 72 hours. Send nothing. Let the ISPs see silence, not continued volume. Then restart at half the volume you were at when you paused, using only your most engaged segment. Rebuild slowly—usually five to seven days at reduced volume—then resume the ramp.

I've seen operators ignore a `0.25%` spam rate on day 14 because "it's close enough." By day 18 they were at `0.40%` and Gmail had quietly routed 60% of their sends to spam. It took six weeks of conservative sending to recover. The pause always costs less than the recovery.

## The Mistake That Kills Most Warm-Ups

The pattern I see in almost every failed domain warm-up: the operator runs the plan perfectly for two weeks, sees decent opens and no obvious problems, then gets impatient and jumps straight to full volume on day 15.

ISPs don't react instantly. A spike in complaints or bounces on day 15 shows up as throttling or spam placement on day 17 or 18, after you've already sent three more high-volume batches. By the time you notice the problem in your metrics, the domain reputation is cratered and you're starting over.

The 30-day plan isn't 30 days because that's how long it takes your domain to warm. It's 30 days because that's how long it takes to catch and correct problems before they become permanent reputation damage.

---

If you're spinning up a new domain or your current sending reputation is already burned, the ramp is non-negotiable. There's no shortcut that doesn't cost you months on the back end.

Need someone to audit your current deliverability setup or walk through a warm-up plan for your account? I offer a free ActiveCampaign audit at https://getner.ai/audit/.