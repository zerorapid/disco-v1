'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import InventoryManager from '@/components/admin/InventoryManager';
import OrderPulse from '@/components/admin/OrderPulse';
import CustomerList from '@/components/admin/CustomerList';
import AnalyticsView from '@/components/admin/AnalyticsView';
import NotificationManager from '@/components/admin/NotificationManager';
import MarketIntelligence from '@/components/admin/MarketIntelligence';
import { Lock, ShieldCheck } from 'lucide-react';

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState({ revenue: 0, orders: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'customers' | 'analytics' | 'alerts' | 'spy'>('orders');

  useEffect(() => {
    // Check if previously authorized in this session
    const auth = sessionStorage.getItem('disco_admin_auth');
    if (auth === 'true') {
      setIsAuthorized(true);
      fetchData();
    }
  }, []);

  async function fetchData() {
    const [prodRes, orderRes] = await Promise.all([
      supabase.from('products').select('*').order('name'),
      supabase.from('orders').select('total_amount').gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString())
    ]);

    if (prodRes.data) setProducts(prodRes.data);
    
    if (orderRes.data) {
      const revenue = orderRes.data.reduce((acc, curr) => acc + curr.total_amount, 0);
      setStats({ revenue, orders: orderRes.data.length });
    }
    
    setLoading(false);
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Default credentials as requested
      setIsAuthorized(true);
      sessionStorage.setItem('disco_admin_auth', 'true');
      fetchData();
    } else {
      setError('Invalid Command Center Credentials');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (!isAuthorized) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck size={40} className="text-green-500" />
            </div>
            <h1 className="text-heading-2 text-white uppercase tracking-tighter">DISCO Command Center</h1>
            <p className="text-caption text-white/40 uppercase tracking-widest">Authorized Personnel Only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Access Key"
                className="w-full h-16 bg-white/5 border border-white/10 px-12 text-white font-black placeholder:text-white/10 focus:border-green-500 transition-all outline-none"
              />
            </div>
            {error && <p className="text-red-500 text-[10px] font-black uppercase text-center animate-bounce">{error}</p>}
            <button 
              type="submit"
              className="w-full h-16 bg-white text-black text-caption font-black uppercase tracking-widest hover:bg-green-500 transition-all active-scale"
            >
              Initiate Session
            </button>
          </form>

          <div className="pt-8 text-center">
            <a href="/" className="text-[10px] font-black text-white/20 uppercase hover:text-white transition-colors">Return to Storefront</a>
          </div>
        </div>
      </main>
    );
  }

  return (
  return (
    <main className="min-h-screen bg-uber-gray/30 flex flex-col md:flex-row overflow-hidden">
      {/* VERTICAL SIDEBAR - ERP MODE */}
      <div className="w-full md:w-80 bg-white border-r border-black/10 flex flex-col sticky top-0 h-auto md:h-screen z-30 shadow-2xl">
        <div className="p-8 border-b border-black/5">
          <div className="w-12 h-12 bg-black text-white rounded-none flex items-center justify-center font-black text-2xl mb-4">D</div>
          <h1 className="text-[14px] font-semibold uppercase tracking-[0.2em] leading-tight text-black/40">DISCO<br/>COMMAND</h1>
        </div>

        {/* INTEGRATED VERTICAL KPIs - INTER MEDIUM CLARITY */}
        <div className="p-6 space-y-4 border-b border-black/10 bg-uber-gray/10">
          <div className="bg-white p-6 border-l-4 border-green-600 shadow-md">
            <p className="text-[13px] font-medium uppercase tracking-widest text-black mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Today's Revenue</p>
            <h2 className="text-[32px] font-semibold tracking-tighter text-black" style={{ fontFamily: "'Inter', sans-serif" }}>₹{stats.revenue.toLocaleString()}</h2>
          </div>
          <div className="bg-white p-6 border-l-4 border-black shadow-md">
            <p className="text-[13px] font-medium uppercase tracking-widest text-black mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Today's Orders</p>
            <h2 className="text-[32px] font-semibold tracking-tighter text-black" style={{ fontFamily: "'Inter', sans-serif" }}>{stats.orders}</h2>
          </div>
          <div className="bg-white p-6 border-l-4 border-red-600 shadow-md">
            <p className="text-[13px] font-medium uppercase tracking-widest text-black mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Low Stock Alerts</p>
            <h2 className={`text-[32px] font-semibold tracking-tighter ${products.filter(p => p.stock < 5).length > 0 ? 'text-red-600' : 'text-black'}`} style={{ fontFamily: "'Inter', sans-serif" }}>
              {products.filter(p => p.stock < 5).length}
            </h2>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6" role="tablist">
          {[
            { id: 'orders', label: 'Pulse', count: orders.length },
            { id: 'inventory', label: 'Stock', count: products.length },
            { id: 'customers', label: 'Users', count: 'LOG' },
            { id: 'analytics', label: 'Stats', count: '₹' },
            { id: 'alerts', label: 'Alerts', count: '!' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full text-left px-8 py-6 transition-all border-l-4 flex flex-col gap-1 group focus:outline-none ${
                activeTab === tab.id 
                  ? 'bg-uber-gray border-black text-black' 
                  : 'border-transparent text-black/40 hover:text-black hover:bg-uber-gray/30'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-[13px] font-bold uppercase tracking-[0.2em] ${activeTab === tab.id ? 'text-black' : 'text-black/80'}`}>
                  {tab.label}
                </span>
                <span className={`text-[11px] font-semibold ${activeTab === tab.id ? 'text-black/40' : 'text-black/20'}`}>
                  ({tab.count})
                </span>
              </div>
              <div className={`w-6 h-0.5 bg-black transition-all ${activeTab === tab.id ? 'opacity-100' : 'opacity-0'}`}></div>
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-black/5">
          <button 
            onClick={() => { sessionStorage.clear(); window.location.reload(); }}
            className="w-full text-[10px] font-semibold uppercase tracking-widest text-red-600 hover:text-red-700"
          >
            Terminate Session
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 h-screen overflow-y-auto bg-uber-gray/10">
        <div className="pt-12 pb-32 px-6 md:px-16 max-w-6xl">
          <div className="mb-12">
            <h2 className="text-[32px] font-semibold uppercase tracking-tighter text-black mb-2">{activeTab.toUpperCase()}</h2>
            <div className="w-12 h-1 bg-black"></div>
          </div>

          <div 
            id={`${activeTab}-panel`}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            {loading ? (
              <div className="h-64 flex items-center justify-center text-[12px] font-semibold uppercase tracking-widest animate-pulse">Syncing...</div>
            ) : (
              activeTab === 'orders' ? <OrderPulse /> : 
              activeTab === 'inventory' ? <InventoryManager products={products} onUpdate={fetchData} /> :
              activeTab === 'customers' ? <CustomerList /> :
              activeTab === 'analytics' ? <AnalyticsView /> :
              <NotificationManager />
            )}
          </div>
        </div>
      </div>
    </main>
  );
  );
}
