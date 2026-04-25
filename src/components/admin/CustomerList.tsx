'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, ShoppingBag, Calendar, Phone } from 'lucide-react';

export default function CustomerList() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
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

  if (loading) return <div className="h-64 flex items-center justify-center text-caption animate-pulse">Scanning Intelligence Hub...</div>;

  return (
    <div className="space-y-6">
      <div className="relative">
        <input 
          type="text" 
          placeholder="Search customers by name or phone..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-14 bg-white border-thin px-12 font-bold text-sm outline-none focus:border-black"
        />
        <User size={20} className="absolute left-4 top-4 text-black/20" />
      </div>

      <div className="space-y-4">
        {filteredCustomers.map((customer, idx) => (
          <div key={idx} className={`bg-white border-thin overflow-hidden transition-all duration-300 ${expandedPhone === customer.phone ? 'border-black shadow-xl ring-1 ring-black' : 'hover:border-black'}`}>
            <div 
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
              onClick={() => {
                if (expandedPhone === customer.phone) {
                  setExpandedPhone(null);
                } else {
                  setExpandedPhone(customer.phone);
                  fetchActivity(customer.phone);
                }
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-uber-gray flex items-center justify-center rounded-full text-black/40">
                  <User size={24} />
                </div>
                <div>
                  <h4 className="text-body-primary uppercase font-black">{customer.name || 'Anonymous User'}</h4>
                  <div className="flex items-center gap-2 text-body-secondary text-[11px] font-bold">
                    <Phone size={12} />
                    {customer.phone}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-8 md:gap-12">
                <div className="text-center md:text-left">
                  <p className="text-[10px] text-black/20 font-black uppercase tracking-widest">Orders</p>
                  <p className="text-heading-3">{customer.total_orders}</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-[10px] text-black/20 font-black uppercase tracking-widest">LTV</p>
                  <p className="text-heading-3">₹{customer.total_spend}</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-[10px] text-black/20 font-black uppercase tracking-widest">PIN</p>
                  <p className="text-heading-3 text-blue-600 font-black">{generatePermanentPin(customer.phone)}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <div className={`w-10 h-10 border-thin flex items-center justify-center transition-transform ${expandedPhone === customer.phone ? 'rotate-180' : ''}`}>
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
              </div>
            </div>

            {/* EXPANDED ACTIVITY FEED */}
            {expandedPhone === customer.phone && (
              <div className="border-t border-uber-gray bg-uber-gray/30 p-6 animate-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-black/40 flex items-center gap-2">
                    <Calendar size={12} /> Intelligence Dossier
                  </h5>
                  <div className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">
                    Permanent PIN: {generatePermanentPin(customer.phone)}
                  </div>
                </div>
                <div className="space-y-2">
                  {activity.length > 0 ? activity.map((act, i) => (
                    <div key={i} className="bg-white p-3 border-thin flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`text-[8px] font-black px-1.5 py-0.5 uppercase ${
                          act.action === 'SEARCH' ? 'bg-blue-100 text-blue-700' :
                          act.action === 'CART_ADD' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {act.action}
                        </span>
                        <p className="text-[11px] font-bold text-black">
                          {act.action === 'SEARCH' ? `Searched for "${act.details.query}"` :
                           act.action === 'CART_ADD' ? `Added ${act.details.name} to cart` : 'User Action'}
                        </p>
                      </div>
                      <span className="text-[9px] font-black text-black/20">{new Date(act.created_at).toLocaleTimeString()}</span>
                    </div>
                  )) : (
                    <div className="py-8 text-center text-caption text-black/10 italic">No recent activity detected</div>
                  )}
                </div>
                
                <div className="mt-6 flex gap-3">
                  <a href={`tel:${customer.phone}`} className="flex-1 h-12 bg-black text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active-scale">
                    <Phone size={14} /> Call Customer
                  </a>
                  <a href={`https://wa.me/${customer.phone}`} target="_blank" className="flex-1 h-12 bg-white border-thin text-black text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active-scale">
                    <ShoppingBag size={14} /> WhatsApp Pulse
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredCustomers.length === 0 && (
          <div className="py-20 text-center text-caption text-black/10">
            No customers found matching your search
          </div>
        )}
      </div>
    </div>
  );
}
