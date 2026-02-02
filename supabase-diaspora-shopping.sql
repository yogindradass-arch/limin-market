-- Diaspora Shopping "Send Home" Feature Migration
-- This adds international shipping capabilities for diaspora buyers

-- Add diaspora shopping columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS send_home_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS send_home_shipping_fee DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS send_home_carrier TEXT,
ADD COLUMN IF NOT EXISTS send_home_delivery_time TEXT,
ADD COLUMN IF NOT EXISTS send_home_destinations TEXT[] DEFAULT '{}';

-- Add comment to describe the feature
COMMENT ON COLUMN products.send_home_available IS 'Whether seller offers international shipping to diaspora';
COMMENT ON COLUMN products.send_home_shipping_fee IS 'International shipping fee in USD';
COMMENT ON COLUMN products.send_home_carrier IS 'Shipping carrier (FedEx, DHL, USPS, UPS, etc.)';
COMMENT ON COLUMN products.send_home_delivery_time IS 'Estimated delivery time (e.g., "5-7 days")';
COMMENT ON COLUMN products.send_home_destinations IS 'Available shipping destinations (USA, Canada, UK, Caribbean)';

-- Create index for filtering products with diaspora shipping
CREATE INDEX IF NOT EXISTS idx_products_send_home_available
ON products(send_home_available)
WHERE send_home_available = true;

-- Note: This feature enables sellers in Guyana to offer international shipping
-- to diaspora buyers in USA, Canada, UK, and Caribbean destinations.
-- Prices for diaspora items can be displayed in USD alongside the GYD price.
