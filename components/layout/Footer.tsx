'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronUp, Github } from 'lucide-react';

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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          {/* Shop */}
          <div>
            <h3 className="text-white font-bold mb-4">Shop</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/products" className="text-sm hover:text-primary-400 hover:underline transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?featured=true" className="text-sm hover:text-primary-400 hover:underline transition-colors">
                  Today&apos;s Deals
                </Link>
              </li>
              <li>
                <Link href="/products?sort=newest" className="text-sm hover:text-primary-400 hover:underline transition-colors">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Your Account */}
          <div>
            <h3 className="text-white font-bold mb-4">Your Account</h3>
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
                <Link href="/chat" className="text-sm hover:text-primary-400 hover:underline transition-colors">
                  AI Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* GitHub */}
          <div>
            <h3 className="text-white font-bold mb-4">GitHub</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://github.com/spa-raj/cartIQ-frontend"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-primary-400 hover:underline transition-colors flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  Frontend Repo
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/spa-raj/cartIQ-backend"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-primary-400 hover:underline transition-colors flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  Backend Repo
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
              <span className="text-2xl font-bold text-[#2874f0] italic">CartIQ</span>
            </Link>

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
