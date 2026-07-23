---
topic_id: klaviyo-post-purchase-flow
title: "The Klaviyo Post-Purchase Flow That Turns One Order Into Three"
category: Flows
platform: klaviyo
drafted_at: 2026-07-23T15:03:12.079Z
word_count: 1495
---

# The Klaviyo Post-Purchase Flow That Turns One Order Into Three

*Most Klaviyo programs I audit have a welcome series and an abandoned cart flow, then nothing. The actual repeat revenue lives in the thirty days after someone buys—and most stores send one transactional email and go silent.*

I've been in Klaviyo accounts for twenty-three years across platforms. Seven-figure coaching businesses. DTC brands shipping thousands of orders a month. The builder changes. The gap stays the same.

The post-purchase window is where retention actually happens. Not in a generic "thank you for your order" campaign you set up once. In a structured flow that moves a first-time buyer through confirmation, delivery, first use, social proof, and the next purchase—all triggered by the `Placed Order` metric and timed to when they're actually ready to hear from you.

## The Flow Structure: Five Emails, Three Splits

Here's the architecture I build in every program I run.

**Email 1: Order confirmation (0 hours)**  
Trigger: `Placed Order`. No delay. This is transactional, so Klaviyo sends it even if the contact is suppressed for marketing. Confirm what they bought, when it ships, and how to contact support. Skip the upsell. They just gave you money.

**Email 2: Shipping notification (triggered by fulfillment)**  
Trigger: `Fulfilled Order` if you're syncing Shopify fulfillment events, or a time-delay if you're not. If you ship same-day or next-day, set this to 24 hours after placed order. If you're drop-shipping or made-to-order, adjust. This email includes tracking and sets the expectation for delivery.

**Email 3: How to use it (3–5 days after order, or 1 day after predicted delivery)**  
This is where most flows stop, and it's where repeat buyers start. Send setup instructions, a use-case guide, or a "here's how to get results" email. For physical products: care instructions, recipe ideas, styling tips. For digital products: login credentials, first-step onboarding, where to find the module or workbook they bought.

Timing matters here. If you're selling a physical product and you send this email the day after purchase, it arrives before the product does. Use Klaviyo's predicted delivery date or add 5–7 days to the order date as a manual buffer.

**Email 4: Review request (7–10 days after order, or 3–5 days after predicted delivery)**  
Don't ask for a review the day the package arrives. They haven't used it yet. Time this email to when they've actually experienced the product. For consumables, that's a week. For courses, it's after they've watched the first module. For supplements, it's two weeks in.

Use a conditional split on `Placed Order at least once` zero times over all time to confirm this is a real first purchase, not a repeat buyer you're nagging. If you're using Klaviyo Reviews, the review request is built into the flow filter. If you're using Okendo, Stamped, or Yotpo, you'll link to their hosted form or trigger their webhook.

**Email 5: Replenishment or cross-sell (14–30 days depending on product)**  
Trigger the next purchase. For consumables, this is a replenishment reminder timed to when they're running low. For one-time products, it's a cross-sell to a complementary item. For coaching or courses, it's an upsell to the next tier or a related offer.

Use a conditional split here on total order count. First-time buyers get the "here's what pairs with what you bought" email. Repeat buyers get early access to a new release or a loyalty discount.

## Conditional Split: First-Time vs. Repeat Buyer

Right after the `Placed Order` trigger, add a conditional split on `Placed Order at least once over all time equals 1`. This separates genuinely new customers from repeat buyers who don't need the full onboarding sequence.

The left path (first-time buyers) gets all five emails: confirmation, shipping, how-to, review request, cross-sell.

The right path (repeat buyers) skips the how-to and the review request. They already know how your product works, and they've likely already left a review. Send them confirmation, shipping, and a faster path to repurchase—usually a loyalty discount or a "thanks for coming back, here's what's new" email at the 7-day mark instead of 30.

