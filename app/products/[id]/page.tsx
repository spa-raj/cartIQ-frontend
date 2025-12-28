'use client';

import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Check,
} from 'lucide-react';
import { Product, ProductViewSource } from '@/lib/types';
import { api } from '@/lib/api';
import { useEvent } from '@/context/EventContext';
import { formatPrice, calculateDiscount, getPlaceholderImage } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import AddToCartButton from '@/components/cart/AddToCartButton';
import ProductGrid from '@/components/products/ProductGrid';
import { PageLoader, Skeleton } from '@/components/ui/Loading';

function ProductDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { trackProductView } = useEvent();

  // Track view duration
  const viewStartTime = useRef<number>(Date.now());
  const productDataRef = useRef<Product | null>(null);
  const hasTrackedRef = useRef<boolean>(false);

  // Get source and search query from URL params
  const source = (searchParams.get('source') as ProductViewSource) || 'DIRECT';
  const searchQuery = searchParams.get('q') || undefined;

  // Use ref to always have latest trackProductView (avoids stale closure with user auth)
  const trackProductViewRef = useRef(trackProductView);
  const sourceRef = useRef(source);
  const searchQueryRef = useRef(searchQuery);

  // Keep refs updated
  useEffect(() => {
    trackProductViewRef.current = trackProductView;
    sourceRef.current = source;
    searchQueryRef.current = searchQuery;
  }, [trackProductView, source, searchQuery]);

  // Function to track product view with duration (uses refs to avoid stale closures)
  const trackViewWithDuration = useCallback(() => {
    if (!productDataRef.current || hasTrackedRef.current) return;

    const viewDurationMs = Date.now() - viewStartTime.current;
    trackProductViewRef.current(
      productDataRef.current.id,
      productDataRef.current.name,
      productDataRef.current.categoryName,
      productDataRef.current.price,
      sourceRef.current,
      searchQueryRef.current,
      viewDurationMs
    );
    hasTrackedRef.current = true;
  }, []);

  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true);
      viewStartTime.current = Date.now();
      hasTrackedRef.current = false;

      try {
        const data = await api.getProduct(productId);
        setProduct(data);
        productDataRef.current = data;

        // Track product view immediately for reliability (before user navigates away)
        // This ensures the event is sent even if user closes tab quickly
        trackProductViewRef.current(
          data.id,
          data.name,
          data.categoryName,
          data.price,
          sourceRef.current,
          searchQueryRef.current,
          undefined // viewDurationMs will be sent on unmount if user stays longer
        );
        hasTrackedRef.current = true;

        // Load related products
        if (data.categoryId) {
          const related = await api.getProductsByCategory(data.categoryId, 0, 4);
          setRelatedProducts(related.content.filter((p) => p.id !== data.id).slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  // Track view on unmount or visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        trackViewWithDuration();
      }
    };

    const handleBeforeUnload = () => {
      trackViewWithDuration();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      trackViewWithDuration();
    };
  }, [trackViewWithDuration]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Product Not Found</h1>
          <p className="text-surface-500 mb-4">The product you're looking for doesn't exist.</p>
          <Link href="/products">
            <Button variant="primary">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = product.imageUrls?.length > 0 ? product.imageUrls : [getPlaceholderImage(600, 600)];
  const discountPercent = product.compareAtPrice
    ? calculateDiscount(product.compareAtPrice, product.price)
    : 0;

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
          <Link
            href={`/categories/${product.categoryId}`}
            className="hover:text-primary-600"
          >
            {product.categoryName}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-surface-900 font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-2xl border border-surface-200 overflow-hidden">
              <Image
                src={images[selectedImageIndex]}
                alt={product.name}
                fill
                className="object-contain p-4"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.featured && (
                  <Badge variant="secondary">Featured</Badge>
                )}
                {discountPercent > 0 && (
                  <Badge variant="accent">-{discountPercent}% OFF</Badge>
                )}
                {!product.inStock && (
                  <Badge variant="danger">Out of Stock</Badge>
                )}
              </div>

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImageIndex((i) => (i === 0 ? images.length - 1 : i - 1))
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImageIndex((i) => (i === images.length - 1 ? 0 : i + 1))
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Grid */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index
                        ? 'border-primary-500'
                        : 'border-surface-200 hover:border-surface-300'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category & Brand */}
            <div className="flex items-center gap-2 text-sm">
              <Link
                href={`/categories/${product.categoryId}`}
                className="text-primary-600 hover:underline"
              >
                {product.categoryName}
              </Link>
              {product.brand && (
                <>
                  <span className="text-surface-300">•</span>
                  <span className="text-surface-500">{product.brand}</span>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-surface-900">{product.name}</h1>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-secondary-500 fill-secondary-500'
                          : 'text-surface-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium text-surface-900">{product.rating.toFixed(1)}</span>
                <span className="text-surface-500">({product.reviewCount} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-surface-900">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xl text-surface-400 line-through">
                  {formatPrice(product.compareAtPrice, product.currency)}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-green-600 font-medium">Save {discountPercent}%</span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.inStock ? (
                <>
                  <div className="h-3 w-3 bg-green-500 rounded-full" />
                  <span className="text-green-600 font-medium">In Stock</span>
                  <span className="text-surface-500">({product.stockQuantity} available)</span>
                </>
              ) : (
                <>
                  <div className="h-3 w-3 bg-red-500 rounded-full" />
                  <span className="text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>

            {/* Add to Cart */}
            <div className="pt-4">
              <AddToCartButton
                productId={product.id}
                productName={product.name}
                price={product.price}
                inStock={product.inStock}
                category={product.categoryName}
                size="lg"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-2">
              <button className="flex items-center gap-2 text-surface-600 hover:text-primary-600 transition-colors">
                <Heart className="h-5 w-5" />
                <span className="text-sm">Add to Wishlist</span>
              </button>
              <button className="flex items-center gap-2 text-surface-600 hover:text-primary-600 transition-colors">
                <Share2 className="h-5 w-5" />
                <span className="text-sm">Share</span>
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-surface-200">
              <div className="text-center">
                <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Truck className="h-5 w-5 text-primary-600" />
                </div>
                <p className="text-xs text-surface-600">Free shipping over $500</p>
              </div>
              <div className="text-center">
                <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <RotateCcw className="h-5 w-5 text-primary-600" />
                </div>
                <p className="text-xs text-surface-600">30-day returns</p>
              </div>
              <div className="text-center">
                <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Shield className="h-5 w-5 text-primary-600" />
                </div>
                <p className="text-xs text-surface-600">2-year warranty</p>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="pt-6 border-t border-surface-200">
                <h3 className="font-semibold text-surface-900 mb-3">Description</h3>
                <p className="text-surface-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* SKU */}
            <div className="text-sm text-surface-500">
              SKU: <span className="font-mono">{product.sku}</span>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-16 border-t border-surface-200">
            <h2 className="text-2xl font-bold text-surface-900 mb-8">You May Also Like</h2>
            <ProductGrid products={relatedProducts} source="RECOMMENDATION" />
          </section>
        )}
      </div>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ProductDetailContent />
    </Suspense>
  );
}
