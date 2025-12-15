'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Folder } from 'lucide-react';
import { Category, Product } from '@/lib/types';
import { api } from '@/lib/api';
import { useEvent } from '@/context/EventContext';
import ProductGrid from '@/components/products/ProductGrid';
import Sidebar from '@/components/layout/Sidebar';
import Button from '@/components/ui/Button';
import { PageLoader, Skeleton } from '@/components/ui/Loading';

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { trackPageView } = useEvent();

  useEffect(() => {
    trackPageView('CATEGORY', `/categories/${categoryId}`);
  }, [trackPageView, categoryId]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [categoryData, productsData, subcategoriesData] = await Promise.all([
          api.getCategory(categoryId),
          api.getProductsByCategory(categoryId, page, 20),
          api.getSubcategories(categoryId).catch(() => []),
        ]);

        setCategory(categoryData);
        setProducts(productsData.content);
        setTotalPages(productsData.totalPages);
        setSubcategories(subcategoriesData);
      } catch (error) {
        console.error('Failed to load category:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [categoryId, page]);

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
            {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
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
              emptyMessage={`No products found in ${category.name}. Check back soon!`}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`h-10 w-10 rounded-lg font-medium transition-colors ${
                      page === i
                        ? 'bg-primary-600 text-white'
                        : 'bg-white border border-surface-300 text-surface-700 hover:bg-surface-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
