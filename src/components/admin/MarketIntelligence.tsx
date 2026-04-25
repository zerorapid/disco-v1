'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { TrendingDown, Zap, ExternalLink, RefreshCw, BarChart3, AlertTriangle } from 'lucide-react';

export default function MarketIntelligence() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarketData();
  }, []);

  async function fetchMarketData() {
    setLoading(true);
    const { data: prices, error } = await supabase
      .from('competitor_prices')
      .select('*')
      .order('last_updated', { ascending: false });

    if (prices) setData(prices);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-black text-white p-8 border-thin shadow-2xl flex justify-between items-center overflow-hidden relative">
        <div className="absolute right-[-20px] top-[-20px] opacity-10">
          <BarChart3 size={200} />
        </div>
        <div className="relative z-10">
          <h2 className="text-heading-2 uppercase tracking-tighter">Market Intelligence</h2>
          <p className="text-caption text-white/40 max-w-md">Real-time competitor tracking from Zepto, Blinkit, and Amazon. Data is synced via the DISCO Spy Extension.</p>
        </div>
        <button 
          onClick={fetchMarketData}
          className="bg-white/10 hover:bg-white text-white hover:text-black p-4 rounded-full transition-all active-scale"
        >
          <RefreshCw className={loading ? 'animate-spin' : ''} size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RECENT SCANS */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-caption font-black uppercase tracking-widest text-black/40">Latest Spy Results</h3>
            <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 uppercase">Live Feed</span>
          </div>
          
          <div className="bg-white border-thin overflow-hidden">
            {data.length > 0 ? (
              <div className="divide-y divide-uber-gray">
                {data.map((item) => (
                  <div key={item.id} className="p-6 flex items-center justify-between hover:bg-uber-gray/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-black text-[10px] uppercase">
                        {item.platform.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-[16px] font-black text-black leading-tight">{item.product_name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black uppercase text-black/40">{item.platform}</span>
                          <span className="text-[10px] font-medium text-black/20">•</span>
                          <span className="text-[10px] font-black uppercase text-black/40">{new Date(item.last_updated).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[20px] font-black text-black">₹{item.price}</div>
                      {item.price < 50 && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-red-600">
                          <TrendingDown size={10} /> Loot Opportunity
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center space-y-4">
                <AlertTriangle size={40} className="mx-auto text-black/10" />
                <p className="text-caption text-black/40">No competitor data found. Use the DISCO Spy Extension to scan products.</p>
              </div>
            )}
          </div>
        </div>

        {/* INSTRUCTIONS / GUIDELINES */}
        <div className="space-y-6">
          <div className="bg-white border-thin p-6 space-y-4">
            <h3 className="text-caption font-black uppercase tracking-widest text-black/40">Spy Instructions</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex-shrink-0 flex items-center justify-center font-black text-sm">1</div>
                <p className="text-[12px] font-bold leading-relaxed">Install the <span className="border-b border-black">DISCO Spy Extension</span> from your source folder.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex-shrink-0 flex items-center justify-center font-black text-sm">2</div>
                <p className="text-[12px] font-bold leading-relaxed">Visit <span className="text-blue-600 font-black">BigBasket</span> or <span className="text-blue-600 font-black">Amazon Fresh</span> and search for your top 200 products.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex-shrink-0 flex items-center justify-center font-black text-sm">3</div>
                <p className="text-[12px] font-bold leading-relaxed">Click the Extension icon on the product page and hit <span className="font-black text-green-600">SCAN & SYNC</span>.</p>
              </div>
            </div>
            <div className="pt-4 border-t border-uber-gray">
              <button className="w-full h-12 bg-uber-gray hover:bg-black hover:text-white transition-all text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                <ExternalLink size={14} /> Download Extension Source
              </button>
            </div>
          </div>

          {/* TARGET 200 STRATEGY */}
          <div className="bg-green-700 text-white p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Zap size={18} fill="currentColor" />
              <h3 className="text-caption uppercase font-black">Target 200 Strategy</h3>
            </div>
            <p className="text-[11px] font-medium leading-relaxed opacity-80">
              By focusing on the top 200 high-demand essentials, we maintain a price leadership perception. If we are ₹1 cheaper on Onions, customers assume everything is cheaper.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
