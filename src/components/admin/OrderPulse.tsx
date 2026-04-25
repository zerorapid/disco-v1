'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { ShoppingBag, MapPin, Phone, CheckCircle2, MessageSquare, Truck, Package, Clock, Zap } from 'lucide-react';

export default function OrderPulse() {
  const [orders, setOrders] = useState<any[]>([]);
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
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(20);
    if (data) setOrders(data);
  }

  async function updateStatus(id: number, status: string) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (!error) {
      setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    }
  }

  return (
      <div className="grid grid-cols-1 gap-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border border-black/10 flex relative group hover:shadow-md transition-all">
            {/* Minimalist Status Indicator */}
            <div className={`w-1.5 ${
              order.status === 'Packing' ? 'bg-orange-500' : 
              order.status === 'Shipped' ? 'bg-blue-500' : 'bg-green-500'
            }`} />

            <div className="flex-1 p-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* PRIMARY DATA: ID & TOTAL */}
                <div className="min-w-[140px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-black/40">#{order.id.toString().slice(-4)}</span>
                    <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest ${
                      order.status === 'Packing' ? 'bg-orange-50 text-orange-700' : 
                      order.status === 'Shipped' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-black tracking-tighter">₹{order.total_amount}</h3>
                  <p className="text-[9px] font-bold text-black/30 uppercase tracking-widest mt-1">
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* PAYLOAD GRID */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 border-l border-black/5 pl-4">
                  <div className="flex items-start gap-2">
                    <Package size={14} className="text-black/20 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-black text-black/40 uppercase tracking-widest mb-0.5">Items</p>
                      <p className="text-[12px] font-bold leading-tight line-clamp-1">
                        {order.items?.map((it: any) => `${it.quantity}x ${it.name}`).join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-black/20 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-black text-black/40 uppercase tracking-widest mb-0.5">Address</p>
                      <p className="text-[12px] font-bold leading-tight truncate uppercase">
                        {order.address?.flat}, {order.address?.area}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ACTIONS & CONTACTS */}
                <div className="flex items-center gap-3 border-l border-black/5 pl-4">
                  <div className="flex gap-1">
                    <a href={`tel:${order.customer_phone}`} className="w-9 h-9 bg-uber-gray flex items-center justify-center hover:bg-black hover:text-white transition-all">
                      <Phone size={14} />
                    </a>
                    <a href={`https://wa.me/${order.customer_phone}`} target="_blank" className="w-9 h-9 bg-uber-gray flex items-center justify-center hover:bg-black hover:text-white transition-all">
                      <MessageSquare size={14} />
                    </a>
                  </div>
                  
                  <div className="min-w-[160px]">
                    {order.status === 'Packing' && (
                      <button 
                        onClick={() => updateStatus(order.id, 'Shipped')}
                        className="w-full h-10 bg-black text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-600 transition-all active-scale"
                      >
                        <Truck size={14} />
                        Ship Payload
                      </button>
                    )}
                    {order.status === 'Shipped' && (
                      <button 
                        onClick={() => updateStatus(order.id, 'Delivered')}
                        className="w-full h-10 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-600 transition-all active-scale"
                      >
                        <CheckCircle2 size={14} />
                        Confirm Drop
                      </button>
                    )}
                    {order.status === 'Delivered' && (
                      <div className="w-full h-10 bg-green-50 text-green-700 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-green-200">
                        <CheckCircle2 size={12} />
                        Archived
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {orders.length === 0 && (
          <div className="py-24 border-2 border-dashed border-black/10 flex flex-col items-center justify-center text-[12px] font-semibold text-black/20 uppercase tracking-widest">
            No active pulses found
          </div>
        )}
      </div>
    </div>
  );
}
