'use client';

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { generateSessionId } from '@/lib/utils';
import { useAuth } from './AuthContext';
import { DeviceType, PricePreference, UserProfileEvent } from '@/lib/types';

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

// Helper to determine price preference from min/max values
const getPricePreference = (minPrice?: number, maxPrice?: number): PricePreference => {
  // Use max price if available, otherwise use min price
  const referencePrice = maxPrice ?? minPrice ?? 0;

  if (referencePrice <= 500) return 'budget';
  if (referencePrice <= 2000) return 'mid';
  if (referencePrice <= 5000) return 'premium';
  return 'luxury';
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
  trackUserProfile: (data: {
    topCategories?: string[];
    minPricePreference?: number;
    maxPricePreference?: number;
    totalOrders?: number;
    totalSpent?: number;
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
  const [sessionCount, setSessionCount] = useState<number>(1);
  const { user } = useAuth();

  useEffect(() => {
    // Generate or retrieve session ID on client side
    setSessionId(generateSessionId());

    // Track session count in localStorage
    const storedCount = localStorage.getItem('cartiq_session_count');
    const newCount = storedCount ? parseInt(storedCount, 10) + 1 : 1;
    localStorage.setItem('cartiq_session_count', newCount.toString());
    setSessionCount(newCount);
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

  const trackUserProfile = useCallback(
    (data: {
      topCategories?: string[];
      minPricePreference?: number;
      maxPricePreference?: number;
      totalOrders?: number;
      totalSpent?: number;
    }) => {
      console.log('trackUserProfile called, user?.id:', user?.id, 'data:', data);

      if (!user?.id) {
        console.warn('trackUserProfile: No user id, skipping');
        return;
      }

      const profileEvent: UserProfileEvent = {
        userId: user.id,
        topCategories: data.topCategories || [],
        pricePreference: getPricePreference(data.minPricePreference, data.maxPricePreference),
        totalOrders: data.totalOrders || 0,
        totalSpent: data.totalSpent || 0,
        sessionCount: sessionCount,
        lastActive: new Date().toISOString(),
      };

      console.log('Sending user profile event:', profileEvent);

      api
        .trackUserProfileEvent(profileEvent)
        .then(() => {
          console.log('User profile event sent successfully');
        })
        .catch((error) => {
          console.error('Failed to track user profile event:', error);
        });
    },
    [user?.id, sessionCount]
  );

  return (
    <EventContext.Provider
      value={{
        sessionId,
        trackPageView,
        trackProductView,
        trackCartEvent,
        trackOrderEvent,
        trackUserProfile,
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
