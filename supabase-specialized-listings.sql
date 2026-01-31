-- Add specialized fields for Real Estate and Vehicle listings

-- Real Estate fields
ALTER TABLE products
ADD COLUMN IF NOT EXISTS bedrooms INTEGER,
ADD COLUMN IF NOT EXISTS bathrooms NUMERIC(3,1),
ADD COLUMN IF NOT EXISTS square_feet INTEGER,
ADD COLUMN IF NOT EXISTS property_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS listing_purpose VARCHAR(20);

-- Vehicle fields
ALTER TABLE products
ADD COLUMN IF NOT EXISTS vehicle_make VARCHAR(50),
ADD COLUMN IF NOT EXISTS vehicle_model VARCHAR(50),
ADD COLUMN IF NOT EXISTS vehicle_year INTEGER,
ADD COLUMN IF NOT EXISTS mileage INTEGER,
ADD COLUMN IF NOT EXISTS vehicle_condition VARCHAR(20),
ADD COLUMN IF NOT EXISTS transmission VARCHAR(20),
ADD COLUMN IF NOT EXISTS fuel_type VARCHAR(20);

-- Create indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_bedrooms ON products(bedrooms);
CREATE INDEX IF NOT EXISTS idx_products_vehicle_year ON products(vehicle_year);
CREATE INDEX IF NOT EXISTS idx_products_property_type ON products(property_type);

-- Add check constraints
ALTER TABLE products
ADD CONSTRAINT check_bedrooms_positive CHECK (bedrooms IS NULL OR bedrooms >= 0),
ADD CONSTRAINT check_bathrooms_positive CHECK (bathrooms IS NULL OR bathrooms >= 0),
ADD CONSTRAINT check_square_feet_positive CHECK (square_feet IS NULL OR square_feet > 0),
ADD CONSTRAINT check_mileage_positive CHECK (mileage IS NULL OR mileage >= 0),
ADD CONSTRAINT check_vehicle_year_valid CHECK (vehicle_year IS NULL OR (vehicle_year >= 1900 AND vehicle_year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1));

-- Comments for documentation
COMMENT ON COLUMN products.bedrooms IS 'Number of bedrooms (Real Estate)';
COMMENT ON COLUMN products.bathrooms IS 'Number of bathrooms (Real Estate)';
COMMENT ON COLUMN products.square_feet IS 'Property size in square feet (Real Estate)';
COMMENT ON COLUMN products.property_type IS 'Type: House, Apartment, Land, Commercial (Real Estate)';
COMMENT ON COLUMN products.listing_purpose IS 'For Sale or For Rent (Real Estate)';
COMMENT ON COLUMN products.vehicle_make IS 'Vehicle manufacturer (Vehicles)';
COMMENT ON COLUMN products.vehicle_model IS 'Vehicle model name (Vehicles)';
COMMENT ON COLUMN products.vehicle_year IS 'Year of manufacture (Vehicles)';
COMMENT ON COLUMN products.mileage IS 'Odometer reading in miles (Vehicles)';
COMMENT ON COLUMN products.vehicle_condition IS 'New, Used, Excellent, Good, Fair (Vehicles)';
COMMENT ON COLUMN products.transmission IS 'Automatic or Manual (Vehicles)';
COMMENT ON COLUMN products.fuel_type IS 'Gasoline, Diesel, Electric, Hybrid (Vehicles)';
