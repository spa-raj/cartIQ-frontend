'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '@/lib/types';
import { formatPrice, getPlaceholderImage } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem, isLoading } = useCart();

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    await updateQuantity(item.id, newQuantity);
  };

  const handleRemove = async () => {
    await removeItem(item.id, item.productName);
  };

  return (
    <div className="flex gap-4 p-4 bg-white rounded-xl border border-surface-200">
      {/* Product Image */}
      <Link href={`/products/${item.productId}`} className="flex-shrink-0">
        <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-surface-100">
          <Image
            src={item.thumbnailUrl || getPlaceholderImage(100, 100)}
            alt={item.productName}
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${item.productId}`}
          className="text-surface-900 font-medium hover:text-primary-600 transition-colors line-clamp-2"
        >
          {item.productName}
        </Link>
        <p className="text-surface-500 text-sm mt-1">
          {formatPrice(item.unitPrice, 'INR')} each
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center border border-surface-300 rounded-lg">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isLoading || item.quantity <= 1}
              className="p-2 hover:bg-surface-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="px-4 py-2 text-sm font-medium text-surface-900 min-w-[3rem] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isLoading}
              className="p-2 hover:bg-surface-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-r-lg"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleRemove}
            disabled={isLoading}
            className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="text-right flex-shrink-0">
        <p className="text-lg font-semibold text-surface-900">
          {formatPrice(item.subtotal, 'INR')}
        </p>
      </div>
    </div>
  );
}
