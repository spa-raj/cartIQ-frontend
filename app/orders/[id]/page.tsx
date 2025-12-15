'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Calendar,
  Clock,
  AlertCircle,
  PartyPopper,
} from 'lucide-react';
import { Order } from '@/lib/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useEvent } from '@/context/EventContext';
import {
  formatPrice,
  formatDate,
  formatDateTime,
  getOrderStatusColor,
  getPaymentStatusColor,
  getPlaceholderImage,
} from '@/lib/utils';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Loading';

function OrderDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const isSuccess = searchParams.get('success') === 'true';

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { trackPageView, trackOrderEvent } = useEvent();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    trackPageView('ORDER_DETAIL', `/orders/${orderId}`);
  }, [trackPageView, orderId]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/orders');
      return;
    }

    const loadOrder = async () => {
      if (!isAuthenticated) return;

      try {
        const data = await api.getOrder(orderId);
        setOrder(data);
      } catch (error) {
        console.error('Failed to load order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [orderId, isAuthenticated, authLoading, router]);

  const handleCancelOrder = async () => {
    if (!order || !order.cancellable) return;

    setIsCancelling(true);
    try {
      const updatedOrder = await api.cancelOrder(order.id);
      setOrder(updatedOrder);

      trackOrderEvent({
        action: 'CANCELLED',
        orderId: order.id,
        orderNumber: order.orderNumber,
        items: order.items?.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })) || [],
        subtotal: order.subtotal,
        discount: 0,
        total: order.totalAmount,
        paymentMethod: 'COD',
        status: updatedOrder.status,
        shippingCity: order.shippingCity || '',
        shippingState: order.shippingState || '',
      });
    } catch (error) {
      console.error('Failed to cancel order:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  if (authLoading || isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Order Not Found</h1>
          <p className="text-surface-500 mb-4">The order you're looking for doesn't exist.</p>
          <Link href="/orders">
            <Button variant="primary">View All Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'CANCELLED':
      case 'REFUNDED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'SHIPPED':
        return <Truck className="h-5 w-5 text-indigo-600" />;
      default:
        return <Package className="h-5 w-5 text-primary-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Banner */}
        {isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <PartyPopper className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-green-800 mb-1">
                  Order Placed Successfully!
                </h2>
                <p className="text-green-700">
                  Thank you for your order. We'll send you an email confirmation shortly.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Back Link */}
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-surface-600 hover:text-primary-600 mb-6"
        >
          <ChevronLeft className="h-5 w-5" />
          <span>Back to Orders</span>
        </Link>

        {/* Order Header */}
        <div className="bg-white rounded-xl border border-surface-200 p-6 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {getStatusIcon(order.status)}
                <h1 className="text-2xl font-bold text-surface-900">{order.orderNumber}</h1>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={getOrderStatusColor(order.status)}>{order.status}</Badge>
                <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                  Payment: {order.paymentStatus}
                </Badge>
              </div>
            </div>

            {order.cancellable && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelOrder}
                isLoading={isCancelling}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Cancel Order
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-surface-200">
            <div>
              <p className="text-sm text-surface-500 mb-1">Order Date</p>
              <p className="font-medium text-surface-900">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-surface-500 mb-1">Total Items</p>
              <p className="font-medium text-surface-900">{order.totalQuantity}</p>
            </div>
            <div>
              <p className="text-sm text-surface-500 mb-1">Subtotal</p>
              <p className="font-medium text-surface-900">{formatPrice(order.subtotal, 'INR')}</p>
            </div>
            <div>
              <p className="text-sm text-surface-500 mb-1">Total Amount</p>
              <p className="font-bold text-primary-600 text-lg">
                {formatPrice(order.totalAmount, 'INR')}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-surface-200 p-6">
              <h2 className="text-lg font-semibold text-surface-900 mb-4">Order Items</h2>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b border-surface-100 last:border-0 last:pb-0"
                  >
                    <Link href={`/products/${item.productId}`}>
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-surface-100 flex-shrink-0">
                        <Image
                          src={item.thumbnailUrl || getPlaceholderImage(80, 80)}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.productId}`}
                        className="font-medium text-surface-900 hover:text-primary-600 line-clamp-2"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-sm text-surface-500 mt-1">SKU: {item.productSku}</p>
                      <p className="text-sm text-surface-600 mt-1">
                        {formatPrice(item.unitPrice, 'INR')} x {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-surface-900">
                        {formatPrice(item.subtotal, 'INR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-6 pt-4 border-t border-surface-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(order.subtotal, 'INR')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-600">Shipping</span>
                  <span className="font-medium">
                    {order.shippingCost === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(order.shippingCost, 'INR')
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-600">Tax</span>
                  <span className="font-medium">{formatPrice(order.tax, 'INR')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-surface-200">
                  <span className="font-semibold text-surface-900">Total</span>
                  <span className="font-bold text-primary-600 text-lg">
                    {formatPrice(order.totalAmount, 'INR')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-surface-200 p-6">
              <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary-600" />
                Shipping Address
              </h2>
              <div className="text-surface-600 space-y-1">
                <p className="font-medium text-surface-900">{order.shippingAddress}</p>
                <p>
                  {order.shippingCity}
                  {order.shippingState && `, ${order.shippingState}`}
                </p>
                <p>
                  {order.shippingZipCode}, {order.shippingCountry}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-surface-200">
                <div className="flex items-center gap-2 text-surface-600">
                  <Phone className="h-4 w-4" />
                  <span>{order.contactPhone}</span>
                </div>
              </div>
            </div>

            {order.notes && (
              <div className="bg-white rounded-xl border border-surface-200 p-6">
                <h2 className="text-lg font-semibold text-surface-900 mb-2">Order Notes</h2>
                <p className="text-surface-600">{order.notes}</p>
              </div>
            )}

            {/* Need Help */}
            <div className="bg-primary-50 rounded-xl p-6">
              <h3 className="font-semibold text-primary-900 mb-2">Need Help?</h3>
              <p className="text-sm text-primary-700 mb-4">
                Have questions about your order? Our AI assistant is here to help!
              </p>
              <Link href="/chat">
                <Button variant="primary" size="sm" className="w-full">
                  Chat with AI Assistant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <OrderDetailContent />
    </Suspense>
  );
}
