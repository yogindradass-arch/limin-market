interface HeaderProps {
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  currency?: 'GYD' | 'USD';
  onCurrencyToggle?: () => void;
}

export default function Header({ onMenuClick, onSearchClick, currency = 'GYD', onCurrencyToggle }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="grid grid-cols-3 items-center h-14 px-4 gap-4">
        {/* Left: Hamburger Menu */}
        <div className="flex items-center justify-start">
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 text-limin-dark hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Center: Logo/Brand */}
        <h1 className="text-xl font-bold text-limin-dark flex items-center justify-center gap-2">
          <span className="text-2xl">🇬🇾</span>
          <span className="whitespace-nowrap">Limin Market</span>
        </h1>

        {/* Right: Currency Toggle & Search */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCurrencyToggle}
            className="px-3 py-1.5 text-sm font-semibold bg-gray-100 hover:bg-gray-200 rounded-full transition-colors flex items-center gap-1"
            aria-label="Toggle currency"
          >
            <span>{currency === 'GYD' ? '🇬🇾' : '🇺🇸'}</span>
            <span>{currency}</span>
          </button>

          <button
            onClick={onSearchClick}
            className="p-2 -mr-2 text-limin-dark hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Search"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
