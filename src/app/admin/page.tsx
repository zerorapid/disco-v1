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
    <main className="min-h-screen bg-uber-gray/30">
      <Header />
      
      <div className="pt-24 pb-32 max-width">
        {/* KPI SECTION */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 border-thin shadow-sm">
            <p className="text-caption text-black/40 mb-1">Today's Revenue</p>
            <h2 className="text-heading-2">₹{stats.revenue}</h2>
          </div>
          <div className="bg-white p-6 border-thin shadow-sm">
            <p className="text-caption text-black/40 mb-1">Today's Orders</p>
            <h2 className="text-heading-2">{stats.orders}</h2>
          </div>
          <div className="bg-white p-6 border-thin shadow-sm">
            <p className="text-caption text-black/40 mb-1">Low Stock Items</p>
            <h2 className="text-heading-2 text-red-600">{products.filter(p => p.stock < 5).length}</h2>
          </div>
          <div className="bg-white p-6 border-thin shadow-sm">
            <p className="text-caption text-black/40 mb-1">Live Products</p>
            <h2 className="text-heading-2">{products.length}</h2>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex bg-white border-thin p-1 mb-8 overflow-x-auto no-scrollbar">
          {[
            { id: 'orders', label: `Pulse (${stats.orders})` },
            { id: 'inventory', label: `Stock (${products.length})` },
            { id: 'customers', label: 'Users' },
            { id: 'analytics', label: 'Financials' },
            { id: 'alerts', label: 'Alerts' },
            { id: 'spy', label: 'Spy' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[100px] py-4 text-caption transition-all ${activeTab === tab.id ? 'bg-black text-white' : 'hover:bg-uber-gray text-black/40'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="min-h-[400px] animate-in fade-in duration-500">
          {loading ? (
            <div className="h-64 flex items-center justify-center text-caption animate-pulse">Synchronizing Data...</div>
          ) : (
            activeTab === 'orders' ? <OrderPulse /> : 
            activeTab === 'inventory' ? <InventoryManager products={products} onUpdate={fetchData} /> :
            activeTab === 'customers' ? <CustomerList /> :
            activeTab === 'analytics' ? <AnalyticsView /> :
            activeTab === 'alerts' ? <NotificationManager /> :
            <MarketIntelligence />
          )}
        </div>
      </div>
    </main>
  );
}
