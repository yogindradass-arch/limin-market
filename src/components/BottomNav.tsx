interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSearchClick?: () => void;
  onPostClick?: () => void;
  onFeedClick?: () => void;
  unreadMessagesCount?: number;
}

export default function BottomNav({
  activeTab,
  onTabChange,
  onSearchClick,
  onPostClick,
  onFeedClick,
  unreadMessagesCount = 0,
}: BottomNavProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'feed', label: 'Feed', icon: FeedIcon },
    { id: 'post', label: 'Post', icon: CameraIcon }, // New camera/post button
    { id: 'messages', label: 'Messages', icon: MessagesIcon, badge: unreadMessagesCount },
    { id: 'account', label: 'Account', icon: AccountIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-14 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'search') {
                  onSearchClick?.();
                } else if (tab.id === 'post') {
                  onPostClick?.();
                } else if (tab.id === 'feed') {
                  onFeedClick?.();
                } else {
                  onTabChange(tab.id);
                }
              }}
              className="flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-200 hover:bg-gray-50 rounded-lg py-1.5 gap-1"
            >
              <div className="relative flex items-center justify-center h-6">
                <Icon isActive={isActive} />
                {/* Simple dot indicator for notifications */}
                {'badge' in tab && tab.badge && tab.badge > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              {isActive && (
                <span className="text-[11px] font-semibold text-limin-primary leading-none">
                  {tab.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg
      className={`w-6 h-6 ${isActive ? 'text-limin-primary' : 'text-gray-600'}`}
      fill={isActive ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

function MessagesIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg
      className={`w-6 h-6 ${isActive ? 'text-limin-primary' : 'text-gray-600'}`}
      fill={isActive ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function AccountIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg
      className={`w-6 h-6 ${isActive ? 'text-limin-primary' : 'text-gray-600'}`}
      fill={isActive ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function CameraIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg
      className={`w-6 h-6 ${isActive ? 'text-limin-primary' : 'text-gray-600'}`}
      fill={isActive ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function FeedIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg
      className={`w-6 h-6 ${isActive ? 'text-limin-primary' : 'text-gray-600'}`}
      fill={isActive ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
      />
    </svg>
  );
}
