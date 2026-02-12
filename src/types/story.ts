export interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption?: string;
  created_at: string;
  expires_at: string;
  views_count: number;
  is_active: boolean;
  // Joined data
  user_name?: string;
  user_avatar?: string;
}

export interface StoryView {
  id: string;
  story_id: string;
  viewer_id: string;
  viewed_at: string;
}

export interface UserStories {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  stories: Story[];
  has_unviewed: boolean;
}
