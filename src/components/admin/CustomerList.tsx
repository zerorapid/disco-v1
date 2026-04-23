'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, ShoppingBag, Calendar, Phone } from 'lucide-react';

export default function CustomerList() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    const { data, error } = await supabase
      .from('orders')
      .select('customer_name, customer_phone, total_amount, created_at')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const customerMap: any = {};
      
      data.forEach((order: any) => {
        const phone = order.customer_phone || 'N/A';
        if (!customerMap[phone]) {
          customerMap[phone] = {
            name: order.customer_name || 'Guest',
            phone: phone,
            total_orders: 0,
            total_spend: 0,
            last_order: order.created_at
          };
        }
        customerMap[phone].total_orders += 1;
        customerMap[phone].total_spend += order.total_amount;
      });

      setCustomers(Object.values(customerMap));
    }
    setLoading(false);
  }

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  );

  if (loading) return <div className="h-64 flex items-center justify-center text-caption animate-pulse">Scanning Order History...</div>;

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

      <div className="space-y-2">
        {filteredCustomers.map((customer, idx) => (
          <div key={idx} className="bg-white border-thin p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-black transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-uber-gray flex items-center justify-center rounded-full text-black/40">
                <User size={24} />
              </div>
              <div>
                <h4 className="text-body-primary uppercase font-black">{customer.name}</h4>
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
                <p className="text-[10px] text-black/20 font-black uppercase tracking-widest">Spend</p>
                <p className="text-heading-3">₹{customer.total_spend}</p>
              </div>
              <div className="text-center md:text-left hidden lg:block">
                <p className="text-[10px] text-black/20 font-black uppercase tracking-widest">Latest</p>
                <p className="text-body-secondary text-[11px] font-bold mt-2">
                  {new Date(customer.last_order).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <a 
                href={`tel:${customer.phone}`}
                className="w-10 h-10 border-thin flex items-center justify-center hover:bg-uber-gray active-scale"
              >
                <Phone size={18} />
              </a>
              <a 
                href={`https://wa.me/${customer.phone}`}
                target="_blank"
                className="w-10 h-10 border-thin flex items-center justify-center hover:bg-uber-gray active-scale"
              >
                <ShoppingBag size={18} />
              </a>
            </div>
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
