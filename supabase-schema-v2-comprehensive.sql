-- ============================================
-- LIMIN MARKET V2 - COMPREHENSIVE FEATURE SET
-- Database Schema for All New Features
-- Run this after the base schema (supabase-schema.sql)
-- ============================================

-- ============================================
-- 1. VERIFICATION & TRUST SYSTEM
-- ============================================

-- User Verification Table
CREATE TABLE IF NOT EXISTS user_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phone_verified BOOLEAN DEFAULT FALSE,
  phone_verified_at TIMESTAMP WITH TIME ZONE,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP WITH TIME ZONE,
  id_verified BOOLEAN DEFAULT FALSE,
  id_verified_at TIMESTAMP WITH TIME ZONE,
  id_document_url TEXT, -- Stored securely, only accessible by admins
  social_connected JSONB DEFAULT '{}', -- {facebook: true, instagram: true, linkedin: false}
  verification_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business Accounts Table
CREATE TABLE IF NOT EXISTS business_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  business_type TEXT, -- retail, wholesale, service, etc.
  business_phone TEXT,
  business_email TEXT,
  business_address TEXT,
  business_registration_number TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_document_url TEXT,
  website_url TEXT,
  instagram_handle TEXT,
  facebook_page TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. USER PROFILES & STORIES
-- ============================================

-- Extended Profiles with Stories
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS origin_location TEXT, -- "Georgetown, Guyana"
ADD COLUMN IF NOT EXISTS current_city TEXT, -- "Queens, NY"
ADD COLUMN IF NOT EXISTS joined_year INTEGER,
ADD COLUMN IF NOT EXISTS story TEXT, -- "From Georgetown, moved to Queens in 2019..."
ADD COLUMN IF NOT EXISTS interests TEXT[], -- array of interests
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['English'], -- English, Creole, etc.
ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
ADD COLUMN IF NOT EXISTS facebook_profile TEXT,
ADD COLUMN IF NOT EXISTS linkedin_profile TEXT,
ADD COLUMN IF NOT EXISTS response_rate DECIMAL(5,2) DEFAULT 0, -- percentage
ADD COLUMN IF NOT EXISTS avg_response_time INTEGER, -- minutes
ADD COLUMN IF NOT EXISTS total_sales INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS member_level TEXT DEFAULT 'bronze' CHECK (member_level IN ('bronze', 'silver', 'gold', 'platinum')),
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS premium_until TIMESTAMP WITH TIME ZONE;

-- User Badges Table (achievements, status)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_type TEXT NOT NULL, -- verified, top_seller, fast_shipper, helpful, trusted, etc.
  badge_name TEXT NOT NULL,
  badge_icon TEXT, -- emoji or icon name
  badge_description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_type)
);

-- Following/Followers System
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- ============================================
-- 3. SHIPPING & LOGISTICS
-- ============================================

-- Shipping Options Table
CREATE TABLE IF NOT EXISTS shipping_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  can_ship_to_guyana BOOLEAN DEFAULT FALSE,
  can_ship_local BOOLEAN DEFAULT TRUE,
  can_ship_international BOOLEAN DEFAULT FALSE,
  shipping_cost DECIMAL(10, 2),
  estimated_days INTEGER,
  shipping_method TEXT, -- pickup, meetup, cargo, courier
  cargo_company TEXT, -- EZShip, Guyana Cargo Express, etc.
  package_weight_kg DECIMAL(10, 2),
  package_dimensions TEXT, -- "24x18x12 inches"
  shipping_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cargo Companies Directory (for reference)
