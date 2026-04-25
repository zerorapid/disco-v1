'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  discount_price: number;
  image_url: string;
  quantity: number;
  weight: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  totalPrice: number;
  discount: number;
  deliveryFee: number;
  platformFee: number;
  paperBagFee: number;
  addPaperBag: boolean;
  setAddPaperBag: (val: boolean) => void;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => boolean;
  freeDeliveryThreshold: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addPaperBag, setAddPaperBag] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const freeDeliveryThreshold = 100;
  const platformFee = 15;

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('disco_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('disco_cart', JSON.stringify(cart));
  }, [cart]);

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const applyCoupon = (code: string) => {
    if (code.toUpperCase() === 'FLAT30' && subtotal >= 100) {
      setAppliedCoupon('FLAT30');
      return true;
    }
    return false;
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setAddPaperBag(false);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.discount_price * item.quantity), 0);
  
  const discount = appliedCoupon === 'FLAT30' ? Math.floor(subtotal * 0.3) : 0;
  const deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : 34;
  const paperBagFee = addPaperBag ? 5 : 0;
  
  const totalPrice = subtotal - discount + deliveryFee + platformFee + paperBagFee;

  // Auto-remove coupon if subtotal falls below threshold
  useEffect(() => {
    if (appliedCoupon === 'FLAT30' && subtotal < 100) {
      setAppliedCoupon(null);
    }
  }, [subtotal, appliedCoupon]);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      totalItems, 
      subtotal,
      totalPrice,
      discount,
      deliveryFee,
      platformFee,
      paperBagFee,
      addPaperBag,
      setAddPaperBag,
      appliedCoupon,
      applyCoupon,
      freeDeliveryThreshold,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
