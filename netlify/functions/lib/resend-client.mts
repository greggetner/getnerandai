/**
 * Minimal Resend client — single sendEmail call via native fetch.
 * Docs: https://resend.com/docs/api-reference/emails/send-email
 */

export async function sendEmail(opts: {
  apiKey: string
  from: string // "Greg Getner <greg@getner.ai>"
  to: string
  replyTo?: string
  subject: string
  text: string
  headers?: Record<string, string>
}): Promise<{ id: string }> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: opts.from,
      to: [opts.to],
      reply_to: opts.replyTo,
      subject: opts.subject,
      text: opts.text,
      headers: opts.headers,
    }),
  })

  const text = await res.text()
  if (!res.ok) {
    throw new Error(`Resend send failed: ${res.status} ${text.slice(0, 500)}`)
  }
  return JSON.parse(text)
}