CREATE TABLE IF NOT EXISTS cargo_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT,
  locations TEXT[], -- cities they operate in
  services TEXT[], -- barrel, courier, air freight, etc.
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert popular cargo companies
INSERT INTO cargo_companies (name, phone, email, website, locations, services) VALUES
('EZShip Guyana', '592-225-xxxx', 'info@ezshipguyana.com', 'https://ezshipguyana.com', ARRAY['Georgetown', 'Queens', 'Brooklyn'], ARRAY['barrel', 'air freight']),
('Guyana Cargo Express', '592-226-xxxx', 'info@guyanacargo.com', 'https://guyanacargo.com', ARRAY['Georgetown', 'Miami', 'Toronto'], ARRAY['barrel', 'courier']),
('Caribbean Freight', '718-555-xxxx', 'info@caribbeanfreight.com', 'https://caribbeanfreight.com', ARRAY['Queens', 'Brooklyn', 'Georgetown'], ARRAY['barrel', 'container'])
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. PAYMENTS & TRANSACTIONS
-- ============================================

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'GYD' CHECK (currency IN ('GYD', 'USD')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'stripe', 'escrow', 'payment_plan')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'disputed')),
  stripe_payment_intent_id TEXT,
  escrow_released BOOLEAN DEFAULT FALSE,
  escrow_release_date TIMESTAMP WITH TIME ZONE,
  transaction_fee DECIMAL(10, 2), -- 3% fee
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Plans Table (split payments)
CREATE TABLE IF NOT EXISTS payment_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  number_of_installments INTEGER NOT NULL CHECK (number_of_installments >= 2),
  installment_amount DECIMAL(10, 2) NOT NULL,
  installments_paid INTEGER DEFAULT 0,
  next_payment_due TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. CULTURAL CALENDAR & EVENTS
-- ============================================

-- Cultural Events Table
CREATE TABLE IF NOT EXISTS cultural_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN ('holiday', 'festival', 'community', 'marketplace')),
  event_date DATE NOT NULL,
  location TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT, -- annual, monthly, etc.
  related_products_category TEXT, -- suggest gift items for this event
  image_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert major cultural events
INSERT INTO cultural_events (title, description, event_type, event_date, is_recurring, recurrence_pattern, related_products_category) VALUES
('Mashramani (Republic Day)', 'Guyana''s Republic Day celebration with parades and festivities', 'holiday', '2026-02-23', TRUE, 'annual', 'Clothing'),
('Phagwah (Holi)', 'Hindu festival of colors celebrated with powder and water', 'holiday', '2026-03-14', TRUE, 'annual', 'Party Supplies'),
('Diwali', 'Festival of lights celebrated by Hindu and Sikh communities', 'holiday', '2026-10-21', TRUE, 'annual', 'Home Decor'),
('Emancipation Day', 'Celebration of the emancipation of enslaved Africans', 'holiday', '2026-08-01', TRUE, 'annual', 'Clothing'),
('Caribana (Toronto)', 'Caribbean carnival festival in Toronto', 'festival', '2026-08-01', TRUE, 'annual', 'Clothing'),
('West Indian American Day Carnival', 'Brooklyn''s Labor Day parade and carnival', 'festival', '2026-09-07', TRUE, 'annual', 'Clothing')
ON CONFLICT DO NOTHING;

-- Community Events/Meetups Table
CREATE TABLE IF NOT EXISTS community_meetups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  tags TEXT[], -- ["guyanese", "networking", "food", etc.]
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event Attendees
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES community_meetups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'going' CHECK (status IN ('going', 'interested', 'not_going')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- ============================================
-- 6. SAFETY & MEETING FEATURES
-- ============================================

-- Safe Meeting Locations
CREATE TABLE IF NOT EXISTS safe_meeting_spots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('police_station', 'bank', 'mall', 'public_space', 'community_center')),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  hours TEXT, -- "24/7" or "Mon-Fri 9am-5pm"
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert safe spots for major cities
INSERT INTO safe_meeting_spots (name, type, address, city, latitude, longitude, hours) VALUES
-- Georgetown
('Georgetown Police Station', 'police_station', 'Brickdam, Georgetown', 'Georgetown', 6.8013, -58.1551, '24/7'),
('Banks DIH Limited', 'bank', 'Church Street, Georgetown', 'Georgetown', 6.8015, -58.1600, 'Mon-Fri 8am-3pm'),
('Giftland Mall', 'mall', 'Turkeyen, East Coast Demerara', 'Georgetown', 6.8100, -58.0850, '9am-9pm daily'),

-- Queens, NY
('NYPD 103rd Precinct', 'police_station', '168-02 91st Ave, Queens, NY', 'Queens', 40.7070, -73.7948, '24/7'),
('Jamaica Center Mall', 'mall', '161-10 Jamaica Ave, Queens, NY', 'Queens', 40.7020, -73.8051, '10am-8pm daily'),
('Queens Public Library', 'public_space', '89-11 Merrick Blvd, Queens, NY', 'Queens', 40.6950, -73.7900, '10am-6pm'),

