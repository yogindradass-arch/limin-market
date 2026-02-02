-- Migration: Add Delivery Options to Products
-- This migration adds delivery-related fields to the products table

-- Add delivery columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS delivery_available BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS delivery_option TEXT CHECK (delivery_option IN ('pickup', 'delivery', 'both')),
ADD COLUMN IF NOT EXISTS delivery_fee INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_zones JSONB DEFAULT '[]'::jsonb;

-- Create index for delivery queries
CREATE INDEX IF NOT EXISTS idx_products_delivery_available ON products(delivery_available);

-- Add comment for documentation
COMMENT ON COLUMN products.delivery_available IS 'Whether seller offers delivery (true if delivery or both)';
COMMENT ON COLUMN products.delivery_option IS 'Delivery option: pickup, delivery, or both';
COMMENT ON COLUMN products.delivery_fee IS 'Delivery fee in GYD (0 for free delivery)';
COMMENT ON COLUMN products.delivery_zones IS 'Array of delivery zones where delivery is available';
