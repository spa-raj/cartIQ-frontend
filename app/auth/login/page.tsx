'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEvent } from '@/context/EventContext';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { isValidEmail } from '@/lib/utils';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { login } = useAuth();
  const { trackPageView, trackUserProfile } = useEvent();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    trackPageView('LOGIN', '/auth/login');
  }, [trackPageView]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      await login(formData);

      // Track user profile event after successful login
      try {
        const [prefsData, ordersData] = await Promise.all([
          api.getPreferences().catch(() => null),
          api.getOrders(0, 100).catch(() => null),
        ]);

        const totalOrders = ordersData?.totalElements || 0;
        const totalSpent = ordersData?.content?.reduce((sum, order) => sum + order.totalAmount, 0) || 0;

        // Calculate top categories from order history
        let topCategories: string[] = [];
        if (ordersData?.content && ordersData.content.length > 0) {
          const productIds = new Set<string>();
          ordersData.content.forEach(order => {
            order.items?.forEach(item => productIds.add(item.productId));
          });

          if (productIds.size > 0) {
            const products = await api.getProductsByIds(Array.from(productIds)).catch(() => []);
            const categoryCount: Record<string, number> = {};
            ordersData.content.forEach(order => {
              order.items?.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product?.categoryName) {
                  categoryCount[product.categoryName] = (categoryCount[product.categoryName] || 0) + item.quantity;
                }
              });
            });
            topCategories = Object.entries(categoryCount)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([category]) => category);
          }
        }

        trackUserProfile({
          topCategories,
          minPricePreference: prefsData?.minPricePreference,
          maxPricePreference: prefsData?.maxPricePreference,
          totalOrders,
          totalSpent,
        });
      } catch (profileError) {
        console.debug('Failed to track user profile on login:', profileError);
      }

      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <span className="text-3xl font-bold text-[#2874f0] italic">
              CartIQ
            </span>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-surface-900">Welcome back</h1>
            <p className="text-surface-500 mt-2">
              Sign in to your account to continue shopping
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              leftIcon={<Mail className="h-5 w-5" />}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                leftIcon={<Lock className="h-5 w-5" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-surface-400 hover:text-surface-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-surface-600">Remember me</span>
              </label>
              <Link href="#" className="text-primary-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-surface-500">
            Don't have an account?{' '}
            <Link
              href={`/auth/register${redirect !== '/' ? `?redirect=${redirect}` : ''}`}
              className="text-primary-600 font-medium hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-[#2874f0] items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <div className="h-20 w-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            AI-Powered Shopping Experience
          </h2>
          <p className="text-white/90 text-lg">
            Get personalized product recommendations based on your preferences and shopping history.
            Our AI assistant is here to help you find exactly what you need.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-50" />}>
      <LoginForm />
    </Suspense>
  );
}
