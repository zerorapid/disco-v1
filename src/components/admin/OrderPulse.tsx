'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { MapPin, Phone, CheckCircle2, MessageSquare, Truck, Package, Zap, Clock, MoreVertical, CreditCard, User, Box, Trash2, Copy, ChevronDown, ChevronUp, Map, Receipt } from 'lucide-react';

interface OrderPulseProps {
  searchQuery?: string;
}

export default function OrderPulse({ searchQuery = '' }: OrderPulseProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [manualUtr, setManualUtr] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('schema-db-changes-v2')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setOrders((prev) => [payload.new, ...prev]);
          if (audioRef.current) audioRef.current.play().catch(() => {});
        } else if (payload.eventType === 'UPDATE') {
          setOrders((prev) => prev.map(o => o.id === payload.new.id ? payload.new : o));
        } else if (payload.eventType === 'DELETE') {
          setOrders((prev) => prev.filter(o => o.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchOrders() {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(100);
    if (data) setOrders(data);
  }

  async function updateStatus(id: number, status: string) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) alert("Error updating status: " + error.message);
  }

  const filteredOrders = orders.filter(order => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      order.id.toString().includes(query) || 
      order.items?.some((it: any) => it.name.toLowerCase().includes(query)) ||
      order.customer_name?.toLowerCase().includes(query) ||
      order.customer_phone?.includes(query);
    
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const sanitizePhone = (phone: string) => phone.replace(/\D/g, '');

  return (
    <div className="w-full space-y-4">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3" />
      
      {/* STATUS COMMAND RIBBON */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['All', 'Packing', 'Shipped', 'Delivered', 'Cancelled', 'Issue'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`h-12 px-6 text-[11px] font-black uppercase tracking-widest transition-all border ${
              statusFilter === status 
                ? 'bg-black text-white border-black shadow-lg translate-y-[-2px]' 
                : 'bg-white text-black/40 border-black/10 hover:border-black/30'
            }`}
          >
            {status} ({status === 'All' ? orders.length : orders.filter(o => o.status === status).length})
          </button>
        ))}
      </div>

      {/* LEDGER HEADER - Desktop Only */}
      <div className="hidden md:grid grid-cols-[140px_1fr_1fr_140px_160px_140px] gap-4 px-6 py-4 bg-uber-gray/50 border-b border-black/10 text-[11px] font-black uppercase tracking-[0.2em] text-black/40">
        <div>Order Ref</div>
        <div>Customer / Account</div>
        <div>Line Items</div>
        <div>Payment Status</div>
        <div className="text-center">Logistics / Status</div>
        <div className="text-right">Actions</div>
      </div>

      <div className="divide-y divide-black/5 bg-white border border-black/10">
        {filteredOrders.map((order) => (
          <div key={order.id} className="transition-all duration-300">
            {/* DESKTOP ROW */}
            <div 
              className={`hidden md:grid grid-cols-[140px_1fr_1fr_140px_160px_140px] gap-4 px-6 py-5 items-center hover:bg-black/[0.02] transition-colors group relative cursor-pointer ${expandedOrder === order.id ? 'bg-black/[0.03]' : ''}`}
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
            >
              {/* COL 1: PULSE & ID */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    order.status === 'Packing' ? 'bg-orange-500' : 
                    order.status === 'Shipped' ? 'bg-blue-500' : 
                    order.status === 'Cancelled' ? 'bg-red-500' : 
                    order.status === 'Issue' ? 'bg-yellow-400' : 'bg-green-500'
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
                    {order.customer_name || 'Customer'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <a href={`tel:${order.customer_phone}`} onClick={e => e.stopPropagation()} className="text-[10px] font-black text-black/40 hover:text-black uppercase tracking-widest underline decoration-black/10">Call</a>
                  <a 
                    href={`https://wa.me/${sanitizePhone(order.customer_phone || '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
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
                  <span className={`text-[10px] font-black uppercase tracking-widest ${order.utr ? 'text-green-600' : 'text-black/40'}`}>
                    {order.utr ? 'PAID' : 'PENDING'}
                  </span>
                </div>
              </div>

              {/* COL 5: LOGISTICS / GRID */}
              <div className="flex flex-col items-center justify-center gap-2">
                <div className={`px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-none border ${
                  order.status === 'Packing' ? 'border-orange-200 bg-orange-50 text-orange-700' : 
                  order.status === 'Shipped' ? 'border-blue-200 bg-blue-50 text-blue-700' : 
                  order.status === 'Cancelled' ? 'border-red-200 bg-red-50 text-red-700' :
                  order.status === 'Issue' ? 'border-yellow-400 bg-yellow-50 text-yellow-800' :
                  'border-green-200 bg-green-50 text-green-700'
                }`}>
                  {order.status}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-black/30 uppercase tracking-widest">
                  {order.transport_type === 'TRUCK' ? <Truck size={14} /> : <Zap size={14} />}
                  <span>{order.total_weight_kg || '0.5'}KG</span>
                </div>
              </div>

              {/* COL 6: ACTIONS */}
              <div className="flex items-center justify-end gap-2 relative" onClick={e => e.stopPropagation()}>
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
                <div className="relative">
                  <button 
                    onClick={() => setActiveMenu(activeMenu === order.id ? null : order.id)}
                    className="w-10 h-10 border border-black/10 flex items-center justify-center hover:bg-black hover:text-white transition-all"
                  >
                    <MoreVertical size={16} />
                  </button>

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
                        onClick={() => {
                          updateStatus(order.id, 'Issue');
                          setActiveMenu(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-yellow-600 hover:bg-yellow-600 hover:text-white transition-all border-b border-black/5"
                      >
                        <Phone size={14} />
                        Flag Unresponsive
                      </button>
                      <button 
                        onClick={() => {
                          updateStatus(order.id, 'Cancelled');
                          setActiveMenu(null);
                        }}
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

            {/* MOBILE CARD */}
            <div 
              className="md:hidden p-5 space-y-4 border-b border-black/5 active:bg-black/[0.02]"
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      order.status === 'Packing' ? 'bg-orange-500' : 
                      order.status === 'Shipped' ? 'bg-blue-500' : 
                      order.status === 'Cancelled' ? 'bg-red-500' : 
                      order.status === 'Issue' ? 'bg-yellow-400' : 'bg-green-500'
                    } animate-pulse`} />
                    <span className="text-[14px] font-black tracking-tighter">#{order.id.toString().slice(-4)}</span>
                    <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <h3 className="text-[15px] font-bold text-black">{order.customer_name || 'Customer'}</h3>
                </div>
                <div className="text-right">
                  <h3 className="text-[18px] font-black tracking-tighter leading-none">₹{order.total_amount}</h3>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${order.utr ? 'text-green-600' : 'text-red-500'}`}>
                    {order.utr ? 'PAID' : 'PENDING'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-uber-gray/50 text-[11px] font-bold text-black/60 line-clamp-1">
                {order.items?.map((it: any) => `${it.quantity || 1}x ${it.name}`).join(', ')}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest border ${
                  order.status === 'Packing' ? 'border-orange-200 bg-orange-50 text-orange-700' : 
                  order.status === 'Shipped' ? 'border-blue-200 bg-blue-50 text-blue-700' : 
                  'border-green-200 bg-green-50 text-green-700'
                }`}>
                  {order.status}
                </div>
                <div className="flex gap-2">
                  {order.status === 'Packing' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'Shipped'); }}
                      className="h-10 px-6 bg-black text-white text-[10px] font-black uppercase tracking-widest"
                    >
                      Ship
                    </button>
                  )}
                  {order.status === 'Shipped' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); updateStatus(order.id, 'Delivered'); }}
                      className="h-10 px-6 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest"
                    >
                      Drop
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === order.id ? null : order.id); }}
                    className="w-10 h-10 border border-black/10 flex items-center justify-center"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* DEEP DATA DOSSIER (EXPANDED) */}
            {expandedOrder === order.id && (
              <div className="bg-uber-gray/30 p-8 border-t border-black/5 animate-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {/* PAYMENT INTEL */}
                  <div className="space-y-4">
                    <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-black/30 flex items-center gap-2">
                      <Receipt size={14} /> Transaction Ledger
                    </h5>
                    <div className="bg-white p-6 border border-black/5 space-y-4 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-black/40 uppercase">Transaction ID</span>
                        <span className="text-[13px] font-black text-blue-600 tracking-wider">{order.utr || 'NOT_FOUND'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-black/40 uppercase">Platform Fee</span>
                        <span className="text-[13px] font-black">₹{order.platform_fee || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-black/40 uppercase">Handling Fee</span>
                        <span className="text-[13px] font-black">₹{order.handling_fee || 0}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-uber-gray">
                        <span className="text-[11px] font-black uppercase">Final Settlement</span>
                        <span className="text-[18px] font-black">₹{order.total_amount}</span>
                      </div>
                      
                      {!order.utr && (
                        <div className="pt-4 space-y-3">
                          <label className="block text-[9px] font-black uppercase tracking-widest text-black/40">Manual Payment Verify</label>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              placeholder="Enter UTR..."
                              className="flex-1 h-10 border border-black px-3 text-[12px] font-bold outline-none"
                              value={manualUtr}
                              onChange={(e) => setManualUtr(e.target.value)}
                            />
                            <button 
                              onClick={async () => {
                                if (!manualUtr) return;
                                const { error } = await supabase.from('orders').update({ utr: manualUtr, status: 'Packing' }).eq('id', order.id);
                                if (!error) {
                                  setManualUtr('');
                                  setExpandedOrder(null);
                                }
                              }}
                              className="bg-black text-white px-4 text-[9px] font-black uppercase tracking-widest"
                            >
                              Verify
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* LOGISTICS DOSSIER */}
                  <div className="space-y-4">
                    <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-black/30 flex items-center gap-2">
                      <Map size={14} /> Logistics Dossier
                    </h5>
                    <div className="bg-white p-6 border border-black/5 space-y-4 shadow-sm">
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-black/40 uppercase">Delivery Slot</p>
                        <p className="text-[13px] font-black uppercase text-green-700">{order.delivery_slot || 'INSTANT'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-black/40 uppercase">Precision Address</p>
                        <p className="text-[13px] font-black leading-tight">
                          {order.address?.flat}, {order.address?.floor ? `Floor ${order.address.floor},` : ''} {order.address?.area}
                        </p>
                        {order.address?.landmark && (
                          <p className="text-[11px] font-bold text-blue-600 uppercase mt-1">Landmark: {order.address.landmark}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ITEM MANIFEST */}
                  <div className="space-y-4">
                    <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-black/30 flex items-center gap-2">
                      <Box size={14} /> Item Manifest
                    </h5>
                    <div className="bg-white border border-black/5 divide-y divide-uber-gray overflow-hidden shadow-sm">
                      {order.items?.map((item: any, i: number) => (
                        <div key={i} className="p-4 flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-[13px] font-black">{item.name}</span>
                            <span className="text-[10px] font-bold text-black/40 uppercase">{item.quantity} Unit(s)</span>
                          </div>
                          <span className="text-[13px] font-black text-black/60">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="py-24 flex flex-col items-center justify-center text-[12px] font-black text-black/20 uppercase tracking-widest border border-black/10 bg-white">
          {searchQuery ? `No matches for "${searchQuery}"` : 'Manifest Empty / Waiting for Pulse'}
        </div>
      )}
    </div>
  );
}
