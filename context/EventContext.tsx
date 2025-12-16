'use client';

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { generateSessionId } from '@/lib/utils';
import { useAuth } from './AuthContext';
import { DeviceType } from '@/lib/types';

// Helper to detect device type from user agent
const getDeviceType = (): DeviceType => {
  if (typeof window === 'undefined') return 'desktop';

  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

interface EventContextType {
  sessionId: string;
  trackPageView: (pageType: string, pagePath?: string) => void;
  trackProductView: (productId: string, productName: string, category?: string, price?: number, source?: 'search' | 'category' | 'home' | 'recommendation' | 'direct' | 'cart', searchQuery?: string, viewDurationMs?: number) => void;
  trackCartEvent: (data: {
    action: 'add' | 'remove' | 'update_quantity' | 'clear';
    productId?: string;
    productName?: string;
    category?: string;
    quantity?: number;
    price?: number;
    cartTotal?: number;
    cartItemCount?: number;
  }) => void;
  trackOrderEvent: (data: {
    action: 'PLACED' | 'CANCELLED' | 'COMPLETED';
    orderId: string;
    orderNumber: string;
    items: { productId: string; productName: string; category?: string; quantity: number; price: number }[];
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: 'cod' | 'card' | 'upi' | 'netbanking' | 'wallet';
    status: 'pending' | 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    shippingCity: string;
    shippingState: string;
  }) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

// Map frontend page types to backend enum values (lowercase)
// Backend only accepts: cart, category, product, checkout, home
const PAGE_TYPE_MAP: Record<string, string> = {
  HOME: 'home',
  PRODUCTS: 'product',
  PRODUCT: 'product',
  CART: 'cart',
  CHECKOUT: 'checkout',
  CATEGORY: 'category',
  CHAT: 'home',
  CHAT_FULL: 'home',
  ORDERS: 'home',
  ORDER_DETAIL: 'home',
  LOGIN: 'home',
  REGISTER: 'home',
};

const mapPageType = (pageType: string): string => {
  return PAGE_TYPE_MAP[pageType.toUpperCase()] || 'home';
};

export function EventProvider({ children }: { children: React.ReactNode }) {
  // Initialize sessionId immediately on client-side to avoid race conditions
  const [sessionId, setSessionId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return generateSessionId();
    }
    return '';
  });
  const { user } = useAuth();

  useEffect(() => {
    // Ensure sessionId is set on client side (handles SSR hydration)
    const id = generateSessionId();
    if (id && id !== sessionId) {
      setSessionId(id);
    }
  }, []);

  const trackPageView = useCallback(
    (pageType: string, pagePath?: string) => {
      if (!sessionId) return;

      const currentPath = pagePath || (typeof window !== 'undefined' ? window.location.pathname : '');
      const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
      const referrer = typeof document !== 'undefined' ? document.referrer : '';
      const deviceType = getDeviceType();

      api
        .trackUserEvent({
          sessionId,
          userId: user?.id,
          eventType: 'page_view',
          pageType: mapPageType(pageType),
          pagePath: currentPath,
          pageUrl,
          deviceType,
          referrer: referrer || undefined,
        })
        .catch((error) => {
          console.debug('Failed to track page view:', error);
        });
    },
    [sessionId, user?.id]
  );

  const trackProductView = useCallback(
    (productId: string, productName: string, category?: string, price?: number, source?: 'search' | 'category' | 'home' | 'recommendation' | 'direct' | 'cart', searchQuery?: string, viewDurationMs?: number) => {
      if (!sessionId) return;

      api
        .trackProductView({
          sessionId,
          userId: user?.id,
          productId,
          productName,
          category,
          price: price || 0,
          source,
          searchQuery,
          viewDurationMs,
        })
        .catch((error) => {
          console.debug('Failed to track product view:', error);
        });
    },
    [sessionId, user?.id]
  );

  const trackCartEvent = useCallback(
    (data: {
      action: 'add' | 'remove' | 'update_quantity' | 'clear';
      productId?: string;
      productName?: string;
      category?: string;
      quantity?: number;
      price?: number;
      cartTotal?: number;
      cartItemCount?: number;
    }) => {
      if (!sessionId) return;

      api
        .trackCartEvent({
          sessionId,
          userId: user?.id,
          ...data,
        })
        .catch((error) => {
          console.debug('Failed to track cart event:', error);
        });
    },
    [sessionId, user?.id]
  );

  const trackOrderEvent = useCallback(
    (data: {
      action: 'PLACED' | 'CANCELLED' | 'COMPLETED';
      orderId: string;
      orderNumber: string;
      items: { productId: string; productName: string; category?: string; quantity: number; price: number }[];
      subtotal: number;
      discount: number;
      total: number;
      paymentMethod: 'cod' | 'card' | 'upi' | 'netbanking' | 'wallet';
      status: 'pending' | 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
      shippingCity: string;
      shippingState: string;
    }) => {
      if (!sessionId) return;

      api
        .trackOrderEvent({
          sessionId,
          userId: user?.id,
          ...data,
        })
        .catch((error) => {
          console.debug('Failed to track order event:', error);
        });
    },
    [sessionId, user?.id]
  );

  return (
    <EventContext.Provider
      value={{
        sessionId,
        trackPageView,
        trackProductView,
        trackCartEvent,
        trackOrderEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
}
