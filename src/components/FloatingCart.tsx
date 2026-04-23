'use client';

import { useCart } from '@/context/CartContext';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function FloatingCart() {
  const { totalItems, totalPrice, setIsCartOpen } = useCart();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Tactic 14: Show bubble when user scrolls past 300px and has items
      setIsVisible(window.scrollY > 300 && totalItems > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [totalItems]);

  if (totalItems === 0) return null;

  return (
    <div 
      className={`fixed bottom-[100px] left-1/2 -translate-x-1/2 z-[40] transition-all duration-500 ${
        isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-90 pointer-events-none'
      }`}
    >
      <button 
        onClick={() => setIsCartOpen(true)}
        className="bg-green-700 text-white h-14 px-6 rounded-xl flex items-center gap-6 shadow-[0_20px_50px_rgba(21,128,61,0.3)] active:scale-95 transition-all border border-green-600 hover:bg-green-800"
      >
        <div className="flex flex-col items-start leading-none">
          <span className="text-[12px] font-bold opacity-80 mb-1">{totalItems} {totalItems === 1 ? 'Item' : 'Items'}</span>
          <span className="text-[18px] font-black">₹{totalPrice}</span>
        </div>
        
        <div className="w-[1px] h-8 bg-white/20"></div>

        <div className="flex items-center gap-2">
          <span className="text-[15px] font-black">View Cart</span>
          <ChevronRight size={20} className="text-white/60" />
        </div>
      </button>
    </div>
  );
}
