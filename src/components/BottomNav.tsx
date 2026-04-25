'use client';

import { useCart } from '@/context/CartContext';
import { useAccount } from '@/context/AccountContext';
import { useUI } from '@/context/UIContext';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, User, Zap } from 'lucide-react';

export default function BottomNav() {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, setIsAccountOpen } = useAccount();
  const { setIsSearchOpen } = useUI();
  const router = useRouter();
  const pathname = usePathname();

  const handleHomeClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (pathname !== '/') {
      router.push('/');
    }
    setIsSearchOpen(false);
  };

  const navItemClass = "flex flex-col items-center justify-center gap-1.5 flex-1 h-full transition-all active-scale";
  const iconSize = 22;
  const activeStroke = 3;
  const inactiveStroke = 2.5;

  return (
    <nav className="fixed bottom-0 left-0 w-full h-[84px] bg-white border-t border-border z-50 md:hidden flex items-center justify-between px-2 pb-safe shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
      
      {/* 1. MARKET */}
      <button 
        onClick={handleHomeClick}
        className={`${navItemClass} ${pathname === '/' ? 'text-black' : 'text-black/30'}`}
      >
        <Home 
          size={iconSize} 
          strokeWidth={pathname === '/' ? activeStroke : inactiveStroke} 
        />
        <span className="text-[10px] font-black uppercase tracking-widest">Market</span>
      </button>

      {/* 2. DEALS */}
      <button 
        onClick={() => router.push('/deals')}
        className={`${navItemClass} ${pathname === '/deals' ? 'text-black' : 'text-black/30'}`}
      >
        <div className={`relative ${pathname === '/deals' ? 'text-green-600' : ''}`}>
          <Zap 
            size={iconSize} 
            fill={pathname === '/deals' ? "currentColor" : "none"} 
            strokeWidth={pathname === '/deals' ? activeStroke : inactiveStroke} 
          />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">Deals</span>
      </button>

      {/* 3. SEARCH */}
      <button 
        onClick={() => {
          setIsSearchOpen(true);
          // Force focus with a slight delay for mobile keyboard stability
          setTimeout(() => {
            const input = document.getElementById('global-search-input');
            if (input) input.focus();
          }, 100);
        }}
        className={`${navItemClass} text-black/30 hover:text-black`}
      >
        <Search 
          size={iconSize} 
          strokeWidth={inactiveStroke} 
        />
        <span className="text-[10px] font-black uppercase tracking-widest">Search</span>
      </button>

      {/* 4. ACCOUNT */}
      <button 
        onClick={() => setIsAccountOpen(true)}
        className={`${navItemClass} text-black/30 hover:text-black relative`}
      >
        <User 
          size={iconSize} 
          strokeWidth={inactiveStroke} 
        />
        {user && <div className="absolute top-4 right-1/2 translate-x-4 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />}
        <span className="text-[10px] font-black uppercase tracking-widest">Account</span>
      </button>

      {/* 5. CART */}
      <button 
        onClick={() => setIsCartOpen(true)}
        className={`${navItemClass} text-black/30 hover:text-black relative`}
      >
        <div className="relative">
          <ShoppingBag 
            size={iconSize} 
            strokeWidth={inactiveStroke} 
          />
          {totalItems > 0 && (
            <div className="absolute -top-1.5 -right-2 bg-green-500 text-black text-[9px] font-black w-4 h-4 flex items-center justify-center ring-2 ring-white">
              {totalItems}
            </div>
          )}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">Cart</span>
      </button>

    </nav>
  );
}
