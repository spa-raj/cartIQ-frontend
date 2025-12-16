'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Shield, Bell, Globe, CreditCard, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEvent } from '@/context/EventContext';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { User as UserType, UserPreference } from '@/lib/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { PageLoader } from '@/components/ui/Loading';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { trackPageView, trackUserProfile } = useEvent();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const [preferences, setPreferences] = useState<UserPreference | null>(null);
  const [orderStats, setOrderStats] = useState<{ totalOrders: number; totalSpent: number; topCategories: string[] }>({ totalOrders: 0, totalSpent: 0, topCategories: [] });

  useEffect(() => {
    trackPageView('PROFILE', '/profile');
  }, [trackPageView]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/profile');
      return;
    }

    const loadProfileData = async () => {
      if (!isAuthenticated) return;

      try {
        const [userData, prefsData, ordersData] = await Promise.all([
          api.getCurrentUser(),
          api.getPreferences().catch(() => null),
          api.getOrders(0, 100).catch(() => null),
        ]);

        setProfileData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
        });

        setPreferences(prefsData);

        // Calculate order statistics
        const totalOrders = ordersData?.totalElements || 0;
        const totalSpent = ordersData?.content?.reduce((sum, order) => sum + order.totalAmount, 0) || 0;

        // Calculate top categories from order history
        let topCategories: string[] = [];
        if (ordersData?.content && ordersData.content.length > 0) {
          // Fetch full order details (list endpoint doesn't include items)
          const orderDetails = await Promise.all(
            ordersData.content.slice(0, 10).map(order =>
              api.getOrder(order.id).catch(() => null)
            )
          );

          // Collect all product IDs from order items
          const productIds = new Set<string>();
          orderDetails.forEach(order => {
            order?.items?.forEach(item => {
              productIds.add(item.productId);
            });
          });

          // Fetch product details to get categories
          if (productIds.size > 0) {
            try {
              const products = await api.getProductsByIds(Array.from(productIds));

              // Count category frequency (weighted by quantity purchased)
              const categoryCount: Record<string, number> = {};
              orderDetails.forEach(order => {
                order?.items?.forEach(item => {
                  const product = products.find(p => p.id === item.productId);
                  if (product?.categoryName) {
                    categoryCount[product.categoryName] = (categoryCount[product.categoryName] || 0) + item.quantity;
                  }
                });
              });

              // Sort by frequency and get top 5 categories
              topCategories = Object.entries(categoryCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([category]) => category);
            } catch (productErr) {
              console.debug('Failed to fetch product details for categories:', productErr);
            }
          }
        }

        setOrderStats({ totalOrders, totalSpent, topCategories });
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [isAuthenticated, authLoading, router]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError(null);
    setSuccess(null);
  };

  const handlePreferenceChange = (key: keyof UserPreference, value: boolean | string | number | undefined) => {
    if (!preferences) return;
    setPreferences(prev => prev ? { ...prev, [key]: value } : null);
    setError(null);
    setSuccess(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone || undefined,
      });

      // Track user profile event on profile update
      trackUserProfile({
        topCategories: orderStats.topCategories,
        minPricePreference: preferences?.minPricePreference,
        maxPricePreference: preferences?.maxPricePreference,
        totalOrders: orderStats.totalOrders,
        totalSpent: orderStats.totalSpent,
      });

      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!preferences) return;

    setIsSavingPrefs(true);
    setError(null);
    setSuccess(null);

    try {
      await api.updatePreferences({
        emailNotifications: preferences.emailNotifications,
        pushNotifications: preferences.pushNotifications,
        currency: preferences.currency,
        language: preferences.language,
        minPricePreference: preferences.minPricePreference,
        maxPricePreference: preferences.maxPricePreference,
      });

      // Track user profile event on preference update
      trackUserProfile({
        topCategories: orderStats.topCategories,
        minPricePreference: preferences.minPricePreference,
        maxPricePreference: preferences.maxPricePreference,
        totalOrders: orderStats.totalOrders,
        totalSpent: orderStats.totalSpent,
      });

      setSuccess('Preferences updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setIsSavingPrefs(false);
    }
  };

  if (authLoading || isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-surface-900 mb-8">My Profile</h1>

        {/* Success/Error Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-white rounded-xl border border-surface-200 p-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-primary-600" />
              Personal Information
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  placeholder="John"
                  required
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  placeholder="Doe"
                  required
                />
              </div>

              <Input
                label="Email"
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleProfileChange}
                placeholder="john@example.com"
                disabled
                className="bg-surface-50"
              />

              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                value={profileData.phone}
                onChange={handleProfileChange}
                placeholder="+1 (555) 123-4567"
              />

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Account Info */}
          <div className="bg-white rounded-xl border border-surface-200 p-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary-600" />
              Account Information
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-surface-100">
                <span className="text-surface-500">Account Type</span>
                <span className="font-medium text-surface-900">{user?.role || 'USER'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-surface-100">
                <span className="text-surface-500">Account Status</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-surface-500">Member Since</span>
                <span className="font-medium text-surface-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Preferences */}
          {preferences && (
            <div className="bg-white rounded-xl border border-surface-200 p-6">
              <h2 className="text-lg font-semibold text-surface-900 mb-6 flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary-600" />
                Preferences
              </h2>

              <div className="space-y-6">
                {/* Notifications */}
                <div>
                  <h3 className="text-sm font-medium text-surface-700 mb-3">Notifications</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-surface-600">Email Notifications</span>
                      <input
                        type="checkbox"
                        checked={preferences.emailNotifications}
                        onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-surface-300 rounded"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-surface-600">Push Notifications</span>
                      <input
                        type="checkbox"
                        checked={preferences.pushNotifications}
                        onChange={(e) => handlePreferenceChange('pushNotifications', e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-surface-300 rounded"
                      />
                    </label>
                  </div>
                </div>

                {/* Regional */}
                <div>
                  <h3 className="text-sm font-medium text-surface-700 mb-3">Regional Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-surface-600 mb-1">Currency</label>
                      <select
                        value={preferences.currency}
                        onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                        className="w-full rounded-lg border border-surface-300 px-4 py-2.5 text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="INR">INR - Indian Rupee</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-surface-600 mb-1">Language</label>
                      <select
                        value={preferences.language}
                        onChange={(e) => handlePreferenceChange('language', e.target.value)}
                        className="w-full rounded-lg border border-surface-300 px-4 py-2.5 text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-sm font-medium text-surface-700 mb-3">Price Preferences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-surface-600 mb-1">Min Price</label>
                      <input
                        type="number"
                        value={preferences.minPricePreference || ''}
                        onChange={(e) => handlePreferenceChange('minPricePreference', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="0"
                        className="w-full rounded-lg border border-surface-300 px-4 py-2.5 text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-surface-600 mb-1">Max Price</label>
                      <input
                        type="number"
                        value={preferences.maxPricePreference || ''}
                        onChange={(e) => handlePreferenceChange('maxPricePreference', e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="100000"
                        className="w-full rounded-lg border border-surface-300 px-4 py-2.5 text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleSavePreferences}
                    isLoading={isSavingPrefs}
                    leftIcon={<Save className="h-4 w-4" />}
                  >
                    Save Preferences
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
