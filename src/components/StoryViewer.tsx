import { useState, useEffect, useRef } from 'react';
import type { UserStories } from '../types/story';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface StoryViewerProps {
  userStories: UserStories;
  allUserStories: UserStories[];
  onClose: () => void;
  onNavigateUser: (direction: 'prev' | 'next') => void;
}

export default function StoryViewer({ userStories, allUserStories, onClose, onNavigateUser }: StoryViewerProps) {
  const { user } = useAuth();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const remainingTimeRef = useRef<number>(5000);

  const currentStory = userStories.stories[currentStoryIndex];
  const isLastStory = currentStoryIndex === userStories.stories.length - 1;
  const isFirstStory = currentStoryIndex === 0;
  const currentUserIndex = allUserStories.findIndex(us => us.user_id === userStories.user_id);
  const isLastUser = currentUserIndex === allUserStories.length - 1;
  const isFirstUser = currentUserIndex === 0;

  // Track story view
  useEffect(() => {
    if (currentStory && user) {
      const trackView = async () => {
        try {
          // Insert view record
          await supabase
            .from('story_views')
            .insert({
              story_id: currentStory.id,
              viewer_id: user.id
            });

          // Increment view count
          await supabase.rpc('increment_story_views', {
            story_uuid: currentStory.id
          });
        } catch (error) {
          // Ignore duplicate view errors
          console.log('Story view tracking:', error);
        }
      };

      trackView();
    }
  }, [currentStory?.id, user]);

  // Auto-advance timer
  useEffect(() => {
    if (isPaused) return;

    startTimeRef.current = Date.now();

    const startTimer = () => {
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const newProgress = Math.min((elapsed / remainingTimeRef.current) * 100, 100);
        setProgress(newProgress);

        if (newProgress >= 100) {
          handleNext();
        }
      }, 50);
    };

    startTimer();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentStoryIndex, isPaused, userStories.user_id]);

  const handleNext = () => {
    if (isLastStory) {
      if (!isLastUser) {
        onNavigateUser('next');
      } else {
        onClose();
      }
    } else {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
      remainingTimeRef.current = 5000;
    }
  };

  const handlePrevious = () => {
    if (isFirstStory) {
      if (!isFirstUser) {
        onNavigateUser('prev');
      }
    } else {
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
      remainingTimeRef.current = 5000;
    }
  };

  const handleTap = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const third = rect.width / 3;

    if (x < third) {
      handlePrevious();
    } else if (x > third * 2) {
      handleNext();
    } else {
      // Middle tap - pause/unpause
      setIsPaused(prev => !prev);
    }
  };

  const handlePauseStart = () => {
    setIsPaused(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = remainingTimeRef.current - elapsed;
    }
  };

  const handlePauseEnd = () => {
    setIsPaused(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this story? This cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', currentStory.id)
        .eq('user_id', user?.id); // Extra safety check

      if (error) {
        console.error('Error deleting story:', error);
        alert('Failed to delete story. Please try again.');
        return;
      }

      // Close viewer and let StoriesBar refetch
      onClose();
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Failed to delete story. Please try again.');
    }
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2">
        {userStories.stories.map((story, index) => (
          <div key={story.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all"
              style={{
                width: index < currentStoryIndex ? '100%' : index === currentStoryIndex ? `${progress}%` : '0%'
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 pt-4 px-4 pb-16 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center justify-between text-white mt-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-limin-primary to-limin-secondary rounded-full flex items-center justify-center text-white font-bold">
              {userStories.user_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold">{userStories.user_name}</p>
              <p className="text-xs opacity-75">
                {new Date(currentStory.created_at).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Delete button (only for story owner) */}
            {user?.id === userStories.user_id && (
              <button
                onClick={handleDelete}
                className="p-2 hover:bg-red-500/30 rounded-full transition-colors"
                title="Delete story"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Story content */}
      <div
        className="w-full h-full flex items-center justify-center"
        onClick={handleTap}
        onMouseDown={handlePauseStart}
        onMouseUp={handlePauseEnd}
        onTouchStart={handlePauseStart}
        onTouchEnd={handlePauseEnd}
      >
        {currentStory.media_type === 'image' ? (
          <img
            src={currentStory.media_url}
            alt="Story"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <video
            src={currentStory.media_url}
            className="max-w-full max-h-full object-contain"
            autoPlay
            muted
            playsInline
          />
        )}
      </div>

      {/* Caption */}
      {currentStory.caption && (
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-white text-center">{currentStory.caption}</p>
        </div>
      )}

      {/* View count (only for story owner) */}
      {user?.id === userStories.user_id && (
        <div className="absolute bottom-20 left-4 right-4">
          <div className="bg-black/50 text-white px-3 py-2 rounded-full inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-sm">{currentStory.views_count} views</span>
          </div>
        </div>
      )}
    </div>
  );
}
