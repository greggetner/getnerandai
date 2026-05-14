---
topic_id: customer-journey-mapping-ac
title: "How to Map a Customer Journey in ActiveCampaign From Scratch"
category: Platform
drafted_at: 2026-05-14T15:13:59.620Z
word_count: 1581
---

# How to Map a Customer Journey in ActiveCampaign From Scratch

*Most ActiveCampaign accounts are a graveyard of disconnected automations—each built to solve one problem, none of them talking to each other, all of them firing whether or not the contact should still be receiving them.*

I've been opening ActiveCampaign accounts for twenty-three years. The pattern is consistent: someone builds a welcome series. Then a webinar funnel. Then a cart abandonment flow. Then a win-back sequence. Each one works in isolation. None of them know what the others are doing.

The result? Contacts get pitched the same offer twice in three days from different automations. Customers still receive nurture emails for a product they already bought. High-intent prospects fall into a black hole between "downloaded the lead magnet" and "ready to buy" because no one mapped what happens in the middle.

You can't fix this by adding more automations. You fix it by mapping the customer journey first, then building the ActiveCampaign infrastructure to support it.

## The Five Stages Every Customer Journey Needs

Most operators skip this step. They jump straight into building automations because ActiveCampaign makes it easy to start dragging boxes around a canvas. But if you don't know what stage a contact is in, you can't send them the right message at the right time.

Every customer journey breaks into five stages, whether you're selling a $47 course or a $25K mastermind:

1. **Awareness** – they know they have a problem, just learned you exist
2. **Consideration** – they're evaluating whether your solution fits
3. **First purchase** – they bought, now they need to activate and get value
4. **Retention** – they got value, you want them to buy again or stay engaged
5. **Advocacy** – they're promoters, referring others or creating content about you

The stage determines the message. A contact in awareness needs education. A contact in retention needs upsell paths and engagement loops. Sending retention messages to someone still in awareness kills conversions. Sending awareness content to a customer wastes their time and yours.

Map these five stages on paper before you open ActiveCampaign. Write down what actions move someone from one stage to the next. That's your blueprint.

## Which ActiveCampaign Objects Handle Each Stage

Once you've mapped the stages, you need to assign each one a home inside ActiveCampaign. Here's the framework I use in the programs I run.

### Awareness: Tags and Entry Automations

When someone first enters your world—subscribed to a list, downloaded a lead magnet, registered for a webinar—tag them with a source tag and drop them into an awareness automation.

Use a naming convention: `src-webinar`, `src-ebook`, `src-referral`. These source tags never get removed. They're your attribution layer. You'll want to know six months from now how someone originally found you.

The awareness automation delivers your core education. Introduce who you are. Teach them the framework. Position the problem. Most awareness sequences I see stop at email three or four. The high-performing ones run seven to ten emails and include a soft offer or a tripwire at the end to move someone into consideration.

### Consideration: Pipeline Stages and Conditional Content

Consideration is where most accounts leak. Someone downloaded your lead magnet, read the welcome series, and then... nothing. Or they get lumped into a generic newsletter and you hope they eventually buy.

If you sell high-ticket or have a sales process, use a **deal pipeline** to track consideration. Create a pipeline stage for each step: `Lead In`, `Engaged`, `Booked Call`, `Proposal Sent`, `Closed Won`. Automations can create deals automatically when someone takes a high-intent action—books a call, attends a webinar live, replies to an email.

If you sell productized offers or courses, use a **lifecycle custom field** instead. Values: `Subscriber`, `Engaged Lead`, `Customer`, `VIP`. Update this field as contacts take actions. Then segment your campaigns and automations by lifecycle stage using conditional content blocks or if/else splits.

The consideration stage is where you nurture. Send case studies. Answer objections. Offer a low-ticket entry product. The goal is to get them to first purchase or disqualify themselves so you stop spending sends on dead leads.

### First Purchase: Goal Steps and Onboarding Automations

The moment someone buys, three things need to happen in ActiveCampaign:

1. **Exit all pre-purchase automations immediately.** Use a goal step configured near the top of every nurture sequence, set to trigger on `Tag: customer` or `Lifecycle field = Customer`. When the purchase happens, the contact jumps to the goal and skips the remaining pitch emails.

2. **Tag them as a customer.** Use a single universal tag like `customer` or `active-customer`. Update your lifecycle field to `Customer`. Remove any urgency or promotion tags.

