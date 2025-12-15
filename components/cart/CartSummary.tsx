'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Lock, Truck } from 'lucide-react';
import { Cart } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface CartSummaryProps {
  cart: Cart;
}

export default function CartSummary({ cart }: CartSummaryProps) {
  const subtotal = cart.totalAmount;
  const shipping = subtotal > 500 ? 0 : 49.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="bg-white rounded-xl border border-surface-200 p-6 sticky top-24">
      <h2 className="text-lg font-semibold text-surface-900 mb-4">Order Summary</h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-surface-600">Subtotal ({cart.totalItems} items)</span>
          <span className="font-medium text-surface-900">{formatPrice(subtotal, 'INR')}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-surface-600">Shipping</span>
          <span className="font-medium text-surface-900">
            {shipping === 0 ? (
              <span className="text-green-600">Free</span>
            ) : (
              formatPrice(shipping, 'INR')
            )}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-surface-600">Estimated Tax</span>
          <span className="font-medium text-surface-900">{formatPrice(tax, 'INR')}</span>
        </div>

        <hr className="border-surface-200" />

        <div className="flex justify-between text-base">
          <span className="font-semibold text-surface-900">Total</span>
          <span className="font-bold text-surface-900">{formatPrice(total, 'INR')}</span>
        </div>
      </div>

      {/* Free Shipping Message */}
      {subtotal < 500 && (
        <div className="mt-4 p-3 bg-secondary-50 rounded-lg">
          <div className="flex items-center gap-2 text-secondary-700">
            <Truck className="h-4 w-4" />
            <span className="text-sm">
              Add <strong>{formatPrice(500 - subtotal, 'INR')}</strong> more for free shipping!
            </span>
          </div>
          <div className="mt-2 h-2 bg-secondary-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((subtotal / 500) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      <Link href="/checkout" className="block mt-6">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          leftIcon={<Lock className="h-4 w-4" />}
        >
          Proceed to Checkout
        </Button>
      </Link>

      <Link href="/products" className="block mt-3">
        <Button variant="outline" size="md" className="w-full">
          Continue Shopping
        </Button>
      </Link>

      {/* Trust Badges */}
      <div className="mt-6 pt-4 border-t border-surface-200">
        <div className="flex items-center justify-center gap-2 text-surface-500 text-xs">
          <Lock className="h-4 w-4" />
          <span>Secure checkout</span>
        </div>
      </div>
    </div>
  );
}
