'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Package, ChevronRight, ShoppingBag, Calendar, Clock } from 'lucide-react';
import { Order } from '@/lib/types';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useEvent } from '@/context/EventContext';
import { formatPrice, formatDate, getOrderStatusColor, getPlaceholderImage } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { OrderSkeleton, PageLoader } from '@/components/ui/Loading';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { trackPageView } = useEvent();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    trackPageView('ORDERS', '/orders');
  }, [trackPageView]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/orders');
      return;
    }

    const loadOrders = async () => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      try {
        const response = await api.getOrders(0, 20, statusFilter || undefined);
        setOrders(response.content);
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [isAuthenticated, authLoading, router, statusFilter]);

  if (authLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-surface-900">My Orders</h1>
            <p className="text-surface-500 mt-1">Track and manage your orders</p>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-surface-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Orders</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <OrderSkeleton key={i} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-20 w-20 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-surface-400" />
            </div>
            <h2 className="text-xl font-semibold text-surface-900 mb-2">No orders yet</h2>
            <p className="text-surface-500 mb-6">
              {statusFilter
                ? `No ${statusFilter.toLowerCase()} orders found`
                : "You haven't placed any orders yet. Start shopping!"}
            </p>
            <Link href="/products">
              <Button variant="primary">Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`}>
                <div className="bg-white rounded-xl border border-surface-200 p-6 hover:shadow-lg hover:border-primary-200 transition-all cursor-pointer">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-surface-900">
                          {order.orderNumber}
                        </span>
                        <Badge className={getOrderStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-surface-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ShoppingBag className="h-4 w-4" />
                          {order.totalQuantity} {order.totalQuantity === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-surface-400" />
                  </div>

                  {/* Items Preview - only show if items are available */}
                  {order.items && order.items.length > 0 && (
                    <div className="flex gap-3 mb-4">
                      {order.items.slice(0, 4).map((item) => (
                        <div
                          key={item.id}
                          className="relative h-16 w-16 rounded-lg overflow-hidden bg-surface-100"
                        >
                          <Image
                            src={item.thumbnailUrl || getPlaceholderImage(64, 64)}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="h-16 w-16 rounded-lg bg-surface-100 flex items-center justify-center text-surface-500 text-sm font-medium">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-surface-100">
                    <span className="text-surface-600">Total</span>
                    <span className="text-lg font-bold text-surface-900">
                      {formatPrice(order.totalAmount, 'INR')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
