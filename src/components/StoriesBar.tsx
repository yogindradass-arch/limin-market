import { useState, useEffect } from 'react';
import type { UserStories } from '../types/story';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import StoryViewer from './StoryViewer';

interface StoriesBarProps {
  onCreateStory?: () => void;
}

export default function StoriesBar({ onCreateStory }: StoriesBarProps) {
  const { user } = useAuth();
  const [userStories, setUserStories] = useState<UserStories[]>([]);
  const [selectedUserStories, setSelectedUserStories] = useState<UserStories | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      console.log('📖 Fetching stories...');

      // Fetch active stories
      const { data: stories, error } = await supabase
        .from('stories')
        .select('*')
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching stories:', error);
        throw error;
      }

      console.log('✅ Stories fetched:', stories?.length || 0);

      if (stories && stories.length > 0) {
        // Get unique user IDs
        const userIds = [...new Set(stories.map(s => s.user_id))];

        // Fetch profiles for these users
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        // Group stories by user
        const grouped = stories.reduce((acc: UserStories[], story) => {
          const profile = profileMap.get(story.user_id);
          const userName = profile?.full_name || story.user_id.substring(0, 8);
          const existingUser = acc.find(u => u.user_id === story.user_id);

          if (existingUser) {
            existingUser.stories.push(story);
          } else {
            acc.push({
              user_id: story.user_id,
              user_name: userName,
              user_avatar: profile?.avatar_url,
              stories: [story],
              has_unviewed: true // TODO: Check against story_views
            });
          }

          return acc;
        }, []);

        setUserStories(grouped);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setLoading(false);
    }
  };

  const handleNavigateUser = (direction: 'prev' | 'next') => {
    if (!selectedUserStories) return;

    const currentIndex = userStories.findIndex(us => us.user_id === selectedUserStories.user_id);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex >= 0 && nextIndex < userStories.length) {
      setSelectedUserStories(userStories[nextIndex]);
    } else {
      setSelectedUserStories(null);
    }
  };

  // Always show the bar if user is logged in (so they can create stories)
  console.log('👤 StoriesBar render - user:', !!user, 'loading:', loading, 'stories:', userStories.length);

  if (loading) {
    console.log('⏳ Still loading stories...');
    return null;
  }

  if (!user && userStories.length === 0) {
    console.log('🚫 No user and no stories, hiding bar');
    return null;
  }

  console.log('✨ Rendering StoriesBar!');
  return (
    <>
      <div className="bg-white border-b border-gray-200 px-4 py-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-4">
          {/* Add Story button (for current user) */}
          {user && onCreateStory && (
            <button
              onClick={onCreateStory}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative">
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                  <svg className="w-6 h-6 text-limin-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
              <span className="text-xs font-medium text-gray-700 max-w-[64px] truncate">Your Story</span>
            </button>
          )}

          {/* Story rings */}
          {userStories.map((us) => (
            <button
              key={us.user_id}
              onClick={() => setSelectedUserStories(us)}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <div className={`w-16 h-16 rounded-full p-0.5 ${
                us.has_unviewed
                  ? 'bg-gradient-to-br from-limin-primary via-limin-accent to-limin-secondary'
                  : 'bg-gray-300'
              }`}>
                <div className="w-full h-full rounded-full bg-white p-0.5">
                  <div className="w-full h-full bg-gradient-to-br from-limin-primary/20 to-limin-secondary/20 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {us.user_avatar ? (
                      <img src={us.user_avatar} alt={us.user_name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-limin-primary">{us.user_name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-xs font-medium text-gray-700 max-w-[64px] truncate">{us.user_name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Story Viewer */}
      {selectedUserStories && (
        <StoryViewer
          userStories={selectedUserStories}
          allUserStories={userStories}
          onClose={() => {
            setSelectedUserStories(null);
            fetchStories(); // Refresh stories after closing viewer
          }}
          onNavigateUser={handleNavigateUser}
        />
      )}
    </>
  );
}
