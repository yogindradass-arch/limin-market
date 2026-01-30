-- Add listing expiration and status columns to products table

-- Add status column (active, sold, expired)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired'));

-- Add expires_at column (defaults to 30 days from creation)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days');

-- Create index for efficient querying of expired listings
CREATE INDEX IF NOT EXISTS idx_products_expires_at ON products(expires_at);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Update existing products to have expires_at set to 30 days from their creation date
UPDATE products
SET expires_at = created_at + INTERVAL '30 days'
WHERE expires_at IS NULL;

-- Create a function to automatically mark expired listings
CREATE OR REPLACE FUNCTION mark_expired_listings()
RETURNS void AS $$
BEGIN
  UPDATE products
  SET status = 'expired'
  WHERE expires_at < NOW()
    AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- Note: To automatically run this function, you need to set up a cron job
-- In Supabase, go to Database > Extensions and enable pg_cron, then run:
--
-- SELECT cron.schedule(
--   'mark-expired-listings',
--   '0 0 * * *',  -- Run daily at midnight
--   $$SELECT mark_expired_listings()$$
-- );

-- Add RLS policies for status field
-- Users can only view active and their own sold/expired listings
DROP POLICY IF EXISTS "Users can view active listings" ON products;
CREATE POLICY "Users can view active listings"
ON products FOR SELECT
USING (
  status = 'active'
  OR seller_id = auth.uid()
);

-- Users can only mark their own listings as sold or extend them
DROP POLICY IF EXISTS "Users can update their own listings" ON products;
CREATE POLICY "Users can update their own listings"
ON products FOR UPDATE
USING (seller_id = auth.uid())
WITH CHECK (seller_id = auth.uid());

-- Comment: After 30 days of being expired, you can add another function
-- to hard delete the listing and its images (implement later if needed)
