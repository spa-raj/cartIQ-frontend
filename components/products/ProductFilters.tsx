'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface ProductFiltersProps {
  onFilterChange?: () => void;
}

export default function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [brands, setBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get('brands')?.split(',').filter(Boolean) || []
  );
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'createdAt,desc');
  const [showFilters, setShowFilters] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);

  useEffect(() => {
    const loadBrands = async () => {
      try {
        const data = await api.getBrands();
        setBrands(data);
      } catch (error) {
        console.error('Failed to load brands:', error);
      }
    };
    loadBrands();
  }, []);

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (selectedBrands.length > 0) params.set('brands', selectedBrands.join(','));
    if (sortBy !== 'createdAt,desc') params.set('sort', sortBy);

    const search = searchParams.get('search');
    if (search) params.set('search', search);

    router.push(`/products?${params.toString()}`);
    onFilterChange?.();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSelectedBrands([]);
    setSortBy('createdAt,desc');

    const search = searchParams.get('search');
    router.push(search ? `/products?search=${search}` : '/products');
    onFilterChange?.();
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const hasActiveFilters = minPrice || maxPrice || selectedBrands.length > 0;

  return (
    <div className="mb-4">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-surface-300 rounded-md bg-white hover:bg-surface-50 transition-colors"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 h-4 w-4 bg-primary-500 text-white text-[10px] rounded-full flex items-center justify-center">
              {(minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + selectedBrands.length}
            </span>
          )}
        </button>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-surface-500 hidden sm:block">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setTimeout(applyFilters, 0);
            }}
            className="px-2.5 py-1.5 text-xs border border-surface-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="createdAt,desc">Newest</option>
            <option value="price,asc">Price: Low to High</option>
            <option value="price,desc">Price: High to Low</option>
            <option value="rating,desc">Top Rated</option>
            <option value="name,asc">Name: A-Z</option>
          </select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-2 py-1 text-xs text-surface-500 hover:text-surface-700 transition-colors"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      {/* Filter Panel */}
      <div
        className={cn(
          'mt-3 p-3 bg-white border border-surface-200 rounded-lg transition-all duration-300',
          showFilters ? 'block' : 'hidden lg:block'
        )}
      >
        <div className="flex flex-wrap items-end gap-4">
          {/* Price Range */}
          <div className="flex-shrink-0">
            <h4 className="text-xs font-medium text-surface-700 mb-2">Price Range</h4>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                className="w-20 px-2 py-1.5 text-xs border border-surface-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <span className="text-surface-400 text-xs">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                className="w-20 px-2 py-1.5 text-xs border border-surface-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <button
                onClick={applyFilters}
                className="ml-1 px-3 py-1.5 text-xs font-medium bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center gap-1"
              >
                <Search className="h-3 w-3" />
                Filter
              </button>
            </div>
          </div>

          {/* Brands */}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-medium text-surface-700 mb-2">Brands</h4>
            <div className={cn(
              'flex flex-wrap gap-1.5 overflow-y-auto',
              !showAllBrands && 'max-h-20'
            )}>
              {(showAllBrands ? brands : brands.slice(0, 12)).map((brand) => (
                <button
                  key={brand}
                  onClick={() => toggleBrand(brand)}
                  className={cn(
                    'px-2 py-1 text-xs rounded-md border transition-colors',
                    selectedBrands.includes(brand)
                      ? 'bg-primary-50 border-primary-400 text-primary-700'
                      : 'bg-surface-50 border-surface-200 text-surface-600 hover:border-surface-300'
                  )}
                >
                  {brand}
                </button>
              ))}
            </div>
            {brands.length > 12 && (
              <button
                onClick={() => setShowAllBrands(!showAllBrands)}
                className="flex items-center gap-1 mt-1.5 text-xs text-primary-600 hover:text-primary-700 transition-colors"
              >
                {showAllBrands ? (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    Show all ({brands.length})
                  </>
                )}
              </button>
            )}
          </div>

          {/* Apply Button */}
          <button
            onClick={applyFilters}
            className="px-5 py-2 text-sm font-semibold bg-[#2874f0] text-white rounded-lg hover:bg-[#1a5dc8] transition-colors shadow-sm flex items-center gap-1.5"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
