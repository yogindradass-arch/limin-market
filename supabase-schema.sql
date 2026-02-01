-- Limin Market Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  seller_phone TEXT NOT NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_type TEXT CHECK (listing_type IN ('standard', 'wholesale', 'local')) DEFAULT 'standard',
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites Table (for logged-in users)
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- User Profiles Table (extended user info)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  location TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_location ON products(location);
CREATE INDEX idx_products_listing_type ON products(listing_type);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_product_id ON favorites(product_id);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Products
-- Anyone can view active products
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (is_active = true);

-- Only authenticated users can insert products
CREATE POLICY "Users can insert their own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- Users can update their own products
CREATE POLICY "Users can update their own products"
  ON products FOR UPDATE
  USING (auth.uid() = seller_id);

-- Users can delete their own products
CREATE POLICY "Users can delete their own products"
  ON products FOR DELETE
  USING (auth.uid() = seller_id);

-- RLS Policies for Favorites
-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add favorites
CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own favorites
CREATE POLICY "Users can remove their own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for Profiles
-- Profiles are viewable by everyone
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to increment product views
CREATE OR REPLACE FUNCTION increment_product_views(product_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET views = COALESCE(views, 0) + 1
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PHASE 1: NEW TABLES FOR ENHANCED FEATURES
-- ============================================

-- 1. Conversations Table (for messaging)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  buyer_unread_count INTEGER DEFAULT 0,
  seller_unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, buyer_id, seller_id)
);

-- 2. Messages Table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Reviews Table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(reviewer_id, seller_id)
);

-- 4. Seller Ratings Materialized View
CREATE MATERIALIZED VIEW seller_ratings AS
SELECT
  seller_id,
  COUNT(*) as review_count,
  AVG(rating)::DECIMAL(3,2) as average_rating,
  COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star_count,
  COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star_count,
  COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star_count,
  COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star_count,
  COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star_count
FROM reviews
GROUP BY seller_id;

-- Create unique index on materialized view for refresh
CREATE UNIQUE INDEX idx_seller_ratings_seller_id ON seller_ratings(seller_id);

-- 5. Saved Searches Table
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  filters JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Analytics Events Table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'favorite', 'contact', 'share')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Notification Preferences Table
CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_new_messages BOOLEAN DEFAULT TRUE,
  email_price_drops BOOLEAN DEFAULT TRUE,
  email_new_listings BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Email Logs Table
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email_type TEXT NOT NULL,
  status TEXT CHECK (status IN ('sent', 'failed', 'pending')) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. User Bans Table
CREATE TABLE user_bans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  banned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  banned_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 10. Update Profiles Table - Add admin role
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user';

-- 11. Update Products Table - Add new columns
ALTER TABLE products
ADD COLUMN IF NOT EXISTS images JSONB,
ADD COLUMN IF NOT EXISTS image_variants JSONB,
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'sold', 'expired', 'hidden')) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS listing_mode TEXT CHECK (listing_mode IN ('offering', 'seeking')) DEFAULT 'offering';

-- Update existing products to have status='active' if not set
UPDATE products SET status = 'active' WHERE status IS NULL;

-- 12. Create Reports Table if not exists (or update existing)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'reviewed', 'dismissed')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Conversations indexes
CREATE INDEX idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX idx_conversations_seller_id ON conversations(seller_id);
CREATE INDEX idx_conversations_product_id ON conversations(product_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);

-- Messages indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_is_read ON messages(is_read);

-- Reviews indexes
CREATE INDEX idx_reviews_seller_id ON reviews(seller_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Saved searches indexes
CREATE INDEX idx_saved_searches_user_id ON saved_searches(user_id);

-- Analytics events indexes
CREATE INDEX idx_analytics_events_product_id ON analytics_events(product_id);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- Reports indexes
CREATE INDEX idx_reports_product_id ON reports(product_id);
CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- Products status index
CREATE INDEX idx_products_status ON products(status);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Conversations: Users can see their own conversations
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can insert conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Messages: Users can view messages in their conversations
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
  ));

CREATE POLICY "Users can insert messages"
  ON messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
    AND auth.uid() = messages.sender_id
  ));

CREATE POLICY "Users can update their messages"
  ON messages FOR UPDATE
  USING (sender_id = auth.uid());

-- Reviews: Everyone can read, authenticated users can write
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = reviewer_id);

