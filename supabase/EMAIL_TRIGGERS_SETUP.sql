-- Email Notification Triggers for Limin Market
-- These triggers automatically send email notifications for various events

-- Prerequisites:
-- 1. Deploy the send-email-notification Edge Function
-- 2. Enable pg_net extension: CREATE EXTENSION IF NOT EXISTS pg_net;
-- 3. Set service_role_key in app settings

-- =============================================================================
-- 1. NEW MESSAGE NOTIFICATIONS
-- =============================================================================

CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  recipient_id UUID;
  recipient_email TEXT;
  sender_name TEXT;
  product_title TEXT;
  project_url TEXT := 'https://your-project-ref.supabase.co'; -- UPDATE THIS!
BEGIN
  -- Determine recipient (seller if sender is buyer, buyer if sender is seller)
  SELECT 
    CASE 
      WHEN NEW.sender_id = c.buyer_id THEN c.seller_id
      ELSE c.buyer_id
    END,
    c.product_id
  INTO recipient_id, product_title
  FROM conversations c
  WHERE c.id = NEW.conversation_id;

  -- Get recipient email
  SELECT email INTO recipient_email
  FROM auth.users
  WHERE id = recipient_id;

  -- Get sender name (use email username as name)
  SELECT SPLIT_PART(email, '@', 1) INTO sender_name
  FROM auth.users
  WHERE id = NEW.sender_id;

  -- Get product title
  SELECT title INTO product_title
  FROM products p
  JOIN conversations c ON c.product_id = p.id
  WHERE c.id = NEW.conversation_id;

  -- Send notification via Edge Function (async via pg_net)
  PERFORM net.http_post(
    url := project_url || '/functions/v1/send-email-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'to', recipient_email,
      'type', 'new_message',
      'data', jsonb_build_object(
        'productTitle', product_title,
        'productId', (SELECT product_id FROM conversations WHERE id = NEW.conversation_id),
        'senderName', sender_name
      )
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_new_message_notify ON messages;
CREATE TRIGGER on_new_message_notify
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();


-- =============================================================================
-- 2. PRICE DROP NOTIFICATIONS
-- =============================================================================

CREATE OR REPLACE FUNCTION notify_price_drop()
RETURNS TRIGGER AS $$
DECLARE
  fav_record RECORD;
  user_email TEXT;
  project_url TEXT := 'https://your-project-ref.supabase.co'; -- UPDATE THIS!
BEGIN
  -- Only trigger if price decreased
  IF NEW.price >= OLD.price THEN
    RETURN NEW;
  END IF;

  -- Notify all users who favorited this product
  FOR fav_record IN
    SELECT DISTINCT f.user_id, u.email
    FROM favorites f
    JOIN auth.users u ON u.id = f.user_id
    WHERE f.product_id = NEW.id
  LOOP
    -- Send notification via Edge Function (async via pg_net)
    PERFORM net.http_post(
      url := project_url || '/functions/v1/send-email-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'to', fav_record.email,
        'type', 'price_drop',
        'data', jsonb_build_object(
          'productTitle', NEW.title,
          'productId', NEW.id,
          'oldPrice', OLD.price,
          'newPrice', NEW.price
        )
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_price_drop_notify ON products;
CREATE TRIGGER on_price_drop_notify
  AFTER UPDATE OF price ON products
  FOR EACH ROW
  WHEN (NEW.price < OLD.price)
  EXECUTE FUNCTION notify_price_drop();


-- =============================================================================
-- 3. NEW LISTING NOTIFICATIONS (Matching Saved Searches)
-- =============================================================================

CREATE OR REPLACE FUNCTION notify_matching_searches()
RETURNS TRIGGER AS $$
DECLARE
  search_record RECORD;
  user_email TEXT;
  filters JSONB;
  matches BOOLEAN;
  project_url TEXT := 'https://your-project-ref.supabase.co'; -- UPDATE THIS!
BEGIN
  -- Loop through all saved searches
  FOR search_record IN
    SELECT ss.id, ss.user_id, ss.name, ss.filters, u.email
    FROM saved_searches ss
    JOIN auth.users u ON u.id = ss.user_id
  LOOP
    filters := search_record.filters;
    matches := TRUE;

    -- Check category match
    IF filters ? 'categories' AND jsonb_array_length(filters->'categories') > 0 THEN
      IF NOT (filters->'categories' @> to_jsonb(NEW.category::text)) THEN
        matches := FALSE;
      END IF;
    END IF;

    -- Check price range
    IF matches AND filters ? 'priceMin' THEN
      IF NEW.price < (filters->>'priceMin')::numeric THEN
        matches := FALSE;
      END IF;
    END IF;

    IF matches AND filters ? 'priceMax' THEN
      IF NEW.price > (filters->>'priceMax')::numeric THEN
        matches := FALSE;
      END IF;
    END IF;

    -- Check location
    IF matches AND filters ? 'location' AND filters->>'location' IS NOT NULL THEN
      IF NEW.location != filters->>'location' THEN
        matches := FALSE;
      END IF;
    END IF;

    -- Check listing type
    IF matches AND filters ? 'listingType' AND filters->>'listingType' IS NOT NULL THEN
      IF NEW.listing_type != filters->>'listingType' THEN
        matches := FALSE;
      END IF;
    END IF;

    -- Check listing mode
    IF matches AND filters ? 'listingMode' AND filters->>'listingMode' IS NOT NULL THEN
      IF NEW.listing_mode != filters->>'listingMode' THEN
        matches := FALSE;
      END IF;
    END IF;

    -- If all filters match, send notification
    IF matches THEN
      PERFORM net.http_post(
        url := project_url || '/functions/v1/send-email-notification',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
        ),
        body := jsonb_build_object(
          'to', search_record.email,
          'type', 'new_listing',
          'data', jsonb_build_object(
            'productTitle', NEW.title,
            'productId', NEW.id,
            'searchName', search_record.name,
            'category', NEW.category
          )
        )
      );
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_new_listing_notify ON products;
CREATE TRIGGER on_new_listing_notify
  AFTER INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION notify_matching_searches();


-- =============================================================================
-- 4. SETUP INSTRUCTIONS
-- =============================================================================

-- Step 1: Enable pg_net extension (required for async HTTP calls)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Step 2: Set service role key in app settings
-- Run this with your actual service role key:
-- ALTER DATABASE postgres SET app.settings.service_role_key TO 'your-service-role-key';

-- Step 3: Update project_url in all functions above to match your Supabase project

-- Step 4: Grant necessary permissions
GRANT USAGE ON SCHEMA net TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA net TO postgres, anon, authenticated, service_role;


-- =============================================================================
-- 5. TESTING
-- =============================================================================

-- Test new message notification:
-- 1. Create a conversation between two users
-- 2. Insert a message
-- 3. Check email_logs table for sent status

-- Test price drop notification:
-- 1. Create a product and favorite it
-- 2. Update the product price to a lower value
-- 3. Check email_logs table

-- Test new listing notification:
-- 1. Create a saved search with specific filters
-- 2. Insert a product matching those filters
-- 3. Check email_logs table


-- =============================================================================
-- 6. MONITORING
-- =============================================================================

-- View recent email logs
SELECT 
  el.*,
  u.email as recipient_email,
  CASE 
    WHEN el.status = 'sent' THEN '✅'
    WHEN el.status = 'failed' THEN '❌'
    ELSE '⏳'
  END as status_icon
FROM email_logs el
LEFT JOIN auth.users u ON u.id = el.user_id
ORDER BY el.created_at DESC
LIMIT 50;

-- View failed emails
SELECT *
FROM email_logs
WHERE status = 'failed'
ORDER BY created_at DESC;

-- Email statistics
SELECT 
  email_type,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
  ROUND(SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as success_rate
FROM email_logs
GROUP BY email_type;
