import { CATEGORIES, CATEGORY_LABELS, CategoryType } from '@/constants/categories';

interface CategoryTabsProps {
  cityName: string;
  activeCategory?: CategoryType | 'all';
  onCategoryChange: (category: CategoryType | 'all') => void;
}

export default function CategoryTabs({ 
  cityName, 
  activeCategory = 'all',
  onCategoryChange 
}: CategoryTabsProps) {

  const handleTabClick = (category: CategoryType | 'all') => {
    onCategoryChange(category);
  };

  const isActive = (category: CategoryType | 'all') => activeCategory === category;

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex overflow-x-auto no-scrollbar py-3 gap-2 sm:gap-3">
          
          {/* All tab */}
          <button
            onClick={() => handleTabClick('all')}
            className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm md:text-base font-medium whitespace-nowrap transition-all duration-200 transform active:scale-95 ${
              isActive('all')
                ? 'bg-[#1E88E5] text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>

          {/* Category tabs */}
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleTabClick(category)}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm md:text-base font-medium whitespace-nowrap transition-all duration-200 transform active:scale-95 ${
                isActive(category)
                  ? 'bg-[#1E88E5] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {CATEGORY_LABELS[category]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
