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
import { Lock, ShieldCheck, BarChart3, Package, Users, Activity, Bell, Search, Plus, ExternalLink, LogOut, Radio } from 'lucide-react';

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
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
      setOrders(orderRes.data);
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
    <main className="min-h-screen bg-uber-gray/30 flex flex-col md:flex-row overflow-hidden">
      {/* SIDEBAR - DESKTOP ONLY */}
      <div className="hidden md:flex w-80 bg-white border-r border-black/10 flex-col sticky top-0 h-screen z-30 shadow-2xl">
        <div className="p-8 border-b border-black/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black text-xl">D</div>
            <div>
              <h1 className="text-[17px] font-black uppercase tracking-tighter leading-tight">DISCO</h1>
              <div className="flex items-center gap-1.5">
                <Radio size={10} className="text-green-500 animate-pulse" fill="currentColor" />
                <span className="text-[11px] font-bold text-black/40 uppercase tracking-widest">System Online</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-8">
          {[
            { id: 'orders', label: 'Activity Pulse', icon: Activity, count: orders.length },
            { id: 'inventory', label: 'Inventory Hub', icon: Package, count: products.length },
            { id: 'customers', label: 'User dossiers', icon: Users, count: 'LOG' },
            { id: 'analytics', label: 'Market Stats', icon: BarChart3, count: '₹' },
            { id: 'alerts', label: 'Broadcasts', icon: Bell, count: '!' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full text-left px-8 py-5 transition-all flex items-center gap-4 group relative ${
                activeTab === tab.id 
                  ? 'bg-black text-white' 
                  : 'text-black/60 hover:bg-black/5 hover:text-black'
              }`}
            >
              <tab.icon size={20} className={activeTab === tab.id ? 'text-green-400' : 'text-black/20 group-hover:text-black'} />
              <span className={`text-[14px] font-black uppercase tracking-widest flex-1`}>
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <div className="absolute right-0 top-0 w-1 h-full bg-green-400"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-black/10 space-y-4">
          <a 
            href="/" 
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 text-[12px] font-black uppercase tracking-widest text-black/60 hover:text-black hover:bg-black/5 transition-all"
          >
            <ExternalLink size={16} />
            View Storefront
          </a>
          <button 
            onClick={() => { sessionStorage.clear(); window.location.reload(); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-[12px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut size={16} />
            Terminate Session
          </button>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-black text-white z-50 flex items-center justify-around h-20 px-4 border-t border-white/10 pb-env">
        {[
          { id: 'orders', icon: Activity },
          { id: 'inventory', icon: Package },
          { id: 'analytics', icon: BarChart3 },
          { id: 'customers', icon: Users },
          { id: 'alerts', icon: Bell }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center justify-center gap-1 transition-all ${activeTab === tab.id ? 'text-green-400' : 'text-white/40'}`}
          >
            <tab.icon size={24} />
            <span className="text-[8px] font-black uppercase tracking-widest">{tab.id}</span>
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 h-screen overflow-y-auto bg-uber-gray/10 scroll-smooth">
        {/* STICKY KPI DASHBOARD */}
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-black/10 px-4 md:px-16 py-4 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 max-w-6xl">
            <div className="grid grid-cols-3 gap-4 md:gap-16 flex-1">
              <div className="flex flex-col">
                <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] text-black/40 mb-1.5 truncate">Revenue</span>
                <div className="flex items-baseline gap-1 md:gap-2">
                  <span className="text-2xl md:text-4xl font-black tracking-tighter text-green-700">₹{stats.revenue.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex flex-col border-l border-black/5 pl-4 md:pl-0 md:border-none">
                <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] text-black/40 mb-1.5 truncate">Orders</span>
                <span className="text-2xl md:text-4xl font-black tracking-tighter">{stats.orders}</span>
              </div>
              <div className="flex flex-col border-l border-black/5 pl-4 md:pl-0 md:border-none">
                <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.2em] text-black/40 mb-1.5 truncate">Alerts</span>
                <span className={`text-2xl md:text-4xl font-black tracking-tighter ${products.filter(p => p.stock < 5).length > 0 ? 'text-red-600' : ''}`}>
                  {products.filter(p => p.stock < 5).length}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative group flex-1 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20" size={14} />
                <input 
                  type="text"
                  placeholder="ERP Search"
                  className="w-full h-10 md:h-12 bg-uber-gray border border-transparent px-10 text-[12px] md:text-[14px] font-bold uppercase tracking-widest placeholder:text-black/20 focus:bg-white focus:border-black transition-all outline-none"
                />
              </div>
              <button className="h-10 w-10 md:h-12 md:w-12 bg-black text-white flex items-center justify-center hover:bg-green-600 transition-all active-scale">
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-12 pb-32 px-6 md:px-16 max-w-6xl">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-[48px] font-black uppercase tracking-tighter text-black leading-none">{activeTab}</h2>
              <p className="text-[13px] font-bold text-black/40 uppercase tracking-[0.3em] mt-4">Sector: Intelligence-Grid-{activeTab.substring(0,3).toUpperCase()}</p>
            </div>
            <div className="hidden md:flex gap-2">
              <div className="h-10 w-28 border border-black/10 bg-white flex items-center justify-center text-[11px] font-black uppercase tracking-widest text-black/40">Filtered</div>
              <div className="h-10 w-28 border border-black/10 bg-white flex items-center justify-center text-[11px] font-black uppercase tracking-widest text-black/40">Realtime</div>
            </div>
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
}
