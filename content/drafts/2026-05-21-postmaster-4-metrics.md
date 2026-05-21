---
topic_id: postmaster-4-metrics
title: "Google Postmaster Tools: The 4 Metrics That Actually Matter"
category: Deliverability
drafted_at: 2026-05-21T16:12:29.728Z
word_count: 1524
---

# Google Postmaster Tools: The 4 Metrics That Actually Matter

*Gmail gives you ten charts in Postmaster Tools. Seven of them are theater. Here are the four that actually tell you whether your email is landing or dying in spam.*

I open Google Postmaster Tools in almost every ActiveCampaign audit I run. The dashboard looks impressive—ten different charts, color-coded reputation scales, authentication badges. Most of it doesn't matter.

What matters: whether Gmail trusts you enough to deliver your mail, and whether recipients are telling Gmail they don't want it. Everything else is commentary.

Four metrics answer those questions. The rest are lag indicators, vanity data, or things you already know from your ActiveCampaign reports. Here's what to watch, what the thresholds mean, and what to do when something slips.

## User-Reported Spam Rate: The Only Metric That Can Kill You Overnight

This is the percentage of your delivered Gmail messages that recipients manually marked as spam. Not bounces. Not unsubscribes. The button that says "Report spam" or "Mark as spam."

**Healthy:** Below `0.10%`. Invisible to Gmail's throttling algorithms.

**Warning zone:** `0.10%` to `0.30%`. You're on the watch list. Gmail hasn't throttled you yet, but you're one bad send away from it.

**Red line:** Above `0.30%`. Gmail starts routing your mail to spam, slowing delivery, or blocking it outright.

I have a standing rule in the programs I run: if user-reported spam rate crosses `0.30%` to any meaningful portion of our Gmail volume, we stop all sends to Gmail addresses until we find the cause. Not pause. Stop.

That threshold isn't theoretical. Gmail has said publicly that `0.30%` is where enforcement begins. I've watched accounts go from 95% inbox placement to 11% in three days after crossing it during a botched promotional send.

**What causes spikes:**

- Sending to a list segment you haven't touched in 90+ days
- Rented, scraped, or "co-reg" lists (which you should never touch anyway)
- A sudden shift in content—going from educational emails to hard pitches
- Sending without a working, visible unsubscribe link

**The fix:** Segment by engagement recency. In ActiveCampaign, build a segment for contacts who've opened or clicked in the last 60 days and send only to them until your spam rate drops back under `0.10%`. Then slowly re-introduce older contacts in small batches—10% of the dormant list per week—and watch the spam rate after each batch.

If it jumps again, those contacts are dead. Suppress them permanently or move them to a low-frequency re-engagement sequence with a single goal: get one click or remove them.

## Domain Reputation: The Scorecard Gmail Actually Uses

This is Gmail's trust rating for your sending domain—the part after the @ in your `From:` address. It's the single biggest factor in whether your mail hits the inbox or spam.

Postmaster Tools shows it on a scale: Bad, Low, Medium, High. No numbers. Just color bands.

**Healthy:** High. Green bar, all the way right. This is where you want to live.

**Warning zone:** Medium. Yellow-orange. Your mail is still mostly delivering, but Gmail is watching. A bad send here drops you faster than a bad send from High.

**Emergency:** Low or Bad. Most of your mail is going to spam. If you're here, you've already lost weeks of deliverability.

Domain reputation moves slowly when it's high and fast when it's falling. I've seen accounts sit at High for nine months, send one unvetted list upload, and drop to Medium in 48 hours. The climb back took five weeks of perfect behavior.

**What drops it:**

