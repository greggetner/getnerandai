---
topic_id: first-30-min-audit-checklist
title: "The First-30-Minutes Audit I Run on Every New ActiveCampaign Account"
category: Platform
platform: ac
drafted_at: 2026-08-18T13:35:44.890Z
word_count: 1346
---

# The First-30-Minutes Audit I Run on Every New ActiveCampaign Account

*Before I quote any work, I spend thirty minutes in your account looking at five things—and what I find in that half-hour tells me exactly what the next ninety days need to look like.*

A prospect fills out the intake form. They send the account invite. I log in, and the canvas looks fine. Dozens of automations. Segmentation. Tagging. Someone clearly put in effort.

Then I run the checklist. Five data points. Thirty minutes. And I can tell you whether this is a tuning job or a rebuild—and what's leaking money right now.

## 1. Engagement Cohort Chart: Who's Actually Opening

First thing I do: pull the engagement report. ActiveCampaign has it under **Reports > Engagement**. I'm looking at the breakdown of contacts by engagement level over the last ninety days: `Highly Engaged`, `Active`, `Moderately Engaged`, `Barely Engaged`, `Never Engaged`.

**Pass threshold:** At least 40% of your list should be in the top two buckets combined (`Highly Engaged` + `Active`). Another 20–30% in `Moderately Engaged` is fine. The rest is dead weight.

**Fail threshold:** If more than half your list sits in `Barely Engaged` or `Never Engaged`, you're mailing a graveyard. Your deliverability is already compromised, and every campaign you send trains the inbox providers that your mail doesn't matter.

What this tells me about the next ninety days: if you fail, we're doing a sunset sequence immediately. We're segmenting the engaged contacts into their own subset and stopping broadcast sends to anyone who hasn't opened in six months. The alternative is watching your sender reputation crater and taking the engaged half of your list down with the dead half.

The accounts that pass this check rarely need more than tactical work. The ones that fail need list hygiene before we touch a single automation.

## 2. Google Postmaster Tools: What Gmail Actually Thinks of You

I ask for Postmaster Tools access during onboarding. If they haven't set it up, that's already a flag. Setting it up takes four minutes and a DNS TXT record.

Once I'm in, I'm looking at two things: **Domain Reputation** and **Spam Rate** over the last thirty days.

**Pass threshold:** Domain reputation is `High` or `Medium`. User-reported spam rate is below `0.10%`. IP reputation (if you're on a dedicated IP) is `High`.

**Fail threshold:** Domain reputation is `Low` or `Bad`. Spam rate is above `0.30%`. If I see spam rate spiking consistently above that line, Gmail is already throttling you—your mail is going to the promotions tab at best, spam folder at worst.

What this tells me: if your reputation is in the gutter, we're not launching anything new. We're pulling back send volume, tightening the engagement segment, fixing authentication (SPF, DKIM, DMARC), and rebuilding trust with the inbox providers. That's a sixty-day project minimum before we can run offense again.

If Postmaster looks clean, we can move fast. I know the infrastructure is sound and the problem is strategic, not technical.

## 3. Top Three Automations: Goal Completion Rate

Next I pull the three automations that should be doing the most work. Usually that's the welcome series, the post-purchase onboarding, and the lead nurture or application funnel.

I click into each one, go to **Reporting** at the top of the automation builder, and look at the number of contacts who entered versus the number who reached the `goal` step.

**Pass threshold:** The automation has a goal configured (not just an end tag), and at least 15–25% of contacts who enter actually reach it. The goal represents the outcome you want—purchased, booked a call, completed onboarding, tagged as `qualified`.

**Fail threshold:** No goal configured. Or the goal is there but completion rate is under 5%. Or—this is the most common pattern—the goal is at the very end of the automation instead of placed early so contacts can jump to it from anywhere in the sequence.

What this tells me: if there's no goal, the automation is a broadcast dressed up as a sequence. Contacts plow through every email whether or not they've already converted, and you're burning goodwill. If the goal exists but nobody reaches it, the sequence isn't doing its job. Either the offer is wrong, the messaging is wrong, or the sequence is too long and people tune out before the ask.

When I see well-structured goals with healthy completion rates, I know the operator understands automation logic. When I see none, we're starting from scratch on how to structure sequences that actually end when they should.

## 4. Tag Count and Taxonomy Health

I open the tag manager. **Contacts > Tags > Manage Tags**. Then I sort by tag name and start scrolling.

**Pass threshold:** Fewer than 200 tags total. Clear naming convention—either `Source: Webinar 2024-03` or `Behavior - Clicked Link 3` or something consistent. No random capitalization. No duplicates like `Purchased`, `purchased`, `Purchase Complete`, `Customer`.

**Fail threshold:** 400+ tags. No naming system. Tags that are just dates (`2023-09-15`). Tags that describe one-time events but never get removed (`Attended Live Event`). Tags with counts of one or two contacts. The classic: `test`, `test2`, `TEST`, `delete this`.

What this tells me: tag bloat means one of two things. Either the account has been running for years with no governance, or the operator is using tags like a CRM when they should be using custom fields and deal pipelines. Both are fixable, but the audit reveals how much archaeology we're doing.

If you pass, I know you've been intentional. Tagging is clean, segmentation is probably clean, and we're iterating on strategy, not cleaning up after six years of duct tape.

If you fail, we're doing a tag consolidation project in month one. I'll export the full tag list, flag everything that's redundant or obsolete, merge where we can, and build a taxonomy guide so this doesn't happen again.

## 5. Sender Address and Authentication Records

Last check: I go to **Settings > Advanced > SMTP & Tracking** and look at the sending domain. Then I verify the authentication records in DNS.

**Pass threshold:** You're sending from your own domain (`hello@yourbrand.com`), not a generic `@gmail.com` or `@myactivecampaign.com` address. SPF, DKIM, and DMARC are all configured and passing. DMARC policy is set to at least `p=quarantine`.

**Fail threshold:** You're still sending from ActiveCampaign's default domain. Or you've set up your domain but DKIM isn't aligned. Or DMARC isn't set up at all. Or—this still happens—SPF is broken because someone added too many includes and hit the lookup limit.

What this tells me: if authentication is missing or broken, you're flying blind. The inbox providers don't trust you, and your deliverability is a coin flip. This is table stakes, and if it's not done, everything else we're measuring is skewed.

When authentication is clean, I know someone either did the work or hired someone who knew what they were doing. We're building on a foundation. When it's missing, we're scheduling a call with whoever manages DNS, and nothing else moves until this is fixed.

## What This Half-Hour Tells Me

These five checks take thirty minutes. Sometimes less. And by the time I close the last tab, I know whether we're optimizing or rebuilding. I know whether the operator has been strategic or reactive. I know what's on fire and what can wait.

The accounts that pass all five are rare. When they show up, the work is fun—we're testing new sequences, tightening attribution, building out conditional content, layering in predictive sending. The upside is fast.

The accounts that fail three or more? We're playing defense for sixty days. Sunsetting the dead weight. Fixing authentication. Rebuilding trust with Gmail and Outlook. Cleaning up the tag mess. It's not glamorous, but it's the only way to get the program healthy enough to scale.

If you're reading this and you've never run these five checks on your own account, do it this week. You'll know exactly where you stand—and what needs to happen next.

**If you want me to run the audit for you, I still do them for free—just book it at [getner.ai/audit](https://getner.ai/audit/).**