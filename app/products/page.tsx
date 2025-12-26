'use client';

import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/lib/types';
import { api } from '@/lib/api';
import { useEvent } from '@/context/EventContext';
import ProductGrid from '@/components/products/ProductGrid';
import ProductFilters from '@/components/products/ProductFilters';
import Sidebar from '@/components/layout/Sidebar';
import { Loader2 } from 'lucide-react';

const PAGE_SIZE = 15;

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const { trackPageView } = useEvent();

  // Calculate hasMore based on products loaded vs total
  const hasMore = products.length < totalElements;

  // Pre-fetched next page data
  const nextPageDataRef = useRef<Product[] | null>(null);
  const isFetchingNextRef = useRef(false);

  // Intersection Observer ref for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const search = searchParams.get('search');
  const categoryId = searchParams.get('category');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const brands = searchParams.get('brands');
  const sort = searchParams.get('sort') || 'createdAt,desc';
  const featured = searchParams.get('featured');
  const bestOfElectronics = searchParams.get('bestOfElectronics');

  // Create a filter key to detect filter changes
  const filterKey = `${search}-${categoryId}-${minPrice}-${maxPrice}-${brands}-${sort}-${featured}-${bestOfElectronics}`;

  useEffect(() => {
    trackPageView('PRODUCTS', '/products');
  }, [trackPageView]);

  // Fetch products for a specific page
  const fetchProducts = useCallback(async (pageNum: number): Promise<{ content: Product[]; totalPages: number; totalElements: number }> => {
    let response;

    if (search) {
      response = await api.searchProducts(search, pageNum, PAGE_SIZE, {
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      });
    } else if (categoryId) {
      response = await api.getProductsByCategory(categoryId, pageNum, PAGE_SIZE);
    } else if (minPrice || maxPrice) {
      response = await api.getProductsByPriceRange(
        minPrice ? parseFloat(minPrice) : undefined,
        maxPrice ? parseFloat(maxPrice) : undefined,
        pageNum,
        PAGE_SIZE
      );
    } else if (featured === 'true') {
      response = await api.getFeaturedProducts(PAGE_SIZE, pageNum);
    } else if (bestOfElectronics === 'true') {
      response = await api.getBestOfElectronics(pageNum, PAGE_SIZE);
    } else {
      response = await api.getProducts(pageNum, PAGE_SIZE, sort);
    }

    return {
      content: response.content || [],
      totalPages: response.page?.totalPages ?? 0,
      totalElements: response.page?.totalElements ?? 0,
    };
  }, [search, categoryId, minPrice, maxPrice, sort, featured, bestOfElectronics]);

  // Pre-fetch next page in background
  const prefetchNextPage = useCallback(async (currentPage: number, currentTotalPages: number) => {
    if (currentPage >= currentTotalPages - 1 || isFetchingNextRef.current) return;

    isFetchingNextRef.current = true;
    try {
      const nextData = await fetchProducts(currentPage + 1);
      nextPageDataRef.current = nextData.content;
    } catch (error) {
      console.error('Failed to prefetch next page:', error);
      nextPageDataRef.current = null;
    } finally {
      isFetchingNextRef.current = false;
    }
  }, [fetchProducts]);

  // Load initial products when filters change
  useEffect(() => {
    const loadInitialProducts = async () => {
      setIsLoading(true);
      setProducts([]);
      setPage(0);
      setTotalElements(0);
      nextPageDataRef.current = null;
      isFetchingNextRef.current = false;

      try {
        const data = await fetchProducts(0);
        setProducts(data.content);
        setTotalElements(data.totalElements);

        // Pre-fetch next page if there are more
        if (data.totalPages > 1) {
          prefetchNextPage(0, data.totalPages);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
        setProducts([]);
        setTotalElements(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialProducts();
  }, [filterKey, fetchProducts, prefetchNextPage]);

  // Load more products (for infinite scroll)
  const loadMoreProducts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      let newProducts: Product[];
      let totalPages: number;

      // Use pre-fetched data if available
      if (nextPageDataRef.current) {
        newProducts = nextPageDataRef.current;
        nextPageDataRef.current = null;
        totalPages = Math.ceil(totalElements / PAGE_SIZE);
      } else {
        const data = await fetchProducts(nextPage);
        newProducts = data.content;
        totalPages = data.totalPages;
      }

      setProducts(prev => [...prev, ...newProducts]);
      setPage(nextPage);

      // Pre-fetch the next page
      prefetchNextPage(nextPage, totalPages);
    } catch (error) {
      console.error('Failed to load more products:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, page, totalElements, fetchProducts, prefetchNextPage]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, isLoading, isLoadingMore, loadMoreProducts]);

  const getPageTitle = () => {
    if (search) return `Search results for "${search}"`;
    if (featured === 'true') return 'Featured Products';
    if (bestOfElectronics === 'true') return 'Best of Electronics';
    return 'All Products';
  };

  const handleFilterChange = () => {
    // Reset will happen automatically via filterKey change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6">
          {search ? (
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
              Showing <span className="font-medium text-surface-700">{products.length.toLocaleString()}</span> of{' '}
              <span className="font-medium text-surface-700">{(totalElements || 0).toLocaleString()}</span> {totalElements === 1 ? 'product' : 'products'}
            </p>
          )}
        </div>

        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          <Sidebar className="hidden lg:block" />

          {/* Main Content */}
          <div className="flex-1">
            {/* Filters */}
            <ProductFilters onFilterChange={handleFilterChange} />

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

            {/* Infinite Scroll Trigger & Loading Indicator */}
            <div ref={loadMoreRef} className="mt-8 flex justify-center">
              {isLoadingMore && (
                <div className="flex items-center gap-2 text-surface-500 py-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Loading more products...</span>
                </div>
              )}
              {!hasMore && products.length > 0 && !isLoading && (
                <p className="text-surface-400 text-sm py-4">
                  You've reached the end of the list
                </p>
              )}
            </div>
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