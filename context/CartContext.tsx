'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Cart, CartItem } from '@/lib/types';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';
import { useEvent } from './EventContext';

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  itemCount: number;
  addToCart: (productId: string, quantity: number, productName?: string, price?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string, productName?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { trackCartEvent } = useEvent();

  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }

    setIsLoading(true);
    try {
      const cartData = await api.getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Failed to load cart:', error);
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addToCart = async (productId: string, quantity: number, productName?: string, price?: number) => {
    setIsLoading(true);
    try {
      const updatedCart = await api.addToCart({ productId, quantity });
      setCart(updatedCart);

      // Track event
      trackCartEvent({
        action: 'ADD',
        productId,
        productName,
        quantity,
        price,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    setIsLoading(true);
    try {
      const updatedCart = await api.updateCartItem(itemId, { quantity });
      setCart(updatedCart);

      // Track event
      const item = cart?.items.find(i => i.id === itemId);
      trackCartEvent({
        action: 'UPDATE',
        productId: item?.productId,
        productName: item?.productName,
        quantity,
        price: item?.unitPrice,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: string, productName?: string) => {
    setIsLoading(true);
    try {
      const item = cart?.items.find(i => i.id === itemId);
      const updatedCart = await api.removeFromCart(itemId);
      setCart(updatedCart);

      // Track event
      trackCartEvent({
        action: 'REMOVE',
        productId: item?.productId,
        productName: productName || item?.productName,
        quantity: item?.quantity,
        price: item?.unitPrice,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      await api.clearCart();
      setCart(cart ? { ...cart, items: [], totalAmount: 0, totalItems: 0 } : null);

      // Track event
      trackCartEvent({ action: 'CLEAR' });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCart = async () => {
    await loadCart();
  };

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        itemCount,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
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
