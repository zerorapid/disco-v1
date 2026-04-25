'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAccount } from '@/context/AccountContext';
import Header from '@/components/Header';
import { CreditCard, Truck, ShieldCheck, CheckCircle2, Receipt, Tag, Leaf, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function CheckoutPage() {
  const { 
    cart, 
    subtotal,
    totalPrice, 
    discount,
    deliveryFee,
    platformFee,
    paperBagFee,
    appliedCoupon,
    clearCart 
  } = useCart();
  
  const { user, addresses, setIsAccountOpen } = useAccount();
  
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [selectedAddrIdx, setSelectedAddrIdx] = useState<number>(-1);
  const [utr, setUtr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // If user is not logged in, force open account overlay
  useEffect(() => {
    if (!user) {
      setIsAccountOpen(true);
    }
  }, [user]);

  const handlePlaceOrder = async () => {
    if (!user) {
      setIsAccountOpen(true);
      return;
    }

    if (!utr && step === 'payment') {
      alert('Please enter your UPI UTR (Transaction ID)');
      return;
    }

    setLoading(true);
    
    // Create order in Supabase with Elite metadata
    const { data, error } = await supabase.from('orders').insert([{
      customer_name: user.name,
      customer_phone: user.phone,
      total_amount: totalPrice,
      items: cart,
      status: 'Packing',
      utr: utr,
      address: addresses[selectedAddrIdx] || { type: 'Other', flat: 'Disco Hub', floor: '1', area: 'Disco Main Road', landmark: 'Hyderabad', name: user.name, phone: user.phone },
      discount_applied: discount,
      discount_tier: appliedCoupon ? `30% (${appliedCoupon})` : '0%',
    }]).select();

    if (!error && data) {
      setStep('success');
      clearCart();
    } else {
      alert('Order failed. Please try again.');
    }
    setLoading(false);
  };

  if (cart.length === 0 && step !== 'success') {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <h1 className="font-black text-[32px] mb-4 uppercase">Your basket is empty</h1>
        <button 
          onClick={() => router.push('/')}
          className="bg-black text-white px-12 py-4 font-black uppercase tracking-widest"
        >
          Back to Store
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <div className="pt-32 pb-32 max-width max-w-4xl">
        {/* STEPS INDICATOR */}
        <div className="flex items-center gap-4 mb-16 overflow-x-auto no-scrollbar">
          <div className={`flex items-center gap-3 flex-shrink-0 ${step === 'info' ? 'opacity-100' : 'opacity-30'}`}>
            <span className="w-8 h-8 flex items-center justify-center border-2 border-black font-black text-[12px]">01</span>
            <span className="font-black uppercase tracking-widest text-[11px]">Delivery</span>
          </div>
          <div className="w-12 h-[2px] bg-border flex-shrink-0"></div>
          <div className={`flex items-center gap-3 flex-shrink-0 ${step === 'payment' ? 'opacity-100' : 'opacity-30'}`}>
            <span className="w-8 h-8 flex items-center justify-center border-2 border-black font-black text-[12px]">02</span>
            <span className="font-black uppercase tracking-widest text-[11px]">Payment</span>
          </div>
          <div className="w-12 h-[2px] bg-border flex-shrink-0"></div>
          <div className={`flex items-center gap-3 flex-shrink-0 ${step === 'success' ? 'opacity-100' : 'opacity-30'}`}>
            <span className="w-8 h-8 flex items-center justify-center border-2 border-black font-black text-[12px]">03</span>
            <span className="font-black uppercase tracking-widest text-[11px]">Success</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-16">
          {/* LEFT: FORM */}
          <div className="lg:col-span-3 space-y-12">
            {step === 'info' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <h2 className="!text-3xl mb-8 font-black uppercase tracking-tighter">Delivery Location</h2>
                
                <div className="space-y-4">
                  {addresses.length === 0 ? (
                    <div className="border-4 border-black p-8 bg-uber-gray flex flex-col items-center text-center">
                      <p className="font-bold text-[14px] uppercase mb-4">No saved addresses found</p>
                      <button 
                        onClick={() => setIsAccountOpen(true)}
                        className="bg-black text-white px-8 py-3 font-black uppercase text-[10px] tracking-widest"
                      >
                        Add Address in Profile
                      </button>
                    </div>
                  ) : (
                    addresses.map((addr, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setSelectedAddrIdx(idx)}
                        className={`border-4 p-8 relative overflow-hidden cursor-pointer transition-all ${selectedAddrIdx === idx ? 'border-black bg-white' : 'border-border bg-uber-gray hover:border-black/20'}`}
                      >
                        <div className="relative z-10">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-[18px] mb-2 uppercase">{addr.type} Spot</p>
                              <p className="text-muted text-[13px] font-bold uppercase tracking-widest">
                                {addr.flat}, {addr.floor}, {addr.area}
                              </p>
                            </div>
                            {selectedAddrIdx === idx && <CheckCircle2 className="text-black" size={24} />}
                          </div>
                        </div>
                        <Truck size={120} className="absolute -right-8 -bottom-8 opacity-5 text-black" />
                      </div>
                    ))
                  )}
                </div>
                
                <div className="mt-12 space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest mb-2 text-muted">Phone Number</label>
                    <input 
                      type="tel"
                      disabled
                      value={user?.phone || ''}
                      className="w-full h-14 border border-border px-6 font-bold bg-uber-gray outline-none transition-colors"
                    />
                  </div>
                  <button 
                    onClick={() => setStep('payment')}
                    disabled={selectedAddrIdx === -1}
                    className="w-full bg-black text-white h-16 font-black uppercase tracking-widest hover:bg-gray-900 transition-colors disabled:opacity-20"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            )}

            {step === 'payment' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <h2 className="!text-3xl mb-8 font-black uppercase tracking-tighter">Instant UPI Transfer</h2>
                <div className="border border-border p-8 text-center space-y-8">
                  <div className="w-48 h-48 bg-white border-2 border-black mx-auto flex items-center justify-center p-4">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('upi://pay?pa=9441276604@ybl&pn=DISCO%20COMMERCE&am=' + totalPrice)}`} 
                      alt="UPI QR Code" 
                      className="w-full h-full"
                    />
                  </div>
                  <div>
                    <p className="font-black text-[24px] mb-1 uppercase">Scan & Pay ₹{totalPrice}</p>
                    <p className="text-muted text-[11px] font-bold uppercase tracking-widest">To: 9441276604@ybl</p>
                  </div>
                  
                  <div className="text-left space-y-4">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-muted">Enter 12-Digit UTR / Transaction ID</label>
                    <input 
                      required
                      placeholder="e.g. 4123..."
                      maxLength={12}
                      className="w-full h-14 border border-black px-6 font-bold outline-none focus:ring-2 focus:ring-black/5"
                      value={utr}
                      onChange={(e) => setUtr(e.target.value.replace(/[^0-9]/g, ''))}
                    />
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                      * Required for order dispatch
                    </p>
                  </div>

                  <button 
                    onClick={handlePlaceOrder}
                    disabled={loading || utr.length < 12}
                    className="w-full bg-black text-white h-16 font-black uppercase tracking-widest hover:bg-gray-900 transition-colors flex items-center justify-center gap-4 disabled:opacity-20"
                  >
                    {loading ? 'Verifying...' : 'Complete Order'}
                    {!loading && <ShieldCheck size={20} />}
                  </button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="animate-in fade-in zoom-in duration-700 text-center space-y-8 py-12">
                <div className="w-24 h-24 bg-green-500 text-white rounded-full mx-auto flex items-center justify-center">
                  <CheckCircle2 size={48} />
                </div>
                <div>
                  <h2 className="!text-4xl mb-4 font-black uppercase tracking-tighter">Order Locked In</h2>
                  <p className="text-muted text-[13px] font-bold uppercase tracking-widest">Your delivery is being packed at Disco Warehouse.</p>
                </div>
                <button 
                  onClick={() => router.push('/')}
                  className="bg-black text-white px-12 py-5 font-black uppercase tracking-widest hover:bg-gray-900"
                >
                  Back to Store
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: SUMMARY */}
          {step !== 'success' && (
            <div className="lg:col-span-2">
              <div className="border border-border p-8 sticky top-32 space-y-8">
                <div>
                  <h3 className="font-black uppercase tracking-widest text-[12px] mb-8 pb-4 border-b border-border">Order Summary</h3>
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="font-bold text-[14px] leading-tight">{item.name}</p>
                          <p className="text-[10px] text-muted font-bold uppercase">{item.quantity} x {item.weight}g</p>
                        </div>
                        <span className="font-black text-[14px]">₹{item.discount_price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4 pt-8 border-t-4 border-black">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-muted">
                    <span>Subtotal</span>
                    <span className="text-black">₹{subtotal}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-green-600">
                      <span>Discount ({appliedCoupon})</span>
                      <span>- ₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-muted">
                    <span>Delivery Fee</span>
                    <span className={deliveryFee === 0 ? 'text-green-600 font-black' : 'text-black font-black'}>
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-muted">
                    <span>Platform Fee</span>
                    <span className="text-black">₹{platformFee}</span>
                  </div>
                  {paperBagFee > 0 && (
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-muted">
                      <span>Paper Bag</span>
                      <span className="text-black">₹{paperBagFee}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-end pt-4 border-t border-border">
                    <span className="font-black uppercase tracking-tighter text-[16px]">To Pay</span>
                    <span className="font-black text-[32px] leading-none">₹{totalPrice}</span>
                  </div>
                </div>

                {discount > 0 && (
                  <div className="bg-green-50 p-4 border border-green-100 flex items-center gap-3">
                    <Tag className="text-green-600" size={16} />
                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">
                      Elite Savings: ₹{discount + (deliveryFee === 0 ? 34 : 0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
