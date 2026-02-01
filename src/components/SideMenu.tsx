interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onAboutClick?: () => void;
  onSettingsClick?: () => void;
  onFavoritesClick?: () => void;
  onMyListingsClick?: () => void;
  onDealsClick?: () => void;
  onFreeItemsClick?: () => void;
}

export default function SideMenu({ isOpen, onClose, onAboutClick, onSettingsClick, onFavoritesClick, onMyListingsClick, onDealsClick, onFreeItemsClick }: SideMenuProps) {
  if (!isOpen) return null;

  const menuSections = [
    {
      title: 'Browse',
      items: [
        { icon: '🔥', label: 'Deals & Featured', action: () => onDealsClick?.() },
        { icon: '🎁', label: 'Free Items', action: () => onFreeItemsClick?.() },
      ]
    },
    {
      title: 'My Account',
      items: [
        { icon: '📱', label: 'My Listings', action: () => onMyListingsClick?.() },
        { icon: '❤️', label: 'Favorites', action: () => onFavoritesClick?.() },
      ]
    },
    {
      title: 'App',
      items: [
        { icon: '⚙️', label: 'Settings', action: () => onSettingsClick?.() },
        { icon: 'ℹ️', label: 'About', action: () => onAboutClick?.() },
        { icon: '📞', label: 'Contact Us', action: () => console.log('Contact') },
      ]
    }
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Side Menu */}
      <div className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-limin-primary to-orange-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold mb-1">Limin Market</h2>
          <p className="text-sm opacity-90">Where Guyana Limes & Trades</p>
        </div>

        {/* Menu Items */}
        <div className="overflow-y-auto" style={{ height: 'calc(100vh - 140px)' }}>
          <nav className="p-4">
            {menuSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className={sectionIndex > 0 ? 'mt-6' : ''}>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item, itemIndex) => (
                    <button
                      key={itemIndex}
                      onClick={() => {
                        item.action();
                        onClose();
                      }}
                      className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left group"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                      <span className="text-gray-800 font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer Info */}
          <div className="p-6 mt-4 border-t">
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Limin Market</strong></p>
              <p>Version 1.0.0</p>
              <p className="text-xs">Made with ❤️ for Guyana 🇬🇾</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
