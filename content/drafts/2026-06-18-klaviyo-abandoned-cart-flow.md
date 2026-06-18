---
topic_id: klaviyo-abandoned-cart-flow
title: "The Klaviyo Abandoned Cart Flow Most Stores Set Up Wrong"
category: Flows
platform: klaviyo
drafted_at: 2026-06-18T16:22:22.975Z
word_count: 1840
---

# The Klaviyo Abandoned Cart Flow Most Stores Set Up Wrong

*Most Klaviyo abandoned cart flows fire one discount-led email and stop. The ones that recover revenue lead with utility before any incentive.*

I've audited enough Klaviyo accounts to recognize the pattern immediately. Someone abandons a cart. The store waits thirty minutes, then sends an email with a subject line like "Forgot something? Here's 10% off." If that doesn't convert, nothing else fires. The flow ends.

The problem isn't that the email is bad. The problem is that it trains customers to abandon on purpose. Leave the cart, wait for the discount, then buy. You've just built a margin-killing incentive system disguised as a recovery flow.

The abandoned cart flows that actually recover revenue do something different. They lead with utility. They remind, reassure, and remove friction before they ever mention a discount. And they're structured in Klaviyo to handle different customer segments differently.

## The Three-Stage Structure That Works

The flow I build in every Klaviyo account has three stages, and only the third one includes an incentive.

**Stage one: the one-hour reminder.** This email exists to catch people who got distracted. No discount. No urgency language. Just a plain reminder that says "you left these items in your cart" with product images, prices, and a single call-to-action button. The trigger is `Started Checkout` with a one-hour time delay.

**Stage two: the 24-hour value-add.** This is where you remove friction. Highlight your return policy. Show shipping details. Include customer reviews or user-generated content for the products in the cart. Add trust signals—secure checkout badges, testimonials, whatever reduces purchase anxiety. Still no discount. You're selling the decision they already made once.

**Stage three: the 48-hour incentive (if needed).** Now—and only now—you can offer a discount. But make it conditional. Use a conditional split in Klaviyo to check `Placed Order zero times since starting this flow` so you're not sending discounts to people who already converted from email one or two.

Most stores fire the discount first. That's the mistake that costs you margin on every future purchase from that customer.

## The Klaviyo Trigger and Flow Filter Setup

Start with the `Started Checkout` metric as your flow trigger. This fires when someone hits your checkout page and provides an email address.

Immediately after the trigger, add a flow filter: `Placed Order zero times since starting this flow`. This is the suppression logic that prevents the flow from continuing if someone completes their purchase. Klaviyo evaluates flow filters before every email in the sequence, so if someone buys after email one, they won't receive email two.

Do not use `Placed Order at least once over all time` as your filter. That excludes first-time customers entirely, and first-time customers are exactly who you want in this flow. The flow filter needs to be scoped to activity *since starting this flow*, not lifetime behavior.

In the flow settings, enable `Smart Sending` and set it to skip profiles who have received a campaign or are in another flow within the last 16 hours. This prevents message overlap if you're running sale campaigns or other automated flows.

## The Conditional Split You Need at Stage Three

Before you send the discount email, add a conditional split based on `Placed Order at least once over all time`. This separates first-time prospects from repeat customers.

**Yes path (existing customers):** Send the discount email, but frame it as a thank-you for being a returning customer. "Welcome back—here's 10% off to finish your order." The psychology is different. You're rewarding loyalty, not training behavior.

**No path (first-time prospects):** You have two options here. Option one: send the discount with a first-purchase framing. "New here? Take 10% off your first order." Option two, which I use in most accounts I run: skip the discount entirely and send a final friction-reduction email. Highlight the no-risk purchase (easy returns, money-back guarantee, whatever your offer includes). Save the discount for a separate prospect nurture flow.

The split matters because repeat customers already know your brand. They have a different set of objections than someone who's never bought from you. Treating them the same leaves money on the table.

## What to Put in Each Email

**Email one (1 hour):** Subject line that's plain and factual. "You left something in your cart" or "Still thinking it over?" Body copy is three parts: a single sentence of acknowledgment ("You started checking out but didn't finish"), a visual cart summary with product images and a subtotal, and a single call-to-action button that says "Complete your order" and links directly to the checkout page with the cart pre-populated. No secondary CTAs. No discount mentions. No "limited time" language. Just the reminder.

**Email two (24 hours):** Subject line that addresses friction. "Questions about shipping?" or "Here's what to expect." Body copy leads with the friction-reducer: free shipping threshold, return window, product reviews, size guide, whatever objection you hear most often from customer support. Include the cart summary again, smaller this time, with the CTA button at the bottom. You're selling confidence in the purchase decision.