I see programs that treat every order the same. A customer on their ninth bottle of the same supplement gets the same "here's how to take this" email as someone who just discovered the brand. It reads like you're not paying attention.

## Timing the Review Request to Delivery, Not Purchase

This one leaks social proof in every account that gets it wrong.

Most Klaviyo flows I audit send the review request 7 days after `Placed Order`. That works if you ship same-day and deliver in 2–3 days. It fails if you're shipping from overseas, if the customer chose economy shipping, or if you're a digital product that requires setup time.

The fix: add a conditional split based on predicted delivery, or manually buffer by product type.

For physical products, Klaviyo's predictive analytics can estimate delivery date if you're syncing Shopify fulfillment. Set the review request to 3–5 days *after* predicted delivery. If you're not using predicted delivery, add 10 days to the order date as a safe default for domestic shipping, 21 days for international.

For digital products, the timing depends on consumption. A $27 email swipe file? They've used it in 48 hours; ask for the review at day 3. A $2,000 course with twelve modules? They need two weeks minimum. A coaching program with live calls? Wait until after the second session.

I've seen programs ask for a review the day after purchase for a product that hasn't even shipped yet. The response rate is zero, and the brand looks automated in the worst way.

## The Replenishment Window: 30, 60, or 90 Days

The cross-sell or replenishment email is the one that turns one order into three, but only if you time it to when the customer actually needs to reorder.

For consumables—supplements, coffee, skincare—calculate average days between orders from your Klaviyo analytics. Go to **Analytics > Benchmarks**, filter by product, and look at median time to second purchase. If it's 35 days, set your replenishment email to day 30. If it's 60, adjust.

For non-consumables, this becomes a cross-sell. If someone bought a yoga mat, they don't need a second yoga mat in 30 days. They might need blocks, a strap, or a bolster. Use Klaviyo's product catalog and cross-sell based on category or a manual product-pairing table you maintain in a custom property.

I run a conditional split here on `Placed Order at least once in the last 45 days equals 0` to suppress this email for anyone who's already reordered. If they came back on their own, they don't need the nudge.

## Suppression: Don't Upsell Active Customers

Here's the mistake I see most often: a customer places a second order on day 12, and the post-purchase flow from the *first* order keeps running. They get the replenishment email on day 30 asking them to buy again, even though they already did.

Every post-purchase flow needs a flow filter at the top: `What someone has done > Placed Order > zero times in the last 1 day`. This prevents the same person from entering the flow twice if they place two orders in quick succession.

Then add a conditional split at the replenishment email: `Placed Order at least once in the last 30 days equals 0`. If they've reordered, exit the flow. Don't send the upsell.

The alternative is to use Klaviyo's smart sending, but smart sending only prevents *duplicate* emails, not contextually wrong ones. A replenishment email isn't a duplicate of the confirmation email; it's just badly timed. The conditional split fixes it.

## Metrics to Watch

After you build this, the metrics that matter are repeat purchase rate and time to second order, not open rate.

Go to **Analytics > Flows**, filter to your post-purchase flow, and look at revenue per recipient over 30, 60, and 90 days. If the flow is working, revenue per recipient should be higher than your average order value—because a meaningful percentage of recipients are placing a second order.

Then segment your customer list by `Placed Order at least once over all time equals 1` and compare time to second purchase before and after you launched the flow. If the flow is doing its job, median time to second order should compress.

Opens and clicks tell you the emails are getting read. Revenue per recipient and repeat purchase rate tell you the flow is actually working.

---

Most Klaviyo programs stop at the transaction. The account I'm in right now sends one transactional email, then nothing for 90 days until the customer ends up in a winback flow. The post-purchase window—the 30 days when a buyer is most engaged—goes completely unused.

The structure above takes four hours to build and turns one order into three without adding a single new acquisition channel.

If you want a second set of eyes on your Klaviyo retention program, I offer a free audit at https://getner.ai/audit/.