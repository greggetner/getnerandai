import type { Context, Config } from "@netlify/functions"

const DEBUG = Netlify.env.get('DEBUG') === 'true'

export default async (req: Request, context: Context) => {
  console.log('🚀 Probe-brain function started')
  
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ message: 'Probe-brain function is running!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  if (req.method !== 'POST') {
    if (DEBUG) console.log('🚫 Invalid method:', req.method)
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    if (DEBUG) console.log('📥 Parsing request body...')
    const { message, email, messageCount, history = [] } = await req.json()
    if (DEBUG) console.log('📊 Request data:', { email, messageCount, historyLength: history.length })

    if (!message || !email) {
      if (DEBUG) console.log('❌ Missing required fields')
      return new Response(JSON.stringify({ error: 'Message and email are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Cap message length
    if (typeof message !== 'string' || message.length > 2000) {
      return new Response(JSON.stringify({ error: 'Message too long (max 2000 characters)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (messageCount > 5) {
      if (DEBUG) console.log('🛑 Question limit reached')
      return new Response(JSON.stringify({ 
        error: 'Question limit reached. Contact Greg directly to continue the conversation.',
        limitReached: true
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (DEBUG) console.log('🔑 Checking API key...')
    const apiKey = Netlify.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      console.error('❌ Missing ANTHROPIC_API_KEY')
      return new Response(JSON.stringify({ error: 'AI service unavailable' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    // API key found — do NOT log any portion of the key

    // Sanitize history: filter to valid {role, content} objects, cap content length, keep last 8
    const sanitizedHistory = (Array.isArray(history) ? history : [])
      .filter(
        (item: unknown): item is { role: string; content: string } =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as Record<string, unknown>).role === 'string' &&
          typeof (item as Record<string, unknown>).content === 'string'
      )
      .map((item: { role: string; content: string }) => ({
        role: item.role,
        content: item.content.slice(0, 2000),
      }))
      .slice(-8)

    if (DEBUG) console.log('🚀 Calling Anthropic API...')
    const apiRequestBody = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [...sanitizedHistory, { role: 'user', content: message }],
      system: `You are Greg Getner, an ActiveCampaign expert with 23 years of experience. Respond as Greg with a direct, confident, no-fluff style.\n\nUse the full conversation history to stay in context:\n- Short or fragmented user replies are usually answers to a question you just asked, not new topics. Interpret them in light of what you last asked.\n- Build on previous answers instead of re-asking for context you already have.\n- Only ask for clarification when the user's intent is genuinely ambiguous given the prior turns.`
    }
    if (DEBUG) console.log('📊 API request body:', JSON.stringify(apiRequestBody, null, 2))

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': apiKey
      },
      body: JSON.stringify(apiRequestBody)
    })

    console.log('📡 API response status:', response.status)
    if (DEBUG) console.log('📡 API response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Anthropic API error:', response.status, errorText)
      return new Response(JSON.stringify({ error: 'AI service error: ' + response.status }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (DEBUG) console.log('📊 Parsing API response...')
    const data = await response.json()
    if (DEBUG) console.log('📊 API response data:', JSON.stringify(data, null, 2))

    const aiResponse = data.content[0].text
    if (DEBUG) console.log('🧡 AI response text:', aiResponse)

    console.log('✅ Returning successful response')
    return new Response(JSON.stringify({ response: aiResponse }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('💥 Function error:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to process your question. Please try again.',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
