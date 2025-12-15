'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
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
    <div className="mb-6">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Mobile Filter Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          leftIcon={<SlidersHorizontal className="h-4 w-4" />}
          className="lg:hidden"
        >
          Filters
          {hasActiveFilters && (
            <span className="ml-1 h-5 w-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
              {(minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + selectedBrands.length}
            </span>
          )}
        </Button>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-surface-600 hidden sm:block">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setTimeout(applyFilters, 0);
            }}
            className="px-3 py-2 text-sm border border-surface-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
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
          <Button variant="ghost" size="sm" onClick={clearFilters} leftIcon={<X className="h-4 w-4" />}>
            Clear filters
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      <div
        className={cn(
          'mt-4 p-4 bg-white border border-surface-200 rounded-xl transition-all duration-300',
          showFilters ? 'block' : 'hidden lg:block'
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Price Range */}
          <div>
            <h4 className="text-sm font-medium text-surface-900 mb-3">Price Range</h4>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="text-sm"
              />
              <span className="text-surface-400">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          {/* Brands */}
          <div>
            <h4 className="text-sm font-medium text-surface-900 mb-3">Brands</h4>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => toggleBrand(brand)}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-full border transition-colors',
                    selectedBrands.includes(brand)
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'bg-white border-surface-300 text-surface-600 hover:border-surface-400'
                  )}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <div className="flex items-end">
            <Button variant="primary" onClick={applyFilters} className="w-full md:w-auto">
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
