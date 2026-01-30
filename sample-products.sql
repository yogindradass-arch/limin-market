-- Sample Products for Limin Market
-- Run this in Supabase SQL Editor to populate your marketplace with realistic Guyana listings

INSERT INTO products (
  title,
  description,
  price,
  category,
  location,
  seller_name,
  seller_phone,
  listing_type,
  image_url,
  is_active
) VALUES
-- Electronics
('iPhone 13 Pro - Like New', 'Barely used iPhone 13 Pro, 256GB, Pacific Blue. Includes charger and case. No scratches, excellent condition.', 180000, 'Electronics', 'Georgetown', 'Tech Seller', '592-623-4567', 'standard', 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=500', true),

('Samsung 55" Smart TV', 'Brand new Samsung 55" 4K Smart TV, still in box. Crystal clear display, perfect for streaming.', 120000, 'Electronics', 'New Amsterdam', 'Electronics Pro', '592-333-7890', 'hot_deal', 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500', true),

('Gaming Laptop - RTX 3060', 'High performance gaming laptop. Intel i7, 16GB RAM, RTX 3060. Runs all games smoothly!', 250000, 'Electronics', 'Georgetown', 'Gamer Guy', '592-222-5555', 'standard', 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500', true),

('Sony Wireless Headphones', 'Noise-cancelling Sony WH-1000XM4 headphones. Amazing sound quality, barely used.', 35000, 'Electronics', 'Linden', 'Music Lover', '592-444-6789', 'standard', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500', true),

-- Furniture
('Modern Sofa Set', '3-seater sofa in excellent condition. Grey fabric, very comfortable. Must sell, moving abroad.', 65000, 'Furniture', 'Georgetown', 'Home Seller', '592-111-2222', 'hot_deal', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500', true),

('Dining Table with 6 Chairs', 'Solid wood dining table with 6 matching chairs. Perfect for family meals. Like new condition.', 80000, 'Furniture', 'New Amsterdam', 'Furniture Guy', '592-555-8888', 'standard', 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500', true),

('King Size Bed Frame', 'Beautiful wooden king size bed frame. Sturdy construction, no damage. Mattress not included.', 45000, 'Furniture', 'Georgetown', 'Sleep Well', '592-777-4444', 'standard', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500', true),

-- Vehicles
('Toyota Rav4 2018', 'Well maintained Toyota Rav4, 60,000 km. Full service history, AC working perfectly. Clean interior.', 3500000, 'Vehicles', 'Georgetown', 'Auto Trader', '592-666-9999', 'standard', 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500', true),

('Honda CRF 250 Motorcycle', 'Reliable Honda motorcycle, great for city riding. Recently serviced, new tires.', 450000, 'Vehicles', 'Linden', 'Bike Seller', '592-333-1111', 'hot_deal', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500', true),

-- Home & Garden
('Lawn Mower - Electric', 'Electric lawn mower, eco-friendly and quiet. Perfect for medium-sized yards.', 25000, 'Home & Garden', 'New Amsterdam', 'Garden Pro', '592-888-3333', 'standard', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', true),

('Outdoor Patio Set', 'Complete patio furniture set with table and 4 chairs. Weather-resistant, great for outdoor dining.', 55000, 'Home & Garden', 'Georgetown', 'Outdoor Living', '592-222-7777', 'standard', 'https://images.unsplash.com/photo-1600335895229-6e75511892c8?w=500', true),

-- Fashion
('Designer Handbag - Authentic', 'Genuine leather designer handbag, barely used. Comes with dust bag and authenticity card.', 45000, 'Fashion', 'Georgetown', 'Fashion Queen', '592-444-8888', 'standard', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500', true),

('Men''s Dress Shoes - Size 10', 'Black leather dress shoes, size 10. Perfect for weddings and formal events. Worn twice.', 15000, 'Fashion', 'New Amsterdam', 'Style Seller', '592-555-2222', 'standard', 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=500', true),

-- Sports & Outdoors
('Mountain Bike - 21 Speed', 'Excellent mountain bike with 21 gears. Perfect for trails and city riding. Well maintained.', 65000, 'Sports & Outdoors', 'Linden', 'Cyclist', '592-777-9999', 'standard', 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=500', true),

('Camping Tent - 4 Person', 'Spacious 4-person tent, used only twice. Perfect for outdoor adventures and camping trips.', 18000, 'Sports & Outdoors', 'Georgetown', 'Adventure Guy', '592-333-5555', 'standard', 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=500', true),

-- Dollar Items (Cheap deals)
('Kitchen Blender', 'Working blender, a bit old but still functional. Great for smoothies and soups.', 5000, 'Home & Garden', 'Georgetown', 'Quick Seller', '592-111-4444', 'dollar', 'https://images.unsplash.com/photo-1585515320310-259814833379?w=500', true),

('Office Chair', 'Basic office chair with wheels. Some wear but still comfortable for home office.', 8000, 'Furniture', 'New Amsterdam', 'Office Clear', '592-666-3333', 'dollar', 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500', true),

('Portable Speaker', 'Small Bluetooth speaker, good battery life. Perfect for picnics and small gatherings.', 6000, 'Electronics', 'Linden', 'Music Man', '592-888-7777', 'dollar', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500', true),

-- Free Items
('Plant Pots - Set of 5', 'Various sized plant pots, some plastic, some ceramic. Free to good home!', 0, 'Home & Garden', 'Georgetown', 'Plant Lady', '592-222-9999', 'free', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500', true),

('Kids Books Collection', 'Collection of children''s books, ages 5-10. Some wear but still readable. Free for families!', 0, 'Other', 'New Amsterdam', 'Book Lover', '592-555-6666', 'free', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500', true);
