-- Migration: Add Home-Made Category Fields to Products
-- This migration adds Guyanese home-made product fields to the products table

-- Add home-made columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS home_made_type TEXT,
ADD COLUMN IF NOT EXISTS ingredients TEXT,
ADD COLUMN IF NOT EXISTS shelf_life TEXT,
ADD COLUMN IF NOT EXISTS is_refrigerated BOOLEAN DEFAULT FALSE;

-- Create index for home-made queries
CREATE INDEX IF NOT EXISTS idx_products_home_made_type ON products(home_made_type);

-- Add comments for documentation
COMMENT ON COLUMN products.home_made_type IS 'Type of home-made item (Pepper Sauce, Cassava Bread, etc.)';
COMMENT ON COLUMN products.ingredients IS 'Main ingredients used in the home-made item';
COMMENT ON COLUMN products.shelf_life IS 'How long the home-made item lasts';
COMMENT ON COLUMN products.is_refrigerated IS 'Whether the home-made item requires refrigeration';
