export interface NotificationPreferences {
  user_id: string;
  email_new_messages: boolean;
  email_price_drops: boolean;
  email_new_listings: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailNotification {
  id: string;
  user_id: string;
  email_type: 'new_message' | 'price_drop' | 'new_listing';
  status: 'sent' | 'failed' | 'pending';
  error_message?: string;
  created_at: string;
}

export type NotificationType = 'new_message' | 'price_drop' | 'new_listing';
