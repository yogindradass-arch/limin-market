interface FABProps {
  onClick?: () => void;
}

export default function FAB({ onClick }: FABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 w-14 h-14 bg-limin-primary hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-colors"
      aria-label="Post new listing"
    >
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M12 4v16m8-8H4"
        />
      </svg>
    </button>
  );
}
