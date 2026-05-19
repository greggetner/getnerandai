---
topic_id: spf-dkim-dmarc-20-min
title: "SPF, DKIM, and DMARC: The 20-Minute Deliverability Setup Most Accounts Get Wrong"
category: Deliverability
drafted_at: 2026-05-19T16:14:56.710Z
word_count: 1436
---

# SPF, DKIM, and DMARC: The 20-Minute Deliverability Setup Most Accounts Get Wrong

*I've audited ActiveCampaign programs where every automation was built correctly, segmentation was tight, and content was strong—but 18% of sends never reached the inbox because nobody had configured DMARC.*

Email authentication isn't optional anymore. Gmail and Yahoo both announced hard requirements in February 2024: if you're sending commercial email without proper `SPF`, `DKIM`, and `DMARC` records, your messages get throttled or blocked outright. Not flagged as spam—just rejected at the server level before anyone even sees them.

The frustrating part: authentication takes twenty minutes to set up and most accounts either skip it entirely or misconfigure one of the three records. Then they blame "deliverability" or "engagement" when the real problem is that ISPs are treating their domain like an unauthenticated sender.

## What Each Record Actually Does

**SPF** (Sender Policy Framework) tells receiving mail servers which IP addresses are allowed to send email on behalf of your domain. When you send through ActiveCampaign, their servers send the message. SPF confirms you've given them permission to do that.

**DKIM** (DomainKeys Identified Mail) adds a cryptographic signature to every outbound message. The receiving server checks that signature against a public key published in your DNS. If they match, the message hasn't been tampered with in transit and genuinely came from your domain.

**DMARC** (Domain-based Message Authentication, Reporting, and Conformance) is the enforcement layer. It tells receiving servers what to do if `SPF` or `DKIM` checks fail: quarantine the message, reject it outright, or let it through with a warning. It also sends you daily reports showing every authentication attempt against your domain—which means you'll know if someone's trying to spoof you.

All three work together. `SPF` and `DKIM` authenticate the message. `DMARC` enforces the policy and gives you visibility.

## Why DMARC Is the Non-Negotiable One Now

Gmail and Yahoo's 2024 sender requirements made `DMARC` mandatory for anyone sending more than 5,000 messages a day to Gmail addresses. But the practical threshold is lower: if you're running a coaching business, a course launch, or a DTC brand with any kind of list, you're over that line.

Without a published `DMARC` record, your domain has no authentication policy. ISPs treat that as a red flag. Even if your `SPF` and `DKIM` records are perfect, the lack of `DMARC` signals that you're not serious about email security. Messages get deprioritized or blocked.

The other reason `DMARC` matters: reporting. Once it's configured, you'll get daily XML reports from major ISPs showing every authentication check against your domain. You'll see pass/fail rates for `SPF` and `DKIM`, which IPs are sending on your behalf, and whether anyone's attempting to spoof your domain. In the accounts I run, I check those reports quarterly. They've caught misconfigured subdomains, old ESPs still trying to send, and at least twice, actual spoofing attempts.

Start with a `DMARC` policy of `p=none`. That tells ISPs to monitor and report, but not to reject anything. Once you confirm `SPF` and `DKIM` are passing consistently for thirty days, move to `p=quarantine`, then eventually `p=reject`.

## The Three Most Common Setup Mistakes

### 1. Adding ActiveCampaign to SPF but Not Flattening the Record

ActiveCampaign's `SPF` include directive is `include:servers.mcsv.net`. You add that to your domain's `SPF` record along with any other sending services—your CRM, your helpdesk, maybe Slack if you're sending from that domain.

The problem: `SPF` has a hard limit of ten DNS lookups. Every `include:` statement counts as one lookup. If you're using ActiveCampaign, Google Workspace, HubSpot, and a transactional service like Postmark, you're already at four or five lookups before you've added your own IPs. Hit eleven and the entire `SPF` record fails, even if the individual components are correct.

The fix is `SPF` flattening. Instead of including a third-party's domain (which triggers a lookup), you resolve their IP ranges manually and list them directly in your record as `ip4:` or `ip6:` entries. Services like MXToolbox and EasyDMARC offer automated flattening, or you can do it manually by checking each provider's published IPs and updating quarterly.

In the programs I run, I flatten everything except ActiveCampaign's include, since their IP ranges change frequently enough that manual updates aren't practical. Everything else—static IPs, Google Workspace, transactional services—gets flattened.

