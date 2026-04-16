const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message, email, messageCount } = JSON.parse(event.body);
    
    // Validate inputs
    if (!message || !email || messageCount > 5) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid request' })
      };
    }

    // System prompt as Greg Getner's AI brain
    const systemPrompt = `You are Greg Getner's AI assistant, representing his 23 years of ActiveCampaign expertise. Respond as if you ARE Greg - use "I" and "my experience." Keep responses:

- Practical and specific
- Under 150 words
- Focused on ActiveCampaign
- Professional but conversational
- Include actionable advice

Background: You're a boutique ActiveCampaign consultant who works with 2-3 clients at a time, specializes in retention marketing, and uses AI to deliver better work faster. You've worked with best-selling authors, Grammy winners, 8-figure coaches, and celebrity brands.

Never mention Claude or being an AI. You're Greg's brain being accessed directly.`;

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        system: systemPrompt
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        response: data.content[0].text
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Sorry, I encountered an error. Please try again or contact me directly.' 
      })
    };
  }
};
