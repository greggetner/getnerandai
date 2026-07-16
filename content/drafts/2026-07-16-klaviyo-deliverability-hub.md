---
topic_id: klaviyo-deliverability-hub
title: "Reading the Klaviyo Deliverability Hub Before It Reads You"
category: Deliverability
platform: klaviyo
drafted_at: 2026-07-16T14:53:34.063Z
word_count: 1909
---

# Reading the Klaviyo Deliverability Hub Before It Reads You

*Klaviyo's deliverability dashboard surfaces the signals that predict an inbox problem two weeks before it tanks a send — most operators glance past it until Gmail has already throttled the account.*

I've seen the pattern a dozen times. An operator running a seven-figure program notices open rates sliding from 42% to 31% over three months. They test subject lines. They swap send times. They rebuild templates. Nothing moves the number. When I open the account, the deliverability hub has been flashing warnings for six weeks — spam complaint rate climbing, engagement trend dropping, unengaged contacts still getting every campaign — and nobody looked.

The hub doesn't just report problems. It predicts them. But only if you know what you're watching.

## The Four Metrics That Matter

Klaviyo's deliverability hub tracks more than a dozen signals. Four of them predict inbox problems before they compound.

**Spam complaint rate** is the number that matters most. Klaviyo surfaces this as a percentage: complaints divided by delivered emails. Gmail Postmaster Tools uses `0.30%` as the threshold — anything above that and you're getting throttled. Yahoo and Outlook follow similar rules. If your Klaviyo dashboard shows `0.25%` or higher, you're one bad send away from a deliverability collapse.

The fix is immediate: stop sending to anyone who hasn't engaged in 90 days. Not "move them to a re-engagement sequence." Stop sending. Build a `Engaged in Last 90 Days` segment using the condition `What someone has done > Opened Email > at least once in the last 90 days OR Clicked Email > at least once in the last 90 days`. Exclude everyone else from your next five campaigns. Watch the complaint rate drop.

**Bounce rate** should sit below `2%`. If it's climbing, you're either buying lists (stop) or your signup forms aren't using double opt-in (turn it on). Klaviyo automatically suppresses hard bounces, but a rising bounce rate means your list hygiene is broken upstream. Check your signup forms. If you're using embedded forms or pop-ups without the double opt-in setting enabled, you're collecting fake emails and feeding them into every campaign.

The third metric is **engagement trend**, and it's the one that predicts trouble two months out. Klaviyo graphs this as a rolling 30-day average: the percentage of your delivered emails that get opened or clicked. If the line is trending down over 60 days, your list is aging faster than you're replacing engaged subscribers. The usual cause: you've been sending to everyone, including the contacts who haven't opened anything since Q2 of last year.

The fourth is the **unengaged contact warning**. Klaviyo flags this when your campaigns are regularly hitting profiles who haven't engaged in 180+ days. Most operators ignore it because the warning doesn't stop the send. It should. Every unengaged contact in a campaign dilutes your engagement rate and increases the likelihood that one of them marks you as spam. They don't remember signing up. They don't want the email. And when they hit the spam button, Gmail doesn't care that they opted in 14 months ago.

## The Sunset Flow You're Not Running

The single most effective fix for deliverability problems is a sunset flow. Klaviyo calls it a "win-back" flow in some of their templates. I call it a sunset because the point isn't to win anyone back — it's to stop sending to people who don't want your emails before they report you as spam.

Here's how it works. Create a segment: `Has Not Opened or Clicked Email > in the last 90 days` and `Subscribed to Email > at least 91 days ago`. The second condition prevents the flow from triggering on brand-new subscribers who haven't had time to engage. This segment is your unengaged list.

Build a flow triggered by entry into that segment. Three emails over 14 days. The first email has a subject line that says exactly what's happening: "Still want to hear from us?" or "We're about to remove you from this list." No clever copy. No metaphors. State the stakes.

Inside the email: one paragraph explaining that they haven't engaged in 90 days, one paragraph saying you'll remove them if they don't click the button, and one clear call-to-action button. That button links anywhere — your homepage, a blog post, a product page. It doesn't matter. The goal is a click, which Klaviyo records as engagement.

Email two comes seven days later. Same stakes, slightly more urgent. Email three comes seven days after that. "This is the last email. Click here to stay subscribed or we'll remove you tomorrow."

At the end of the flow, add a conditional split: `Has Not Opened or Clicked Email in the Sunset Flow > zero times`. Everyone in the "yes" branch gets suppressed. Add them to a suppression list or update their profile property to `Email Consent = Unsubscribed`. They're done.

The contacts who click any of the three emails stay subscribed and exit the flow. You've re-engaged the people who actually want your emails and removed the dead weight that was dragging your complaint rate up.

Run this flow continuously. The segment updates every day. New unengaged contacts enter. Old unengaged contacts who don't click get suppressed. Your list stays clean without manual intervention.

## The Spam Complaint Rate You Can't See

Klaviyo's deliverability hub shows your complaint rate across all mailbox providers. It doesn't break down complaints by domain. That breakdown lives in Gmail Postmaster Tools, Yahoo's postmaster portal, and Microsoft SNDS. Most operators never set these up.

