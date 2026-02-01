interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSearchClick?: () => void;
  unreadMessagesCount?: number;
  isAdmin?: boolean;
  pendingReportsCount?: number;
}

export default function BottomNav({
  activeTab,
  onTabChange,
  onSearchClick,
  unreadMessagesCount = 0,
  isAdmin = false,
  pendingReportsCount = 0
}: BottomNavProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'search', label: 'Search', icon: SearchIcon },
    // Show Admin tab instead of Local tab for admins
    isAdmin
      ? { id: 'admin', label: 'Admin', icon: AdminIcon, badge: pendingReportsCount }
      : { id: 'local', label: 'Local', icon: LocationIcon },
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
                } else {
                  onTabChange(tab.id);
                }
              }}
              className="flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-200 hover:bg-gray-50 rounded-lg py-1.5 gap-0.5"
            >
              <div className="relative">
                <Icon isActive={isActive} />
                {/* Badge for messages and admin tabs */}
                {'badge' in tab && tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center shadow-sm">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
              {isActive && (
                <span className="text-[11px] font-semibold text-limin-primary">
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

function SearchIcon({ isActive }: { isActive: boolean }) {
  return (
    <svg
      className={`w-6 h-6 ${isActive ? 'text-limin-primary' : 'text-gray-600'}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function LocationIcon({ isActive }: { isActive: boolean }) {
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
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
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

function AdminIcon({ isActive }: { isActive: boolean }) {
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
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}
