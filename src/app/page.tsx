'use client';

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import CategoryTabs from "@/components/CategoryTabs";
import ProductCard from "@/components/ProductCard";
import { useUI } from "@/context/UIContext";
import { ShieldCheck, Zap, Sparkles } from "lucide-react";

import { supabase } from "@/lib/supabase";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { searchQuery, setSearchQuery } = useUI();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('id', { ascending: true });

        if (error) throw error;
        if (data) setProducts(data);
      } catch (err) {
        console.error("Supabase Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-width pt-[124px] md:pt-24">
        {/* ELITE HERO - Tactic 47, 49 */}
        <section className="mb-16">
          <div className="relative bg-black text-white p-10 lg:p-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 grayscale mix-blend-overlay">
              <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover" />
            </div>
            <div className="relative z-10 max-w-xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-[28px]">shopping_bag</span>
                <span className="text-[10px] font-black tracking-normal">Cart</span>
              </div>
              <h2 className="text-[48px] lg:text-[72px] font-black leading-[0.9] tracking-tighter uppercase mb-8">
                Rapid<br/>Cart<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20">System</span>
              </h2>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 border border-white/5">
                  <Zap size={14} className="text-yellow-400" />
                  <span className="text-[11px] font-black uppercase tracking-widest">10 Mins</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 border border-white/5">
                  <ShieldCheck size={14} className="text-green-400" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Secured</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH INTEL / FALLBACKS - Tactic 37, 19 */}

        {/* CATEGORIES - Tactic 49 */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <h4 className="text-[11px] font-black text-muted uppercase tracking-[0.25em] whitespace-nowrap">
              Sectors <span className="text-black ml-2">• {selectedCategory}</span>
            </h4>
            <div className="flex-1 h-[1px] bg-black/5"></div>
          </div>
          <CategoryTabs selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
        </section>

        {/* INVENTORY GRID - Tactic 8, 43, 50, 104 */}
        <section className="mb-32">
          <div className="flex items-center gap-4 mb-8">
            <h4 className="text-[11px] font-black text-muted uppercase tracking-[0.25em] whitespace-nowrap">
              {searchQuery ? `Searching: ${searchQuery}` : 'Inventory Pulse'}
            </h4>
            <div className="flex-1 h-[1px] bg-black/5"></div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white h-[400px] animate-pulse p-8 flex flex-col justify-end gap-4 border border-border">
                  <div className="w-full h-40 bg-uber-gray mb-auto"></div>
                  <div className="w-3/4 h-4 bg-uber-gray"></div>
                  <div className="w-1/2 h-3 bg-uber-gray"></div>
                  <div className="w-full h-12 bg-uber-gray"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center border-thin bg-uber-gray/30 animate-in fade-in duration-700">
              <div className="w-24 h-24 bg-white flex items-center justify-center mx-auto mb-8 shadow-sm">
                <Sparkles size={40} className="text-black/10" />
              </div>
              <h3 className="text-[14px] font-black uppercase tracking-[0.4em] opacity-30 mb-4">No Sector Match</h3>
              <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-12">Expand your search intelligence parameters.</p>
              
              <div className="flex flex-col gap-3 max-w-[280px] mx-auto">
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                  className="w-full h-[60px] bg-black text-white text-[11px] font-black uppercase tracking-[0.3em] active:scale-95 transition-all"
                >
                  Reset Terminal
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      <div className="h-32"></div>
      <BottomNav />
    </div>
  );
}
