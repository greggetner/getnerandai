---
topic_id: webhooks-external-triggers
title: "Using Webhooks to Trigger ActiveCampaign Automations from External Events"
category: Platform
platform: ac
drafted_at: 2026-07-21T14:56:26.099Z
word_count: 1694
---

# Using Webhooks to Trigger ActiveCampaign Automations from External Events

*Most operators I work with never touch webhooks because they sound like a developer task—but they're just URLs that wake up an automation when something happens outside ActiveCampaign.*

You're paying for Zapier. Or you're tagging people manually after Calendly bookings. Or your Stripe charges fire and nothing happens in ActiveCampaign for twenty minutes because you're waiting for a polling interval.

Webhooks solve this. They're not code. They're a URL ActiveCampaign gives you that you paste into another tool. When the event fires—booking, charge, course enrollment—the other tool pings that URL and your automation starts instantly.

I've been setting these up in accounts for years. The technical reputation scares people away from what's actually the simplest integration method ActiveCampaign offers. Here's how to use them, three scenarios I configure most often, and the single mistake that breaks every one.

## How ActiveCampaign Webhooks Actually Work

Open any automation. Add a start trigger. Choose `Webhook`.

ActiveCampaign generates a unique URL. It looks like `https://trackcmp.net/webhook?key=abc123xyz`. That's it. That's your webhook.

You paste that URL into the external tool—Calendly, Stripe, a custom app, whatever. When the event happens over there, the tool makes an HTTP request to that URL. ActiveCampaign receives it. The automation starts. The contact either enters for the first time or re-enters if you've configured it that way.

The external tool can send data with the webhook—email address, booking time, charge amount, custom fields. ActiveCampaign receives that data and you can use it inside the automation with conditional logic, field updates, or personalization tokens.

That's the entire mechanism. Now here's how to configure it for three scenarios I build repeatedly.

## Use Case 1: Calendly Booking Confirmation Sequence

You run a high-ticket coaching business. Someone books a discovery call through Calendly. You want them in an automation immediately—confirmation email, pre-call questionnaire link, reminder sequence, post-call follow-up if they don't show.

**The ActiveCampaign setup:**

Create a new automation. Set the start trigger to `Webhook`. Copy the webhook URL ActiveCampaign generates.

Open Calendly. Go to your event type settings. Scroll to `Workflows & Notifications`. Add a new webhook notification. Paste the ActiveCampaign webhook URL.

Calendly will send the invitee email, name, event time, and cancellation URL when someone books. Map those fields in ActiveCampaign by clicking into the webhook trigger settings and defining which incoming data points should populate which custom fields.

Add your automation steps: immediate confirmation email using `%CALENDLY_EVENT_TIME%` or your mapped custom field, a 24-hour wait, a reminder, a show/no-show branch using a tag or custom field you update manually or via another webhook when the call completes.

**The gotcha:**

Calendly sends the event time in ISO 8601 format: `2025-02-15T14:30:00Z`. ActiveCampaign can't natively parse that into a readable date for email personalization without a formatting step.

The fix: use conditional content blocks in your email template. If the field is populated, display it raw and tell the contact to check their calendar. Or set up a second webhook in Calendly that fires to Zapier or Make, reformats the date, and writes it back to a different custom field in ActiveCampaign as plain text. I prefer the first option—cleaner, no dependency.

Or just skip the date token entirely. "Your call is confirmed. Check your calendar for the exact time. Here's what to prepare." No one complains.

## Use Case 2: Stripe Charge Follow-Up Automation

You sell a course, a membership, or a one-time coaching package through Stripe. The moment the charge succeeds, you want the buyer in a post-purchase onboarding sequence—login credentials, first lesson, expectation-setting email, check-in after three days.

**The ActiveCampaign setup:**

Create an automation with a `Webhook` start trigger. Copy the URL.

Log into Stripe. Go to `Developers` → `Webhooks` → `Add endpoint`. Paste the ActiveCampaign webhook URL.

In the event selection screen, choose `charge.succeeded`. Stripe will ping ActiveCampaign every time a charge completes.

Stripe sends customer email, charge amount, product description, and charge ID. Map the email field to the contact email in ActiveCampaign's webhook settings. Map charge amount to a custom field called `last_purchase_amount` or similar. Use that field later for conditional branches—did they buy the $500 course or the $2,000 package?

Now build your automation: immediate purchase confirmation, tag the contact `purchased_[product_name]`, add them to the relevant onboarding sequence, set a `goal` step at the top of the automation so if they purchase again while still in this automation, they skip to the goal and re-enter from the start.

**The gotcha:**

Stripe sends charge amounts in cents, not dollars. A $500 charge shows up as `50000`. If you're using that field in an email or a conditional branch, you'll display "You just purchased 50000" unless you account for it.