**Email three (48 hours):** Subject line mentions the incentive if you're sending one. "Here's 10% off to finish your order." Body copy is short. Acknowledge they haven't purchased yet, present the discount code (use Klaviyo's coupon code feature so each email gets a unique code that tracks back to the flow), restate the cart contents, single CTA button. Set the email to skip if `Placed Order at least once since starting this flow` so you're not giving away margin to someone who already bought.

Some accounts I work in add a fourth email at 7 days with a final "cart expiring" message and no discount. It works if your cart abandonment window is long and your average order value is high. For most DTC brands, three emails is the structure.

## The Cardinal Mistake: Leading With the Discount

When you send the discount in email one, you teach customers a behavior pattern. Abandon the cart, wait thirty minutes, get the discount code, then complete the purchase. They'll do it on every future order.

I see this pattern in almost every account I audit. The abandoned cart flow has a single email. It fires fast—ten minutes, twenty minutes—and it leads with a percentage off. The store owner sees it recovering revenue and thinks it's working. What they don't see is the margin erosion on every subsequent purchase.

Run a Klaviyo segment: `Placed Order at least twice over all time AND Received Email in Flow where Flow equals Abandoned Cart Flow at least once per person`. Look at the average time between receiving that first discount email and placing the first order. Then look at the average time between cart abandonment and order placement on their second purchase. If the second-purchase delay is consistently close to your abandoned cart email delay, you've trained them.

The fix is to remove the discount from email one and move it to email three, behind the conditional split that checks for prior purchase behavior. You'll recover fewer carts in the first 24 hours. But the customers you do acquire won't expect a discount on every transaction.

## Flow Trigger Timing Matters More Than You Think

Most stores set the first abandoned cart email to send after 30 minutes or 1 hour. That's fine for stage one. But I see stores set email two at 2 hours and email three at 4 hours. That's too tight.

The person who abandons and doesn't come back in the first hour is not sitting at their computer waiting for your second email 60 minutes later. They've moved on. Email two needs to land at a different time of day—24 hours later means it hits a different session, a different mindset.

In Klaviyo, set your time delays as follows: email one at 1 hour, email two at 24 hours from the `Started Checkout` trigger (not 24 hours from email one—use the trigger as the anchor), email three at 48 hours from trigger. This spreads the touches across multiple days and multiple sessions. Each email is a new opportunity to recapture attention, not just a faster follow-up to the last one.

If your store has a short purchase-decision window—flash sales, limited inventory, event-based products—you can compress this to 1 hour, 6 hours, 24 hours. But test it. The tighter you compress the timing, the more likely you are to annoy instead of convert.

## Excluding Purchasers From the Flow

The flow filter `Placed Order zero times since starting this flow` handles most of the suppression logic. But you also need to exclude people who placed an order for the *same products* even if they didn't click through your email.

In Klaviyo, this requires a conditional split after each time delay and before each email. The split checks `Placed Order at least once since starting this flow where Product ID equals <cart product ID>`. If yes, they exit the flow via a designated end path. If no, they continue to the email.

This is more complex to set up than a simple flow filter, but it prevents the embarrassing scenario where someone places an order on their phone, then receives your abandoned cart email on desktop three hours later trying to sell them the thing they already bought.

Klaviyo's flow builder doesn't make this easy—you'll need one conditional split per email, and you'll need to use the `Placed Order` conditional split logic with product-level matching. It's worth the setup time. The alternative is sending recovery emails to people who don't need recovering.

## What This Flow Structure Actually Fixes

The three-stage structure solves three problems at once.

**Problem one:** You stop training customers to wait for discounts. The first two emails never mention a discount, so the customer who's ready to buy at full price doesn't learn that waiting pays off.

**Problem two:** You handle different customer segments differently. The conditional split at stage three means your repeat customers get different messaging than first-time prospects. You're not treating a $10,000 lifetime-value customer the same as someone who's never heard of you.

**Problem three:** You remove friction before you resort to discounting. Most cart abandonment isn't about price. It's about trust, clarity, or distraction. Email two handles the first two. Email one handles the third. The discount is a last resort, not the opening move.

The stores that run this structure recover more revenue per cart abandonment than the stores that lead with discounts, and they do it without eroding margin on future purchases. The flow takes longer to build in Klaviyo—more conditional splits, more time delays, more email variants—but it pays back the setup time in the first month.

---

If your Klaviyo abandoned cart flow is a single discount email, you're leaving money on the table and training bad customer behavior at the same time. The three-stage structure fixes both problems. If you want a second set of eyes on your flow setup—or any other part of your Klaviyo account—request a free audit at https://getner.ai/audit/.