-- Brooklyn, NY
('NYPD 67th Precinct', 'police_station', '2820 Snyder Ave, Brooklyn, NY', 'Brooklyn', 40.6450, -73.9200, '24/7'),
('Kings Plaza Shopping Center', 'mall', '5100 Kings Plaza, Brooklyn, NY', 'Brooklyn', 40.6090, -73.9210, '10am-9pm daily'),

-- Miami, FL
('Miami Police Department', 'police_station', '400 NW 2nd Ave, Miami, FL', 'Miami', 25.7779, -80.1979, '24/7'),
('Dadeland Mall', 'mall', '7535 N Kendall Dr, Miami, FL', 'Miami', 25.6890, -80.3140, '10am-9pm daily')
ON CONFLICT DO NOTHING;

-- Transaction Safety Reports (rate the meetup)
CREATE TABLE IF NOT EXISTS transaction_safety_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  other_party_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  safety_rating INTEGER CHECK (safety_rating >= 1 AND rating <= 5), -- How safe did they feel?
  meeting_location TEXT,
  was_safe BOOLEAN,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. ENHANCED PRODUCT FEATURES
-- ============================================

-- Update products table with more fields
ALTER TABLE products
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS video_thumbnail TEXT,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS boost_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_boosted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_gift_registry_item BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS condition TEXT CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'for_parts')),
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS model TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Price History (for price drop alerts)
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  old_price DECIMAL(10, 2) NOT NULL,
  new_price DECIMAL(10, 2) NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wish Lists
CREATE TABLE IF NOT EXISTS wish_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT DEFAULT 'My Wish List',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wish List Items
CREATE TABLE IF NOT EXISTS wish_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wish_list_id UUID REFERENCES wish_lists(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  notes TEXT,
  priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(wish_list_id, product_id)
);

-- Gift Registry
CREATE TABLE IF NOT EXISTS gift_registries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL, -- "Baby Shower", "Wedding", "Birthday"
  event_type TEXT CHECK (event_type IN ('wedding', 'baby_shower', 'birthday', 'housewarming', 'other')),
  event_date DATE,
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  share_code TEXT UNIQUE, -- unique code for easy sharing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift Registry Items
CREATE TABLE IF NOT EXISTS gift_registry_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registry_id UUID REFERENCES gift_registries(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity_wanted INTEGER DEFAULT 1,
  quantity_purchased INTEGER DEFAULT 0,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  notes TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(registry_id, product_id)
);

-- ============================================
-- 8. SEARCH & DISCOVERY
-- ============================================

-- Search History (for personalization)
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  search_query TEXT NOT NULL,
  filters JSONB,
  results_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recently Viewed Products
CREATE TABLE IF NOT EXISTS recently_viewed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Product Recommendations (AI/ML generated)
CREATE TABLE IF NOT EXISTS product_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  recommendation_type TEXT CHECK (recommendation_type IN ('based_on_views', 'similar_users', 'trending', 'price_match')),
  score DECIMAL(5, 4), -- relevance score 0-1
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id, recommendation_type)
);

-- ============================================
-- 9. REVENUE FEATURES
-- ============================================