The fix: create a calculated custom field in ActiveCampaign (if you're on a plan that supports it) that divides the raw amount by 100. Or just don't display the amount in emails. "Thanks for your purchase" works better than "Thanks for your $500.00 purchase" anyway—it doesn't remind them they just spent money.

Alternatively, handle the formatting in the conditional branch logic itself. Set up branches like `if last_purchase_amount is 50000 then tag product_A`, `if last_purchase_amount is 200000 then tag product_B`. The contact never sees the raw number.

## Use Case 3: Custom App Event (Course Progress, Community Activity, Login Behavior)

You built or bought a membership platform, a course app, or a community tool that isn't ActiveCampaign. Someone completes lesson three. Or they log in after being dormant for 60 days. Or they post in the community for the first time. You want an automation to fire instantly.

**The ActiveCampaign setup:**

Create an automation. Start trigger: `Webhook`. Copy the URL.

Give that URL to your developer or paste it into your app's webhook settings (if it has them—most modern tools do: Circle, Kajabi, Thinkific, Teachable, custom Rails or Node apps, whatever).

Configure the app to send the contact's email address and any relevant event data—lesson ID, login timestamp, post content, whatever. Map those fields in ActiveCampaign.

Build the automation based on the event. Lesson three completed? Send an encouragement email and tag them `engaged_student`. First community post? Send a welcome-to-the-conversation email and tag them `community_active`. Logged in after 60 days dormant? Start a re-engagement sequence and remove the `dormant` tag.

**The gotcha:**

The contact might not exist in ActiveCampaign yet. If your app fires a webhook for a user who isn't in your ActiveCampaign account, the automation won't start.

The fix: in the webhook trigger settings, enable `Create contact if they don't exist`. ActiveCampaign will add them to the default list you specify, then start the automation.

Or handle it upstream—make sure every user is added to ActiveCampaign when they first register in your app, before any event webhooks fire. I prefer this. It gives you control over which list they land on, what tags they get, and ensures they're already in a welcome sequence before behavior-based automations start layering on top.

Also: rate limits. If your app fires ten thousand webhooks in five minutes because you just imported historical data, ActiveCampaign will queue them and process them as fast as it can, but contacts won't enter instantly. Test with small batches first. I've seen apps fire a backfill webhook job and flood ActiveCampaign with 50,000 entries. It worked, but it took two hours and caused temporary delays in other automations.

## When Webhooks Beat Zapier or Native Integrations

Zapier polls most triggers every 5–15 minutes depending on your plan. A webhook fires instantly. If you're running a webinar registration sequence and someone signs up at 6:58 PM for a 7:00 PM start, that two-minute head start matters.

Native integrations—ActiveCampaign's deep data connections—are great when they exist. But most tools don't have them. And even when they do, they're often one-way (data flows into ActiveCampaign but not out) or limited to specific triggers (new contact, new purchase, but not custom events like lesson completion or community activity).

Webhooks are universal. Every modern SaaS tool supports outbound webhooks. If it doesn't, it's old or bad.

The other advantage: no middleware cost. Zapier charges per task. A webhook is free. If you're firing five thousand events a month—Stripe charges, Calendly bookings, course progress updates—you're paying Zapier $50–$150/month for something ActiveCampaign does natively.

I still use Zapier when I need transformation logic (reformat a date, look up a value in a spreadsheet, split a name into first and last). But for simple event → automation triggers, webhooks are faster, cheaper, and more reliable.

## The One Mistake That Breaks Every Webhook Setup

You paste the webhook URL into the external tool. You fire a test event. Nothing happens in ActiveCampaign.

The reason: the email address the external tool sends doesn't match any contact in your ActiveCampaign account, and you haven't enabled `Create contact if they don't exist` in the webhook trigger settings.

Or the external tool is sending the email field with a different key than ActiveCampaign expects—`email` versus `contact_email` versus `user_email`—and you haven't mapped it in the webhook configuration screen.

The fix: always send a test webhook and check the automation's run log. ActiveCampaign logs every webhook request it receives, whether it started an automation or not. Open the automation. Click the graph icon in the top right. Look at `Webhook requests`. You'll see the raw data the external tool sent. If the email field is named something unexpected, map it manually in the trigger settings.

And always enable `Create contact if they don't exist` unless you have a specific reason not to. The worst case: you add a few test contacts you delete later. The best case: you never miss a legitimate entry.

---

The accounts I work in waste hours on Zapier tasks that should be direct webhooks, or they tag people manually after events that should fire automations instantly. Webhooks sound technical. They're not. They're a URL. You paste it. The automation starts.

Set up one webhook this week—Calendly, Stripe, or your course platform—and you'll never go back to polling integrations.

If you're running ActiveCampaign and want a second set of eyes on your automation architecture, webhook strategy, or anything else that's leaking revenue, grab a free audit at https://getner.ai/audit/.