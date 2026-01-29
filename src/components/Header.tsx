interface HeaderProps {
  onMenuClick?: () => void;
  onSearchClick?: () => void;
}

export default function Header({ onMenuClick, onSearchClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Hamburger Menu */}
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

        {/* Logo/Brand */}
        <h1 className="text-xl font-bold text-limin-dark flex items-center gap-2">
          <span className="text-2xl">🇬🇾</span>
          Limin Market
        </h1>

        {/* Search Icon */}
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
    </header>
  );
}
