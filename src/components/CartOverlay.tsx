'use client';

import { useCart } from '@/context/CartContext';
import { useAccount } from '@/context/AccountContext';
import { useUI } from '@/context/UIContext';
import { X, ChevronLeft, Plus, Minus, MapPin, Loader2, Home, Briefcase, ChevronRight, Timer, Ticket, CheckCircle2, ShoppingBag, ShieldCheck, Zap, Navigation, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type CheckoutView = 'cart' | 'address-select' | 'address-add' | 'payment' | 'verifying' | 'success';

export default function CartOverlay() {
  const { cart, totalItems, totalPrice, isCartOpen, setIsCartOpen, updateQuantity, clearCart } = useCart();
  const { addresses, addAddress, user, setIsAccountOpen } = useAccount();
  const { selectedAddress, setIsLocationOpen } = useUI();
  const [view, setView] = useState<CheckoutView>('cart');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [utr, setUtr] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [needsCarryBag, setNeedsCarryBag] = useState(false);
  const [deliverySlot, setDeliverySlot] = useState('Instant');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isCartOpen || !mounted) return null;

  // Finalized Billing Strategy
  const safeTotalPrice = totalPrice || 0;
  const deliveryThreshold = 500;
  const deliveryCharge = safeTotalPrice >= deliveryThreshold ? 0 : 25;
  const handlingCharge = 5;
  const platformFee = 5;
  const carryBagCharge = needsCarryBag ? 5 : 0;
  const gstAmount = Math.round(safeTotalPrice * 0.05);
  const discountAmount = appliedCoupon ? Math.round(safeTotalPrice * 0.3) : 0;
  const grandTotal = safeTotalPrice + deliveryCharge + handlingCharge + platformFee + carryBagCharge + gstAmount - discountAmount;

  // Gamified Threshold Progress
  const progressPercent = Math.min((safeTotalPrice / deliveryThreshold) * 100, 100);
  const remainingForFreeDelivery = deliveryThreshold - safeTotalPrice;

  const handleProceed = async () => {
    if (view === 'cart') {
      setView('address-select');
    } else if (view === 'address-select') {
      if (selectedAddressId) setView('payment');
      else if (selectedAddressId === 'current') setView('payment');
      else alert("Please select an address");
    } else if (view === 'payment') {
      if (utr.length < 12) {
        alert("Please enter a valid 12-digit Transaction ID");
        return;
      }
      setLoading(true);
      setView('verifying');
      
      setTimeout(async () => {
        let addr = addresses.find(a => a.id === selectedAddressId);
        if (selectedAddressId === 'current') {
          addr = { ...selectedAddress, id: 'current', type: 'Current' } as any;
        }
        try {
          await supabase.from('orders').insert([{
            customer_name: user?.name || 'Guest',
            customer_phone: user?.phone || '0000000000',
            total_amount: grandTotal,
            items: cart,
            status: 'Packing',
            utr: utr,
            address: addr,
            coupon: appliedCoupon,
            coupon_discount: discountAmount,
            gst_amount: gstAmount,
            delivery_fee: deliveryCharge,
            platform_fee: platformFee,
            handling_fee: handlingCharge,
            carry_bag_fee: carryBagCharge,
            delivery_slot: deliverySlot
          }]);
          
          setView('success');
          clearCart();
        } catch (err) {
          console.error("Order failed:", err);
          setView('payment');
        } finally {
          setLoading(false);
        }
      }, 8000);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={() => { if(view !== 'verifying' && view !== 'success') setIsCartOpen(false); }} 
      />

      {/* Main Drawer */}
      <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.3)] animate-in slide-in-from-right duration-300">
        
        {/* Header - Tactic 56 Refinement */}
        {view !== 'success' && (
          <div className="bg-white px-6 py-5 flex items-center justify-between border-b border-border z-10">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  if (view === 'cart') setIsCartOpen(false);
                  else if (view === 'address-add') setView('address-select');
                  else if (view === 'payment') setView('address-select');
                  else setView('cart');
                }} 
                disabled={view === 'verifying'}
                className="w-10 h-10 flex items-center justify-center hover:bg-uber-gray active-scale"
              >
                {view === 'cart' ? <X size={24} strokeWidth={2.5} /> : <ChevronLeft size={28} strokeWidth={2.5} />}
              </button>
              <h2 className="text-heading-3">
                {view === 'cart' ? 'Your Cart' : view === 'address-select' ? 'Delivery' : view === 'payment' ? 'Payment' : 'Validating'}
              </h2>
            </div>
            {view === 'cart' && (
              <div className="flex flex-col items-end">
                <span className="text-caption text-brand-success leading-none">Express</span>
                <span className="text-[10px] font-black uppercase tracking-tighter text-black/40">10-15 Mins</span>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto no-scrollbar bg-uber-gray/30">
          {view === 'cart' && (
            <div className="p-5 space-y-5 pb-32">
              
              {/* GAMIFIED THRESHOLD - Tactic 40, 53 */}
              <div className="bg-white border-thin p-5 space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h4 className="text-body-primary flex items-center gap-2">
                      <Zap size={16} className="text-yellow-500 fill-yellow-500" />
                      {remainingForFreeDelivery > 0 
                        ? `₹${remainingForFreeDelivery} more for FREE Delivery` 
                        : "You've unlocked FREE Delivery!"}
                    </h4>
                    <p className="text-body-secondary mt-1">
                      {remainingForFreeDelivery > 0 
                        ? "Shop for more to save on delivery fees" 
                        : "Enjoy elite delivery benefits on this order"}
                    </p>
                  </div>
                  <span className="text-caption text-black/20">₹{deliveryThreshold}</span>
                </div>
                <div className="h-1.5 w-full bg-uber-gray overflow-hidden">
                  <div 
                    className="h-full bg-black transition-all duration-700 ease-out" 
                    style={{ width: `${progressPercent}%` }} 
                  />
                </div>
              </div>

              {/* CART ITEMS */}
              <div className="bg-white border-thin">
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <div key={item.id} className="p-4 border-b border-uber-gray last:border-0 flex items-center gap-5">
                      <div className="w-20 h-20 bg-uber-gray p-2 flex items-center justify-center">
                        <img src={item.image_url} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="text-body-primary leading-tight">{item.name}</h4>
                        <p className="text-body-secondary text-[12px]">{item.weight}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-body-primary">₹{item.discount_price}</span>
                          <span className="text-xs text-black/20 line-through">₹{item.price}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center bg-black text-white px-2 py-1 gap-4">
                          <button onClick={() => updateQuantity(item.id, -1)} className="active-scale"><Minus size={14} /></button>
                          <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="active-scale"><Plus size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-uber-gray mx-auto flex items-center justify-center">
                      <ShoppingBag size={32} className="text-black/10" />
                    </div>
                    <p className="text-body-secondary font-bold">Your cart is empty</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="text-caption text-black border-b-2 border-black pb-1"
                    >
                      Start Shopping
                    </button>
                  </div>
                )}
              </div>

              {/* COUPON SECTION - Tactic 51, 55 */}
              <div className="bg-white border-thin p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <Ticket size={20} className="text-black/40" />
                  <h4 className="text-caption">Coupons & Offers</h4>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter Code" 
                    className="flex-1 bg-uber-gray px-4 h-12 text-sm font-black uppercase tracking-widest placeholder:text-black/20"
                    value={appliedCoupon || ''}
                    onChange={(e) => setAppliedCoupon(e.target.value.toUpperCase())}
                  />
                  <button 
                    onClick={() => setAppliedCoupon('FLAT30')}
                    className="px-6 h-12 bg-uber-gray border border-black/5 text-caption text-black hover:bg-black hover:text-white transition-all active-scale"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon === 'FLAT30' && (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200">
                    <span className="text-xs font-black text-green-700">'FLAT30' applied! You saved ₹{discountAmount}</span>
                    <button onClick={() => setAppliedCoupon(null)} className="text-green-700"><X size={14} /></button>
                  </div>
                )}
              </div>

              {/* CARRY BAG TOGGLE */}
              <div className="bg-white border-thin p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-uber-gray flex items-center justify-center text-black/40">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <h4 className="text-body-primary">Add a carry bag</h4>
                    <p className="text-body-secondary text-[11px]">Recommended for this order</p>
                  </div>
                </div>
                <button 
                  onClick={() => setNeedsCarryBag(!needsCarryBag)}
                  className={`w-14 h-7 relative transition-all active-scale ${needsCarryBag ? 'bg-black' : 'bg-uber-gray'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white transition-all ${needsCarryBag ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {/* BILL DETAILS - Tactic 52, 54 */}
              <div className="bg-white border-thin p-5 space-y-4">
                <h4 className="text-caption">Bill Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-body-secondary">
                    <span>Items total</span>
                    <span className="text-black font-bold">₹{safeTotalPrice}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-xs font-black text-green-700">
                      <span className="flex items-center gap-1">Coupon Discount <span className="px-1.5 py-0.5 bg-green-700 text-white text-[8px]">SAVING</span></span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-body-secondary">
                    <span>Delivery fee</span>
                    <span className={deliveryCharge === 0 ? "text-blue-600 font-bold" : "text-black font-bold"}>
                      {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-body-secondary">
                    <span>Handling & Packaging</span>
                    <span className="text-black font-bold">₹{handlingCharge + platformFee + carryBagCharge}</span>
                  </div>
                  <div className="flex justify-between text-body-secondary">
                    <span>Govt. GST (5%)</span>
                    <span className="text-black font-bold">₹{gstAmount}</span>
                  </div>
                </div>
                
                <div className="pt-5 border-t border-dashed border-black/10 flex justify-between items-center">
                  <span className="text-heading-3">Grand Total</span>
                  <span className="text-heading-3">₹{grandTotal}</span>
                </div>
              </div>

              {/* FOOTER TEXT - Tactic 1. Visual Hierarchy Fix */}
              <div className="pt-4 text-center space-y-4 opacity-30">
                <div className="flex items-center justify-center gap-2">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Secured by DISCO Intelligence</span>
                </div>
                <p className="text-[9px] font-medium leading-relaxed px-10">
                  By proceeding, you agree to our terms and conditions. Delivery times are estimated based on warehouse load.
                </p>
              </div>
            </div>
          )}

          {/* ADDRESS SELECTION */}
          {view === 'address-select' && (
            <div className="p-5 space-y-5 pb-32">
              <button 
                onClick={() => setIsLocationOpen(true)} 
                className="w-full bg-black text-white h-14 flex items-center justify-center gap-3 active-scale"
              >
                <MapPin size={20} />
                <span className="text-caption">Change Current Location</span>
              </button>
              
              <div className="space-y-3">
                <h4 className="text-caption text-black/40">Active Choice</h4>
                {selectedAddress && (
                  <div 
                    onClick={() => setSelectedAddressId('current')}
                    className={`bg-white p-5 border-thin flex gap-5 cursor-pointer transition-all active-scale ${selectedAddressId === 'current' ? 'border-black ring-1 ring-black' : ''}`}
                  >
                    <div className="w-12 h-12 bg-green-50 flex items-center justify-center text-green-600">
                      <Navigation size={24} fill="currentColor" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="text-body-primary font-bold">Detected Location</h4>
                      <p className="text-body-secondary leading-tight">{selectedAddress.title}, {selectedAddress.area}</p>
                    </div>
                    {selectedAddressId === 'current' && <CheckCircle2 className="text-black" size={20} />}
                  </div>
                )}

                <div className="pt-4 border-t border-uber-gray">
                  <h4 className="text-caption text-black/40">Saved Locations</h4>
                </div>
                {addresses.length > 0 ? (
                  addresses.map((addr) => (
                    <div 
                      key={addr.id} 
                      onClick={() => setSelectedAddressId(addr.id)} 
                      className={`bg-white p-5 border-thin flex gap-5 cursor-pointer transition-all active-scale ${selectedAddressId === addr.id ? 'border-black ring-1 ring-black' : ''}`}
                    >
                      <div className="w-12 h-12 bg-uber-gray flex items-center justify-center text-black/40">
                        {addr.type === 'Home' ? <Home size={24} /> : <Briefcase size={24} />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="text-body-primary">{addr.type}</h4>
                        <p className="text-body-secondary leading-tight">{addr.flat}, {addr.area}</p>
                      </div>
                      {selectedAddressId === addr.id && <CheckCircle2 className="text-black" size={20} />}
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-10 border-thin text-center space-y-3">
                    <MapPin className="mx-auto text-black/10" size={32} />
                    <p className="text-body-secondary font-bold">No saved addresses</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PAYMENT VIEW */}
          {view === 'payment' && (
            <div className="p-5 space-y-6 pb-32">
              {/* TIME SLOT SELECTOR */}
              <div className="bg-white border-thin p-5 space-y-4">
                <div className="flex items-center gap-2 text-caption text-black/40 uppercase tracking-widest">
                  <Clock size={16} />
                  Choose Delivery Time
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Instant', label: 'Instant', sub: '12-15 Mins', icon: Zap },
                    { id: 'Morning', label: 'Morning', sub: '7am - 9am', icon: Timer },
                    { id: 'Night', label: 'Late Night', sub: '11pm - 12am', icon: Clock },
                    { id: 'Tomorrow', label: 'Tomorrow', sub: '7am - 8am', icon: CheckCircle2 }
                  ].map((slot) => (
                    <button 
                      key={slot.id}
                      onClick={() => setDeliverySlot(slot.id)}
                      className={`p-3 border-thin text-left transition-all active-scale ${deliverySlot === slot.id ? 'bg-black text-white border-black shadow-lg' : 'bg-white hover:bg-uber-gray'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-black uppercase tracking-tight">{slot.label}</span>
                        <slot.icon size={12} className={deliverySlot === slot.id ? 'text-green-500' : 'text-black/20'} />
                      </div>
                      <p className={`text-[10px] font-bold ${deliverySlot === slot.id ? 'text-white/60' : 'text-black/40'}`}>{slot.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white border-thin p-8 text-center space-y-8">
                <div className="w-56 h-56 bg-white border-thin mx-auto p-4 flex items-center justify-center shadow-inner">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=upi://pay?pa=9441276604@ybl&am=${grandTotal}&cu=INR`} 
                    alt="Scan to Pay" 
                    className="w-full h-full" 
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-heading-2">₹{grandTotal}</h3>
                  <p className="text-body-secondary">Scan with any UPI app to pay</p>
                </div>
              </div>
              
              <div className="bg-white border-thin p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-caption text-black/40">Enter 12-Digit Transaction ID (UTR)</label>
                  <input 
                    type="text" 
                    maxLength={12} 
                    placeholder="0000 0000 0000" 
                    value={utr} 
                    onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))} 
                    className="w-full h-16 bg-uber-gray px-5 text-2xl font-black tracking-[0.2em] placeholder:text-black/5" 
                  />
                </div>
                <p className="text-[11px] text-black/40 font-medium italic">
                  Payment will be manually verified by our warehouse dispatcher.
                </p>
              </div>
            </div>
          )}

          {/* VERIFYING VIEW */}
          {view === 'verifying' && (
            <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-8 bg-white">
              <div className="relative">
                <Loader2 className="animate-spin text-black" size={80} strokeWidth={1} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck size={32} className="text-black/20" />
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-heading-2">Verifying</h2>
                <p className="text-body-secondary max-w-[200px] mx-auto">Connecting to bank nodes for UTR validation...</p>
              </div>
              <div className="w-full max-w-[240px] h-1 bg-uber-gray overflow-hidden">
                <div className="h-full bg-black animate-[progress_8s_linear_forwards]" style={{ width: '100%' }}></div>
              </div>
            </div>
          )}

          {/* SUCCESS VIEW */}
          {view === 'success' && (
            <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-10 bg-white animate-in zoom-in-95 duration-500">
              <div className="w-32 h-32 bg-black text-white flex items-center justify-center shadow-2xl shadow-black/20">
                <CheckCircle2 size={64} strokeWidth={2} />
              </div>
              <div className="space-y-4">
                <h2 className="text-heading-1">Order<br/>Locked</h2>
                <p className="text-body-secondary">Dispatching from nearest warehouse in 120 seconds.</p>
              </div>
              <button 
                onClick={() => { setIsCartOpen(false); setView('cart'); setUtr(''); setIsAccountOpen(true); }} 
                className="w-full h-16 bg-black text-white text-caption active-scale"
              >
                Track Live Order
              </button>
            </div>
          )}
        </div>

        {/* BOTTOM FIXED CTA - Tactic 51, 1. Visual Hierarchy Fix */}
        {(view === 'cart' || view === 'address-select' || view === 'payment') && (
          <div className="p-6 bg-white border-t border-border shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
            <button 
              onClick={handleProceed} 
              disabled={loading}
              className="w-full h-16 bg-black text-white flex items-center justify-between px-8 active-scale disabled:opacity-50 transition-all shadow-xl shadow-black/10"
            >
              <div className="flex flex-col items-start leading-none">
                <span className="text-[18px] font-black">₹{grandTotal}</span>
                <span className="text-[10px] font-black uppercase opacity-40">Total</span>
              </div>
              <div className="flex items-center gap-3 text-caption">
                {view === 'cart' ? 'Proceed to Delivery' : view === 'address-select' ? 'Proceed to Pay' : 'Verify Payment'}
                <ChevronRight size={20} strokeWidth={3} />
              </div>
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
