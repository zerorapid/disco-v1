'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface UIContextType {
  isSearchOpen: boolean;
  setIsSearchOpen: (isOpen: boolean) => void;
  isLocationOpen: boolean;
  setIsLocationOpen: (isOpen: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (isOpen: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedAddress: { title: string; area: string };
  setSelectedAddress: (addr: { title: string; area: string }) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAddress, setSelectedAddress] = useState({ 
    title: "Warehouse S4", 
    area: "Sector 1, Delivery Hub" 
  });

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('disco_location');
    if (saved) {
      setSelectedAddress(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage when changed
  const handleSetAddress = (addr: { title: string; area: string }) => {
    setSelectedAddress(addr);
    localStorage.setItem('disco_location', JSON.stringify(addr));
  };

  // Tactic 19, 81: Modal Back-Button Hijacking
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // If we're navigating back and drawers are open, close them
      if (isSearchOpen || isLocationOpen || isNotificationsOpen) {
        setIsSearchOpen(false);
        setIsLocationOpen(false);
        setIsNotificationsOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // When a drawer opens, push a dummy state
    if (isSearchOpen || isLocationOpen || isNotificationsOpen) {
      window.history.pushState({ drawer: 'open' }, '');
    }

    // Tactic 28: No-Scroll Body Lock
    if (isSearchOpen || isLocationOpen || isNotificationsOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    } else {
      document.body.style.overflow = '';
      document.body.style.height = '';
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.body.style.overflow = '';
    };
  }, [isSearchOpen, isLocationOpen, isNotificationsOpen]);

  return (
    <UIContext.Provider value={{ 
      isSearchOpen, 
      setIsSearchOpen,
      isLocationOpen,
      setIsLocationOpen,
      isNotificationsOpen,
      setIsNotificationsOpen,
      searchQuery,
      setSearchQuery,
      selectedAddress,
      setSelectedAddress: handleSetAddress
    }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