-- Featured Listings (paid promotion)
CREATE TABLE IF NOT EXISTS featured_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  duration_days INTEGER NOT NULL,
  amount_paid DECIMAL(10, 2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Premium Subscriptions
CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type TEXT CHECK (plan_type IN ('monthly', 'yearly')) NOT NULL,
  amount_paid DECIMAL(10, 2) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  auto_renew BOOLEAN DEFAULT TRUE,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  benefits JSONB, -- {unlimited_listings: true, priority_support: true, analytics: true}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 10. OFFLINE MODE & PERFORMANCE
-- ============================================

-- Cached Content for Offline (stores essential data)
CREATE TABLE IF NOT EXISTS offline_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cache_type TEXT CHECK (cache_type IN ('product_list', 'product_detail', 'user_profile', 'favorites')),
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(user_id, cache_type)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Verification indexes
CREATE INDEX idx_user_verifications_user_id ON user_verifications(user_id);
CREATE INDEX idx_business_accounts_user_id ON business_accounts(user_id);

-- User badges indexes
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_type ON user_badges(badge_type);

-- Following indexes
CREATE INDEX idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following_id ON user_follows(following_id);

-- Shipping indexes
CREATE INDEX idx_shipping_options_product_id ON shipping_options(product_id);
CREATE INDEX idx_shipping_options_can_ship_to_guyana ON shipping_options(can_ship_to_guyana);

-- Transaction indexes
CREATE INDEX idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX idx_transactions_product_id ON transactions(product_id);
CREATE INDEX idx_transactions_payment_status ON transactions(payment_status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Event indexes
CREATE INDEX idx_cultural_events_event_date ON cultural_events(event_date);
CREATE INDEX idx_cultural_events_event_type ON cultural_events(event_type);
CREATE INDEX idx_community_meetups_city ON community_meetups(city);
CREATE INDEX idx_community_meetups_event_date ON community_meetups(event_date);

-- Safety indexes
CREATE INDEX idx_safe_meeting_spots_city ON safe_meeting_spots(city);
CREATE INDEX idx_transaction_safety_reports_reporter_id ON transaction_safety_reports(reporter_id);

-- Product feature indexes
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_condition ON products(condition);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_price_history_product_id ON price_history(product_id);
CREATE INDEX idx_price_history_changed_at ON price_history(changed_at DESC);

-- Wish list indexes
CREATE INDEX idx_wish_lists_user_id ON wish_lists(user_id);
CREATE INDEX idx_wish_list_items_wish_list_id ON wish_list_items(wish_list_id);
CREATE INDEX idx_wish_list_items_product_id ON wish_list_items(product_id);

-- Gift registry indexes
CREATE INDEX idx_gift_registries_user_id ON gift_registries(user_id);
CREATE INDEX idx_gift_registries_share_code ON gift_registries(share_code);
CREATE INDEX idx_gift_registry_items_registry_id ON gift_registry_items(registry_id);

-- Search indexes
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_recently_viewed_user_id ON recently_viewed(user_id);
CREATE INDEX idx_recently_viewed_viewed_at ON recently_viewed(viewed_at DESC);

-- Revenue indexes
CREATE INDEX idx_featured_listings_product_id ON featured_listings(product_id);
CREATE INDEX idx_featured_listings_expires_at ON featured_listings(expires_at);
CREATE INDEX idx_premium_subscriptions_user_id ON premium_subscriptions(user_id);
CREATE INDEX idx_premium_subscriptions_status ON premium_subscriptions(status);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE user_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargo_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE cultural_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_meetups ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE safe_meeting_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_safety_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE wish_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wish_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_registries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_registry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_cache ENABLE ROW LEVEL SECURITY;

-- Verification policies (users can view/edit their own, admins can see all)
CREATE POLICY "Users can view their own verification" ON user_verifications FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Users can update their verification" ON user_verifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Business account policies
CREATE POLICY "Business accounts viewable by everyone" ON business_accounts FOR SELECT USING (true);
CREATE POLICY "Users can manage their business account" ON business_accounts FOR ALL
  USING (auth.uid() = user_id);

-- User badges viewable by everyone
CREATE POLICY "Badges viewable by everyone" ON user_badges FOR SELECT USING (true);

-- Following policies
CREATE POLICY "Users can view all follows" ON user_follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others" ON user_follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON user_follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Shipping options
CREATE POLICY "Shipping options viewable by everyone" ON shipping_options FOR SELECT USING (true);
CREATE POLICY "Sellers can manage shipping for their products" ON shipping_options FOR ALL
  USING (EXISTS (SELECT 1 FROM products WHERE products.id = shipping_options.product_id AND products.seller_id = auth.uid()));

-- Cargo companies viewable by everyone
CREATE POLICY "Cargo companies viewable by everyone" ON cargo_companies FOR SELECT USING (true);

-- Transactions (buyer and seller can see their own)
CREATE POLICY "Users can view their transactions" ON transactions FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR
         EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Cultural events viewable by everyone
CREATE POLICY "Cultural events viewable by everyone" ON cultural_events FOR SELECT USING (true);

-- Community meetups
CREATE POLICY "Public meetups viewable by everyone" ON community_meetups FOR SELECT
  USING (is_public = true OR auth.uid() = organizer_id);
CREATE POLICY "Users can create meetups" ON community_meetups FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);

-- Safe meeting spots viewable by everyone
CREATE POLICY "Safe spots viewable by everyone" ON safe_meeting_spots FOR SELECT USING (true);

-- Wish lists
CREATE POLICY "Users can view their wish lists" ON wish_lists FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can manage their wish lists" ON wish_lists FOR ALL
  USING (auth.uid() = user_id);

-- Gift registries
CREATE POLICY "Public registries viewable by everyone" ON gift_registries FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can manage their registries" ON gift_registries FOR ALL
  USING (auth.uid() = user_id);

-- Search history (private)
CREATE POLICY "Users can view their search history" ON search_history FOR ALL
  USING (auth.uid() = user_id);

-- Recently viewed (private)
CREATE POLICY "Users can view their history" ON recently_viewed FOR ALL
  USING (auth.uid() = user_id);

-- Featured listings viewable by everyone
CREATE POLICY "Featured listings viewable by everyone" ON featured_listings FOR SELECT USING (true);

-- Premium subscriptions (users see their own, admins see all)
CREATE POLICY "Users can view their subscription" ON premium_subscriptions FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ============================================
-- DATABASE FUNCTIONS
-- ============================================

-- Function to track price changes
CREATE OR REPLACE FUNCTION track_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.price != NEW.price THEN
    INSERT INTO price_history (product_id, old_price, new_price)
    VALUES (NEW.id, OLD.price, NEW.price);

    -- TODO: Trigger price drop notifications to users who favorited this item
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for price tracking
DROP TRIGGER IF EXISTS track_product_price_changes ON products;
CREATE TRIGGER track_product_price_changes
AFTER UPDATE ON products
FOR EACH ROW
WHEN (OLD.price IS DISTINCT FROM NEW.price)
EXECUTE FUNCTION track_price_change();

-- Function to update response time and rate
CREATE OR REPLACE FUNCTION update_seller_response_stats()
RETURNS TRIGGER AS $$
DECLARE
  seller_id_var UUID;
  avg_time_minutes INTEGER;
  response_rate_var DECIMAL;
BEGIN
  -- Get the seller from the conversation
  SELECT seller_id INTO seller_id_var
  FROM conversations
  WHERE id = NEW.conversation_id;

  -- Calculate average response time (simplified)
  -- TODO: Implement proper calculation based on message timestamps

  -- Update seller profile
  -- UPDATE profiles SET avg_response_time = avg_time_minutes WHERE id = seller_id_var;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment total sales when transaction completes
CREATE OR REPLACE FUNCTION increment_total_sales()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'completed' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'completed') THEN
    UPDATE profiles
    SET total_sales = COALESCE(total_sales, 0) + 1
    WHERE id = NEW.seller_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS increment_seller_sales ON transactions;
