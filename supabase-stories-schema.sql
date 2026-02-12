-- Seller Stories Feature Schema
-- Instagram-style 24-hour stories for sellers

-- Stories table
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('image', 'video')) DEFAULT 'image',
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  views_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- Story views tracking table
CREATE TABLE IF NOT EXISTS story_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, viewer_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_stories_active ON stories(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_story_views_viewer_id ON story_views(viewer_id);

-- RLS Policies

-- Stories: Everyone can view active, non-expired stories
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stories are viewable by everyone"
  ON stories FOR SELECT
  USING (is_active = true AND expires_at > NOW());

-- Only authenticated users can create stories
CREATE POLICY "Authenticated users can create stories"
  ON stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own stories
CREATE POLICY "Users can update their own stories"
  ON stories FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own stories
CREATE POLICY "Users can delete their own stories"
  ON stories FOR DELETE
  USING (auth.uid() = user_id);

-- Story Views: Users can view all story views
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Story views are viewable by story owner"
  ON story_views FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM stories
    WHERE stories.id = story_views.story_id
    AND stories.user_id = auth.uid()
  ));

-- Authenticated users can create story views
CREATE POLICY "Authenticated users can create story views"
  ON story_views FOR INSERT
  WITH CHECK (auth.uid() = viewer_id);

-- Function to increment story views
CREATE OR REPLACE FUNCTION increment_story_views(story_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE stories
  SET views_count = views_count + 1
  WHERE id = story_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-expire old stories (call this periodically via cron or edge function)
CREATE OR REPLACE FUNCTION expire_old_stories()
RETURNS void AS $$
BEGIN
  UPDATE stories
  SET is_active = false
  WHERE expires_at <= NOW() AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Materialized view for active stories grouped by user
CREATE MATERIALIZED VIEW IF NOT EXISTS active_stories_by_user AS
SELECT
  user_id,
  COUNT(*) as story_count,
  MAX(created_at) as latest_story_at,
  BOOL_OR(is_active) as has_active_stories
FROM stories
WHERE is_active = true AND expires_at > NOW()
GROUP BY user_id;

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_active_stories()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW active_stories_by_user;
END;
$$ LANGUAGE plpgsql;

-- Trigger to refresh materialized view after story changes
CREATE OR REPLACE FUNCTION refresh_active_stories_trigger()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM refresh_active_stories();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stories_refresh_trigger
AFTER INSERT OR UPDATE OR DELETE ON stories
FOR EACH STATEMENT EXECUTE FUNCTION refresh_active_stories_trigger();
