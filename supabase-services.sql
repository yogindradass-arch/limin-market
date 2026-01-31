-- Add specialized fields for Service listings

-- Service fields
ALTER TABLE products
ADD COLUMN IF NOT EXISTS service_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS service_area VARCHAR(200),
ADD COLUMN IF NOT EXISTS price_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS response_time VARCHAR(50);

-- Create indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_products_service_type ON products(service_type);
CREATE INDEX IF NOT EXISTS idx_products_price_type ON products(price_type);
CREATE INDEX IF NOT EXISTS idx_products_response_time ON products(response_time);

-- Add check constraints
ALTER TABLE products
ADD CONSTRAINT check_hourly_rate_positive CHECK (hourly_rate IS NULL OR hourly_rate >= 0);

-- Comments for documentation
COMMENT ON COLUMN products.service_type IS 'Delivery, Cleaning, Repairs, Construction, etc. (Services)';
COMMENT ON COLUMN products.service_area IS 'Areas served (Services)';
COMMENT ON COLUMN products.price_type IS 'Hourly, Per Job, Per Item, Per Mile (Services)';
COMMENT ON COLUMN products.hourly_rate IS 'Rate charged (Services)';
COMMENT ON COLUMN products.response_time IS 'Same Day, 24 Hours, 48 Hours (Services)';
