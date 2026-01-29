import type { Product } from '../types/product';

interface HotDealsSectionProps {
  deals: Product[];
  onDealClick?: (product: Product) => void;
}

export default function HotDealsSection({ deals, onDealClick }: HotDealsSectionProps) {
  return (
    <section className="bg-gradient-to-r from-limin-primary to-orange-600 py-4">
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-limin-accent mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
            <h2 className="text-white font-bold text-lg">Hot Deals</h2>
          </div>
          <button className="text-white text-sm font-medium">See All →</button>
        </div>

        {/* Horizontal Scrolling Container */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {deals.map((deal) => (
            <div
              key={deal.id}
              onClick={() => onDealClick?.(deal)}
              className="flex-shrink-0 w-40 bg-white rounded-lg overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square overflow-hidden bg-gray-100">
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2">
                <p className="text-limin-primary font-bold text-sm mb-1">
                  {deal.price === 0 ? 'FREE' : `$${deal.price.toFixed(2)}`}
                </p>
                <p className="text-xs text-gray-700 line-clamp-2">{deal.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
