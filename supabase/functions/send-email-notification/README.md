# Email Notification Edge Function

This Supabase Edge Function sends email notifications to users using the Resend API.

## Setup

### 1. Get Resend API Key

1. Sign up at [Resend](https://resend.com)
2. Create an API key
3. Verify your domain (or use Resend's test domain for development)

### 2. Set Environment Variables

In your Supabase project dashboard:

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

The function automatically has access to:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Deploy the Function

```bash
# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy send-email-notification
```

## Usage

### From Database Triggers

Call the function from database triggers using `pg_net` or create a PostgreSQL function:

```sql
CREATE OR REPLACE FUNCTION send_new_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  recipient_email TEXT;
  product_title TEXT;
  sender_name TEXT;
BEGIN
  -- Get recipient email (seller)
  SELECT email INTO recipient_email
  FROM auth.users
  WHERE id = (SELECT seller_id FROM conversations WHERE id = NEW.conversation_id);

  -- Get product title
  SELECT title INTO product_title
  FROM products
  WHERE id = (SELECT product_id FROM conversations WHERE id = NEW.conversation_id);

  -- Get sender name
  SELECT email INTO sender_name
  FROM auth.users
  WHERE id = NEW.sender_id;

  -- Call Edge Function via HTTP (requires pg_net extension)
  PERFORM
    net.http_post(
      url := 'https://your-project-ref.supabase.co/functions/v1/send-email-notification',
      headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')),
      body := jsonb_build_object(
        'to', recipient_email,
        'type', 'new_message',
        'data', jsonb_build_object(
          'productTitle', product_title,
          'senderName', sender_name
        )
      )
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_new_message_send_email
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION send_new_message_notification();
```

### From Client Application

```typescript
import { supabase } from './lib/supabase';

// Send new message notification
await supabase.functions.invoke('send-email-notification', {
  body: {
    to: 'user@example.com',
    type: 'new_message',
    data: {
      productTitle: 'iPhone 13 Pro',
      senderName: 'John Doe'
    }
  }
});

// Send price drop notification
await supabase.functions.invoke('send-email-notification', {
  body: {
    to: 'user@example.com',
    type: 'price_drop',
    data: {
      productTitle: 'iPhone 13 Pro',
      oldPrice: 599.99,
      newPrice: 499.99
    }
  }
});

// Send new listing notification
await supabase.functions.invoke('send-email-notification', {
  body: {
    to: 'user@example.com',
    type: 'new_listing',
    data: {
      productTitle: 'iPhone 13 Pro',
      searchName: '3BR Homes Georgetown',
      category: 'Real Estate'
    }
  }
});
```

## Email Types

### 1. New Message (`new_message`)
Sent when someone sends a message about a listing.

**Required data:**
- `productTitle`: Title of the product
- `senderName`: Name of the person who sent the message

### 2. Price Drop (`price_drop`)
Sent when a favorited product's price is reduced.

**Required data:**
- `productTitle`: Title of the product
- `oldPrice`: Previous price
- `newPrice`: New (reduced) price

### 3. New Listing (`new_listing`)
Sent when a new listing matches a user's saved search.

**Required data:**
- `productTitle`: Title of the new listing
- `searchName`: Name of the saved search that matched
- `category` (optional): Product category

## Testing

Test the function locally:

```bash
supabase functions serve send-email-notification
```

Then make a test request:

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-email-notification' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"to":"test@example.com","type":"new_message","data":{"productTitle":"Test Product","senderName":"Test User"}}'
```

## Email Templates

The function includes responsive HTML email templates with:
- Gradient headers matching Limin Market branding
- Mobile-friendly design
- Clear call-to-action buttons
- Footer with preference management reminder

## Notification Preferences

The function automatically checks user preferences before sending:
- Queries `notification_preferences` table
- Only sends if user has that notification type enabled
- Returns success message if notification is disabled

## Logging

All email sends are logged to the `email_logs` table:
- Success: `status = 'sent'`
- Failure: `status = 'failed'` with `error_message`

## Domain Setup

For production, verify your domain with Resend:

1. Add DNS records provided by Resend
2. Update the `from` address in the function:
   ```typescript
   from: 'Limin Market <notifications@yourdomain.com>'
   ```

## Rate Limits

Resend free tier limits:
- 100 emails/day (test domain)
- 3,000 emails/month (verified domain)

Upgrade plan as needed for production use.
