-- Add specialized fields for Job listings

-- Job fields
ALTER TABLE products
ADD COLUMN IF NOT EXISTS job_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS salary_min INTEGER,
ADD COLUMN IF NOT EXISTS salary_max INTEGER,
ADD COLUMN IF NOT EXISTS company VARCHAR(100),
ADD COLUMN IF NOT EXISTS experience_level VARCHAR(50);

-- Create indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_products_job_type ON products(job_type);
CREATE INDEX IF NOT EXISTS idx_products_salary_range ON products(salary_min, salary_max);
CREATE INDEX IF NOT EXISTS idx_products_experience_level ON products(experience_level);

-- Add check constraints
ALTER TABLE products
ADD CONSTRAINT check_salary_min_positive CHECK (salary_min IS NULL OR salary_min >= 0),
ADD CONSTRAINT check_salary_max_positive CHECK (salary_max IS NULL OR salary_max >= 0),
ADD CONSTRAINT check_salary_range_valid CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_max >= salary_min);

-- Comments for documentation
COMMENT ON COLUMN products.job_type IS 'Full-time, Part-time, Contract, Temporary (Jobs)';
COMMENT ON COLUMN products.salary_min IS 'Minimum annual salary (Jobs)';
COMMENT ON COLUMN products.salary_max IS 'Maximum annual salary (Jobs)';
COMMENT ON COLUMN products.company IS 'Company name (Jobs)';
COMMENT ON COLUMN products.experience_level IS 'Entry Level, Mid Level, Senior Level (Jobs)';
