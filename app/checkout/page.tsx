'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Lock, CreditCard, Truck, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useEvent } from '@/context/EventContext';
import { api } from '@/lib/api';
import { formatPrice, getPlaceholderImage } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { PageLoader } from '@/components/ui/Loading';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, refreshCart, productCategoryMap } = useCart();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { trackPageView, trackOrderEvent, trackUserProfile } = useEvent();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingZipCode: '',
    shippingCountry: 'United States',
    contactPhone: user?.phone || '',
    notes: '',
  });

  useEffect(() => {
    trackPageView('CHECKOUT', '/checkout');
  }, [trackPageView]);

  useEffect(() => {
    if (user?.phone) {
      setFormData((prev) => ({ ...prev, contactPhone: user.phone || '' }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const order = await api.createOrder({
        shippingAddress: formData.shippingAddress,
        shippingCity: formData.shippingCity,
        shippingState: formData.shippingState || undefined,
        shippingZipCode: formData.shippingZipCode,
        shippingCountry: formData.shippingCountry,
        contactPhone: formData.contactPhone,
        notes: formData.notes || undefined,
      });

      // Track order event
      trackOrderEvent({
        action: 'PLACED',
        orderId: order.id,
        orderNumber: order.orderNumber,
        items: order.items?.map(item => ({
          productId: item.productId,
          productName: item.productName,
          category: productCategoryMap[item.productId],
          quantity: item.quantity,
          price: item.unitPrice,
        })) || [],
        subtotal: order.subtotal,
        discount: 0, // No discount field in current order response
        total: order.totalAmount,
        paymentMethod: 'cod',
        status: order.status.toLowerCase() as 'pending' | 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded',
        shippingCity: order.shippingCity || formData.shippingCity,
        shippingState: order.shippingState || formData.shippingState || '',
      });

      // Track user profile event on order completion
      try {
        const [prefsData, ordersData] = await Promise.all([
          api.getPreferences().catch(() => null),
          api.getOrders(0, 100).catch(() => null),
        ]);

        const totalOrders = ordersData?.totalElements || 0;
        const totalSpent = ordersData?.content?.reduce((sum, o) => sum + o.totalAmount, 0) || 0;

        // Calculate top categories from order history
        let topCategories: string[] = [];
        if (ordersData?.content && ordersData.content.length > 0) {
          const productIds = new Set<string>();
          ordersData.content.forEach(o => {
            o.items?.forEach(item => productIds.add(item.productId));
          });

          if (productIds.size > 0) {
            const products = await api.getProductsByIds(Array.from(productIds)).catch(() => []);
            const categoryCount: Record<string, number> = {};
            ordersData.content.forEach(o => {
              o.items?.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product?.categoryName) {
                  categoryCount[product.categoryName] = (categoryCount[product.categoryName] || 0) + item.quantity;
                }
              });
            });
            topCategories = Object.entries(categoryCount)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([category]) => category);
          }
        }

        trackUserProfile({
          topCategories,
          minPricePreference: prefsData?.minPricePreference,
          maxPricePreference: prefsData?.maxPricePreference,
          totalOrders,
          totalSpent,
        });
      } catch (profileError) {
        console.debug('Failed to track user profile on order:', profileError);
      }

      // Refresh cart
      await refreshCart();

      // Redirect to order confirmation
      router.push(`/orders/${order.id}?success=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    router.push('/auth/login?redirect=/checkout');
    return null;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Your cart is empty</h1>
          <p className="text-surface-500 mb-4">Add some items before checkout.</p>
          <Link href="/products">
            <Button variant="primary">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = cart.totalAmount;
  const shipping = subtotal > 500 ? 0 : 49.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-surface-600 hover:text-primary-600 mb-8"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Back to Cart</span>
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Checkout Form */}
          <div>
            <h1 className="text-3xl font-bold text-surface-900 mb-8">Checkout</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <div className="bg-white rounded-xl border border-surface-200 p-6">
                <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary-600" />
                  Shipping Information
                </h2>

                <div className="space-y-4">
                  <Input
                    label="Street Address"
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleChange}
                    placeholder="123 Main Street, Apt 4B"
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="City"
                      name="shippingCity"
                      value={formData.shippingCity}
                      onChange={handleChange}
                      placeholder="San Francisco"
                      required
                    />
                    <Input
                      label="State / Province"
                      name="shippingState"
                      value={formData.shippingState}
                      onChange={handleChange}
                      placeholder="California"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="ZIP / Postal Code"
                      name="shippingZipCode"
                      value={formData.shippingZipCode}
                      onChange={handleChange}
                      placeholder="94102"
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1.5">
                        Country
                      </label>
                      <select
                        name="shippingCountry"
                        value={formData.shippingCountry}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-surface-300 px-4 py-2.5 text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="India">India</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>
                  </div>

                  <Input
                    label="Phone Number"
                    name="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Special delivery instructions..."
                      rows={3}
                      className="w-full rounded-lg border border-surface-300 px-4 py-2.5 text-surface-800 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Info (Demo) */}
              <div className="bg-white rounded-xl border border-surface-200 p-6">
                <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary-600" />
                  Payment Method
                </h2>

                <div className="bg-surface-50 rounded-lg p-4 border border-surface-200">
                  <p className="text-sm text-surface-600">
                    Payment is processed after order confirmation. For this demo, no real payment is
                    required.
                  </p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
                leftIcon={<Lock className="h-5 w-5" />}
              >
                Place Order - {formatPrice(total, 'INR')}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-xl border border-surface-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-surface-900 mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 max-h-64 overflow-y-auto mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-surface-100 flex-shrink-0">
                      <Image
                        src={item.thumbnailUrl || getPlaceholderImage(64, 64)}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-surface-800 text-white text-xs rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-900 line-clamp-1">
                        {item.productName}
                      </p>
                      <p className="text-sm text-surface-500">
                        {formatPrice(item.unitPrice, 'INR')} x {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-surface-900">
                      {formatPrice(item.subtotal, 'INR')}
                    </p>
                  </div>
                ))}
              </div>

              <hr className="border-surface-200 mb-4" />

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal, 'INR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(shipping, 'INR')
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Tax</span>
                  <span className="font-medium">{formatPrice(tax, 'INR')}</span>
                </div>
                <hr className="border-surface-200 my-2" />
                <div className="flex justify-between text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary-600">{formatPrice(total, 'INR')}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 pt-4 border-t border-surface-200 flex items-center justify-center gap-2 text-surface-500 text-sm">
                <Lock className="h-4 w-4" />
                <span>Secure checkout with SSL encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
