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
  productCategoryMap: Record<string, string>;
  addToCart: (productId: string, quantity: number, productName?: string, price?: number, category?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string, productName?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Store product category mapping for event tracking (backend cart doesn't include category)
  const [productCategoryMap, setProductCategoryMap] = useState<Record<string, string>>({});
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

  const addToCart = async (productId: string, quantity: number, productName?: string, price?: number, category?: string) => {
    setIsLoading(true);
    try {
      const updatedCart = await api.addToCart({ productId, quantity });
      setCart(updatedCart);

      // Store category mapping for future event tracking
      if (category) {
        setProductCategoryMap(prev => ({ ...prev, [productId]: category }));
      }

      // Track event
      trackCartEvent({
        action: 'add',
        productId,
        productName,
        category,
        quantity,
        price,
        cartTotal: updatedCart.totalAmount,
        cartItemCount: updatedCart.totalItems,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    setIsLoading(true);
    try {
      const item = cart?.items.find(i => i.id === itemId);
      const updatedCart = await api.updateCartItem(itemId, { quantity });
      setCart(updatedCart);

      // Track event
      trackCartEvent({
        action: 'update_quantity',
        productId: item?.productId,
        productName: item?.productName,
        category: item?.productId ? productCategoryMap[item.productId] : undefined,
        quantity,
        price: item?.unitPrice,
        cartTotal: updatedCart.totalAmount,
        cartItemCount: updatedCart.totalItems,
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
        action: 'remove',
        productId: item?.productId,
        productName: productName || item?.productName,
        category: item?.productId ? productCategoryMap[item.productId] : undefined,
        quantity: item?.quantity,
        price: item?.unitPrice,
        cartTotal: updatedCart.totalAmount,
        cartItemCount: updatedCart.totalItems,
      });

      // Clean up category mapping for removed product
      if (item?.productId) {
        setProductCategoryMap(prev => {
          const { [item.productId]: _, ...rest } = prev;
          return rest;
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      // Capture cart items before clearing for event tracking
      const itemsBeforeClear = cart?.items || [];
      const previousTotal = cart?.totalAmount;
      const previousItemCount = cart?.totalItems;

      await api.clearCart();
      setCart(cart ? { ...cart, items: [], totalAmount: 0, totalItems: 0 } : null);

      // Track remove event for each item being cleared
      itemsBeforeClear.forEach((item, index) => {
        const isLastItem = index === itemsBeforeClear.length - 1;
        trackCartEvent({
          action: 'clear',
          productId: item.productId,
          productName: item.productName,
          category: productCategoryMap[item.productId],
          quantity: item.quantity,
          price: item.unitPrice,
          // Only the last item event shows the final state (empty cart)
          cartTotal: isLastItem ? 0 : previousTotal,
          cartItemCount: isLastItem ? 0 : previousItemCount,
        });
      });

      // If cart was already empty, still send a clear event
      if (itemsBeforeClear.length === 0) {
        trackCartEvent({
          action: 'clear',
          cartTotal: 0,
          cartItemCount: 0,
        });
      }

      // Clear category mapping
      setProductCategoryMap({});
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
        productCategoryMap,
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
