'use client';

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { generateSessionId } from '@/lib/utils';
import { useAuth } from './AuthContext';

interface EventContextType {
  sessionId: string;
  trackPageView: (pageType: string, pagePath?: string) => void;
  trackProductView: (productId: string, productName: string, category?: string, price?: number) => void;
  trackCartEvent: (data: {
    action: 'ADD' | 'REMOVE' | 'UPDATE' | 'CLEAR';
    productId?: string;
    productName?: string;
    quantity?: number;
    price?: number;
  }) => void;
  trackOrderEvent: (data: {
    action: 'PLACED' | 'CANCELLED' | 'COMPLETED';
    orderId: string;
    orderNumber: string;
    totalAmount: number;
    itemCount: number;
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
  const [sessionId, setSessionId] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    // Generate or retrieve session ID on client side
    setSessionId(generateSessionId());
  }, []);

  const trackPageView = useCallback(
    (pageType: string, pagePath?: string) => {
      if (!sessionId) return;

      api
        .trackUserEvent({
          sessionId,
          userId: user?.id,
          eventType: 'page_view',
          pageType: mapPageType(pageType),
          pagePath: pagePath || (typeof window !== 'undefined' ? window.location.pathname : ''),
        })
        .catch((error) => {
          console.debug('Failed to track page view:', error);
        });
    },
    [sessionId, user?.id]
  );

  const trackProductView = useCallback(
    (productId: string, productName: string, category?: string, price?: number) => {
      if (!sessionId) return;

      api
        .trackProductView({
          sessionId,
          userId: user?.id,
          productId,
          productName,
          category,
          price: price || 0,
        })
        .catch((error) => {
          console.debug('Failed to track product view:', error);
        });
    },
    [sessionId, user?.id]
  );

  const trackCartEvent = useCallback(
    (data: {
      action: 'ADD' | 'REMOVE' | 'UPDATE' | 'CLEAR';
      productId?: string;
      productName?: string;
      quantity?: number;
      price?: number;
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
      totalAmount: number;
      itemCount: number;
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
