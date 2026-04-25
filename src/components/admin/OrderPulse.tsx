'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { MapPin, Phone, CheckCircle2, MessageSquare, Truck, Package, Zap, Clock } from 'lucide-react';

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
        <div key={order.id} className="bg-white border border-black/10 flex h-24 relative group hover:shadow-lg transition-all">
          {/* Elite Status Indicator */}
          <div className={`w-2 h-full ${
            order.status === 'Packing' ? 'bg-orange-500' : 
            order.status === 'Shipped' ? 'bg-blue-500' : 'bg-green-500'
          }`} />

          <div className="flex-1 flex items-center px-6 gap-8">
            {/* ID & PRICE */}
            <div className="w-32 shrink-0 flex flex-col justify-center h-full">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[12px] font-black uppercase tracking-widest text-black/30">#{order.id.toString().slice(-4)}</span>
                <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${
                  order.status === 'Packing' ? 'bg-orange-50 text-orange-700' : 
                  order.status === 'Shipped' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                }`}>
                  {order.status}
                </span>
              </div>
              <h3 className="text-3xl font-black tracking-tighter leading-none">₹{order.total_amount}</h3>
              <p className="text-[12px] font-bold text-black/40 uppercase tracking-widest mt-2 flex items-center gap-1.5">
                <Clock size={12} />
                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* PAYLOAD */}
            <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
              <p className="text-[11px] font-black text-black/20 uppercase tracking-[0.2em] mb-1.5">Items Payload</p>
              <p className="text-[16px] font-bold leading-tight line-clamp-2">
                {order.items?.map((it: any) => `${it.quantity || 1}x ${it.name}`).join(', ')}
              </p>
            </div>

            {/* DESTINATION */}
            <div className="flex-1 min-w-0 hidden xl:flex flex-col justify-center h-full border-l border-black/5 pl-10">
              <p className="text-[11px] font-black text-black/20 uppercase tracking-[0.2em] mb-1.5">Destination</p>
              <p className="text-[14px] font-bold leading-tight uppercase text-black/60 line-clamp-2">
                {order.address?.flat}, {order.address?.area}
              </p>
            </div>

            {/* LOGISTICS */}
            <div className="shrink-0 flex flex-col justify-center h-full border-l border-black/5 pl-10">
              <div className="flex flex-col items-center">
                {order.transport_type === 'TRUCK' ? <Truck size={22} className="text-black/40" /> : <Zap size={22} className="text-black/40" />}
                <span className="text-[11px] font-black uppercase text-black/30 mt-1.5">{order.total_weight_kg || '0.5'}KG</span>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="shrink-0 flex items-center gap-6 border-l border-black/5 pl-10 h-full">
              <div className="flex gap-1.5">
                <a href={`tel:${order.customer_phone}`} className="w-11 h-11 bg-uber-gray flex items-center justify-center text-black hover:bg-black hover:text-white transition-all">
                  <Phone size={18} />
                </a>
                <a href={`https://wa.me/${order.customer_phone}`} target="_blank" className="w-11 h-11 bg-uber-gray flex items-center justify-center text-black hover:bg-black hover:text-white transition-all">
                  <MessageSquare size={18} />
                </a>
              </div>
              
              <div className="w-44">
                {order.status === 'Packing' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'Shipped')}
                    className="w-full h-12 bg-black text-white text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all active-scale"
                  >
                    <Truck size={18} />
                    Ship Pulse
                  </button>
                )}
                {order.status === 'Shipped' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'Delivered')}
                    className="w-full h-12 bg-blue-600 text-white text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-600 transition-all active-scale"
                  >
                    <CheckCircle2 size={18} />
                    Finalize Drop
                  </button>
                )}
                {order.status === 'Delivered' && (
                  <div className="w-full h-12 bg-green-50 text-green-700 text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-green-200">
                    <CheckCircle2 size={16} />
                    Archived
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
