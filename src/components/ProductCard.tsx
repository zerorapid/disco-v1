'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Minus, Plus } from 'lucide-react';

import { usePathname, useRouter } from 'next/navigation';

interface ProductProps {
  product: {
    id: number;
    name: string;
    price: number;
    discount_price: number;
    image_url: string;
    weight: string;
    stock: number;
  };
}

export default function ProductCard({ product }: ProductProps) {
  const router = useRouter();
  const { cart, addToCart, updateQuantity } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const cartItem = cart.find(item => item.id === product.id);

  const titleCase = (str: string) => {
    if (!str) return "";
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdding) return;
    
    setIsAdding(true);
    addToCart(product);

    // LOG ACTIVITY
    const userJson = localStorage.getItem('disco_user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        const { supabase } = await import('@/lib/supabase');
        await supabase.from('user_activity').insert({
          customer_phone: user.phone,
          action: 'CART_ADD',
          details: { product_id: product.id, name: product.name }
        });
      } catch (err) {}
    }
    
    // Tactic 44: Double-Tap Protection
    setTimeout(() => setIsAdding(false), 500);
  };

  const formatWeight = (weight: string) => {
    const numeric = parseInt(weight);
    if (isNaN(numeric)) return weight;
    if (numeric >= 1000) return `${numeric / 1000} kg`;
    return `${numeric} g`;
  };

  const discountPercent = product.price > product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100) 
    : 0;

  return (
    <div 
      className="group bg-white flex flex-col h-full border border-border hover:shadow-lg transition-all duration-300 cursor-pointer relative"
      onClick={() => router.push(`/product/${product.id}`)}
    >
      {/* DISCOUNT BADGE - WCAG AA Contrast */}
      {discountPercent > 0 && (
        <div className="absolute top-4 left-0 z-20 bg-green-800 text-white font-black text-xs px-3 py-1 shadow-md uppercase tracking-wider">
          {discountPercent}% OFF
        </div>
      )}

      {/* IMAGE SECTION - COMPACT 4:3 */}
      <div className="relative aspect-[4/3] md:aspect-square overflow-hidden bg-uber-gray p-2 md:p-6">
        <img 
          src={product.image_url} 
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
        />
        
        {product.stock > 0 && product.stock < 10 && (
          <div className="absolute bottom-0 left-0 w-full bg-red-700 text-white text-xs font-black py-1 px-3 uppercase tracking-tighter">
            Only {product.stock} Units Remaining
          </div>
        )}
      </div>
      
      {/* INFO SECTION - HIGH DENSITY */}
      <div className="p-4 md:p-6 flex flex-col flex-1">
        <h3 className="font-bold text-base leading-tight text-black line-clamp-2 mb-2 min-h-[3em]">
          {titleCase(product.name)}
        </h3>
        
        <p className="text-sm font-medium text-muted mb-4">
          {formatWeight(product.weight)}
        </p>
        
        <div className="mt-auto">
          <div className="flex items-end gap-2 mb-4">
            <span className="text-xl md:text-2xl font-black text-black">₹{product.discount_price}</span>
            {discountPercent > 0 && (
              <span className="text-sm text-black/30 line-through font-medium mb-0.5">₹{product.price}</span>
            )}
          </div>
          
          <div className="relative h-12 md:h-14 w-full">
            {cartItem ? (
              <div className="absolute inset-0 flex items-center bg-green-800 text-white font-black animate-in fade-in zoom-in-95 duration-200">
                <button 
                  onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, -1); }}
                  className="w-14 h-full hover:bg-white/10 transition-colors flex items-center justify-center border-r border-white/10 active-scale"
                  aria-label="Decrease quantity"
                >
                  <span className="material-symbols-outlined text-xl">remove</span>
                </button>
                <span className="flex-1 text-center text-base">{cartItem.quantity}</span>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (cartItem.quantity >= 5) return;
                    updateQuantity(product.id, 1); 
                  }}
                  disabled={cartItem.quantity >= 5}
                  className={`w-14 h-full hover:bg-white/10 transition-colors flex items-center justify-center border-l border-white/10 active-scale ${cartItem.quantity >= 5 ? 'opacity-20 cursor-not-allowed' : ''}`}
                  aria-label="Increase quantity"
                >
                  <span className="material-symbols-outlined text-xl">add</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={handleAdd}
                disabled={isAdding}
                className={`absolute inset-0 w-full bg-white border-2 border-green-800 text-green-800 font-black text-xs uppercase tracking-widest hover:bg-green-50 transition-all flex items-center justify-center gap-2 active-scale ${isAdding ? 'opacity-50' : ''}`}
              >
                <span>{isAdding ? 'Sourcing...' : 'Add to Cart'}</span>
                {!isAdding && <span className="material-symbols-outlined text-lg">add</span>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