If you're sending more than 10,000 emails a week, set up Gmail Postmaster Tools today. Google Search "Gmail Postmaster Tools," authenticate your sending domain, and wait 48 hours for data to populate. The user-reported spam rate is the first chart. If it shows `0.30%` or higher, Gmail is already throttling your sends. Emails are landing in spam. Some aren't being delivered at all.

The fix is the same as the Klaviyo-level fix: stop sending to unengaged contacts immediately. But Postmaster Tools gives you domain-specific visibility. If your Gmail complaint rate is high but Yahoo is fine, you know the problem is concentrated in one provider. Segment your campaigns to exclude unengaged Gmail addresses first, then expand to the full unengaged list once the rate drops.

Klaviyo's hub aggregates this data, but it lags by a few days. Postmaster Tools updates daily. Use both.

## The Campaign Habit That Breaks Deliverability

The pattern I see in most accounts: campaigns go to the entire subscribed list. No segmentation. No engagement filters. Just "all subscribers" and send.

This works when your list is new. Everyone opted in recently. Engagement is high. But six months in, you've accumulated contacts who signed up for a lead magnet, never opened a single email, and forgot you exist. They're still in "all subscribers." They're still getting every campaign. And every campaign they ignore pushes your engagement rate down.

Klaviyo makes it easy to exclude unengaged contacts from campaigns. Before you hit send, add a segment condition: `Opened Email > at least once in the last 90 days OR Clicked Email > at least once in the last 90 days`. Your campaign now goes only to contacts who've engaged in the last 90 days. The unengaged contacts don't get the email. They can't ignore it. They can't report it as spam.

This shrinks your send volume. That's the point. You're not paying to send emails that don't get opened. You're not risking deliverability on contacts who don't want to hear from you. And your engagement rate — the metric that Gmail and Outlook actually watch — stays high.

If you're worried about missing revenue from unengaged contacts, test it. Send your next campaign to engaged contacts only. Compare revenue to your last full-list send. In the programs I run, revenue holds flat or increases because the contacts who actually buy are the ones who engage. The unengaged contacts weren't converting anyway. You're just removing the risk they create.

## The "Engaged" Definition That's Too Loose

Klaviyo's default engagement window is 180 days. If someone opened or clicked an email in the last six months, Klaviyo considers them engaged. That window is too long.

Gmail doesn't wait six months to decide you're spam. If a contact hasn't engaged in 90 days, their likelihood of marking you as spam increases every week. At 120 days, they barely remember opting in. At 180 days, they don't remember at all.

Set your engaged segment to 90 days: `Opened Email > at least once in the last 90 days OR Clicked Email > at least once in the last 90 days`. Use that segment as your baseline. Every campaign, every promotional send, every product launch goes to that segment first. If you want to expand to 120-day engaged contacts, test it as a separate send and watch the complaint rate in the deliverability hub. If it ticks up, stop.

The tighter your engagement window, the safer your sending reputation. You can always loosen it if the data supports it. You can't undo a deliverability collapse after Gmail has decided you're a spammer.

## The Deliverability Problem That Starts in Flows

Flows run continuously. Once they're live, most operators never look at them again. That's the problem.

A flow built 18 months ago is still sending to every contact who triggers it — including contacts who haven't engaged with a campaign in 200 days. Klaviyo doesn't automatically filter unengaged contacts out of flows. If your browse abandonment flow triggers for someone who hasn't opened an email since last year, Klaviyo sends it anyway.

Add flow filters. Every revenue-generating flow should have an engagement filter: `Opened or Clicked Email > at least once in the last 90 days`. This appears under the flow trigger settings as a "flow filter." Add it once, and every contact who enters the flow must meet that condition. Unengaged contacts don't enter. They can't ignore the emails. They can't drag your stats down.

The exception: your sunset flow. That flow deliberately targets unengaged contacts. Everything else gets filtered.

## What Happens After You Clean the List

Most operators worry that excluding unengaged contacts will crater their revenue. The opposite happens.

Your open rate climbs. Your click rate climbs. Your complaint rate drops. Gmail and Outlook see higher engagement and start delivering more of your emails to the inbox instead of spam. The engaged contacts who were already buying keep buying — and now they're seeing every email you send because your sender reputation improved.

The revenue you thought you were getting from unengaged contacts was never there. You were sending to people who weren't opening. They weren't clicking. They weren't buying. The only thing they were doing was increasing the risk that your next campaign lands in spam for everyone, including the contacts who actually want to hear from you.

The deliverability hub shows you the warning signs. Spam complaint rate. Engagement trend. Bounce rate. Unengaged contact warnings. They're not decorative. They're the difference between an inbox and a spam folder.

If your Klaviyo deliverability hub is showing anything above `0.25%` spam complaints or a declining engagement trend over 60 days, the fix is the same: stop sending to unengaged contacts, build the sunset flow, and add engagement filters to every campaign and flow you run.

If you want a second set of eyes on your Klaviyo setup, I'll audit your account for free: [getner.ai/audit](https://getner.ai/audit/).