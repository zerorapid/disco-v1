'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAccount } from '@/context/AccountContext';
import { useUI } from '@/context/UIContext';
import { ShoppingBag, Search, User, X, MapPin, Zap, Bell, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  
  const { totalItems, setIsCartOpen } = useCart();
  const { user, setIsAccountOpen, addresses } = useAccount();
  const { isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery, setIsNotificationsOpen, selectedAddress, setIsLocationOpen } = useUI();
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // ACTIVITY LOGGING
  useEffect(() => {
    const logSearch = async () => {
      if (searchQuery.length < 3) return;
      const timer = setTimeout(async () => {
        try {
          await supabase.from('search_logs').insert({
            query: searchQuery,
            customer_phone: user?.phone || null
          });
          if (user?.phone) {
            await supabase.from('user_activity').insert({
              customer_phone: user.phone,
              action: 'SEARCH',
              details: { query: searchQuery }
            });
          }
        } catch (err) {}
      }, 1000);
      return () => clearTimeout(timer);
    };
    logSearch();
  }, [searchQuery, user]);

  const activeAddress = selectedAddress || { title: "DISCO Warehouse", area: "Industrial Area" };

  // STORE HOURS LOGIC (6 AM - 11 PM)
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  useEffect(() => {
    const checkStoreStatus = () => {
      const hour = new Date().getHours();
      setIsStoreOpen(hour >= 6 && hour < 23);
    };
    checkStoreStatus();
    const timer = setInterval(checkStoreStatus, 60000);
    return () => clearInterval(timer);
  }, []);

  if (isAdmin) {
    return (
      <header className="fixed top-0 left-0 w-full h-16 z-50 bg-black text-white flex items-center px-6 justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-green-400 shrink-0" size={24} />
          <h1 className="text-base md:text-lg font-black uppercase tracking-tight truncate">Command Center</h1>
        </div>
        <div className="flex items-center gap-6">
          <a href="/" className="text-xs md:text-sm font-black uppercase border-b-2 border-white/20 hover:border-white transition-all shrink-0">Storefront</a>
        </div>
      </header>
    );
  }

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b border-border bg-white/80 backdrop-blur-xl ${
        isScrolled ? 'h-16' : 'h-16 md:h-20'
      }`}
    >
      <div className="max-width h-full flex items-center justify-between gap-4">
        
        {/* LEFT: LOCATION / LOGO - Tactic 32, 40 */}
        {!isSearchOpen && (
          <div 
            className="flex flex-col cursor-pointer group active-scale flex-1 min-w-0"
            onClick={() => setIsLocationOpen(true)}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold text-muted uppercase tracking-wider">Delivery to</span>
              {isStoreOpen ? (
                <div className="bg-green-800 text-white text-[10px] font-black px-2 py-0.5 animate-pulse-slow flex items-center gap-1">
                  <Zap size={10} fill="white" />
                  12 MINS
                </div>
              ) : (
                <div className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 flex items-center gap-1">
                  CLOSED
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 group-hover:gap-2 transition-all">
              <h2 className="text-sm md:text-base font-black text-black uppercase tracking-tight truncate">
                {activeAddress.title}, {activeAddress.area}
              </h2>
              <MapPin size={16} className="shrink-0 text-black/20 group-hover:text-black transition-colors" />
            </div>
          </div>
        )}

        {/* CENTER: SEARCH - Tactic 35, 37, 50 */}
        <div 
          className={`transition-all duration-500 relative ${
            isSearchOpen ? 'flex-1' : 'w-10 md:w-64 lg:w-96'
          }`}
        >
          <div className={`relative flex items-center ${isSearchOpen ? 'w-full' : 'w-full'}`}>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search Milk, Eggs, Bread..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              className={`w-full bg-uber-gray h-10 md:h-12 px-10 text-sm font-bold placeholder:text-black/20 transition-all ${
                isSearchOpen ? 'border-2 border-black bg-white shadow-xl' : 'border border-transparent'
              } ${!isSearchOpen && 'md:block hidden'}`}
            />
            <Search 
              className={`absolute left-3 transition-colors ${isSearchOpen ? 'text-black' : 'text-black/30'}`} 
              size={18} 
            />
            
            {/* Mobile Search Trigger */}
            <button 
              className={`md:hidden absolute inset-0 flex items-center justify-center ${isSearchOpen ? 'hidden' : 'flex'}`}
              onClick={() => setIsSearchOpen(true)}
            >
              <Search size={24} className="text-black" />
            </button>

            {isSearchOpen && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="absolute right-3 w-6 h-6 flex items-center justify-center hover:bg-uber-gray"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* DESKTOP DEALS LINK */}
        {!isSearchOpen && (
          <a 
            href="/deals"
            className="hidden lg:flex items-center gap-4 h-14 px-6 bg-green-50 hover:bg-green-100 border-2 border-green-200 transition-all active-scale group"
          >
            <div className="relative">
              <Zap size={22} className="text-green-800" fill="currentColor" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-green-800 uppercase leading-none mb-0.5">Loot Active</span>
              <span className="text-base font-black text-black uppercase tracking-tighter leading-tight">₹1 Deals</span>
            </div>
          </a>
        )}

        {/* RIGHT: ACTIONS */}
        {!isSearchOpen && (
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {/* Notification Bell */}
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-uber-gray transition-colors active-scale relative"
            >
              <Bell size={24} className="text-black" />
              <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            </button>

            {/* Account Icon */}
            <button 
              onClick={() => setIsAccountOpen(true)}
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center hover:bg-uber-gray transition-colors active-scale relative"
            >
              <User size={24} className="text-black" />
              {user && <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />}
            </button>

            {/* Cart Button - Tactic 41, 51 */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="h-10 md:h-12 bg-black text-white px-3 md:px-5 flex items-center gap-3 active-scale shadow-lg shadow-black/10"
            >
              <ShoppingBag size={20} strokeWidth={2.5} />
              {totalItems > 0 && (
                <span className="text-[14px] md:text-[16px] font-black border-l border-white/20 pl-3">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
