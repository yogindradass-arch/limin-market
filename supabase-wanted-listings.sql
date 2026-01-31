-- Add listing_mode field to support "Wanted" listings
-- This allows users to post what they're seeking, not just what they're offering

-- Add listing_mode column
ALTER TABLE products
ADD COLUMN IF NOT EXISTS listing_mode VARCHAR(20) DEFAULT 'offering';

-- Create index for efficient filtering
CREATE INDEX IF NOT EXISTS idx_products_listing_mode ON products(listing_mode);

-- Add check constraint
ALTER TABLE products
ADD CONSTRAINT check_listing_mode_valid CHECK (listing_mode IN ('offering', 'seeking'));

-- Comment for documentation
COMMENT ON COLUMN products.listing_mode IS 'Whether the listing is offering something for sale (offering) or looking to buy/hire (seeking)';
