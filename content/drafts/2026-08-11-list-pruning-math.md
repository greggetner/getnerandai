---
topic_id: list-pruning-math
title: "The Case for Pruning 30% of Your List (Running the Math)"
category: Retention
platform: ac
drafted_at: 2026-08-11T14:13:14.925Z
word_count: 1304
---

# The Case for Pruning 30% of Your List (Running the Math)

*Most operators resist list pruning because the raw count feels valuable, but sending to cold contacts drags inbox placement for your active segment—so deleting dead weight often increases total inbox deliveries of meaningful messages.*

I opened an ActiveCampaign account last month. 47,000 contacts. Owner runs a seven-figure coaching business. She was proud of the size. I filtered to `Has Opened Any Campaign` in the last 180 days and the number dropped to 19,000.

She was sending every broadcast, every automation, every nurture sequence to 28,000 people who hadn't opened an email in six months. Her active segment was paying the deliverability price for those dead addresses, and she was paying real dollars to host them.

The math says prune them. The emotional attachment to list size says don't. Let's run the numbers.

## The Deliverability Tax You're Already Paying

ActiveCampaign doesn't charge you for sends—it charges you for contacts. But Gmail, Outlook, and Yahoo charge you in reputation. Every domain you send from earns a sender score based on engagement. Low engagement signals spam. Spam signals get you filtered, throttled, or blocked.

When you send a broadcast campaign to 50,000 contacts and 22,000 of them never open, the inbox providers see a campaign with poor engagement. They don't separate "the engaged half did great" from "the cold half tanked it." They see the blended number and adjust placement accordingly.

The accounts I work in that resist list pruning typically show open rates in the 18–25% range on broadcast campaigns. The moment we segment to exclude cold contacts—`Has Not Opened Any Campaign` in the last 90 or 120 days—the same messaging to the remaining active segment jumps into the 35–50% range. Same subject lines. Same content. Smaller denominator, better placement, higher absolute opens.

## Running the Math: A Worked Example

Say you have 50,000 contacts in ActiveCampaign. You send a broadcast campaign promoting a new offer.

- 28,000 contacts have opened at least one campaign in the last 180 days. They're warm.
- 22,000 contacts have not opened anything in the last 180 days. They're cold.

You send to all 50,000. Here's what typically happens in the accounts I audit:

- The 28,000 warm contacts: ~40% open rate = 11,200 opens
- The 22,000 cold contacts: ~3% open rate = 660 opens
- **Total opens: 11,860**
- **Blended open rate: 23.7%**

That 23.7% signals mediocre engagement to inbox providers. Gmail starts placing your emails in the Promotions tab instead of Primary. Outlook throttles delivery. Your next campaign lands worse.

Now run the same campaign after pruning the 22,000 cold contacts:

- 28,000 warm contacts: ~48% open rate = 13,440 opens
- **Total opens: 13,440**
- **Blended open rate: 48%**

You got **1,580 more opens** by sending to 22,000 fewer people. The improved engagement signals better sender reputation. Your domain warms up. Future campaigns land better. The compounding effect over twelve months is substantial.

The 660 opens you "lost" from the cold segment weren't worth the deliverability drag they caused on the warm segment.

## The ActiveCampaign Hosting Cost

ActiveCampaign pricing tiers by contact count. At 50,000 contacts you're paying for the Professional plan at the 50K tier. Prune to 28,000 and you drop into a lower pricing band.

I'm not saying the cost savings alone justifies pruning—it's the smallest benefit—but it's real. You're paying monthly hosting fees for addresses that haven't engaged in six months. They're not prospects. They're not dormant customers who might wake up. They're dead weight.

In every account I've worked in that tracks cost-per-acquisition back to email, the cold segment shows negative or near-zero contribution after factoring in the deliverability tax they impose on the active segment. You're subsidizing dead addresses at the expense of live ones.

## How to Identify Contacts to Prune

Build a segment in ActiveCampaign using these conditions:

```
Has Not Opened Any Campaign
Date range: in the last 180 days
AND
Has Not Clicked Any Link in Campaign
Date range: in the last 180 days
AND
Is Not in Automation: [any active revenue-generating automation]
```

That last condition is critical. Don't prune someone mid-sequence. Let automations finish or move them to a goal step first.

You can tighten the window to 90 or 120 days if you send frequently. If you only send once a week or less, stick with 180 days.

Export that segment. Review it manually before you delete. Look for:

- Customers who haven't opened recently but have purchased in the last twelve months—move them to a re-engagement sequence instead of pruning immediately
- High-value contacts tagged as VIP, partner, affiliate, or referral source—exclude them from pruning
- Contacts added in the last 30 days who haven't had time to engage—exclude them

After you've filtered those exceptions, you're left with genuinely cold contacts. No opens, no clicks, no purchases, no special status. Delete them.

## The Re-Engagement Sequence (Run It First, Then Prune)

Before you delete, give them one last chance. Build a simple re-engagement automation in ActiveCampaign:

**Entry condition:** segment of cold contacts (same criteria above)

**Email 1** (day 0): subject line acknowledging the silence. "Still want to hear from me?" or "Should I keep sending?" Keep it short. Single CTA: click here to stay subscribed.

**Email 2** (day 4): similar framing, different angle. "Last chance to stay on the list."

**Email 3** (day 7): final notice. "I'm removing inactive subscribers this week. Click to stay."

**Goal step:** `Has Opened Any Campaign` or `Has Clicked Any Link in Campaign` in this automation. Anyone who hits the goal jumps out and stays on the main list.

**End of automation:** tag `Cold - No Response`. After the automation finishes, delete everyone with that tag.

In the programs I run, the re-engagement sequence recovers 4–8% of cold contacts. The rest confirm they're dead. Delete them.

## What Happens After You Prune

The first broadcast campaign after pruning will feel strange. The send count drops by 30–40%. The open rate jumps. The inbox providers notice. Your sender reputation improves over the next two to four weeks.

Expect a short adjustment period where Gmail and Outlook recalibrate. Keep sending consistently. Don't panic and add addresses back. The warm segment will stabilize at a higher engagement rate, and that higher rate will持续 improve placement over time.

You'll also see automation performance improve. Welcome sequences, nurture flows, and cart abandonment automations all benefit from better domain reputation. The cold contacts weren't opening those either—they were just dragging down your sender score across every automation you run.

In the accounts I've worked in that prune annually, the active segment stays healthier, costs less to maintain, and generates more absolute opens and clicks than the bloated list ever did.

## You're Not Losing Reach, You're Gaining Deliverability

The objection I hear most often: "But what if they come back? What if they buy later?"

They won't. A contact who hasn't opened an email in six months is not a dormant prospect waiting to wake up. They've changed addresses, marked you as spam, or trained their inbox provider to filter you automatically. Keeping them on the list doesn't preserve optionality—it actively harms the contacts who *do* want to hear from you.

Every cold contact you send to is a vote telling Gmail that your emails aren't relevant. Enough of those votes and Gmail stops delivering your emails to anyone, warm or cold. You lose reach by trying to preserve it.

Prune the dead weight. Your active segment will thank you with better opens, better clicks, and better revenue. The raw contact count never mattered. The engaged count always did.

---

If you're running a seven-figure business on ActiveCampaign and want a second set of eyes on your list hygiene, deliverability setup, and automation architecture, I offer a free audit: **https://getner.ai/audit/**