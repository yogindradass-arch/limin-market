export interface Report {
  id: string;
  product_id: string;
  reporter_id: string | null;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes?: string;
  created_at: string;
  // Joined data
  product?: {
    id: string;
    title: string;
    image: string;
    seller_id: string;
    category?: string;
  };
  reporter?: {
    email: string;
  };
}

export interface UserBan {
  id: string;
  user_id: string;
  banned_by: string | null;
  reason: string;
  banned_until: string | null;
  created_at: string;
  // Joined data
  user?: {
    email: string;
  };
  banned_by_user?: {
    email: string;
  };
}

export type ReportReason =
  | 'spam_misleading'
  | 'prohibited_items'
  | 'harassment'
  | 'duplicate'
  | 'pricing_scam'
  | 'inappropriate_images'
  | 'other';

export const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  {
    value: 'spam_misleading',
    label: 'Spam or Misleading',
    description: 'False advertising, clickbait, or spam content',
  },
  {
    value: 'prohibited_items',
    label: 'Prohibited Items',
    description: 'Weapons, drugs, or other illegal items',
  },
  {
    value: 'harassment',
    label: 'Harassment or Hate Speech',
    description: 'Offensive, discriminatory, or threatening content',
  },
  {
    value: 'duplicate',
    label: 'Duplicate Listing',
    description: 'Same item posted multiple times',
  },
  {
    value: 'pricing_scam',
    label: 'Pricing Scam',
    description: 'Unrealistic pricing or scam attempt',
  },
  {
    value: 'inappropriate_images',
    label: 'Inappropriate Images',
    description: 'Explicit, violent, or inappropriate photos',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Other policy violations',
  },
];

export interface AdminStats {
  pendingReports: number;
  reviewedReports: number;
  dismissedReports: number;
  activeBans: number;
  hiddenProducts: number;
}
