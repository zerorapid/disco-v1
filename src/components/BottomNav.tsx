'use client';

import { useCart } from '@/context/CartContext';
import { useAccount } from '@/context/AccountContext';
import { useUI } from '@/context/UIContext';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Search, ShoppingBag, User, Zap, MessageCircleQuestion } from 'lucide-react';

export default function BottomNav() {
  const { totalItems, setIsCartOpen } = useCart();
  const { setIsAccountOpen } = useAccount();
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

  const navItemClass = "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all active-scale";

  return (
    <nav className="fixed bottom-0 left-0 w-full h-[84px] bg-white border-t border-border z-50 md:hidden flex items-center justify-between px-2 pb-safe shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
      
      {/* 1. MARKET */}
      <button 
        onClick={handleHomeClick}
        className={`${navItemClass} ${pathname === '/' ? 'text-black' : 'text-black/30'}`}
      >
        <Home size={22} strokeWidth={pathname === '/' ? 3 : 2} />
        <span className="text-[10px] font-black uppercase tracking-widest">Market</span>
      </button>

      {/* 2. DEALS */}
      <button 
        onClick={() => router.push('/deals')}
        className={`${navItemClass} ${pathname === '/deals' ? 'text-black' : 'text-black/30'}`}
      >
        <div className={`relative ${pathname === '/deals' ? 'text-green-600' : ''}`}>
          <Zap size={22} fill={pathname === '/deals' ? "currentColor" : "none"} strokeWidth={3} />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">Deals</span>
      </button>

      {/* 3. SUPPORT */}
      <button 
        onClick={() => {
          // Trigger the floating support chat bubble
          const supportBtn = document.getElementById('support-trigger');
          if (supportBtn) supportBtn.click();
        }}
        className={`${navItemClass} text-black/30 hover:text-black`}
      >
        <MessageCircleQuestion size={22} strokeWidth={2.5} />
        <span className="text-[10px] font-black uppercase tracking-widest">Support</span>
      </button>

      {/* 4. DISCOVER */}
      <button 
        onClick={() => setIsSearchOpen(true)}
        className={`${navItemClass} text-black/30`}
      >
        <div className="w-6 h-6 border-2 border-current flex items-center justify-center text-[10px] font-black">AI</div>
        <span className="text-[10px] font-black uppercase tracking-widest">Discover</span>
      </button>

    </nav>
  );
}