- High user-reported spam rates (see above)
- Sending to a lot of invalid addresses—hard bounces, spam traps, defunct domains
- Sudden volume spikes (doubling your send volume week-over-week without warming)
- Low engagement from Gmail recipients specifically (not opens—Gmail can't measure those reliably anymore—but clicks, replies, moves to Primary, stars, forwards)

**The fix:** You can't directly repair domain reputation. You fix the behaviors that broke it, then wait. Clean your list: pull a segment of everyone who hasn't engaged in 90 days and stop sending to them. Export your bounce list from ActiveCampaign and make sure those contacts are suppressed or deleted, not just tagged. Reduce your send frequency to Gmail addresses by 30–50% until reputation recovers, and make sure every email you *do* send has a clear, single action that's easy to take.

If you're stuck at Medium or Low for more than two weeks despite clean behavior, you may have burned the domain. Start warming a new sending domain in parallel and migrate over 60 days.

## IP Reputation: Matters Only If You're on a Dedicated IP

Most ActiveCampaign users send from shared IPs—pools managed by ActiveCampaign where your mail mixes with others. If that's you, IP reputation in Postmaster Tools will either be grayed out or show the reputation of the shared pool, which you don't control.

IP reputation only matters if you're on a dedicated IP, which usually happens when you're sending 500,000+ emails a month and paying for the privilege.

The scale is the same: Bad, Low, Medium, High.

**Healthy:** High.

**Warning zone:** Medium. Same as domain reputation—you're on notice.

**Emergency:** Low or Bad. You're in spam.

**What drops it:**

- Everything that drops domain reputation, but faster. A dedicated IP has no herd to hide in.
- Inconsistent send volume. If you send 80,000 emails one week and 8,000 the next, Gmail sees erratic behavior and trusts you less.
- Sending from a cold IP without proper warming (a multi-week ramp where you gradually increase daily volume).

**The fix:** If you're on a dedicated IP and reputation falls, the steps are the same as domain reputation—clean your list, cut volume, fix engagement—but you also need to stabilize your send schedule. Gmail wants to see predictable volume. If your business has natural peaks (launch weeks, monthly promos), warm Gmail to that pattern: send at peak volume to your most engaged segment during off-weeks so the IP stays warm.

If IP reputation tanks and won't recover, ask ActiveCampaign to assign you a new dedicated IP and warm it properly. Don't try to rehab a burned IP while still sending revenue mail from it. You'll just burn the domain, too.

## Authentication: The Table Stakes

This section shows whether your email passes SPF, DKIM, and DMARC—the three technical checks that prove you're actually authorized to send from your domain.

In Postmaster Tools, you'll see a percentage for each: what portion of your mail passed each check.

**Healthy:** 100% pass rate on all three, all the time.

**Warning zone:** Anything under 100%. If even 5% of your mail fails authentication, Gmail assumes you don't control your sending infrastructure.

**Emergency:** Below 90% on any check, or a DMARC policy of `p=none` combined with falling domain reputation.

Authentication doesn't directly control whether your mail hits the inbox, but it's a prerequisite. If you fail SPF or DKIM, Gmail won't even *consider* your domain reputation. You're auto-sorted into spam or blocked outright.

**What breaks it:**

- Sending through ActiveCampaign but not updating your DNS records with ActiveCampaign's SPF and DKIM tokens
- Forwarding automations—like a "forward to a friend" feature—that send from your domain but originate from a recipient's action (these almost always fail SPF)
- Sending from multiple platforms (ActiveCampaign + Mailchimp + a transactional provider) without consolidating DNS records
- Copy-pasting your DKIM record incorrectly and leaving a typo or line break

**The fix:** Go into your DNS provider (usually wherever you bought your domain—Cloudflare, GoDaddy, Namecheap) and verify your SPF, DKIM, and DMARC records match what ActiveCampaign provides. If you don't know what those are, log into ActiveCampaign, go to **Settings → Advanced → Sender domains**, click your domain, and follow the instructions exactly.

Set your DMARC policy to `p=quarantine` or `p=reject` once you're consistently hitting 100% authentication. A `p=none` policy tells Gmail you don't actually enforce authentication, which gives you no credit for passing it.

If you're forwarding emails or using third-party tools that send "from" your domain (like some funnel builders or membership platforms), route them through ActiveCampaign's SMTP relay or switch their `From:` address to a subdomain you control, like `notify.yourdomain.com`, and set up separate authentication there.

## The Monitoring Cadence

I check Postmaster Tools once a week in the accounts I run. Daily is overkill—the data lags by 24–48 hours anyway. Monthly is too slow—you'll miss a spike until it's already cost you.

Log in every Monday. Check user-reported spam rate first. If it's climbing, stop and diagnose before you check anything else. Then domain reputation, IP reputation (if applicable), and authentication.

If all four are green and stable, you're done. If any of them slip, you have the playbook above.

---

Most of the deliverability advice you'll find online is vague or outdated. Gmail Postmaster Tools is the rare case where Google actually tells you what they care about and shows you the thresholds. The work is in watching the four metrics that matter and acting the moment one slips.

If you're seeing reputation drops, spam rate spikes, or authentication failures and don't know what's breaking inside your ActiveCampaign setup, I'll walk through your account and show you: **[getner.ai/audit](https://getner.ai/audit/)**.