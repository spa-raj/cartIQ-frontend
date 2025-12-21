'use client';

import React, { useState } from 'react';
import { ShoppingCart, Check, Minus, Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  price: number;
  inStock: boolean;
  category: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showQuantity?: boolean;
}

export default function AddToCartButton({
  productId,
  productName,
  price,
  inStock,
  category,
  className,
  size = 'md',
  showQuantity = true,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart, isLoading } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }

    await addToCart(productId, quantity, productName, price, category);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  if (!inStock) {
    return (
      <Button variant="outline" size={size} disabled className={className}>
        Out of Stock
      </Button>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Quantity Selector */}
      {showQuantity && (
        <div className="flex items-center border border-surface-300 rounded-lg">
          <button
            onClick={decrementQuantity}
            disabled={quantity <= 1 || isLoading}
            className="p-2 hover:bg-surface-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="px-4 py-2 text-sm font-medium text-surface-900 min-w-[3rem] text-center">
            {quantity}
          </span>
          <button
            onClick={incrementQuantity}
            disabled={isLoading}
            className="p-2 hover:bg-surface-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-r-lg"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Add to Cart Button */}
      <Button
        variant={added ? 'accent' : 'primary'}
        size={size}
        onClick={handleAddToCart}
        isLoading={isLoading}
        leftIcon={added ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
        className={cn('flex-1', added && 'bg-green-600 hover:bg-green-700')}
      >
        {added ? 'Added!' : 'Add to Cart'}
      </Button>
    </div>
  );
}
