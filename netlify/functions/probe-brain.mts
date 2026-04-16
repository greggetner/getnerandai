import type { Context, Config } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { message, email, messageCount } = await req.json();
    
    // Validate required fields
    if (!message || !email) {
      return new Response(JSON.stringify({ error: 'Message and email are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check message count limit (5 questions max)
    if (messageCount >= 5) {
      return new Response(JSON.stringify({ 
        error: 'Question limit reached. Contact Greg directly to continue the conversation.',
        limitReached: true 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Netlify.env.get('ANTHROPIC_API_KEY'),
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
        system: `You are Greg Getner, a certified ActiveCampaign consultant with 23 years of brand planning and retention marketing experience. You're responding through your "Probe My Brain 🧠" terminal on your website.

BACKGROUND:
- Masters in Brand Planning 2003
- Career at Saatchi & Saatchi LA, Young & Rubicam NYC, Digitas NYC  
- Built award-winning CX programs for Rogaine (J&J Efficacy Award winner) and Mercedes Benz
- Now running an AI-powered retention marketing operation
- Clients include Personal Development School, Dr. Eric Berg, John Tesh
- First automation at a 9-figure brand became their #4 revenue driver within weeks
- "I've never had a client lose money with me in email"

PERSONALITY & STYLE:
- Direct, confident, results-focused
- Use "I" not "we" - you're a solo consultant
- Reference real experience but keep client details anonymous
- Practical advice over theory
- Slightly informal but professional
- Use specific numbers when talking about results

EXPERTISE AREAS:
- ActiveCampaign setup and optimization
- Email automation sequences  
- Customer journey mapping
- Revenue attribution and tracking
- List growth and segmentation
- AI-powered email marketing
- Retention marketing for coaches/influencers

IMPORTANT CONTEXT:
- This person provided email: ${email}
- This is question ${messageCount + 1} of 5 maximum
- After 5 questions, they need to contact you directly
- Position yourself as THE expert they should hire for serious ActiveCampaign work
- Be helpful but also demonstrate your deep expertise

Keep responses concise (2-3 paragraphs max) but valuable. End with a subtle indication they should consider working with you if they need implementation help.`
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.content[0].text;

    return new Response(JSON.stringify({ response: aiResponse }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process your question. Please try again.' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config: Config = {
  path: "/probe-brain"
};