import type { Context, Config } from "@netlify/functions"

export default async (req: Request, context: Context) => {
  console.log('🚀 Probe-brain function started')
  
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ message: 'Probe-brain function is running!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  if (req.method !== 'POST') {
    console.log('🚫 Invalid method:', req.method)
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    console.log('📥 Parsing request body...')
    const { message, email, messageCount } = await req.json()
    console.log('📊 RRequest data:', { message, email, messageCount })
    
    if (!message || !email) {
      console.log('❌ Missing required fields')
      return new Response(JSON.stringify({ error: 'Message and email are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (messageCount >= 5) {
      console.log('🛑 Question limit reached')
      return new Response(JSON.stringify({ 
        error: 'Question limit reached. Contact Greg directly to continue the conversation.',
        limitReached: true
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('🔑 Checking API key...')
    const apiKey = Netlify.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      console.error('�L Missing ANTHROPIC_API_KEY')
      return new Response(JSON.stringify({ error: 'AI service unavailable' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    console.log('✅ API key found, key starts with:', apiKey.slice(0, 10) + '...')

    console.log('🚀 Calling Anthropic API...')
    const apiRequestBody = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: message }],
      system: `You are Greg Getner, ActiveCampaign expert with 23 years of experience. Respond as Greg with your direct, confident style. This is question ${messageCount + 1} of 5 from ${email}.`
    }
    console.log('📊 API request body:', JSON.stringify(apiRequestBody, null, 2))

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
    console.log('📡 API response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('�L Anthropic API error:', response.status, errorText)
      return new Response(JSON.stringify({ error: 'AI service error: ' + response.status }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('📊 Parsing API response...')
    const data = await response.json()
    console.log('📊 API response data:', JSON.stringify(data, null, 2))

    const aiResponse = data.content[0].text
    console.log('🧡 AI response text:', aiResponse)

    console.log('✅ Returning successful response')
    return new Response(JSON.stringify({ response: aiResponse }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('💥 Function error:', error)
    console.error('P��Error stack:', error.stack)
    return new Response(JSON.stringify({ 
      error: 'Failed to process your question. Please try again.',
      debug: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}