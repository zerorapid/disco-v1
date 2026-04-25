'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { MapPin, Phone, CheckCircle2, MessageSquare, Truck, Package, Zap, Clock, MoreVertical, CreditCard, User, Box, Trash2, Copy } from 'lucide-react';

interface OrderPulseProps {
  searchQuery?: string;
}

export default function OrderPulse({ searchQuery = '' }: OrderPulseProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        setOrders((prev) => [payload.new, ...prev]);
        if (audioRef.current) audioRef.current.play().catch(() => {});
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchOrders() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50);
    if (data) setOrders(data);
  }

  async function updateStatus(id: number, status: string) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (!error) {
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    }
  }

  async function deleteOrder(id: number) {
    if (!confirm('Are you sure you want to terminate this order record?')) return;
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (!error) {
      setOrders(orders.filter(o => o.id !== id));
      setActiveMenu(null);
    }
  }

  const filteredOrders = orders.filter(order => {
    const query = searchQuery.toLowerCase();
    const idMatch = order.id.toString().includes(query);
    const itemMatch = order.items?.some((it: any) => it.name.toLowerCase().includes(query));
    const addressMatch = order.address?.area?.toLowerCase().includes(query) || order.address?.name?.toLowerCase().includes(query);
    return idMatch || itemMatch || addressMatch;
  });

  const sanitizePhone = (phone: string) => phone.replace(/\D/g, '');

  return (
    <div className="w-full bg-white border border-black/10">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3" />
      
      {/* LEDGER HEADER */}
      <div className="grid grid-cols-[140px_1fr_1fr_140px_160px_140px] gap-4 px-6 py-4 bg-uber-gray/50 border-b border-black/10 text-[11px] font-black uppercase tracking-[0.2em] text-black/40">
        <div>Order Ref</div>
        <div>Customer / Account</div>
        <div>Line Items</div>
        <div>Payment Status</div>
        <div className="text-center">Logistics / Status</div>
        <div className="text-right">Actions</div>
      </div>

      <div className="divide-y divide-black/5">
        {filteredOrders.map((order) => (
          <div 
            key={order.id} 
            className="grid grid-cols-[140px_1fr_1fr_140px_160px_140px] gap-4 px-6 py-5 items-center hover:bg-black/[0.02] transition-colors group relative"
          >
            {/* COL 1: PULSE & ID */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  order.status === 'Packing' ? 'bg-orange-500' : 
                  order.status === 'Shipped' ? 'bg-blue-500' : 'bg-green-500'
                } animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />
                <span className="text-[12px] font-black text-black tracking-tighter">#{order.id.toString().slice(-4)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-black/30 uppercase tracking-widest">
                <Clock size={10} />
                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* COL 2: CUSTOMER / ENTITY */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-uber-gray flex items-center justify-center">
                  <User size={12} className="text-black/30" />
                </div>
                <span className="text-[13px] font-bold text-black truncate max-w-[150px]">
                  {order.address?.name || 'Customer'}
                </span>
              </div>
              <div className="flex gap-2">
                <a href={`tel:${order.customer_phone}`} className="text-[10px] font-black text-black/40 hover:text-black uppercase tracking-widest underline decoration-black/10">Call</a>
                <a 
                  href={`https://wa.me/${sanitizePhone(order.customer_phone || '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[10px] font-black text-green-600/60 hover:text-green-600 uppercase tracking-widest underline decoration-green-600/10"
                >
                  WhatsApp
                </a>
              </div>
            </div>

            {/* COL 3: MANIFEST / PAYLOAD */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-black text-black/20 uppercase tracking-widest">
                <Box size={10} />
                <span>Line Items</span>
              </div>
              <p className="text-[13px] font-bold leading-tight text-black/70 line-clamp-2">
                {order.items?.map((it: any) => `${it.quantity || 1}x ${it.name}`).join(', ')}
              </p>
            </div>

            {/* COL 4: FINANCIALS */}
            <div className="space-y-1">
              <h3 className="text-xl font-black tracking-tighter text-black leading-none">₹{order.total_amount}</h3>
              <div className="flex items-center gap-1.5">
                <CreditCard size={10} className="text-black/20" />
                <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">{order.utr ? 'PAID' : 'CASH'}</span>
              </div>
            </div>

            {/* COL 5: LOGISTICS / GRID */}
            <div className="flex flex-col items-center justify-center gap-2">
              <div className={`px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-none border ${
                order.status === 'Packing' ? 'border-orange-200 bg-orange-50 text-orange-700' : 
                order.status === 'Shipped' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-green-200 bg-green-50 text-green-700'
              }`}>
                {order.status}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-black/30 uppercase tracking-widest">
                {order.transport_type === 'TRUCK' ? <Truck size={14} /> : <Zap size={14} />}
                <span>{order.total_weight_kg || '0.5'}KG</span>
              </div>
            </div>

            {/* COL 6: ACTIONS */}
            <div className="flex items-center justify-end gap-2 relative">
              {order.status === 'Packing' && (
                <button 
                  onClick={() => updateStatus(order.id, 'Shipped')}
                  className="h-10 px-4 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all active-scale"
                >
                  Ship
                </button>
              )}
              {order.status === 'Shipped' && (
                <button 
                  onClick={() => updateStatus(order.id, 'Delivered')}
                  className="h-10 px-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all active-scale"
                >
                  Drop
                </button>
              )}
              {order.status === 'Delivered' && (
                <div className="h-10 px-4 border border-black/10 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-black/20 italic">
                  Archived
                </div>
              )}
              <div className="relative">
                <button 
                  onClick={() => setActiveMenu(activeMenu === order.id ? null : order.id)}
                  className="w-10 h-10 border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-all"
                >
                  <MoreVertical size={16} />
                </button>

                {/* MORE MENU DROPDOWN */}
                {activeMenu === order.id && (
                  <div className="absolute right-0 top-12 w-48 bg-white border border-black shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(order.id.toString());
                        setActiveMenu(null);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-black hover:bg-black hover:text-white transition-all border-b border-black/5"
                    >
                      <Copy size={14} />
                      Copy Order ID
                    </button>
                    <button 
                      onClick={() => deleteOrder(order.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-600 hover:text-white transition-all"
                    >
                      <Trash2 size={14} />
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="py-24 flex flex-col items-center justify-center text-[12px] font-black text-black/20 uppercase tracking-widest">
          {searchQuery ? `No matches for "${searchQuery}"` : 'Manifest Empty / Waiting for Pulse'}
        </div>
      )}
    </div>
  );
}
