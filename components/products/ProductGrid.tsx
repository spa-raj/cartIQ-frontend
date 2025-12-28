'use client';

import React from 'react';
import { Product, ProductViewSource } from '@/lib/types';
import ProductCard from './ProductCard';
import { ProductGridSkeleton } from '@/components/ui/Loading';
import { Package } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyMessage?: string;
  source?: ProductViewSource;
  searchQuery?: string;
}

export default function ProductGrid({
  products,
  isLoading = false,
  emptyMessage = 'No products found',
  source = 'DIRECT',
  searchQuery,
}: ProductGridProps) {
  if (isLoading) {
    return <ProductGridSkeleton count={8} />;
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 bg-surface-100 rounded-full flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-surface-400" />
        </div>
        <h3 className="text-lg font-medium text-surface-900 mb-2">No products found</h3>
        <p className="text-surface-500 max-w-md">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} source={source} searchQuery={searchQuery} />
      ))}
    </div>
  );
}
