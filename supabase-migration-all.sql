-- Combined migration for all specialized listing categories
-- This adds support for Real Estate, Vehicles, Jobs, and Services

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

-- Job fields
ALTER TABLE products
ADD COLUMN IF NOT EXISTS job_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS salary_min INTEGER,
ADD COLUMN IF NOT EXISTS salary_max INTEGER,
ADD COLUMN IF NOT EXISTS company VARCHAR(100),
ADD COLUMN IF NOT EXISTS experience_level VARCHAR(50);

-- Service fields
ALTER TABLE products
ADD COLUMN IF NOT EXISTS service_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS service_area VARCHAR(200),
ADD COLUMN IF NOT EXISTS price_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS response_time VARCHAR(50);

-- Create indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_bedrooms ON products(bedrooms);
CREATE INDEX IF NOT EXISTS idx_products_vehicle_year ON products(vehicle_year);
CREATE INDEX IF NOT EXISTS idx_products_property_type ON products(property_type);
CREATE INDEX IF NOT EXISTS idx_products_job_type ON products(job_type);
CREATE INDEX IF NOT EXISTS idx_products_salary_range ON products(salary_min, salary_max);
CREATE INDEX IF NOT EXISTS idx_products_experience_level ON products(experience_level);
CREATE INDEX IF NOT EXISTS idx_products_service_type ON products(service_type);
CREATE INDEX IF NOT EXISTS idx_products_price_type ON products(price_type);
CREATE INDEX IF NOT EXISTS idx_products_response_time ON products(response_time);

-- Add check constraints
ALTER TABLE products
ADD CONSTRAINT check_bedrooms_positive CHECK (bedrooms IS NULL OR bedrooms >= 0),
ADD CONSTRAINT check_bathrooms_positive CHECK (bathrooms IS NULL OR bathrooms >= 0),
ADD CONSTRAINT check_square_feet_positive CHECK (square_feet IS NULL OR square_feet > 0),
ADD CONSTRAINT check_mileage_positive CHECK (mileage IS NULL OR mileage >= 0),
ADD CONSTRAINT check_vehicle_year_valid CHECK (vehicle_year IS NULL OR (vehicle_year >= 1900 AND vehicle_year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1)),
ADD CONSTRAINT check_salary_min_positive CHECK (salary_min IS NULL OR salary_min >= 0),
ADD CONSTRAINT check_salary_max_positive CHECK (salary_max IS NULL OR salary_max >= 0),
ADD CONSTRAINT check_salary_range_valid CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_max >= salary_min),
ADD CONSTRAINT check_hourly_rate_positive CHECK (hourly_rate IS NULL OR hourly_rate >= 0);

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
COMMENT ON COLUMN products.job_type IS 'Full-time, Part-time, Contract, Temporary (Jobs)';
COMMENT ON COLUMN products.salary_min IS 'Minimum annual salary (Jobs)';
COMMENT ON COLUMN products.salary_max IS 'Maximum annual salary (Jobs)';
COMMENT ON COLUMN products.company IS 'Company name (Jobs)';
COMMENT ON COLUMN products.experience_level IS 'Entry Level, Mid Level, Senior Level (Jobs)';
COMMENT ON COLUMN products.service_type IS 'Delivery, Cleaning, Repairs, Construction, etc. (Services)';
COMMENT ON COLUMN products.service_area IS 'Areas served (Services)';
COMMENT ON COLUMN products.price_type IS 'Hourly, Per Job, Per Item, Per Mile (Services)';
COMMENT ON COLUMN products.hourly_rate IS 'Rate charged (Services)';
COMMENT ON COLUMN products.response_time IS 'Same Day, 24 Hours, 48 Hours (Services)';
