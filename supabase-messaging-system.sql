-- Messaging System Migration
-- This adds direct buyer-seller chat functionality

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
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

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller_id ON conversations(seller_id);
CREATE INDEX IF NOT EXISTS idx_conversations_product_id ON conversations(product_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- Add comments to describe the tables
COMMENT ON TABLE conversations IS 'Tracks conversations between buyers and sellers about specific products';
COMMENT ON TABLE messages IS 'Stores individual messages within conversations';
COMMENT ON COLUMN conversations.buyer_unread_count IS 'Number of unread messages for the buyer';
COMMENT ON COLUMN conversations.seller_unread_count IS 'Number of unread messages for the seller';
COMMENT ON COLUMN messages.is_read IS 'Whether the recipient has read this message';

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
-- Users can view conversations they are part of (as buyer or seller)
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Users can create conversations where they are the buyer
CREATE POLICY "Users can create conversations as buyer"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Users can update conversations they are part of (for marking messages as read)
CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- RLS Policies for messages
-- Users can view messages in conversations they are part of
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
  ));

-- Users can create messages in conversations they are part of
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
  ));

-- Users can update messages they sent (for marking as read)
CREATE POLICY "Users can update messages"
  ON messages FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
  ));

-- Function to update conversation's last_message_at and unread count
CREATE OR REPLACE FUNCTION update_conversation_on_new_message()
RETURNS TRIGGER AS $$
DECLARE
  conv conversations%ROWTYPE;
BEGIN
  -- Get the conversation
  SELECT * INTO conv FROM conversations WHERE id = NEW.conversation_id;

  -- Update last_message_at
  UPDATE conversations
  SET last_message_at = NEW.created_at,
      buyer_unread_count = CASE
        WHEN NEW.sender_id = conv.seller_id THEN buyer_unread_count + 1
        ELSE buyer_unread_count
      END,
      seller_unread_count = CASE
        WHEN NEW.sender_id = conv.buyer_id THEN seller_unread_count + 1
        ELSE seller_unread_count
      END
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation on new message
CREATE TRIGGER update_conversation_trigger
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_on_new_message();

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(conv_id UUID, user_id UUID)
RETURNS void AS $$
BEGIN
  -- Mark all unread messages in the conversation as read
  UPDATE messages
  SET is_read = TRUE
  WHERE conversation_id = conv_id
    AND sender_id != user_id
    AND is_read = FALSE;

  -- Reset unread count for the user
  UPDATE conversations
  SET buyer_unread_count = CASE
        WHEN buyer_id = user_id THEN 0
        ELSE buyer_unread_count
      END,
      seller_unread_count = CASE
        WHEN seller_id = user_id THEN 0
        ELSE seller_unread_count
      END
  WHERE id = conv_id;
END;
$$ LANGUAGE plpgsql;

-- Enable Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
