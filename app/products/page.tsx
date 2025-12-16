'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/lib/types';
import { api } from '@/lib/api';
import { useEvent } from '@/context/EventContext';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilters from '@/components/products/ProductFilters';
import Sidebar from '@/components/layout/Sidebar';
import Button from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const { trackPageView } = useEvent();

  const search = searchParams.get('search');
  const categoryId = searchParams.get('category');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const brands = searchParams.get('brands');
  const sort = searchParams.get('sort') || 'createdAt,desc';
  const featured = searchParams.get('featured');

  useEffect(() => {
    trackPageView('PRODUCTS', '/products');
  }, [trackPageView]);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        let response;

        if (search) {
          response = await api.searchProducts(search, page, 20);
        } else if (categoryId) {
          response = await api.getProductsByCategory(categoryId, page, 20);
        } else if (minPrice || maxPrice) {
          response = await api.getProductsByPriceRange(
            minPrice ? parseFloat(minPrice) : undefined,
            maxPrice ? parseFloat(maxPrice) : undefined,
            page,
            20
          );
        } else if (featured === 'true') {
          response = await api.getFeaturedProducts(20);
        } else {
          response = await api.getProducts(page, 20, sort);
        }

        setProducts(response.content || []);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
      } catch (error) {
        console.error('Failed to load products:', error);
        setProducts([]);
        setTotalPages(0);
        setTotalElements(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [search, categoryId, minPrice, maxPrice, brands, sort, featured, page]);

  const getPageTitle = () => {
    if (search) return `Search results for "${search}"`;
    if (featured === 'true') return 'Featured Products';
    return 'All Products';
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6">
          {search ? (
            // Search results header
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-surface-900">
                Search results for
              </h1>
              <span className="text-2xl sm:text-3xl font-bold text-primary-600">"{search}"</span>
            </div>
          ) : (
            <h1 className="text-2xl sm:text-3xl font-bold text-surface-900">{getPageTitle()}</h1>
          )}
          {!isLoading && totalElements !== undefined && (
            <p className="text-surface-500 mt-1 text-sm">
              Showing <span className="font-medium text-surface-700">{(totalElements || 0).toLocaleString()}</span> {totalElements === 1 ? 'product' : 'products'}
            </p>
          )}
        </div>

        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          <Sidebar className="hidden lg:block" />

          {/* Main Content */}
          <div className="flex-1">
            {/* Filters */}
            <ProductFilters onFilterChange={() => setPage(0)} />

            {/* Products Grid */}
            <ProductGrid
              products={products}
              isLoading={isLoading}
              source={search ? 'search' : categoryId ? 'category' : 'direct'}
              searchQuery={search || undefined}
              emptyMessage={
                search
                  ? `No products found for "${search}". Try adjusting your search.`
                  : 'No products available. Check back soon!'
              }
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (page < 3) {
                      pageNum = i;
                    } else if (page > totalPages - 4) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`h-10 w-10 rounded-lg font-medium transition-colors ${
                          page === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'bg-white border border-surface-300 text-surface-700 hover:bg-surface-50'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-50" />}>
      <ProductsPageContent />
    </Suspense>
  );
}
