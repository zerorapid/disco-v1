'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { Zap, Timer, ChevronRight } from 'lucide-react';

export default function DealsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeals() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('discount_price', 1)
        .eq('is_active', true);
      
      if (data) setProducts(data);
      setLoading(false);
    }
    fetchDeals();
  }, []);

  return (
    <main className="min-h-screen bg-uber-gray/30 pb-32">
      <Header />
      
      {/* HERO SECTION */}
      <div className="pt-24 bg-black text-white px-6 py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/20 blur-[100px] rounded-full -mr-32 -mt-32 animate-pulse" />
        
        <div className="max-width relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-green-500 text-black text-[10px] font-black px-2 py-1 uppercase tracking-tighter">Live Now</div>
            <div className="flex items-center gap-1 text-[12px] font-bold text-white/60">
              <Timer size={14} />
              <span>Resetting in 04:22:10</span>
            </div>
          </div>
          
          <h1 className="text-heading-1 mb-2">₹1 Loot Deals</h1>
          <p className="text-body-primary opacity-60 max-w-md">
            LOUD Flash Sale is active! Grab elite items for just ₹1. Limited stock per user.
          </p>
        </div>
      </div>

      <div className="max-width -mt-8 relative z-20">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="aspect-[3/4] bg-white animate-pulse border-thin" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white border-thin p-20 text-center space-y-4 shadow-xl">
            <Zap size={48} className="mx-auto text-black/10" />
            <h2 className="text-heading-3">All ₹1 Deals Sniped!</h2>
            <p className="text-body-secondary">New flash deals drop at the top of every hour. Stay loud.</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-8 h-12 bg-black text-white text-caption active-scale"
            >
              Back to Store
            </button>
          </div>
        )}
      </div>

      {/* RULES SECTION */}
      <div className="max-width mt-12">
        <div className="bg-white border-thin p-8">
          <h3 className="text-caption mb-6">Loot Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="text-[20px] font-black opacity-10">01</div>
              <p className="text-body-primary text-sm font-bold">Max 1 item per ₹1 deal category per user.</p>
            </div>
            <div className="space-y-2">
              <div className="text-[20px] font-black opacity-10">02</div>
              <p className="text-body-primary text-sm font-bold">Available only for verified LOUD members.</p>
            </div>
            <div className="space-y-2">
              <div className="text-[20px] font-black opacity-10">03</div>
              <p className="text-body-primary text-sm font-bold">Offer valid until stocks last. First come, first served.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
