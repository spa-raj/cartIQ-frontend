'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronUp } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#232f3e] text-[#cccccc]">
      {/* Back to Top */}
      <button
        onClick={scrollToTop}
        className="w-full bg-[#37475a] hover:bg-[#485769] py-4 text-center text-sm font-medium transition-colors flex items-center justify-center gap-2 text-white"
      >
        <ChevronUp className="h-4 w-4" />
        Back to top
      </button>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Get to Know Us */}
          <div>
            <h3 className="text-white font-bold mb-4">Get to Know Us</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm hover:text-primary-400 hover:underline transition-colors">
                  About CartIQ
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:text-primary-400 hover:underline transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:text-primary-400 hover:underline transition-colors">
                  Press Releases
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-sm hover:text-primary-400 hover:underline transition-colors">
                  AI Technology
                </Link>
              </li>
            </ul>
          </div>

          {/* Shop With Us */}
          <div>
            <h3 className="text-white font-bold mb-4">Shop With Us</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/products" className="text-sm hover:text-primary-400 hover:underline transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?featured=true" className="text-sm hover:text-primary-400 hover:underline transition-colors">
                  Today's Deals
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-sm hover:text-primary-400 hover:underline transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/products?sort=newest" className="text-sm hover:text-primary-400 hover:underline transition-colors">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Let Us Help You */}
          <div>
            <h3 className="text-white font-bold mb-4">Let Us Help You</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/orders" className="text-sm hover:text-primary-400 hover:underline transition-colors">
                  Your Orders
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-sm hover:text-primary-400 hover:underline transition-colors">
                  Your Cart
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:text-primary-400 hover:underline transition-colors">
                  Shipping Rates
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm hover:text-primary-400 hover:underline transition-colors">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-sm hover:text-primary-400 hover:underline transition-colors">
                  AI Assistant Help
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect With Us */}
          <div>
            <h3 className="text-white font-bold mb-4">Connect With Us</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm hover:text-primary-400 hover:underline transition-colors">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-primary-400 hover:underline transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-primary-400 hover:underline transition-colors">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-primary-400 hover:underline transition-colors">
                  YouTube
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-[#3a4553]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/images/cartIQ-logo.png"
                alt="CartIQ"
                width={100}
                height={32}
                className="h-8 w-auto object-contain"
              />
            </Link>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-surface-400">
              <Link href="#" className="hover:text-primary-400 transition-colors">
                Conditions of Use
              </Link>
              <span className="text-surface-600">|</span>
              <Link href="#" className="hover:text-primary-400 transition-colors">
                Privacy Notice
              </Link>
              <span className="text-surface-600">|</span>
              <Link href="#" className="hover:text-primary-400 transition-colors">
                Interest-Based Ads
              </Link>
            </div>

            {/* Copyright */}
            <p className="text-xs text-surface-500">
              &copy; {currentYear} CartIQ. Built for AI Partner Catalyst Hackathon.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
