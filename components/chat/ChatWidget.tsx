'use client';

import React, { useState } from 'react';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import ChatWindow from './ChatWindow';
import { cn } from '@/lib/utils';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat Window */}
      <div
        className={cn(
          'fixed bottom-24 right-4 z-50 transition-all duration-300',
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        )}
      >
        <ChatWindow onClose={() => setIsOpen(false)} />
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110',
          isOpen
            ? 'bg-gray-800 text-white rotate-90'
            : 'bg-[#2874f0] text-white'
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <Sparkles className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-secondary-500 rounded-full animate-pulse" />
          </div>
        )}
      </button>

      {/* Tooltip (when closed) */}
      {!isOpen && (
        <div className="fixed bottom-20 right-4 z-40 animate-fade-in">
          <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="font-medium">Need help? Ask our AI!</span>
            </div>
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-gray-900 rotate-45" />
          </div>
        </div>
      )}
    </>
  );
}
