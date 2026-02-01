# Supabase Edge Functions Deployment Guide

## Prerequisites

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link to your project:
```bash
cd /Users/kdass/Documents/limin-market
supabase link --project-ref YOUR_PROJECT_REF
```

## Deploy Edge Functions

### 1. Deploy Email Notification Function

```bash
supabase functions deploy send-email-notification
```

### 2. Set Environment Variables

You need to set the `RESEND_API_KEY` secret for the email function:

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

**Note:** Get your Resend API key from https://resend.com/api-keys

The following variables are automatically available to Edge Functions:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (full access)

## Enable Realtime for Messaging

The messaging feature requires Realtime to be enabled for real-time message delivery.

1. Go to your Supabase Dashboard
2. Navigate to **Database** → **Replication**
3. Find the following tables and toggle **ON**:
   - `conversations`
   - `messages`

## Test the Function Locally (Optional)

You can test the Edge Function locally before deploying:

```bash
# Start local Supabase services
supabase start

# Serve the function locally
supabase functions serve send-email-notification --env-file supabase/.env.local
```

Create `supabase/.env.local` with:
```
RESEND_API_KEY=your_test_api_key
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key
```

Test the function:
```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-email-notification' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"conversationId":"uuid-here","recipientId":"uuid-here","emailType":"new_message"}'
```

## Verify Deployment

After deployment, you can check function logs:

```bash
supabase functions logs send-email-notification
```

Or view logs in the Supabase Dashboard:
- Navigate to **Edge Functions** → `send-email-notification` → **Logs**

## Email Configuration

### Using Resend

1. Sign up at https://resend.com
2. Verify your domain (or use their test domain for development)
3. Create an API key
4. Set the secret: `supabase secrets set RESEND_API_KEY=re_xxx`

### Email Template

The function currently sends a basic HTML email template. In Phase 7, we'll add:
- Multiple email templates (new_message, price_drop, new_listing)
- Template customization
- Email preference management

## Troubleshooting

### Function not triggering
- Check if the function is deployed: `supabase functions list`
- Check function logs for errors
- Verify Realtime is enabled for messages table

### Emails not sending
- Verify RESEND_API_KEY is set: `supabase secrets list`
- Check Resend dashboard for delivery status
- Check email_logs table for failed attempts:
  ```sql
  SELECT * FROM email_logs WHERE status = 'failed' ORDER BY created_at DESC LIMIT 10;
  ```

### Notification preferences not working
- Verify notification_preferences table has default row for users
- Add a database trigger to create default preferences on user signup:
  ```sql
  CREATE OR REPLACE FUNCTION create_default_notification_prefs()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE TRIGGER create_notification_prefs_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_notification_prefs();
  ```

## Next Steps

After deploying the email notification function:

1. Test the messaging feature end-to-end
2. Verify emails are being sent
3. Move to Phase 3: Reviews & Ratings system
