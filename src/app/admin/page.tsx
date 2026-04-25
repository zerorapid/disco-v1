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
    <main className="min-h-screen bg-uber-gray/30 flex flex-col md:flex-row overflow-hidden">
      {/* VERTICAL SIDEBAR - WCAG Optimized */}
      <div className="w-full md:w-72 bg-white border-r border-uber-gray flex flex-col sticky top-0 h-auto md:h-screen z-30">
        <div className="p-8 border-b border-uber-gray">
          <div className="w-12 h-12 bg-black text-white rounded-none flex items-center justify-center font-black text-2xl mb-4">D</div>
          <h1 className="text-[14px] font-black uppercase tracking-[0.2em] leading-tight">Admin<br/>Dashboard</h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-6" role="tablist" aria-label="Admin Navigation">
          {[
            { id: 'orders', label: 'Order Pulse', icon: 'Pulse' },
            { id: 'inventory', label: 'Inventory', icon: 'Stock' },
            { id: 'customers', label: 'Intelligence', icon: 'Users' },
            { id: 'analytics', label: 'Analytics', icon: 'Stats' },
            { id: 'alerts', label: 'Broadcast', icon: 'Alerts' }
          ].map((tab) => (
            <button 
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tab.id}-panel`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full text-left px-8 py-5 text-[11px] font-black uppercase tracking-widest transition-all border-l-4 flex items-center justify-between group focus:outline-none focus:ring-2 focus:ring-black/5 ${
                activeTab === tab.id 
                  ? 'bg-uber-gray border-black text-black' 
                  : 'border-transparent text-black/50 hover:text-black hover:bg-uber-gray/50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[9px] opacity-0 group-hover:opacity-100 transition-opacity ${activeTab === tab.id ? 'opacity-100' : ''}`}>➔</span>
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-uber-gray">
          <div className="bg-black/5 p-4 space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-black/40">Secure Session</p>
            <p className="text-[11px] font-black text-black">ADMIN_AUTH: OK</p>
          </div>
          <button 
            onClick={() => { sessionStorage.clear(); window.location.reload(); }}
            className="w-full mt-4 text-[10px] font-black uppercase tracking-widest text-red-600 hover:text-red-700 text-left px-0"
            aria-label="Logout and end secure session"
          >
            Terminate Session
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 h-screen overflow-y-auto no-scrollbar">
        <Header />
        
        <div className="pt-24 pb-32 px-6 md:px-12 max-w-7xl mx-auto">
          {/* KPI SECTION - Tactic 47, 49 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="bg-white p-8 border-l-4 border-green-600 shadow-sm relative overflow-hidden group" role="region" aria-label="Revenue Statistics">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform" aria-hidden="true">
                <ShieldCheck size={100} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50 mb-3">Today's Revenue</p>
              <h2 className="text-[36px] font-black tracking-tighter leading-none">₹{stats.revenue.toLocaleString()}</h2>
            </div>
            
            <div className="bg-white p-8 border-l-4 border-black shadow-sm relative overflow-hidden group" role="region" aria-label="Order Velocity">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50 mb-3">Order Velocity</p>
              <h2 className="text-[36px] font-black tracking-tighter leading-none">{stats.orders} <span className="text-[12px] opacity-20">LVL</span></h2>
            </div>

            <div className="bg-white p-8 border-l-4 border-red-600 shadow-sm relative overflow-hidden group" role="region" aria-label="Stock Alerts">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50 mb-3">Stock Alerts</p>
              <h2 className={`text-[36px] font-black tracking-tighter leading-none ${products.filter(p => p.stock < 5).length > 0 ? 'text-red-600' : 'text-black'}`}>
                {products.filter(p => p.stock < 5).length}
              </h2>
            </div>

            <div className="bg-white p-8 border-l-4 border-black/10 shadow-sm relative overflow-hidden group" role="region" aria-label="Inventory Size">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50 mb-3">Inventory Size</p>
              <h2 className="text-[36px] font-black tracking-tighter leading-none">{products.length} <span className="text-[12px] opacity-20">SKU</span></h2>
            </div>
          </div>

          {/* CONTENT PANEL */}
          <div 
            id={`${activeTab}-panel`}
            role="tabpanel"
            className="min-h-[400px] animate-in fade-in duration-500"
          >
            {loading ? (
              <div className="h-64 flex items-center justify-center text-caption animate-pulse">Synchronizing Data...</div>
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
