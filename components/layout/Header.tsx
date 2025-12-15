'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  LogOut,
  Package,
  ChevronDown,
  User,
  Store,
  MoreVertical,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsLoginDropdownOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      {/* Main Header - White Flipkart Style */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 gap-4 lg:gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <span className="text-2xl font-bold text-[#2874f0] italic">CartIQ</span>
            </Link>

            {/* Search Bar - Flipkart Style */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="flex items-center bg-[#f0f5ff] rounded-sm">
                <input
                  type="text"
                  placeholder="Search for Products, Brands and More"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm text-gray-900 bg-transparent focus:outline-none placeholder-gray-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 text-[#2874f0]"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-2 lg:gap-6">
              {/* Login Dropdown - Flipkart Style */}
              <div
                className="relative"
                onMouseEnter={() => setIsLoginDropdownOpen(true)}
                onMouseLeave={() => setIsLoginDropdownOpen(false)}
              >
                <button
                  className="hidden lg:flex items-center gap-1 px-4 py-1.5 bg-white text-gray-900 font-medium text-sm rounded-sm border border-gray-200 hover:border-[#2874f0] transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>{isAuthenticated ? user?.firstName : 'Login'}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* Mobile Login Icon */}
                <Link
                  href={isAuthenticated ? "/profile" : "/auth/login"}
                  className="lg:hidden flex items-center text-gray-900"
                >
                  <User className="h-5 w-5" />
                </Link>

                {/* Dropdown Menu */}
                {isLoginDropdownOpen && (
                  <div className="absolute right-0 top-full pt-2 w-56 z-50">
                    <div className="bg-white rounded-sm shadow-lg border border-gray-200">
                      {/* New Customer Sign Up - Only show when not authenticated */}
                      {!isAuthenticated && (
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                          <span className="text-sm text-gray-700">New customer?</span>
                          <Link
                            href="/auth/register"
                            className="text-sm font-medium text-[#2874f0] hover:underline"
                          >
                            Sign Up
                          </Link>
                        </div>
                      )}

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          href={isAuthenticated ? "/profile" : "/auth/login"}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User className="h-4 w-4 text-[#2874f0]" />
                          My Profile
                        </Link>
                        <Link
                          href="/orders"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Package className="h-4 w-4 text-[#2874f0]" />
                          Orders
                        </Link>

                        {/* Logout - Only show when authenticated */}
                        {isAuthenticated && (
                          <>
                            <hr className="my-1 border-gray-100" />
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <LogOut className="h-4 w-4 text-[#2874f0]" />
                              Logout
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart - Flipkart Style */}
              <Link
                href="/cart"
                className="flex items-center gap-2 text-gray-900 hover:text-[#2874f0] font-medium text-sm transition-colors"
              >
                <div className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 h-4 w-4 bg-[#ff6161] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </div>
                <span className="hidden lg:inline">Cart</span>
              </Link>

              {/* Become a Seller */}
              <Link
                href="/seller"
                className="hidden lg:flex items-center gap-2 text-gray-900 hover:text-[#2874f0] font-medium text-sm transition-colors"
              >
                <Store className="h-5 w-5" />
                <span>Become a Seller</span>
              </Link>

              {/* More Options */}
              <button className="hidden lg:flex items-center text-gray-700 hover:text-[#2874f0]">
                <MoreVertical className="h-5 w-5" />
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:text-[#2874f0] transition-colors"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            <Link
              href="/products"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 rounded-sm bg-gray-50 hover:bg-[#f0f5ff] text-gray-900 font-medium transition-colors"
            >
              All Products
            </Link>
            <Link
              href="/categories"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 rounded-sm hover:bg-[#f0f5ff] text-gray-700 font-medium transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/products?featured=true"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 rounded-sm hover:bg-[#f0f5ff] text-gray-700 font-medium transition-colors"
            >
              Top Offers
            </Link>
            <Link
              href="/chat"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 rounded-sm bg-[#f0f5ff] text-[#2874f0] font-medium transition-colors"
            >
              AI Assistant
            </Link>
            <Link
              href="/seller"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 rounded-sm hover:bg-[#f0f5ff] text-gray-700 font-medium transition-colors"
            >
              Become a Seller
            </Link>
            {!isAuthenticated && (
              <div className="pt-4 border-t border-gray-100 mt-4 space-y-2">
                <Link
                  href="/auth/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center px-4 py-3 rounded-sm bg-[#2874f0] hover:bg-[#1a5dc8] text-white font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center px-4 py-3 rounded-sm border border-gray-300 hover:border-[#2874f0] text-gray-700 font-medium transition-colors"
                >
                  New Customer? Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