### 2. Configuring DKIM in ActiveCampaign but Not Verifying the DNS Record

ActiveCampaign generates a `DKIM` key pair when you authenticate your domain. They give you a `TXT` record to publish in your DNS. You add the record, wait for propagation, and assume it's working.

Except: `DKIM` records are long. Most DNS providers let you paste the full value, but some truncate it silently or add line breaks that break the signature. Or you copy-paste the record and accidentally grab a trailing space or an invisible character. The record publishes, but the signature doesn't validate.

ActiveCampaign's domain authentication screen shows a green checkmark if they can query the record. That's necessary but not sufficient. The checkmark means the record exists—not that it's validating correctly on inbound mail servers.

The fix: use an external `DKIM` validator like MXToolbox's DKIM Lookup or mail-tester.com. Send a test email to their address, and they'll show you whether the `DKIM` signature passed. If it fails, the record is either incomplete, has a syntax error, or the selector doesn't match what ActiveCampaign is signing with.

I validate `DKIM` on every new domain authentication and again any time I see a sudden drop in inbox placement. At least once a quarter, someone's DNS provider will time out a record or revert a change, and `DKIM` breaks silently.

### 3. Setting DMARC to p=reject Without Monitoring Pass Rates First

You publish your `DMARC` record with `p=reject`, which tells ISPs to hard-reject any message that fails `SPF` and `DKIM` alignment. It feels like the secure choice. Then your transactional emails stop delivering, your ActiveCampaign sends get blocked, and you have no idea why because you're not collecting the reports.

`DMARC` has three policy levels: `p=none` (monitor only), `p=quarantine` (send to spam), and `p=reject` (bounce the message). Start with `p=none` and add the `rua` tag to specify where reports should go: `rua=mailto:dmarc-reports@yourdomain.com`. ISPs will send daily XML reports to that address.

Let it run for thirty days. Check the reports weekly using a `DMARC` analyzer like Postmark's free tool, EasyDMARC, or Valimail. You're looking for two things: pass rates on `SPF` and `DKIM`, and any unexpected sources trying to send on your behalf.

Once you're seeing 95%+ pass rates and no surprises, move to `p=quarantine`. Wait another thirty days. If everything still looks clean, move to `p=reject`. Skipping straight to `p=reject` without that ramp-up period means any misconfiguration—an old sending service, a forwarding rule, a subdomain you forgot about—will cause silent bounces, and you won't know until someone complains.

## How to Verify All Three Are Working Right Now

Don't trust the green checkmarks in ActiveCampaign's interface. External validation catches the errors that admin dashboards miss.

**For SPF:** Use MXToolbox's SPF Lookup tool. Enter your domain. It'll show you the full record, count the DNS lookups, and flag any syntax errors. If you're over ten lookups, flatten the record.

**For DKIM:** Send a test email from ActiveCampaign to mail-tester.com or check-auth@verifier.port25.com. Both will reply with a full authentication report showing whether `DKIM` passed and which selector was used. If it fails, compare the selector in the report to the one in your DNS record—they need to match.

**For DMARC:** Use MXToolbox's DMARC Lookup or Google's CheckMX tool. Enter your domain. It'll show your published policy, the `rua` and `ruf` reporting addresses, and whether the syntax is valid. Then check your `rua` inbox—if you're not getting daily reports, the address is misconfigured or the receiving mailbox is rejecting them.

Run all three checks now. Bookmark the tools. Recheck every ninety days, after any DNS provider change, and any time you see a sudden drop in inbox placement that isn't explained by engagement.

## The Twenty-Minute Fix That Pays for Years

Most deliverability problems aren't about content or send time or engagement. They're about authentication. ISPs don't trust unauthenticated senders. It doesn't matter how good your copy is or how clean your list is if the receiving server rejects your messages before anyone sees them.

`SPF`, `DKIM`, and `DMARC` are the baseline. Configure them once, verify them quarterly, and you've removed the single biggest structural barrier to inbox placement. Everything else—engagement, segmentation, content—builds on that foundation.

If you're not sure your authentication is configured correctly, or if you've never checked your `DMARC` reports, **[request a free ActiveCampaign audit](https://getner.ai/audit/)** and I'll show you exactly what's misconfigured and how to fix it.