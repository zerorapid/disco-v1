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

export default function CategoryTabs() {
  return (
    <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6 -mx-6 px-6">
      {CATEGORIES.map((cat) => (
        <div key={cat.name} className="flex-shrink-0 text-center cursor-pointer group">
          <div className="mb-2 w-16 h-16 mx-auto flex items-center justify-center border border-border group-hover:bg-uber-gray transition-colors">
            <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted group-hover:text-black">
            {cat.name}
          </span>
        </div>
      ))}
    </div>
  );
}