3. **Start the onboarding automation.** This is where you deliver the product, show them how to use it, and get them their first win as fast as possible. Onboarding is the highest-leverage sequence you'll ever build.

I configure the customer tag and lifecycle field update inside the purchase confirmation automation or via webhook from your payment processor. Stripe, ThriveCart, and Kajabi all send purchase events to ActiveCampaign. Map them correctly once, and the rest of your journey flows automatically.

### Retention: Engagement Scoring and Re-Engagement Automations

Retention starts the moment someone gets their first win. In a coaching business, that might be week two of the program. For a course, it's completing module one. For a DTC brand, it's using the product and not returning it.

Track engagement with a **custom field** or **lead scoring**. Award points for key actions: logged into the member portal, attended a coaching call, replied to an email, made a second purchase. Decay points over time if they go quiet.

Set up automations that trigger when engagement drops:

- If someone hasn't logged in for 14 days, send a check-in email
- If they haven't attended a call in 30 days, offer a one-on-one
- If their engagement score drops below a threshold, tag them `at-risk` and start a re-engagement sequence

Retention is also where you introduce upsells, cross-sells, and renewals. Use conditional content in your regular campaigns to show existing customers different offers than prospects. If someone bought your foundational course, your newsletter should pitch them the advanced version—not the thing they already own.

### Advocacy: Referral Tags and VIP Segments

Advocacy is the most under-automated stage. These are your best customers. They've bought multiple times, they engage, they refer others. Most accounts treat them the same as everyone else.

Create a segment for advocates: multiple purchases, high engagement score, or manually tagged `VIP`. Send them different campaigns. Give them early access to new offers. Ask them for testimonials, case studies, and referrals.

Build a referral automation: when someone refers a new contact (tracked via UTM, referral link, or manual tag), send them a thank-you, award points, or give them a bonus. Loop this back into retention by recognizing your advocates and giving them reasons to keep promoting you.

## The One Diagram That Ties It All Together

Here's what I build before I open ActiveCampaign: a single-page journey map that shows all five stages, the tags and fields that define each stage, the automations that run in each stage, and the actions that move someone from one stage to the next.

It looks like this:

```
AWARENESS
Tags: src-* (source)
Field: lifecycle = Subscriber
Automations: Welcome series (7 emails)
Exit condition: Purchases → FIRST PURCHASE
                Engaged 3+ emails → CONSIDERATION

CONSIDERATION
Field: lifecycle = Engaged Lead
Pipeline: Lead → Engaged → Booked Call
Automations: Objection series, case study drip
Exit condition: Purchases → FIRST PURCHASE
                No engagement 60 days → Remove lifecycle field

FIRST PURCHASE
Tags: customer
Field: lifecycle = Customer
Automations: Onboarding (10 emails), product delivery
Exit condition: Completes onboarding → RETENTION

RETENTION
Field: lifecycle = Customer
Score: Engagement score (0–100)
Automations: Re-engagement (score < 20), upsell path, renewal reminders
Exit condition: Refers 2+ people → ADVOCACY
                No purchase 180 days → At-risk automation

ADVOCACY
Tags: VIP, referrer
Field: lifecycle = VIP
Automations: VIP offers, referral rewards, early access
Exit condition: None (retain forever)
```

Your version will be different. Your stages might have different names. Your exit conditions will depend on your business model. But the structure stays the same: define the stages, assign each one tags and fields, list the automations that run in each stage, and specify what actions move someone forward.

This diagram is your source of truth. When you're about to build a new automation, open the diagram first. Ask: which stage is this contact in? What should happen next? Does an automation already handle this, or do I need to build something new?

## Build the Map First, Then Build the Automations

Most ActiveCampaign accounts are a mess because someone built the automations first and tried to reverse-engineer a journey later. That never works. The automations don't know about each other. Contacts end up in the wrong sequences. Money leaks.

Map the five stages. Assign tags, fields, and automations to each stage. Draw the diagram. Then open ActiveCampaign and build the infrastructure to support it.

Your account will be cleaner. Your automations will stop overlapping. Your contacts will stop receiving the wrong message at the wrong time. And you'll finally be able to answer the question every operator should be able to answer: what stage is this contact in, and what happens next?

If your ActiveCampaign account is already a mess and you don't know where to start, I'll map it for you. Book a free audit at https://getner.ai/audit/.