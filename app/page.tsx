'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Product, Category, SuggestionsResponse } from '@/lib/types';
import { api } from '@/lib/api';
import { calculateDiscount } from '@/lib/utils';
import { useEvent } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/Loading';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [electronicsProducts, setElectronicsProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);
  const { trackPageView } = useEvent();
  const { user } = useAuth();
  const dealsScrollRef = useRef<HTMLDivElement>(null);

  const banners = [
    {
      id: 1,
      title: 'Galaxy S24',
      subtitle: "India's top selling android smartphone",
      price: '47,999',
      originalPrice: '74,999',
      bgColor: 'from-[#1a3a4a] via-[#2d5a6a] to-[#1a3a4a]',
      image: '/images/banner-1.jpg',
    },
    {
      id: 2,
      title: 'Electronics Sale',
      subtitle: 'Up to 80% off on top brands',
      price: '999',
      bgColor: 'from-[#2d1f3d] via-[#4a2d5a] to-[#2d1f3d]',
      image: '/images/banner-2.jpg',
    },
    {
      id: 3,
      title: 'Fashion Week',
      subtitle: 'Best deals on fashion',
      price: '299',
      bgColor: 'from-[#3d2d1f] via-[#5a4a2d] to-[#3d2d1f]',
      image: '/images/banner-3.jpg',
    },
  ];

  useEffect(() => {
    trackPageView('HOME', '/');
  }, [trackPageView]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch products, categories, and electronics in parallel
        const [productsRes, categoriesRes, electronicsRes] = await Promise.allSettled([
          api.getProducts(0, 12, 'createdAt,desc'),
          api.getCategories(),
          api.searchProducts('electronics', 0, 8),
        ]);

        // Handle products result
        if (productsRes.status === 'fulfilled' && productsRes.value?.content) {
          setFeaturedProducts(productsRes.value.content);
        } else {
          console.error('Failed to load products:', productsRes.status === 'rejected' ? productsRes.reason : 'No content');
          setHasError(true);
        }

        // Handle categories result
        if (categoriesRes.status === 'fulfilled' && Array.isArray(categoriesRes.value)) {
          setCategories(categoriesRes.value.slice(0, 8));
        } else {
          console.error('Failed to load categories:', categoriesRes.status === 'rejected' ? categoriesRes.reason : 'Invalid response');
        }

        // Handle electronics result
        if (electronicsRes.status === 'fulfilled' && electronicsRes.value?.content) {
          setElectronicsProducts(electronicsRes.value.content);
        } else {
          console.error('Failed to load electronics:', electronicsRes.status === 'rejected' ? electronicsRes.reason : 'No content');
        }
      } catch (error) {
        console.error('Failed to load home page data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Fetch personalized suggestions (separate effect to handle user changes)
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        setSuggestionsLoading(true);
        const suggestionsRes = await api.getSuggestions(12, user?.id);
        setSuggestions(suggestionsRes);
      } catch (error) {
        console.error('Failed to load suggestions:', error);
        setSuggestions(null);
      } finally {
        setSuggestionsLoading(false);
      }
    };

    loadSuggestions();
  }, [user?.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const scrollDeals = (direction: 'left' | 'right') => {
    if (dealsScrollRef.current) {
      const scrollAmount = 300;
      dealsScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  return (
    <div className="min-h-screen bg-[#f1f3f6]">
      {/* Hero Banner Carousel */}
      <section className="relative bg-gradient-to-r from-[#1a3a4a] via-[#2d5a6a] to-[#0a4a3a]">
        <div className="relative h-[200px] sm:h-[280px] overflow-hidden">
          {/* Banner Navigation Arrows */}
          <button
            onClick={() => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 rounded-sm shadow-md transition-colors"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>
          <button
            onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 rounded-sm shadow-md transition-colors"
          >
            <ChevronRight className="h-6 w-6 text-gray-700" />
          </button>

          {/* Banner Content */}
          <div className="h-full flex items-center justify-center px-16">
            <div className="text-center text-white">
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">{banners[currentBanner].title}</h2>
              <p className="text-lg opacity-90 mb-3">{banners[currentBanner].subtitle}</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl font-bold">From ₹{banners[currentBanner].price}</span>
                {banners[currentBanner].originalPrice && (
                  <span className="text-lg line-through opacity-60">₹{banners[currentBanner].originalPrice}</span>
                )}
              </div>
            </div>
          </div>

          {/* Banner Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentBanner ? 'w-6 bg-white' : 'w-2 bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Suggested for You Section */}
      <section className="py-4 px-2 sm:px-4">
        <div className="bg-white rounded-sm shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">
                {suggestions?.personalized ? 'Suggested For You' : 'Trending Products'}
              </h2>
              {suggestions?.personalized && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Personalized
                </span>
              )}
            </div>
            <Link
              href="/products"
              className="px-6 py-2 bg-[#2874f0] text-white text-sm font-medium rounded-sm hover:bg-[#1a5dc8] transition-colors"
            >
              VIEW ALL
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 p-4">
            {suggestionsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4">
                  <Skeleton className="h-32 w-full mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : !suggestions || suggestions.products.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-500">
                <p>No suggestions available</p>
                <Link href="/products" className="text-[#2874f0] hover:underline mt-2 inline-block">
                  Browse all products
                </Link>
              </div>
            ) : (
              suggestions.products.slice(0, 12).map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}?source=recommendation`}
                  className="p-4 hover:shadow-lg transition-shadow text-center group"
                >
                  <div className="h-32 flex items-center justify-center mb-3">
                    {product.thumbnailUrl ? (
                      <Image
                        src={product.thumbnailUrl}
                        alt={product.name}
                        width={120}
                        height={120}
                        className="object-contain max-h-full group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm text-gray-900 font-medium line-clamp-2 mb-1 group-hover:text-[#2874f0] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm font-bold text-gray-900">
                    ₹{formatPrice(product.price)}
                  </p>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <p className="text-xs text-green-600 font-medium">{calculateDiscount(product.compareAtPrice, product.price)}% off</p>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Top Deals Section */}
      <section className="py-4 px-2 sm:px-4">
        <div className="bg-white rounded-sm shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Top Deals</h2>
            <Link
              href="/products?featured=true"
              className="px-6 py-2 bg-[#2874f0] text-white text-sm font-medium rounded-sm hover:bg-[#1a5dc8] transition-colors"
            >
              VIEW ALL
            </Link>
          </div>

          <div className="relative">
            {/* Scroll Buttons */}
            <button
              onClick={() => scrollDeals('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg p-3 rounded-r-sm hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-gray-700" />
            </button>
            <button
              onClick={() => scrollDeals('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg p-3 rounded-l-sm hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="h-6 w-6 text-gray-700" />
            </button>

            {/* Products Scroll */}
            <div
              ref={dealsScrollRef}
              className="flex overflow-x-auto scrollbar-hide gap-0 px-10"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[180px] p-4 border-r border-gray-100">
                    <Skeleton className="h-32 w-full mb-3" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              ) : featuredProducts.length === 0 ? (
                <div className="flex-1 py-12 text-center text-gray-500">
                  <p>No products available at the moment.</p>
                  <Link href="/products" className="text-[#2874f0] hover:underline mt-2 inline-block">
                    Browse all products
                  </Link>
                </div>
              ) : (
                featuredProducts.slice(0, 8).map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}?source=home`}
                    className="flex-shrink-0 w-[180px] p-4 border-r border-gray-100 hover:shadow-lg transition-shadow text-center group"
                  >
                    <div className="h-32 flex items-center justify-center mb-3">
                      {product.thumbnailUrl ? (
                        <Image
                          src={product.thumbnailUrl}
                          alt={product.name}
                          width={120}
                          height={120}
                          className="object-contain max-h-full group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm text-gray-900 font-medium line-clamp-2 mb-1 group-hover:text-[#2874f0] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm font-bold text-gray-900">
                      From ₹{formatPrice(product.price)}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Row */}
      {(isLoading || categories.length > 0) && (
        <section className="py-4 px-2 sm:px-4">
          <div className="bg-white rounded-sm shadow-sm p-4">
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="text-center">
                    <Skeleton className="h-16 w-16 rounded-full mx-auto mb-2" />
                    <Skeleton className="h-4 w-16 mx-auto" />
                  </div>
                ))
              ) : (
                categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.id}`}
                    className="text-center group"
                  >
                    <div className="h-16 w-16 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#f0f5ff] transition-colors overflow-hidden">
                      {category.imageUrl ? (
                        <Image
                          src={category.imageUrl}
                          alt={category.name}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 group-hover:text-[#2874f0] transition-colors">
                      {category.name}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid with Side Banner */}
      <section className="py-4 px-2 sm:px-4">
        <div className="flex gap-4">
          {/* Main Products Grid */}
          <div className="flex-1 bg-white rounded-sm shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Best of Electronics</h2>
              <Link
                href="/products?search=electronics"
                className="px-6 py-2 bg-[#2874f0] text-white text-sm font-medium rounded-sm hover:bg-[#1a5dc8] transition-colors"
              >
                VIEW ALL
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-4">
                    <Skeleton className="h-32 w-full mb-3" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              ) : electronicsProducts.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-500">
                  <p>No electronics available</p>
                </div>
              ) : (
                electronicsProducts.slice(0, 4).map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}?source=home`}
                    className="p-4 hover:shadow-lg transition-shadow text-center group border border-gray-100 rounded-sm"
                  >
                    <div className="h-32 flex items-center justify-center mb-3">
                      {product.thumbnailUrl ? (
                        <Image
                          src={product.thumbnailUrl}
                          alt={product.name}
                          width={120}
                          height={120}
                          className="object-contain max-h-full group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm text-gray-900 font-medium line-clamp-2 mb-1 group-hover:text-[#2874f0] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm font-bold text-gray-900">
                      ₹{formatPrice(product.price)}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Side Banner */}
          <div className="hidden lg:block w-[300px] flex-shrink-0">
            <div className="bg-[#fff5e6] rounded-sm shadow-sm h-full p-6 flex flex-col justify-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Shop your fashion Needs</h3>
              <p className="text-sm text-gray-600 mb-4">with Latest &<br />Trendy Choices</p>
              <Link
                href="/products?category=fashion"
                className="inline-block px-4 py-2 bg-[#2874f0] text-white text-sm font-medium rounded-sm hover:bg-[#1a5dc8] transition-colors w-fit"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI Assistant Banner */}
      <section className="py-4 px-2 sm:px-4 mb-8">
        <div className="bg-white rounded-sm shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-6 p-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Need help finding products?</h2>
              <p className="text-gray-600 mb-4">
                Our AI assistant can help you find exactly what you're looking for.
                Just describe what you need!
              </p>
              <Link
                href="/chat"
                className="inline-block px-6 py-3 bg-[#2874f0] text-white font-medium rounded-sm hover:bg-[#1a5dc8] transition-colors"
              >
                Chat with AI Assistant
              </Link>
            </div>
            <div className="w-full md:w-[300px] h-[150px] bg-gradient-to-br from-[#f0f5ff] to-[#e0e8ff] rounded-sm flex items-center justify-center">
              <span className="text-6xl">🤖</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
