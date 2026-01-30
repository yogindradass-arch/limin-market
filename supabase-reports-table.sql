-- Create reports table for content moderation
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reports_product_id ON reports(product_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- Enable Row Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can create a report
CREATE POLICY "Anyone can create reports"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Users can view their own reports
CREATE POLICY "Users can view their own reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

-- Note: You'll need to create admin policies separately if you want admins to view all reports
-- For now, you can view all reports directly in the Supabase dashboard

COMMENT ON TABLE reports IS 'User reports for inappropriate listings or content';
COMMENT ON COLUMN reports.status IS 'Report status: pending, reviewed, resolved, or dismissed';
