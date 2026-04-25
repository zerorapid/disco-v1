'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, ShoppingBag, Calendar, Phone } from 'lucide-react';

interface CustomerListProps {
  searchQuery?: string;
}

export default function CustomerList({ searchQuery = '' }: CustomerListProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPhone, setExpandedPhone] = useState<string | null>(null);
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchActivity(phone: string) {
    setActivity([]);
    const { data } = await supabase
      .from('user_activity')
      .select('*')
      .eq('customer_phone', phone)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setActivity(data);
  }

  async function fetchCustomers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('last_active', { ascending: false });

    if (!error && data) {
      setCustomers(data);
    }
    setLoading(false);
  }

  const generatePermanentPin = (phoneNumber: string) => {
    if (!phoneNumber || phoneNumber.length < 10) return '0000';
    const digits = phoneNumber.split('').map(Number);
    const sum = digits.reduce((a, b) => a + b, 0);
    const last3 = parseInt(phoneNumber.slice(-3));
    const pin = (last3 + sum + 100) % 10000;
    return pin.toString().padStart(4, '0');
  };

  const filteredCustomers = customers.filter(c => 
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.phone || '').includes(searchQuery)
  );

  if (loading) return <div className="h-64 flex items-center justify-center text-caption animate-pulse font-black uppercase tracking-widest text-black/20">Scanning Intelligence Hub...</div>;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {filteredCustomers.map((customer, idx) => (
          <div key={idx} className={`bg-white border border-black/10 overflow-hidden transition-all duration-300 ${expandedPhone === customer.phone ? 'border-black shadow-2xl' : 'hover:border-black/30'}`}>
            <div 
              className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer"
              onClick={() => {
                if (expandedPhone === customer.phone) {
                  setExpandedPhone(null);
                } else {
                  setExpandedPhone(customer.phone);
                  fetchActivity(customer.phone);
                }
              }}
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-uber-gray flex items-center justify-center text-black/20">
                  <User size={28} />
                </div>
                <div>
                  <h4 className="text-[16px] font-black uppercase tracking-tight text-black">{customer.name || 'Anonymous User'}</h4>
                  <div className="flex items-center gap-2 text-black/40 text-[12px] font-bold mt-1">
                    <Phone size={14} />
                    {customer.phone}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-16">
                <div className="text-left">
                  <p className="text-[9px] text-black/20 font-black uppercase tracking-[0.2em] mb-1">Orders</p>
                  <p className="text-xl md:text-2xl font-black">{customer.total_orders}</p>
                </div>
                <div className="text-left">
                  <p className="text-[9px] text-black/20 font-black uppercase tracking-[0.2em] mb-1">LTV</p>
                  <p className="text-xl md:text-2xl font-black text-green-700">₹{customer.total_spend}</p>
                </div>
                <div className="text-left col-span-2 md:col-span-1 border-t md:border-t-0 border-black/5 pt-3 md:pt-0">
                  <p className="text-[9px] text-black/20 font-black uppercase tracking-[0.2em] mb-1">Permanent PIN</p>
                  <p className="text-xl md:text-2xl text-blue-600 font-black tracking-widest">{generatePermanentPin(customer.phone)}</p>
                </div>
              </div>
            </div>

            {/* EXPANDED ACTIVITY FEED */}
            {expandedPhone === customer.phone && (
              <div className="border-t border-black/5 bg-uber-gray/10 p-8 animate-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center mb-8">
                  <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-black/40 flex items-center gap-2">
                    <Calendar size={14} /> Customer Profile
                  </h5>
                  <div className="bg-black text-white px-4 py-1.5 text-[11px] font-black uppercase tracking-widest">
                    Live Session Active
                  </div>
                </div>
                <div className="space-y-2">
                  {activity.length > 0 ? activity.map((act, i) => (
                    <div key={i} className="bg-white p-4 border border-black/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className={`text-[9px] font-black px-2 py-0.5 uppercase tracking-widest ${
                          act.action === 'SEARCH' ? 'bg-blue-100 text-blue-700' :
                          act.action === 'CART_ADD' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {act.action}
                        </span>
                        <p className="text-[13px] font-bold text-black/80">
                          {act.action === 'SEARCH' ? `Searched for "${act.details.query}"` :
                           act.action === 'CART_ADD' ? `Added ${act.details.name} to cart` : 'User Action'}
                        </p>
                      </div>
                      <span className="text-[10px] font-black text-black/20 uppercase">{new Date(act.created_at).toLocaleTimeString()}</span>
                    </div>
                  )) : (
                    <div className="py-12 text-center text-[12px] font-bold text-black/20 uppercase tracking-widest italic">No recent activity detected in grid</div>
                  )}
                </div>
                
                <div className="mt-8 flex flex-col md:flex-row gap-4">
                  <a href={`tel:${customer.phone}`} className="h-14 bg-black text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 active-scale">
                    <Phone size={18} /> Contact via Phone
                  </a>
                  <a href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`} target="_blank" className="h-14 bg-white border border-black/10 text-black text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 active-scale">
                    <ShoppingBag size={18} /> Send WhatsApp Message
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredCustomers.length === 0 && (
          <div className="py-24 text-center text-[12px] font-black text-black/20 uppercase tracking-widest border-2 border-dashed border-black/5">
            {searchQuery ? `No entities found matching "${searchQuery}"` : 'No customers detected in Intelligence Hub'}
          </div>
        )}
      </div>
    </div>
  );
}
