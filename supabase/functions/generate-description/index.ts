import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') || '';

interface GenerateDescriptionPayload {
  imageBase64?: string;
  imageUrl?: string;
  title: string;
  category: string;
  location?: string;
  price?: number;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateDescription(payload: GenerateDescriptionPayload): Promise<string> {
  const { imageBase64, imageUrl, title, category, location, price } = payload;

  // Construct the prompt
  const systemPrompt = `You are a helpful assistant that writes compelling product descriptions for a Guyanese marketplace called Limin Market.

Your descriptions should:
- Be 2-4 sentences long
- Highlight key features and condition
- Use natural, conversational language
- Include Guyanese context when relevant (e.g., "perfect for staying connected with family back home", "hard to find in Guyana")
- Be honest and accurate
- Mention condition, what's included, and any notable features
- Use local terminology where appropriate`;

  const userPrompt = `Write a compelling marketplace description for this item:
Title: ${title}
Category: ${category}
${location ? `Location: ${location}` : ''}
${price !== undefined ? `Price: ${price === 0 ? 'FREE' : '$' + price + ' GYD'}` : ''}

${imageBase64 || imageUrl ? 'Please analyze the image to identify condition, features, and any visible details.' : 'Generate a description based on the title and category.'}`;

  // Prepare the message content
  const content: any[] = [];

  // Add image if provided
  if (imageBase64) {
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: imageBase64,
      },
    });
  } else if (imageUrl) {
    content.push({
      type: 'image',
      source: {
        type: 'url',
        url: imageUrl,
      },
    });
  }

  // Add text prompt
  content.push({
    type: 'text',
    text: userPrompt,
  });

  // Call Claude API
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: content,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Claude API error:', error);
    throw new Error(`Failed to generate description: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  const description = result.content[0].text;

  return description;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: GenerateDescriptionPayload = await req.json();

    // Validate required fields
    if (!payload.title || !payload.category) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title and category' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate description
    const description = await generateDescription(payload);

    return new Response(
      JSON.stringify({ description }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error generating description:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to generate description',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
