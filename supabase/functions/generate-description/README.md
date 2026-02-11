# AI Description Generator Edge Function

This Supabase Edge Function uses Anthropic's Claude API to generate compelling product descriptions based on images, titles, and categories.

## Features

- **Vision-powered**: Analyzes product images to identify condition, features, and details
- **Context-aware**: Generates descriptions tailored to Guyanese marketplace culture
- **Category-specific**: Adjusts tone and content based on product category
- **Fast**: Returns descriptions in 1-3 seconds

## Setup

### 1. Set Environment Variable

In your Supabase project dashboard, go to Settings → Edge Functions and add:

```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Get your API key from: https://console.anthropic.com/

### 2. Deploy the Function

```bash
supabase functions deploy generate-description
```

### 3. Test the Function

```bash
curl -i --location --request POST 'https://your-project.supabase.co/functions/v1/generate-description' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "title": "iPhone 13 Pro",
    "category": "Electronics",
    "location": "Georgetown, Guyana",
    "price": 150000
  }'
```

## API Reference

### Request Body

```typescript
{
  imageBase64?: string;    // Base64 encoded image (without data:image prefix)
  imageUrl?: string;       // Public image URL (alternative to base64)
  title: string;           // Product title (required)
  category: string;        // Product category (required)
  location?: string;       // Location
  price?: number;          // Price in GYD
}
```

### Response

```typescript
{
  description: string;     // Generated description (2-4 sentences)
}
```

### Error Response

```typescript
{
  error: string;          // Error message
}
```

## Cost Estimates

Claude 3.5 Sonnet pricing:
- Text-only: ~$0.003 per generation
- With image: ~$0.015 per generation

**Monthly estimates:**
- 100 generations: ~$1.50
- 1,000 generations: ~$15
- 10,000 generations: ~$150

## Features of Generated Descriptions

- 2-4 sentences long
- Highlights key features and condition
- Mentions what's included
- Uses Guyanese context (e.g., "hard to find in Guyana", "perfect for staying connected with family")
- Natural, conversational tone
- Honest and accurate

## Example Generations

**Input:**
```json
{
  "title": "iPhone 13",
  "category": "Electronics",
  "price": 150000
}
```

**Output:**
```
iPhone 13 in excellent condition with pristine screen and no visible scratches. Comes with original charger and still under warranty. Battery health at 90% - perfect for WhatsApp calls and staying connected with family back home. Unlocked and works with any carrier in Guyana.
```

## Security

- CORS enabled for all origins (adjust in production)
- API key stored securely in environment variables
- Image data processed only for description generation
- No data stored by Anthropic (per their API terms)

## Troubleshooting

### "Failed to generate description: 401"
- Check that ANTHROPIC_API_KEY is set correctly
- Verify API key is valid at console.anthropic.com

### "Failed to generate description: 400"
- Ensure title and category are provided
- Check that image data is valid base64 or accessible URL

### "Failed to generate description: 429"
- Rate limit exceeded
- Consider implementing caching or usage limits
