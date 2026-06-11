---
topic_id: utm-that-ties-back
title: "Setting Up UTM Tracking That Actually Ties Revenue Back to Email"
category: Analytics
drafted_at: 2026-06-11T16:45:31.046Z
word_count: 1420
---

# Setting Up UTM Tracking That Actually Ties Revenue Back to Email

*Most operators track email inconsistently — some campaigns have UTMs, some don't, the values conflict across automations — and when you try to answer "which emails drove revenue last quarter?" the data is worthless.*

I open ActiveCampaign accounts and ask to see the attribution report. The operator pulls it up, filters by source, and we see fifteen variations of what should be the same value: `email`, `Email`, `newsletter`, `ActiveCampaign`, `campaign`, `ac`, and eight URLs with no UTM parameters at all. 

The report can't group anything. Revenue is scattered across made-up source names. The operator can't tell which automations are working, which broadcasts are paying for themselves, or whether the nurture sequence they spent two weeks building has ever closed a single deal.

## The Real Cost of Inconsistent UTM Tracking

When your UTM taxonomy is broken, you lose the ability to make decisions. You can't kill underperforming broadcasts because you don't know which ones underperform. You can't double down on high-converting automations because the revenue never traces back to them. You end up optimizing based on open rates and gut feeling instead of actual dollars.

The pattern I see across the accounts I work in: UTM parameters are added inconsistently by whoever is sending that week. A contractor sets them one way. The operator sets them another. A campaign goes out with no parameters at all because someone forgot. Six months later, the attribution data is a junk drawer.

## The UTM Taxonomy That Actually Works

Here's the structure that makes email attribution work:

- **`utm_source=email`** — always `email`, never anything else, always lowercase
- **`utm_medium={broadcast|automation|nurture}`** — three values, that's it
- **`utm_campaign={campaign-name}`** — the name of the specific broadcast or automation, lowercase, hyphens instead of spaces
- **`utm_content={variant}`** — optional, use it when you're testing link placement, CTA copy, or sending to different segments

Every link in every email gets all four parameters. No exceptions.

### The Three Medium Values

`broadcast` is a one-time send to a list or segment. Your weekly newsletter. A product launch announcement. A flash sale. If you wrote it once and hit send, it's a broadcast.

`automation` is a triggered sequence tied to a specific behavior or event. Welcome series. Post-purchase onboarding. Abandoned cart. If it fires based on a tag, list subscription, or event, it's an automation.

`nurture` is a longer-term educational or relationship sequence that isn't directly tied to a single conversion event. A 12-week course delivery sequence. A monthly content drip. Use this when the sequence is about engagement over time, not immediate conversion.

Most operators try to track by campaign name alone and end up with sixty campaign names that mean nothing six months later. The medium parameter is what lets you roll up performance by type. You can see all automation revenue vs. all broadcast revenue. You can compare nurture performance across programs. The campaign name gives you the detail; the medium gives you the category.

## The Single Rule That Makes Attribution Work

Write the taxonomy down. Put it in a Google Doc, a Notion page, a Slack pinned message. Title it "UTM Standards" and include the exact parameter values you use.

Then review it before every send.

Not after. Not during QA. Before you build the campaign or automation. Before you write the copy. The moment you decide to create a new email, you decide what the UTM parameters will be and you write them down next to the campaign name in your project tracker.

I've built this into the programs I run: the campaign brief template has a UTM field at the top. If it's blank, the email doesn't get built. If the parameters don't match the taxonomy, it doesn't go into ActiveCampaign.

Tracking fails when it's treated as a last-minute detail. It works when it's a required field.

## The Mini-Audit: Find Broken Tracking in Your Current Setup

Pull your last thirty days of email sends — broadcasts and automations. Export the campaign list from ActiveCampaign or pull the data from Google Analytics if you're tracking email traffic there.

Look for three patterns:

**Pattern one: missing UTMs.** Open ten recent broadcast campaigns in ActiveCampaign. Click through to preview the email. Right-click any link and copy the URL. Paste it into a text editor. If you don't see `utm_source=`, `utm_medium=`, and `utm_campaign=` in every link, your tracking is broken. 

Do the same for your top five automations. Open the automation, click into each email, preview, check the links. Missing parameters mean missing attribution.

**Pattern two: inconsistent source values.** If you're using Google Analytics, go to Acquisition > All Traffic > Source/Medium and filter the date range to the last ninety days. Look at the source column. If you see more than one value that should mean "email" — `email`, `newsletter`, `activecampaign`, `campaign` — your data is fragmented. Revenue is being split across sources that should be grouped.

**Pattern three: meaningless campaign names.** Look at the `utm_campaign` values in your Analytics report or your ActiveCampaign link tracking. If you see `campaign-1`, `test`, `new-email`, `october`, or anything else you can't decode without opening the actual campaign, your taxonomy isn't helping you. Campaign names need to be descriptive enough that you know what the email was about six months later.

If you find any of these three patterns, your attribution is compromised. The data exists, but it's not structured in a way that lets you make decisions.

## How to Fix Broken Tracking Without Starting Over

You can't retroactively fix UTM parameters on emails that already sent. The links are in inboxes. The traffic already hit your site. That data is lost.

But you can fix it going forward in about an hour.

**Step one:** Document your taxonomy. Write down the exact source, medium, and campaign name structure you're going to use. Use the structure I outlined earlier or adapt it, but write it down and make it a rule.

**Step two:** Audit your active automations. Open every automation that's currently live. Check every email in every automation. If the links don't have UTM parameters, add them. If the parameters don't match your new taxonomy, fix them. This is tedious. Do it anyway.

**Step three:** Set up a QA checklist. Before any email goes live — broadcast or automation — someone checks that every link has UTM parameters and that the values match the taxonomy. Make it a required step in your send process. I use a simple checklist in ClickUp: "UTM parameters added and verified" is a checkbox that has to be ticked before the campaign status moves to "ready to send."

**Step four:** Set a calendar reminder to audit your UTM structure every quarter. Drift happens. Someone forgets. A contractor uses a different format. A quarterly audit catches it before the data gets too messy.

## Using Attribution Data to Make Actual Decisions

Once your tracking is consistent, you can answer the questions that matter.

Which automations drive the most revenue per contact? Look at `utm_medium=automation`, group by `utm_campaign`, and sort by revenue. The top three are your highest-leverage sequences. Optimize those first. The bottom half might not be worth the maintenance cost.

Which broadcasts are paying for themselves? If you're spending time writing a weekly newsletter, you should know whether it's driving revenue or just open rates. Look at `utm_medium=broadcast`, group by `utm_campaign`, and calculate revenue per send. If a broadcast format consistently drives revenue, send it more often. If it doesn't, kill it or change the format.

Which links in each email actually convert? Use the `utm_content` parameter to track link position. Put `utm_content=cta-top` on the first CTA and `utm_content=cta-bottom` on the second. After a few sends, you'll see which position drives more clicks and more revenue. Then you can stop guessing about email structure and start using data.

The attribution report is only useful if the taxonomy is consistent. Consistent taxonomy only happens if you treat it like a requirement, not a nice-to-have.

---

Most operators don't have a tracking problem. They have a taxonomy problem. The data is there. It's just not structured in a way that lets you use it. Write the structure down, enforce it before every send, and audit it every quarter. The attribution report will start making sense, and you'll stop optimizing email based on open rates and gut feeling.

If you want a second set of eyes on your current setup, I'll walk through your ActiveCampaign account and flag what's broken — free audit at https://getner.ai/audit/.