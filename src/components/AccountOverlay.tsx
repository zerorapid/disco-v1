'use client';

import { useAccount } from '@/context/AccountContext';
import { X, ChevronLeft, Loader2, Package, LogOut, ShoppingBag, ChevronRight, Clock, MapPin, Shield, User as UserIcon, Settings, Home, Briefcase, Building2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type AccountView = 'dashboard' | 'orders' | 'addresses' | 'security' | 'login-phone' | 'login-otp';

export default function AccountOverlay() {
  const { isAccountOpen, setIsAccountOpen, user, login, logout, addresses } = useAccount();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<AccountView>('dashboard');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [orders, setOrders] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) {
      setView('login-phone');
    } else {
      setView('dashboard');
    }
  }, [user]);

  useEffect(() => {
    if (user?.phone && isAccountOpen && view === 'orders') {
      fetchOrders();
    }
  }, [user?.phone, isAccountOpen, view]);

  const fetchOrders = async () => {
    if (!user?.phone) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_phone', user.phone)
        .order('created_at', { ascending: false });
      
      if (!error && data) setOrders(data);
    } catch (err) {
      console.error("Orders fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAccountOpen || !mounted) return null;

  const handleContinue = async () => {
    if (phone.length !== 10) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setView('login-otp');
    }, 800);
  };

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => {
      login(phone);
      setLoading(false);
    }, 1000);
  };

  const menuItems = [
    { id: 'orders', label: 'My Orders', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'security', label: 'Security & Privacy', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="fixed inset-0 z-[250] flex justify-end">
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsAccountOpen(false)} />

      {/* SIDEBAR CONTENT */}
      <div className="relative w-full max-w-md bg-uber-gray h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* HEADER */}
        <div className="bg-white p-4 flex items-center justify-between border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (view === 'dashboard' || view === 'login-phone') setIsAccountOpen(false);
                else if (view === 'login-otp') setView('login-phone');
                else setView('dashboard');
              }} 
              className="w-10 h-10 flex items-center justify-center hover:bg-uber-gray rounded-full"
            >
              {(view === 'dashboard' || view === 'login-phone') ? <X size={20} /> : <ChevronLeft size={24} />}
            </button>
            <h2 className="text-[18px] font-black text-black uppercase tracking-tighter">
              {view === 'dashboard' ? 'Account' : view === 'orders' ? 'Orders' : view === 'addresses' ? 'Addresses' : 'Settings'}
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {user ? (
            /* DASHBOARD VIEW */
            <div className="p-4 space-y-6">
              {/* PROFILE CARD */}
              <div className="bg-white rounded-3xl p-6 shadow-sm flex items-center gap-4 border border-black/5">
                <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center font-black text-2xl">
                  {user.name?.charAt(0) || 'J'}
                </div>
                <div className="flex-1">
                  <h3 className="text-[20px] font-black text-black">{user.name || 'Jayapal Reddy'}</h3>
                  <p className="text-[14px] text-black/40 font-bold">+91 {user.phone}</p>
                </div>
                <button onClick={logout} className="text-red-500 font-black text-[12px] uppercase">Logout</button>
              </div>

              {/* SETTINGS MENU */}
              {view === 'dashboard' && (
                <div className="space-y-3">
                  <h4 className="text-[11px] font-black text-black/30 uppercase tracking-[0.2em] pl-2">General Settings</h4>
                  <div className="bg-white rounded-3xl overflow-hidden border border-black/5">
                    {menuItems.map((item) => (
                      <button 
                        key={item.id}
                        onClick={() => setView(item.id as AccountView)}
                        className="w-full p-5 flex items-center justify-between hover:bg-uber-gray transition-colors border-b border-uber-gray last:border-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center`}>
                            <item.icon size={20} />
                          </div>
                          <span className="text-[15px] font-bold text-black">{item.label}</span>
                        </div>
                        <ChevronRight size={18} className="text-black/10" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ORDERS SUB-VIEW */}
              {view === 'orders' && (
                <div className="space-y-4">
                  {loading ? (
                    <div className="py-20 flex flex-col items-center gap-4 opacity-20">
                      <Loader2 className="animate-spin" size={32} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Syncing Orders</span>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center space-y-4">
                      <ShoppingBag size={32} className="mx-auto text-black/10" />
                      <p className="text-[14px] font-bold text-black/30">No orders yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-2xl p-5 border border-black/5 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-50 text-green-700 rounded-xl flex items-center justify-center"><Package size={20} /></div>
                              <div>
                                <p className="text-[15px] font-black text-black">Order #{String(order.id).slice(0, 8)}</p>
                                <p className="text-[12px] text-black/40 font-bold">{new Date(order.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-black text-white text-[10px] font-black rounded uppercase tracking-widest">{order.status}</span>
                          </div>
                          <div className="pt-3 border-t border-uber-gray flex justify-between items-center">
                            <span className="text-[12px] font-bold text-green-700">Arriving in 13 mins</span>
                            <span className="text-[16px] font-black text-black">₹{order.total_amount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ADDRESSES SUB-VIEW */}
              {view === 'addresses' && (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="bg-white rounded-2xl p-5 border border-black/5 flex gap-4">
                      <div className="w-10 h-10 bg-uber-gray rounded-xl flex items-center justify-center flex-shrink-0">
                        {addr.type === 'Home' ? <Home size={20} /> : addr.type === 'Work' ? <Briefcase size={20} /> : <Building2 size={20} />}
                      </div>
                      <div>
                        <h4 className="text-[15px] font-black text-black">{addr.type}</h4>
                        <p className="text-[13px] text-black/40 font-bold leading-tight">{addr.flat}, {addr.area}</p>
                      </div>
                    </div>
                  ))}
                  <button className="w-full p-5 bg-white border-2 border-dashed border-black/10 rounded-2xl font-black text-[14px] text-black/40 hover:border-black/20 transition-all">
                    + Add New Address
                  </button>
                </div>
              )}

              {/* SECURITY PLACEHOLDER */}
              {view === 'security' && (
                <div className="bg-white rounded-3xl p-12 text-center space-y-4">
                  <Shield size={32} className="mx-auto text-black/10" />
                  <p className="text-[14px] font-bold text-black/30">Your data is secured with AES-256 encryption.</p>
                </div>
              )}
            </div>
          ) : (
            /* LOGIN FLOW */
            <div className="p-8 h-full bg-white flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center font-black text-2xl mb-8">L</div>
              <h2 className="text-[24px] font-black text-black uppercase tracking-tighter mb-2">Welcome to LOUD</h2>
              <p className="text-[15px] font-bold text-black/40 mb-10">Log in or sign up to manage your orders</p>

              {view === 'login-phone' ? (
                <div className="w-full space-y-4">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 border-r border-border pr-3 text-[16px] font-black">+91</div>
                    <input 
                      type="tel" 
                      maxLength={10} 
                      placeholder="Enter mobile number" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} 
                      className="w-full h-14 bg-white border-2 border-border rounded-xl pl-16 font-black text-[16px] outline-none focus:border-black" 
                    />
                  </div>
                  <button onClick={handleContinue} className="w-full h-14 bg-green-700 text-white rounded-xl font-black">Continue</button>
                </div>
              ) : (
                <div className="w-full space-y-6">
                  <div className="flex justify-center gap-3">
                    {[0,1,2,3].map(i => (
                      <input key={i} type="text" maxLength={1} className="w-12 h-14 border-2 border-border rounded-xl text-center font-black text-xl outline-none focus:border-black" />
                    ))}
                  </div>
                  <button onClick={handleVerify} className="w-full h-14 bg-black text-white rounded-xl font-black">Verify & Proceed</button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
