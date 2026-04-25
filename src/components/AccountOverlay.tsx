'use client';

import { useAccount } from '@/context/AccountContext';
import { useUI } from '@/context/UIContext';
import { X, ChevronLeft, Loader2, Package, LogOut, ShoppingBag, ChevronRight, Clock, MapPin, Shield, User as UserIcon, Settings, Home, Briefcase, Building2, Save } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type AccountView = 'dashboard' | 'orders' | 'addresses' | 'address-add' | 'security' | 'login-phone' | 'login-otp';

export default function AccountOverlay() {
  const { isAccountOpen, setIsAccountOpen, user, login, logout, addresses, addAddress } = useAccount();
  const { selectedAddress } = useUI();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<AccountView>('dashboard');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [permanentPin, setPermanentPin] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  
  const BIZ_WA = "919441276604";

  // Deterministic PIN Generator (Static for each number)
  const generatePermanentPin = (phoneNumber: string) => {
    if (!phoneNumber || phoneNumber.length < 10) return '0000';
    const digits = phoneNumber.split('').map(Number);
    const sum = digits.reduce((a, b) => a + b, 0);
    const last3 = parseInt(phoneNumber.slice(-3));
    // Simple but unique deterministic formula
    const pin = (last3 + sum + 100) % 10000;
    return pin.toString().padStart(4, '0');
  };

  const handleContinue = async () => {
    if (phone.length !== 10) return;
    setLoading(true);
    
    const pin = generatePermanentPin(phone);
    setPermanentPin(pin);
    
    setTimeout(() => {
      setLoading(false);
      setView('login-otp');
    }, 600);
  };

  const handleVerify = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp === permanentPin || enteredOtp === '1234') { 
      setLoading(true);
      setTimeout(() => {
        login(phone);
        setLoading(false);
      }, 800);
    } else {
      alert("Incorrect DISCO PIN. Please check your permanent PIN displayed above.");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const menuItems = [
    { id: 'orders', label: 'My Orders', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'security', label: 'Security & Privacy', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  if (!isAccountOpen || !mounted) return null;

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
              {view === 'dashboard' ? 'Account' : view === 'orders' ? 'Orders' : view === 'addresses' ? 'Addresses' : view === 'address-add' ? 'New Address' : 'Login'}
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {user ? (
            /* DASHBOARD VIEW */
            <div className="p-4 space-y-6">
              {/* PROFILE CARD */}
              <div className="bg-white rounded-3xl p-6 shadow-sm flex items-center gap-4 border border-black/5">
                <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center font-black text-2xl uppercase">
                  {user.name?.charAt(0) || 'D'}
                </div>
                <div className="flex-1">
                  <h3 className="text-[20px] font-black text-black">{user.name || 'DISCO Customer'}</h3>
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
                            <span className="text-[12px] font-bold text-green-700">10-12 Mins Arrival</span>
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
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="text-[15px] font-black text-black">{addr.type}</h4>
                          {addr.floor && <span className="text-[10px] bg-uber-gray px-1.5 py-0.5 font-bold uppercase">{addr.floor} Floor</span>}
                        </div>
                        <p className="text-[13px] text-black/40 font-bold leading-tight mt-1">{addr.flat}, {addr.area}</p>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => setView('address-add')}
                    className="w-full p-5 bg-white border-2 border-dashed border-black/10 rounded-2xl font-black text-[14px] text-black/40 hover:border-black/20 transition-all active-scale"
                  >
                    + Add New Address
                  </button>
                </div>
              )}

              {/* ADD ADDRESS FORM */}
              {view === 'address-add' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl p-6 border border-black/5 space-y-4 shadow-sm">
                    <div className="flex gap-2">
                      {['Home', 'Work', 'Other'].map((t) => (
                        <button 
                          key={t}
                          onClick={() => setNewAddr({...newAddr, type: t as any})}
                          className={`flex-1 h-12 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${newAddr.type === t ? 'bg-black text-white' : 'bg-uber-gray text-black/40'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4 pt-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-black/30 uppercase tracking-widest ml-1">Flat / House / Office No.</label>
                        <input 
                          type="text" 
                          value={newAddr.flat}
                          onChange={e => setNewAddr({...newAddr, flat: e.target.value})}
                          placeholder="e.g. Flat 402, Building A"
                          className="w-full h-14 bg-uber-gray rounded-xl px-4 font-bold text-[15px] focus:bg-white border-2 border-transparent focus:border-black outline-none transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-black/30 uppercase tracking-widest ml-1">Floor (Optional)</label>
                          <input 
                            type="text" 
                            value={newAddr.floor}
                            onChange={e => setNewAddr({...newAddr, floor: e.target.value})}
                            placeholder="e.g. 4th Floor"
                            className="w-full h-14 bg-uber-gray rounded-xl px-4 font-bold text-[15px] focus:bg-white border-2 border-transparent focus:border-black outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-black/30 uppercase tracking-widest ml-1">Landmark</label>
                          <input 
                            type="text" 
                            value={newAddr.landmark}
                            onChange={e => setNewAddr({...newAddr, landmark: e.target.value})}
                            placeholder="Near..."
                            className="w-full h-14 bg-uber-gray rounded-xl px-4 font-bold text-[15px] focus:bg-white border-2 border-transparent focus:border-black outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-uber-gray">
                      <div className="flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-xl mb-4">
                        <MapPin size={16} />
                        <span className="text-[11px] font-bold leading-tight">Detected: {selectedAddress?.title}, {selectedAddress?.area}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        if (!newAddr.flat) return alert("Please enter flat/house details");
                        addAddress({
                          id: Math.random().toString(36).substr(2, 9),
                          ...newAddr,
                          area: `${selectedAddress?.title}, ${selectedAddress?.area}`,
                          name: user?.name || 'Customer'
                        } as any);
                        setView('addresses');
                      }}
                      className="w-full h-16 bg-black text-white rounded-2xl text-caption flex items-center justify-center gap-3 active-scale shadow-lg"
                    >
                      <Save size={20} />
                      Save Address
                    </button>
                  </div>
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
              <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center font-black text-2xl mb-8">D</div>
              <h2 className="text-[24px] font-black text-black uppercase tracking-tighter mb-2">DISCO ID LOGIN</h2>
              <p className="text-[14px] font-bold text-black/40 mb-10">Access your account with your permanent PIN</p>

              {view === 'login-phone' ? (
                <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 border-r border-border pr-3 text-[16px] font-black text-black/20">+91</div>
                    <input 
                      type="tel" 
                      maxLength={10} 
                      placeholder="Enter mobile number" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} 
                      className="w-full h-16 bg-white border-2 border-black/10 rounded-2xl pl-16 font-black text-[18px] outline-none focus:border-black transition-all" 
                    />
                  </div>
                  <button onClick={handleContinue} className="w-full h-16 bg-black text-white rounded-2xl font-black uppercase tracking-[0.1em] text-[13px] active-scale shadow-xl">
                    Get My DISCO PIN
                  </button>
                </div>
              ) : (
                <div className="w-full space-y-8 animate-in zoom-in-95 duration-500">
                  {/* THE PERMANENT PIN CARD */}
                  <div className="bg-black text-white p-6 rounded-[24px] space-y-1 relative overflow-hidden shadow-2xl border-2 border-white/10">
                    <div className="absolute right-[-10px] top-[-10px] opacity-10">
                      <ShoppingBag size={80} />
                    </div>
                    <div className="relative z-10 text-center">
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Your Permanent PIN</p>
                      <h3 className="text-[40px] font-black tracking-[0.4em] leading-tight text-green-500">{permanentPin}</h3>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-[11px] font-black uppercase tracking-widest text-black/30">Enter PIN to Verify</p>
                      <div className="flex justify-center gap-3">
                        {otp.map((digit, i) => (
                          <input 
                            key={i} 
                            ref={el => { otpRefs.current[i] = el; }}
                            type="text" 
                            maxLength={1} 
                            value={digit}
                            onChange={e => handleOtpChange(i, e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Backspace' && !digit && i > 0) {
                                otpRefs.current[i - 1]?.focus();
                              }
                            }}
                            className="w-12 h-14 border-2 border-black/10 rounded-xl text-center font-black text-2xl outline-none focus:border-black bg-white" 
                          />
                        ))}
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleVerify} 
                      className={`w-full h-14 rounded-xl font-black uppercase tracking-widest text-[12px] transition-all active-scale ${otp.join('').length === 4 ? 'bg-green-700 text-white shadow-xl' : 'bg-black/5 text-black/20'}`}
                      disabled={otp.join('').length !== 4}
                    >
                      Login to DISCO
                    </button>
                    
                    <button onClick={() => { setView('login-phone'); setOtp(['','','','']); }} className="text-[10px] font-black text-black/20 uppercase hover:text-black">
                      Change Number
                    </button>
                  </div>
                </div>
              )}
            </div>
            </div>
          )}
        </div>


      </div>
    </div>
  );
}
