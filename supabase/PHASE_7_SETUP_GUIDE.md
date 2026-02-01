# Phase 7: Email Notifications - Setup Guide

This guide will help you complete the email notifications implementation.

## Prerequisites

✅ Phase 1-6 completed (database tables exist)
✅ Supabase CLI installed ([Installation guide](https://supabase.com/docs/guides/cli))
✅ Resend account ([Sign up](https://resend.com))

## Step 1: Get Resend API Key

1. Sign up at https://resend.com
2. Go to **API Keys** section
3. Create a new API key
4. Copy the key (starts with `re_`)

### Domain Verification (Optional but Recommended)

For production:
1. Add your domain in Resend dashboard
2. Add the provided DNS records to your domain
3. Wait for verification
4. Update the `from` address in `supabase/functions/send-email-notification/index.ts`:
   ```typescript
   from: 'Limin Market <notifications@yourdomain.com>'
   ```

For testing, you can use Resend's test domain (limited to 100 emails/day).

## Step 2: Deploy Edge Function

```bash
# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref <your-project-ref>

# Set the Resend API key as a secret
supabase secrets set RESEND_API_KEY=<your-resend-api-key>

# Deploy the function
supabase functions deploy send-email-notification
```

**Find your project ref:**
- Go to your Supabase project dashboard
- Project Settings → General
- Look for "Reference ID"

## Step 3: Enable pg_net Extension

In your Supabase SQL Editor, run:

```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

This extension allows PostgreSQL to make HTTP requests to the Edge Function.

## Step 4: Set Service Role Key

```sql
ALTER DATABASE postgres SET app.settings.service_role_key TO 'your-service-role-key';
```

**Find your service role key:**
- Supabase Dashboard → Project Settings → API
- Look for "service_role secret" (NOT the anon key!)

⚠️ **Security Note:** Never expose the service role key in client-side code!

## Step 5: Update Project URL in Triggers

Edit `supabase/EMAIL_TRIGGERS_SETUP.sql` and replace:

```sql
project_url TEXT := 'https://your-project-ref.supabase.co';
```

With your actual Supabase project URL:

```sql
project_url TEXT := 'https://abcdefghijklmnop.supabase.co';
```

## Step 6: Create Database Triggers

Run the SQL in `supabase/EMAIL_TRIGGERS_SETUP.sql` in your Supabase SQL Editor.

This creates:
- ✅ New message notification trigger
- ✅ Price drop notification trigger
- ✅ New listing (saved search match) notification trigger

## Step 7: Test the Integration

### Test 1: New Message Email

1. Sign in as User A
2. Sign in as User B (different browser/incognito)
3. User B views a product from User A
4. User B clicks "Contact Seller"
5. User B sends a message
6. **Expected:** User A receives an email notification

### Test 2: Price Drop Email

1. Sign in as User A
2. Favorite a product from User B
3. Sign in as User B
4. Edit the product and reduce the price
5. **Expected:** User A receives a price drop email

### Test 3: New Listing Email

1. Sign in as User A
2. Go to Advanced Search → Create a saved search
3. Sign in as User B
4. Post a new listing matching User A's search filters
5. **Expected:** User A receives a new listing email

### Verify Email Logs

Check the `email_logs` table:

```sql
SELECT 
  email_type,
  status,
  error_message,
  created_at
FROM email_logs
ORDER BY created_at DESC
LIMIT 10;
```

- `status = 'sent'` ✅ Email sent successfully
- `status = 'failed'` ❌ Check `error_message` for details
- `status = 'pending'` ⏳ Still processing

## Troubleshooting

### Email not sent

**Check notification preferences:**
```sql
SELECT * FROM notification_preferences WHERE user_id = '<user-id>';
```

Make sure the relevant notification type is enabled.

**Check email logs:**
```sql
SELECT * FROM email_logs WHERE status = 'failed' ORDER BY created_at DESC LIMIT 5;
```

Look at the `error_message` column for details.

### Common Issues

**"Resend API error: Invalid API key"**
- Double-check your Resend API key
- Re-run: `supabase secrets set RESEND_API_KEY=<your-key>`

**"Connection refused"**
- Verify the project URL in trigger functions
- Make sure Edge Function is deployed: `supabase functions list`

**"Unauthorized"**
- Check service_role_key is set correctly
- Verify pg_net has proper permissions (Step 4 in EMAIL_TRIGGERS_SETUP.sql)

**Emails go to spam**
- Verify your domain with Resend
- Add SPF and DKIM records
- Warm up your domain by sending emails gradually

## Email Templates Preview

You can view the HTML email templates in `supabase/functions/send-email-notification/index.ts`.

To customize:
1. Edit the HTML in the `sendEmail()` function
2. Redeploy: `supabase functions deploy send-email-notification`

## Rate Limits

**Resend Free Tier:**
- 100 emails/day (test domain)
- 3,000 emails/month (verified domain)

**To increase limits:**
- Upgrade your Resend plan
- See [Resend Pricing](https://resend.com/pricing)

## Monitoring

View email statistics:

```sql
SELECT 
  email_type,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
  ROUND(SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as success_rate
FROM email_logs
GROUP BY email_type;
```

## Next Steps

After email notifications are working:

→ **Phase 8:** Enhanced Reporting & Admin Dashboard
- Admin moderation tools
- User ban system
- Report management interface
- Auto-hide products after 3 reports

---

**Need help?** Check:
- Supabase Edge Functions docs: https://supabase.com/docs/guides/functions
- Resend documentation: https://resend.com/docs
- pg_net extension docs: https://github.com/supabase/pg_net
