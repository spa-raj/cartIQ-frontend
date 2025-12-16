'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone, Sparkles, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEvent } from '@/context/EventContext';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { isValidEmail, validatePassword, validatePhone, formatPhoneToE164 } from '@/lib/utils';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { register } = useAuth();
  const { trackPageView, trackUserProfile } = useEvent();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    trackPageView('REGISTER', '/auth/register');
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

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate phone if provided
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      setError(phoneValidation.message || 'Invalid phone number');
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message || 'Invalid password');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Format phone to E.164 (remove spaces and special chars) before sending
      const formattedPhone = formData.phone ? formatPhoneToE164(formData.phone) : undefined;

      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formattedPhone || undefined,
      });

      // Track user profile event for new user
      trackUserProfile({
        topCategories: [],
        totalOrders: 0,
        totalSpent: 0,
      });

      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '' };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
    const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'];

    return { strength, label: labels[strength], color: colors[strength] };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-[#2874f0] items-center justify-center p-12">
        <div className="max-w-lg">
          <div className="h-20 w-20 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Join the Smart Shopping Revolution
          </h2>
          <p className="text-white/90 text-lg mb-8">
            Create an account to unlock personalized recommendations, track orders, and enjoy a
            seamless shopping experience powered by AI.
          </p>

          <div className="space-y-4">
            {[
              'AI-powered product recommendations',
              'Real-time order tracking',
              'Exclusive member deals',
              'Personalized shopping experience',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-6 w-6 bg-[#ffc107] rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-gray-900" />
                </div>
                <span className="text-white font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <span className="text-3xl font-bold text-[#2874f0] italic">
              CartIQ
            </span>
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-surface-900">Create an account</h1>
            <p className="text-surface-500 mt-2">Start your AI-powered shopping journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                leftIcon={<User className="h-5 w-5" />}
                required
              />
              <Input
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                required
              />
            </div>

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

            <Input
              label="Phone (Optional)"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+918583022292"
              leftIcon={<Phone className="h-5 w-5" />}
            />

            <div className="relative">
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
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

              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i < passwordStrength.strength
                            ? passwordStrength.color
                            : 'bg-surface-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-surface-500">{passwordStrength.label}</p>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              leftIcon={<Lock className="h-5 w-5" />}
              required
            />

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
              Create Account
            </Button>

            <p className="text-xs text-surface-500 text-center">
              By creating an account, you agree to our{' '}
              <Link href="#" className="text-primary-600 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" className="text-primary-600 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </form>

          <p className="mt-8 text-center text-sm text-surface-500">
            Already have an account?{' '}
            <Link
              href={`/auth/login${redirect !== '/' ? `?redirect=${redirect}` : ''}`}
              className="text-primary-600 font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-50" />}>
      <RegisterForm />
    </Suspense>
  );
}
