'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import CategoryTabs from '@/components/CategoryTabs';
import ProductCard from '@/components/ProductCard';
import BottomNav from '@/components/BottomNav';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('stock', { ascending: false });
      
      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <div className="pt-24 pb-32 max-width">
        {/* HERO BANNER */}
        <div className="relative w-full aspect-[16/9] lg:aspect-[21/9] bg-black overflow-hidden mb-12">
          <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2000&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-60"
            alt="Premium Groceries"
          />
          <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
            <h1 className="text-white !text-3xl lg:!text-5xl mb-4 leading-tight uppercase font-black">
              FLAT 50% OFF<br/>EVERYTHING
            </h1>
            <button className="bg-white text-black px-10 py-4 font-black uppercase text-[12px] w-fit">
              Shop Now
            </button>
          </div>
        </div>

        {/* CATEGORIES */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <h4 className="text-[13px] font-medium text-muted uppercase tracking-widest">Categories</h4>
            <div className="flex-1 h-[1px] bg-border"></div>
          </div>
          <CategoryTabs />
        </section>

        {/* INVENTORY */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <h4 className="text-[13px] font-medium text-muted uppercase tracking-widest">
              Inventory <span className="text-black ml-2">• All Stock</span>
            </h4>
            <div className="flex-1 h-[1px] bg-border"></div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-[1px] bg-border border border-border">
            {loading ? (
              <div className="col-span-full py-20 text-center opacity-30 uppercase font-black tracking-widest">
                Loading Warehouse...
              </div>
            ) : products.length > 0 ? (
              products.map((p) => <ProductCard key={p.id} product={p} />)
            ) : (
              <div className="col-span-full py-20 text-center opacity-30 uppercase font-black tracking-widest">
                No Products Found
              </div>
            )}
          </div>
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
