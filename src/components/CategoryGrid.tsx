interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  gradient: string;
}

interface CategoryGridProps {
  categories: Category[];
  onCategoryClick: (categoryName: string) => void;
}

export default function CategoryGrid({ categories, onCategoryClick }: CategoryGridProps) {
  return (
    <div className="px-4 py-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-limin-dark">Browse by Category</h2>
        <p className="text-sm text-gray-600">Find exactly what you're looking for</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryClick(category.name)}
            className="group relative overflow-hidden rounded-2xl aspect-square shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            {/* Gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-90 group-hover:opacity-100 transition-opacity`}></div>

            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-3 text-white">
              <div className="text-4xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
                {category.icon}
              </div>
              <div className="text-xs font-bold text-center leading-tight mb-1">
                {category.name}
              </div>
              <div className="text-[10px] opacity-90 bg-white/20 px-2 py-0.5 rounded-full">
                {category.count}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
