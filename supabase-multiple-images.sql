-- Add support for multiple images per product

-- Add images array column (stores array of image URLs)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Migrate existing image_url data to images array
UPDATE products
SET images = ARRAY[image_url]
WHERE image_url IS NOT NULL AND images = '{}';

-- Keep image_url for backwards compatibility (will be the first/primary image)
-- In the future, you can remove image_url column if desired

-- Create index for efficient image queries
CREATE INDEX IF NOT EXISTS idx_products_images ON products USING GIN(images);

-- Note: The app will now:
-- 1. Store multiple images in the 'images' array column
-- 2. Set 'image_url' to the first image for backwards compatibility
-- 3. Display all images in a carousel in the product detail modal
