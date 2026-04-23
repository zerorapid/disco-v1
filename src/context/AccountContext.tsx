'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  name: string;
  phone: string;
  isAdmin: boolean;
}

interface Address {
  id: string;
  type: 'Home' | 'Work' | 'Hotel' | 'Other';
  flat: string;
  floor: string;
  area: string;
  landmark: string;
  name: string;
  phone: string;
}

interface AccountContextType {
  user: User | null;
  addresses: Address[];
  login: (phone: string, name?: string) => void;
  logout: () => void;
  addAddress: (addr: Address) => void;
  isAccountOpen: boolean;
  setIsAccountOpen: (isOpen: boolean) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const BIZ_WA = "919441276604";

  useEffect(() => {
    const savedUser = localStorage.getItem('loud_user');
    const savedAddrs = localStorage.getItem('loud_addrs');
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedAddrs) setAddresses(JSON.parse(savedAddrs));
  }, []);

  const login = (phone: string, name: string = "LOUD Customer") => {
    const newUser = {
      name,
      phone,
      isAdmin: phone.includes(BIZ_WA) || phone === "9441276604"
    };
    setUser(newUser);
    localStorage.setItem('loud_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('loud_user');
  };

  const addAddress = (addr: Address) => {
    const newAddrs = [...addresses, addr];
    setAddresses(newAddrs);
    localStorage.setItem('loud_addrs', JSON.stringify(newAddrs));
  };

  return (
    <AccountContext.Provider value={{ 
      user, 
      addresses, 
      login, 
      logout, 
      addAddress, 
      isAccountOpen, 
      setIsAccountOpen 
    }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
}
