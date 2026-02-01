import type { Product } from './product';

export interface Conversation {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
  buyer_unread_count: number;
  seller_unread_count: number;
  created_at: string;
  // Joined data
  product?: Product;
  other_user_name?: string;
  other_user_id?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_new_messages: boolean;
  email_price_drops: boolean;
  email_new_listings: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  user_id: string | null;
  email_type: string;
  status: 'sent' | 'failed' | 'pending';
  error_message: string | null;
  created_at: string;
}