-- Saved Searches: Users can only see their own
CREATE POLICY "Users can view their saved searches"
  ON saved_searches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their saved searches"
  ON saved_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their saved searches"
  ON saved_searches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their saved searches"
  ON saved_searches FOR DELETE
  USING (auth.uid() = user_id);

-- Analytics: Sellers can view their own product analytics
CREATE POLICY "Users can view analytics for their products"
  ON analytics_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM products
    WHERE products.id = analytics_events.product_id
    AND products.seller_id = auth.uid()
  ));

CREATE POLICY "Anyone can insert analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

-- Notification Preferences: Users can only see/modify their own
CREATE POLICY "Users can view their notification preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their notification preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Email Logs: Users can only see their own, admins can see all
CREATE POLICY "Users can view their email logs"
  ON email_logs FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "System can insert email logs"
  ON email_logs FOR INSERT
  WITH CHECK (true);

-- User Bans: Only admins can manage
CREATE POLICY "Admins can view all bans"
  ON user_bans FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admins can insert bans"
  ON user_bans FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admins can update bans"
  ON user_bans FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admins can delete bans"
  ON user_bans FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Reports: Users can report, admins can manage
CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT
  USING (
    auth.uid() = reporter_id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') OR
    EXISTS (SELECT 1 FROM products WHERE products.id = reports.product_id AND products.seller_id = auth.uid())
  );

CREATE POLICY "Authenticated users can insert reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ============================================
-- DATABASE FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to refresh seller ratings materialized view
CREATE OR REPLACE FUNCTION refresh_seller_ratings()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY seller_ratings;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to refresh on review changes
DROP TRIGGER IF EXISTS refresh_seller_ratings_trigger ON reviews;
CREATE TRIGGER refresh_seller_ratings_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH STATEMENT EXECUTE FUNCTION refresh_seller_ratings();

-- Function to auto-hide products after 3 reports
CREATE OR REPLACE FUNCTION check_report_threshold()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM reports WHERE product_id = NEW.product_id AND status = 'pending') >= 3 THEN
    UPDATE products SET status = 'hidden' WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-hide after 3 reports
DROP TRIGGER IF EXISTS auto_hide_reported_products ON reports;
CREATE TRIGGER auto_hide_reported_products
AFTER INSERT ON reports
FOR EACH ROW EXECUTE FUNCTION check_report_threshold();

-- Trigger for notification_preferences updated_at
CREATE TRIGGER update_notification_preferences_updated_at
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for reviews updated_at
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update conversation timestamp on new message
DROP TRIGGER IF EXISTS update_conversation_on_message ON messages;
CREATE TRIGGER update_conversation_on_message
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();

-- Function to increment unread count
CREATE OR REPLACE FUNCTION increment_unread_count()
RETURNS TRIGGER AS $$
DECLARE
  conv RECORD;
BEGIN
  SELECT buyer_id, seller_id INTO conv FROM conversations WHERE id = NEW.conversation_id;

  IF NEW.sender_id = conv.buyer_id THEN
    UPDATE conversations SET seller_unread_count = seller_unread_count + 1 WHERE id = NEW.conversation_id;
  ELSE
    UPDATE conversations SET buyer_unread_count = buyer_unread_count + 1 WHERE id = NEW.conversation_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to increment unread count on new message
DROP TRIGGER IF EXISTS increment_unread_on_message ON messages;
CREATE TRIGGER increment_unread_on_message
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION increment_unread_count();

-- Insert sample data (optional - for testing)
INSERT INTO products (title, description, price, category, location, seller_name, seller_phone, listing_type, image_url, seller_id)
VALUES
  ('Smart TV 55"', 'Brand new 55" 4K Smart TV with HDR support. Perfect for streaming and gaming. Includes warranty and free delivery within Georgetown.', 450.00, 'Electronics', 'Georgetown', 'TechHub', '592-225-1234', 'wholesale', 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500', NULL),
  ('iPhone 14 Pro', 'Excellent condition iPhone 14 Pro, 256GB storage. Deep Purple color. Unlocked and works with all carriers. Comes with original box and charger.', 899.00, 'Electronics', 'New Amsterdam', 'Mobile Store', '592-623-4567', 'standard', 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=500', NULL),
  ('Office Chair', 'Office chair with wheels. Some wear on armrests but still comfortable and fully functional. Great for home office setup.', 0, 'Furniture', 'Georgetown', 'Office', '592-602-9012', 'standard', 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500', NULL)
ON CONFLICT DO NOTHING;
