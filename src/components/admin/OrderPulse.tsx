'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { MapPin, Phone, CheckCircle2, MessageSquare, Truck, Package, Zap } from 'lucide-react';

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
    <div className="flex flex-col gap-3">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3" />
      
      {orders.map((order) => (
        <div key={order.id} className="bg-white border border-black/10 flex h-16 relative group hover:bg-uber-gray/5 transition-all">
          {/* Status Color Bar */}
          <div className={`w-1.5 h-full ${
            order.status === 'Packing' ? 'bg-orange-500' : 
            order.status === 'Shipped' ? 'bg-blue-500' : 'bg-green-500'
          }`} />

          <div className="flex-1 flex items-center px-4 gap-6 overflow-hidden">
            {/* ID & PRICE */}
            <div className="w-24 shrink-0">
              <p className="text-[9px] font-black uppercase tracking-tighter text-black/30 leading-none mb-1">#{order.id.toString().slice(-4)}</p>
              <h3 className="text-lg font-black tracking-tighter leading-none">₹{order.total_amount}</h3>
            </div>

            {/* PAYLOAD */}
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black text-black/30 uppercase tracking-[0.2em] mb-0.5">Payload</p>
              <p className="text-[12px] font-bold truncate">
                {order.items?.map((it: any) => `${it.quantity}x ${it.name}`).join(', ')}
              </p>
            </div>

            {/* DESTINATION */}
            <div className="flex-1 min-w-0 hidden lg:block border-l border-black/5 pl-6">
              <p className="text-[9px] font-black text-black/30 uppercase tracking-[0.2em] mb-0.5">Destination</p>
              <p className="text-[11px] font-bold truncate uppercase text-black/60">
                {order.address?.area || 'Sector 1, Delivery Hub'}
              </p>
            </div>

            {/* LOGISTICS */}
            <div className="shrink-0 flex items-center gap-4 border-l border-black/5 pl-6">
              <div className="flex flex-col items-center">
                {order.transport_type === 'TRUCK' ? <Truck size={14} className="text-black/40" /> : <Zap size={14} className="text-black/40" />}
                <span className="text-[8px] font-black uppercase text-black/30 mt-0.5">{order.total_weight_kg || '0.5'}KG</span>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="shrink-0 flex items-center gap-2 border-l border-black/5 pl-6">
              <div className="flex gap-1">
                <a href={`tel:${order.customer_phone}`} className="w-8 h-8 flex items-center justify-center text-black/40 hover:text-black transition-all">
                  <Phone size={14} />
                </a>
                <a href={`https://wa.me/${order.customer_phone}`} target="_blank" className="w-8 h-8 flex items-center justify-center text-black/40 hover:text-black transition-all">
                  <MessageSquare size={14} />
                </a>
              </div>
              
              <div className="w-28">
                {order.status === 'Packing' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'Shipped')}
                    className="w-full h-9 bg-black text-white text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all"
                  >
                    <Truck size={12} />
                    Ship
                  </button>
                )}
                {order.status === 'Shipped' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'Delivered')}
                    className="w-full h-9 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-600 transition-all"
                  >
                    <CheckCircle2 size={12} />
                    Drop
                  </button>
                )}
                {order.status === 'Delivered' && (
                  <div className="w-full h-9 bg-green-50 text-green-700 text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-1 border border-green-100">
                    <CheckCircle2 size={10} />
                    Finalized
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {orders.length === 0 && (
        <div className="py-24 border-2 border-dashed border-black/10 flex flex-col items-center justify-center text-[12px] font-semibold text-black/20 uppercase tracking-widest font-space">
          No active pulses found
        </div>
      )}
    </div>
  );
}
