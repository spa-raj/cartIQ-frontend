'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Folder, Loader2 } from 'lucide-react';
import { Category, Product } from '@/lib/types';
import { api } from '@/lib/api';
import { useEvent } from '@/context/EventContext';
import ProductGrid from '@/components/products/ProductGrid';
import Sidebar from '@/components/layout/Sidebar';
import Button from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Loading';

const PAGE_SIZE = 15;

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const { trackPageView } = useEvent();

  // Pre-fetched next page data
  const nextPageDataRef = useRef<Product[] | null>(null);
  const isFetchingNextRef = useRef(false);

  // Intersection Observer ref for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Calculate hasMore based on products loaded vs total
  const hasMore = products.length < totalElements;

  useEffect(() => {
    trackPageView('CATEGORY', `/categories/${categoryId}`);
  }, [trackPageView, categoryId]);

  // Fetch products for a specific page
  const fetchProducts = useCallback(async (pageNum: number) => {
    const response = await api.getProductsByCategory(categoryId, pageNum, PAGE_SIZE);
    return {
      content: response.content || [],
      totalElements: response.totalElements || 0,
      totalPages: response.totalPages || 0,
    };
  }, [categoryId]);

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

  // Load initial data when category changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setProducts([]);
      setPage(0);
      setTotalElements(0);
      nextPageDataRef.current = null;
      isFetchingNextRef.current = false;

      try {
        const [categoryData, productsData, subcategoriesData] = await Promise.all([
          api.getCategory(categoryId),
          api.getProductsByCategory(categoryId, 0, PAGE_SIZE),
          api.getSubcategories(categoryId).catch(() => []),
        ]);

        setCategory(categoryData);
        setProducts(productsData.content || []);
        setTotalElements(productsData.totalElements || 0);
        setSubcategories(subcategoriesData);

        // Pre-fetch next page if there are more
        const totalPages = productsData.totalPages || 0;
        if (totalPages > 1) {
          prefetchNextPage(0, totalPages);
        }
      } catch (error) {
        console.error('Failed to load category:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [categoryId, prefetchNextPage]);

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

  if (isLoading && !category) {
    return <PageLoader />;
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Category Not Found</h1>
          <p className="text-surface-500 mb-4">The category you're looking for doesn't exist.</p>
          <Link href="/products">
            <Button variant="primary">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-surface-500 mb-8">
          <Link href="/" className="hover:text-primary-600">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/products" className="hover:text-primary-600">
            Products
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-surface-900 font-medium">{category.name}</span>
        </nav>

        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-surface-900 mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-surface-600 max-w-2xl">{category.description}</p>
          )}
          <p className="text-surface-500 mt-2">
            Showing <span className="font-medium text-surface-700">{products.length.toLocaleString()}</span> of{' '}
            <span className="font-medium text-surface-700">{totalElements.toLocaleString()}</span>{' '}
            {totalElements === 1 ? 'product' : 'products'}
          </p>
        </div>

        {/* Subcategories */}
        {subcategories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-surface-900 mb-4">Subcategories</h2>
            <div className="flex flex-wrap gap-3">
              {subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/categories/${sub.id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-surface-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <Folder className="h-4 w-4 text-secondary-500" />
                  <span className="text-surface-700">{sub.name}</span>
                  {sub.productCount > 0 && (
                    <span className="text-xs text-surface-400">({sub.productCount})</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar */}
          <Sidebar className="hidden lg:block" />

          {/* Products */}
          <div className="flex-1">
            <ProductGrid
              products={products}
              isLoading={isLoading}
              source="category"
              emptyMessage={`No products found in ${category.name}. Check back soon!`}
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