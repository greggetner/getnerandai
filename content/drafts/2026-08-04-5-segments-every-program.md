---
topic_id: 5-segments-every-program
title: "The 5 Segments Every ActiveCampaign Program Should Have"
category: Retention
platform: ac
drafted_at: 2026-08-04T15:16:13.268Z
word_count: 1331
---

# The 5 Segments Every ActiveCampaign Program Should Have

*Most accounts I audit have forty-plus segments built from one-off campaign ideas, and the operators still can't answer "who should I send to this week?"*

I open an ActiveCampaign account. The segment list scrolls for three screens. `Black Friday 2022 clickers`. `Webinar registrants April`. `Downloaded lead magnet - old version`. `Engaged last 14 days TEST`. `VIP maybe?`. Dozens of segments, each built for a single send, never deleted, never standardized.

Then I ask: "Who are your cold contacts?" Blank stare. "Who's actively engaged right now?" They're not sure. "Who should get your weekly broadcast?" They guess.

You don't need forty segments. You need five that actually matter. Build these once, maintain them automatically, and you'll always know exactly who gets what.

## Segment One: Active (Engaged in the Last 30 Days)

This is everyone who opened or clicked an email in the last thirty days. They're paying attention. They get everything: weekly broadcasts, product launches, flash sales, content updates. If you're choosing one list to send to, it's this one.

**How to build it in ActiveCampaign:**

Go to Contacts → Segments → Create a segment. Set the condition to `Has opened` or `Has clicked` with a date range of `in the last 30 days`. Save it as `Active - 30d`.

This segment auto-updates. Someone who opened yesterday is in. Someone whose last action was thirty-one days ago falls out automatically. No manual list pruning.

**What gets sent here:**

Everything. Your weekly newsletter. Product announcements. Time-sensitive offers. Content drops. These people are engaged. They want to hear from you. Send.

The mistake I see: operators send to their entire list because "we might re-engage someone." You won't. You'll train Gmail that most recipients ignore you, and your Active segment—the people who actually want your emails—will start landing in spam. Send to the people who open.

## Segment Two: Dormant (Engaged 31–90 Days Ago)

These contacts were active, then stopped. They're not dead yet, but they're fading. They don't get your regular broadcasts. They get a targeted re-engagement sequence, and if that doesn't work, they move to Cold.

**How to build it:**

Create a segment with two condition groups. First group: `Has opened` or `Has clicked` with a date range of `in the last 31 to 90 days`. Second group: `Has not opened` and `Has not clicked` in the last `30 days`. 

The logic: they did something between thirty-one and ninety days ago, but nothing in the last thirty. Save it as `Dormant - 31-90d`.

**What gets sent here:**

A three-to-five email re-engagement automation. Trigger it when a contact enters the Dormant segment. First email: "We noticed you've been quiet—here's what you missed." Include your best recent content or offer. Second email: "Is this still relevant to you?" Be direct. Third email: preference center or an ask: "Want to stay subscribed?"

Use a **goal step** in the automation. If they open or click any email in the sequence, jump them back to Active and exit the re-engagement flow. Don't keep nudging someone who's already re-engaged.

I don't send regular broadcasts to Dormant. It trains them to ignore you. A dedicated sequence with a clear purpose performs better than adding them to your weekly send and hoping.

## Segment Three: Cold (No Engagement in 90+ Days)

No opens, no clicks, no site visits for ninety days or more. These contacts are dead weight. They hurt deliverability. Every inbox provider watches engagement rates. If you send to ten thousand people and only eight hundred open, you're telling Gmail and Outlook that most people don't want your email.

**How to build it:**

Segment condition: `Has not opened` and `Has not clicked` in the last `90 days`. Save it as `Cold - 90d+`.

**What gets sent here:**

Nothing regular. One final re-engagement attempt, maybe. A single email: "Should we part ways?" with an obvious call-to-action to click if they want to stay. Wait seven days. If they don't click, suppress them.

Create a tag—`Suppressed - Cold`—and add it via automation to anyone in the Cold segment who doesn't engage with the final email. Then exclude that tag from all future sends.

Most operators are terrified to suppress cold contacts. "But we paid for those leads." You're paying more to keep them. Cold contacts drag down your sender reputation, increase spam complaints, and waste send volume on higher-tier ActiveCampaign plans. Cut them.

I've seen list suppressions improve inbox placement for the Active segment within two weeks. You don't need more contacts. You need contacts who actually open.

## Segment Four: Customers (Made a Purchase)

Everyone who's bought. This seems obvious, but half the accounts I audit don't have a clean Customer segment. They have tags like `Purchased Course A` and `Bought June 2023` and `Customer?? Check`, but no single segment that answers "who has given us money?"

**How to build it:**

If you're using ActiveCampaign's **deep data integration** with Shopify, WooCommerce, or your course platform, build the segment as: `Has completed` an order where `Total is greater than 0`. 

If you're tagging purchases manually, use: `Contact has tag` and list every purchase confirmation tag you use. Save it as `Customers - All`.

**What gets sent here:**

Post-purchase onboarding. Replenishment sequences for consumables. Cross-sell and upsell automations. Customer-only content or early access. Renewal reminders for memberships.

What does *not* get sent here: cold acquisition pitches for the thing they already bought. Use **conditional content blocks** in your broadcasts. If someone is in the Customer segment, swap the "buy now" CTA for a "here's how to get more from your purchase" message.

I still see accounts sending cart abandonment emails to existing customers. Or running a lead-nurture sequence that pitches a $2,000 program to someone who bought it four months ago. Exclude `Customers - All` from acquisition automations. Always.

## Segment Five: VIP (Top Decile by Revenue or Engagement)

Your highest-value contacts. Top ten percent by revenue, or your most engaged superfans if you don't have clean revenue data. These people get white-glove treatment: early product access, personal check-ins, VIP-only offers, higher-touch sequences.

**How to build it (revenue-based):**

If you have deep data or deal values tracked in ActiveCampaign, create a custom field—`Lifetime Revenue`—and update it via automation or integration whenever a purchase completes. Then segment by `Lifetime Revenue is greater than X`, where X is your top-decile threshold.

Calculate it manually first: export your contact list with revenue, sort descending, find the value at the 90th percentile. Use that number. Save the segment as `VIP - Revenue`.

**How to build it (engagement-based):**

If revenue tracking isn't clean yet, use engagement. Segment condition: `Contact score is greater than Y`. Set up lead scoring in ActiveCampaign: award points for email opens, link clicks, site visits, webinar attendance. The top ten percent by score are your VIPs. Save it as `VIP - Engagement`.

**What gets sent here:**

Separate onboarding with a personal welcome. Early access to launches. Exclusive content. Higher-frequency check-ins if you're running a coaching business. VIP-only Q&A sessions or live events.

Also: *suppress VIP contacts from heavy discounting*. I see operators blast a 40%-off fire sale to their entire list, including customers who've bought three times at full price. You're training your best customers to wait for discounts. Exclude `VIP - Revenue` from deep-discount campaigns. They'll buy at full price. Let them.

The engagement-based version works if you're early and don't have purchase data yet. But switch to revenue-based scoring as soon as you can. The person who opens every email but never buys is not a VIP.

---

Five segments. You know who's paying attention, who's fading, who's dead, who's bought, and who's worth treating like gold. Build them once, let ActiveCampaign maintain them automatically, and you'll never again stare at your contact list on Sunday night wondering who the hell to send to.

If you want a second set of eyes on your segmentation setup—or the forty orphaned segments you're about to delete—grab a free ActiveCampaign audit at https://getner.ai/audit/.