CREATE TRIGGER increment_seller_sales
AFTER INSERT OR UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION increment_total_sales();

-- Function to generate unique share code for gift registries
CREATE OR REPLACE FUNCTION generate_share_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.share_code IS NULL THEN
    NEW.share_code := substring(md5(random()::text || NEW.id::text) from 1 for 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_gift_registry_share_code ON gift_registries;
CREATE TRIGGER set_gift_registry_share_code
BEFORE INSERT ON gift_registries
FOR EACH ROW
EXECUTE FUNCTION generate_share_code();

-- ============================================
-- UTILITY VIEWS
-- ============================================

-- View: Top Sellers (leaderboard)
CREATE OR REPLACE VIEW top_sellers AS
SELECT
  p.id,
  p.full_name,
  p.avatar_url,
  p.location,
  p.total_sales,
  p.member_level,
  COALESCE(sr.average_rating, 0) as avg_rating,
  COALESCE(sr.review_count, 0) as review_count,
  COUNT(DISTINCT prod.id) as active_listings
FROM profiles p
LEFT JOIN seller_ratings sr ON sr.seller_id = p.id
LEFT JOIN products prod ON prod.seller_id = p.id AND prod.status = 'active'
WHERE p.total_sales > 0
GROUP BY p.id, p.full_name, p.avatar_url, p.location, p.total_sales, p.member_level, sr.average_rating, sr.review_count
ORDER BY p.total_sales DESC, sr.average_rating DESC
LIMIT 100;

-- View: Trending Products (most viewed in last 7 days)
CREATE OR REPLACE VIEW trending_products AS
SELECT
  p.*,
  COUNT(ae.id) as recent_views
FROM products p
LEFT JOIN analytics_events ae ON ae.product_id = p.id
  AND ae.event_type = 'view'
  AND ae.created_at > NOW() - INTERVAL '7 days'
WHERE p.status = 'active'
GROUP BY p.id
HAVING COUNT(ae.id) > 0
ORDER BY recent_views DESC
LIMIT 50;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
-- Schema v2 comprehensive migration complete!
-- This adds all new features for the enhanced Limin Market platform.
