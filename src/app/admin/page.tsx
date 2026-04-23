'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import InventoryManager from '@/components/admin/InventoryManager';
import OrderPulse from '@/components/admin/OrderPulse';
import CustomerList from '@/components/admin/CustomerList';
import AnalyticsView from '@/components/admin/AnalyticsView';

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState({ revenue: 0, orders: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'customers' | 'analytics'>('orders');

  useEffect(() => {
    fetchData();
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
            { id: 'analytics', label: 'Financials' }
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
            <AnalyticsView />
          )}
        </div>
      </div>
    </main>
  );
}
