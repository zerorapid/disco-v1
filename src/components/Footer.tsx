'use client';

const USEFUL_LINKS = [
  ['Blog', 'Privacy', 'Terms', 'FAQs', 'Security', 'Contact'],
  ['Partner', 'Franchise', 'Seller', 'Warehouse', 'Deliver', 'Resources'],
  ['Recipes', 'Bistro', 'District', 'LOUD Ambulance']
];

const CATEGORIES = [
  ['Vegetables & Fruits', 'Cold Drinks & Juices', 'Bakery & Biscuits', 'Dry Fruits, Masala & Oil', 'Paan Corner', 'Pharma & Wellness', 'Personal Care', 'Magazines', 'Electronics & Electricals', 'Toys & Games', 'Rakhi Gifts'],
  ['Dairy & Breakfast', 'Instant & Frozen Food', 'Sweet Tooth', 'Sauces & Spreads', 'Organic & Premium', 'Cleaning Essentials', 'Pet Care', 'Kitchen & Dining', 'Stationery Needs', 'Print Store'],
  ['Munchies', 'Tea, Coffee & Milk Drinks', 'Atta, Rice & Dal', 'Chicken, Meat & Fish', 'Baby Care', 'Home Furnishing & Decor', 'Beauty & Cosmetics', 'Fashion & Accessories', 'Books', 'E-Gift Cards']
];

const SOCIAL_ICONS = [
  { name: 'facebook', icon: 'facebook' },
  { name: 'twitter', icon: 'brand_family' },
  { name: 'instagram', icon: 'photo_camera' },
  { name: 'linkedin', icon: 'work' },
  { name: 'threads', icon: 'alternate_email' }
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border pt-16 pb-12 px-6 lg:px-12">
      <div className="max-width mx-auto">
        {/* MAIN LINKS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* USEFUL LINKS */}
          <div className="lg:col-span-2">
            <h4 className="text-[18px] font-black text-black mb-8">Useful Links</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {USEFUL_LINKS.map((column, idx) => (
                <div key={idx} className="flex flex-col gap-3">
                  {column.map((link) => (
                    <a key={link} href="#" className="text-[15px] text-black/50 hover:text-black transition-colors font-medium">{link}</a>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* CATEGORIES */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-8">
              <h4 className="text-[18px] font-black text-black">Categories</h4>
              <span className="text-[15px] font-bold text-green-700 cursor-pointer hover:underline">see all</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {CATEGORIES.flat().map((link) => (
                <a key={link} href="#" className="text-[15px] text-black/50 hover:text-black transition-colors font-medium">{link}</a>
              ))}
            </div>
          </div>
        </div>

        {/* SOCIAL & APP DOWNLOAD */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pt-12 border-t border-border">
          <div className="text-[14px] text-black/60 font-medium text-center lg:text-left">
            © LOUD Commerce Private Limited, 2024-2026
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex items-center gap-4">
              <span className="text-[14px] font-black text-black/40 uppercase tracking-widest">Download App</span>
              <div className="flex gap-2">
                <div className="w-32 h-10 bg-black rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                  <span className="text-white text-[10px] font-bold">App Store</span>
                </div>
                <div className="w-32 h-10 bg-black rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                  <span className="text-white text-[10px] font-bold">Google Play</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {SOCIAL_ICONS.map((social) => (
                <div key={social.name} className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[18px]">{social.icon}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DISCLAIMER */}
        <div className="mt-12 text-[12px] leading-relaxed text-black/40 font-medium max-w-5xl">
          “LOUD” is owned & managed by “LOUD Commerce Private Limited” and is not related, linked or interconnected in whatsoever manner or nature, to “GROFFR.COM” which is a real estate services business operated by “Redstone Consultancy Services Private Limited”.
        </div>
      </div>
    </footer>
  );
}
