'use client';

const CATEGORIES = [
  { name: "All", icon: "nutrition" },
  { name: "Dairy & Eggs", icon: "egg" },
  { name: "Groceries", icon: "shopping_basket" },
  { name: "Fresh Produce", icon: "eco" },
  { name: "Beverages", icon: "local_cafe" },
  { name: "Snacks", icon: "fastfood" },
  { name: "Meat & Seafood", icon: "restaurant" },
  { name: "Bakery", icon: "bakery_dining" },
  { name: "Household", icon: "home_repair_service" }
];

interface CategoryTabsProps {
  selectedCategory: string;
  onSelect: (name: string) => void;
}

export default function CategoryTabs({ selectedCategory, onSelect }: CategoryTabsProps) {
  return (
    <div className="flex gap-4 lg:gap-8 overflow-x-auto no-scrollbar pb-8 -mx-6 px-6 snap-x snap-mandatory">
      {CATEGORIES.map((cat) => (
        <div 
          key={cat.name} 
          onClick={() => onSelect(cat.name)}
          className="flex-shrink-0 text-center cursor-pointer group snap-center"
        >
          <div className={`mb-3 w-16 h-16 lg:w-20 lg:h-20 mx-auto flex items-center justify-center border-thin transition-all duration-300 active:scale-90 ${
            selectedCategory === cat.name 
              ? 'bg-black text-white border-black shadow-2xl translate-y-[-4px]' 
              : 'bg-white group-hover:bg-uber-gray'
          }`}>
            <span className={`material-symbols-outlined text-[24px] lg:text-[28px] ${selectedCategory === cat.name ? "'FILL': 1" : ""}`} style={{ fontVariationSettings: selectedCategory === cat.name ? "'FILL' 1" : "'FILL' 0" }}>
              {cat.icon}
            </span>
          </div>
          <span className={`text-[14px] lg:text-[15px] font-bold leading-tight transition-colors ${
            selectedCategory === cat.name ? 'text-black' : 'text-black/60 group-hover:text-black'
          }`}>
            {cat.name}
          </span>
        </div>
      ))}
    </div>
  );
}
