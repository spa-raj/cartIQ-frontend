'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart, Heart, Zap } from 'lucide-react';
import { Product } from '@/lib/types';
import { formatPrice, calculateDiscount, getPlaceholderImage, truncateText } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addToCart, isLoading } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href = '/auth/login?redirect=/products';
      return;
    }

    await addToCart(product.id, 1, product.name, product.price);
  };

  const discountPercent = product.compareAtPrice
    ? calculateDiscount(product.compareAtPrice, product.price)
    : 0;

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="bg-white rounded-lg border border-surface-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-surface-300 h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-white p-4">
          <Image
            src={product.thumbnailUrl || product.imageUrls?.[0] || getPlaceholderImage(400, 400)}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.featured && (
              <span className="inline-flex items-center gap-1 bg-[#131921] text-white text-xs font-bold px-2 py-1 rounded">
                <Zap className="h-3 w-3 text-primary-400" />
                Featured
              </span>
            )}
            {discountPercent > 0 && (
              <span className="bg-danger-500 text-white text-xs font-bold px-2 py-1 rounded">
                {discountPercent}% OFF
              </span>
            )}
            {!product.inStock && (
              <span className="bg-surface-500 text-white text-xs font-bold px-2 py-1 rounded">
                Out of Stock
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-danger-50 hover:text-danger-500"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          {/* Category */}
          {product.categoryName && (
            <p className="text-xs text-accent-500 font-medium mb-1">{product.categoryName}</p>
          )}

          {/* Title */}
          <h3 className="text-sm text-surface-800 mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-accent-500 transition-colors">
            {truncateText(product.name, 80)}
          </h3>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating)
                        ? 'text-star-500 fill-star-500'
                        : 'text-surface-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-accent-500 hover:underline">
                ({product.reviewCount.toLocaleString()})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mt-auto">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-xl font-bold text-surface-900">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="text-sm text-surface-400 line-through">
                    {formatPrice(product.compareAtPrice, product.currency)}
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            {product.inStock ? (
              <p className="text-xs text-success-500 font-medium mb-3">In Stock</p>
            ) : (
              <p className="text-xs text-danger-500 font-medium mb-3">Out of Stock</p>
            )}

            {/* Add to Cart Button */}
            <Button
              variant="buy"
              size="sm"
              className="w-full"
              onClick={handleAddToCart}
              disabled={!product.inStock || isLoading}
              leftIcon={<ShoppingCart className="h-4 w-4" />}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
