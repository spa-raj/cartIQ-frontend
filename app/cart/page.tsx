'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useEvent } from '@/context/EventContext';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import Button from '@/components/ui/Button';
import { CartItemSkeleton } from '@/components/ui/Loading';

export default function CartPage() {
  const { cart, isLoading, clearCart } = useCart();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { trackPageView } = useEvent();

  useEffect(() => {
    trackPageView('CART', '/cart');
  }, [trackPageView]);

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-surface-900 mb-8">Shopping Cart</h1>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <CartItemSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="h-20 w-20 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-surface-400" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Sign in to view your cart</h1>
          <p className="text-surface-500 mb-6">
            Create an account or sign in to start adding items to your cart.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/login?redirect=/cart">
              <Button variant="primary" size="lg">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register?redirect=/cart">
              <Button variant="outline" size="lg">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart
  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="h-20 w-20 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-surface-400" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Your cart is empty</h1>
          <p className="text-surface-500 mb-6">
            Looks like you haven't added anything to your cart yet. Start exploring our products!
          </p>
          <Link href="/products">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-surface-900">Shopping Cart</h1>
            <p className="text-surface-500 mt-1">
              {cart.totalItems} {cart.totalItems === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearCart()}
            leftIcon={<Trash2 className="h-4 w-4" />}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Clear Cart
          </Button>
        </div>

        {/* Cart Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <CartSummary cart={cart} />
          </div>
        </div>
      </div>
    </div>
  );
}
