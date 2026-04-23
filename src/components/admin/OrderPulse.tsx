'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { ShoppingBag, MapPin, Phone, CheckCircle2, MessageSquare, Truck, Package } from 'lucide-react';

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
    <div className="space-y-6">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3" />
      
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white border-thin overflow-hidden">
            {/* Header */}
            <div className={`px-6 py-3 flex justify-between items-center ${
              order.status === 'Packing' ? 'bg-orange-50' : 
              order.status === 'Shipped' ? 'bg-blue-50' : 'bg-green-50'
            }`}>
              <span className="text-caption font-black tracking-tighter">Order #{order.id.toString().slice(-4)}</span>
              <span className={`text-[10px] font-black uppercase px-2 py-1 ${
                order.status === 'Packing' ? 'text-orange-700' : 
                order.status === 'Shipped' ? 'text-blue-700' : 'text-green-700'
              }`}>
                {order.status}
              </span>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-heading-2">₹{order.total_amount}</h3>
                  <p className="text-body-secondary text-[11px] mt-1">{new Date(order.created_at).toLocaleTimeString()} • {order.items?.length} Items</p>
                </div>
                <div className="flex gap-2">
                  <a href={`tel:${order.customer_phone}`} className="w-10 h-10 border-thin flex items-center justify-center hover:bg-uber-gray active-scale">
                    <Phone size={18} />
                  </a>
                  <a href={`https://wa.me/${order.customer_phone}`} target="_blank" className="w-10 h-10 border-thin flex items-center justify-center hover:bg-uber-gray active-scale">
                    <MessageSquare size={18} />
                  </a>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Package size={16} className="text-black/20 shrink-0 mt-1" />
                  <p className="text-body-primary text-sm leading-tight">
                    {order.items?.map((it: any) => `${it.quantity}x ${it.name}`).join(', ')}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-black/20 shrink-0 mt-1" />
                  <p className="text-body-secondary text-sm font-bold">
                    {order.address?.flat}, {order.address?.floor}, {order.address?.street}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                {order.status === 'Packing' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'Shipped')}
                    className="flex-1 bg-black text-white h-14 text-caption flex items-center justify-center gap-2 active-scale"
                  >
                    <Truck size={20} />
                    Ready for Delivery
                  </button>
                )}
                {order.status === 'Shipped' && (
                  <button 
                    onClick={() => updateStatus(order.id, 'Delivered')}
                    className="flex-1 bg-green-700 text-white h-14 text-caption flex items-center justify-center gap-2 active-scale"
                  >
                    <CheckCircle2 size={20} />
                    Confirm Delivery
                  </button>
                )}
                {order.status === 'Delivered' && (
                  <div className="flex-1 border-thin h-14 flex items-center justify-center gap-2 text-black/20 text-caption italic">
                    Successfully Completed
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {orders.length === 0 && (
          <div className="py-20 border-2 border-dashed border-uber-gray flex flex-col items-center justify-center text-caption text-black/10">
            No live orders yet
          </div>
        )}
      </div>
    </div>
  );
}
