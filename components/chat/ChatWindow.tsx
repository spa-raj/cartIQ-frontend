'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Loader2, X, ShoppingCart, Star } from 'lucide-react';
import { ChatMessage, ChatProductDTO } from '@/lib/types';
import { api } from '@/lib/api';
import { useEvent } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { formatPrice, getPlaceholderImage } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

interface ChatWindowProps {
  onClose: () => void;
}

export default function ChatWindow({ onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hi! I'm your AI shopping assistant. I can help you find products, answer questions, and give personalized recommendations. What are you looking for today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { trackPageView, recentlyViewedProductIds, recentCategories } = useEvent();
  const { isAuthenticated, user } = useAuth();
  const { addToCart, cart } = useCart();

  useEffect(() => {
    trackPageView('CHAT', '/chat');
  }, [trackPageView]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.sendChatMessage(
        {
          message: userMessage.content,
          userId: user?.id,
          recentlyViewedProductIds,
          recentCategories,
          cartProductIds: cart?.items?.map(item => item.productId),
          cartTotal: cart?.totalAmount,
        },
        chatSessionId || undefined
      );

      // Store session ID for conversation continuity
      if (!chatSessionId && response.sessionId) {
        setChatSessionId(response.sessionId);
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        products: response.products,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (product: ChatProductDTO) => {
    if (!isAuthenticated) {
      window.location.href = '/auth/login?redirect=/chat';
      return;
    }
    try {
      await addToCart(product.id, 1, product.name, product.price, product.categoryName);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  return (
    <div className="w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl border border-surface-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">CartIQ Assistant</h3>
            <p className="text-primary-100 text-xs">Powered by AI</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-50">
        {messages.map((message) => (
          <div key={message.id}>
            <div
              className={`flex gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user'
                    ? 'bg-primary-100 text-primary-700'
                    : ''
                }`}
              >
                {message.role === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-5 w-5 text-surface-400" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white rounded-br-sm'
                    : 'bg-white border border-surface-200 text-surface-800 rounded-bl-sm shadow-sm'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            </div>

            {/* Product Cards */}
            {message.products && message.products.length > 0 && (
              <div className="mt-3 ml-11 space-y-2">
                {message.products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white border border-surface-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-3">
                      <Link href={`/products/${product.id}?source=recommendation`}>
                        <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-surface-100 flex-shrink-0">
                          <Image
                            src={product.thumbnailUrl || getPlaceholderImage(80, 80)}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${product.id}?source=recommendation`}
                          className="text-sm font-medium text-surface-900 hover:text-primary-600 line-clamp-1"
                        >
                          {product.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-surface-500">{product.brand}</span>
                          {product.rating > 0 && (
                            <span className="flex items-center gap-0.5 text-xs text-yellow-600">
                              <Star className="h-3 w-3 fill-current" />
                              {product.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-semibold text-primary-600">
                            {formatPrice(product.price, 'INR')}
                          </span>
                          {product.inStock ? (
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="flex items-center gap-1 text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-lg hover:bg-primary-100 transition-colors"
                            >
                              <ShoppingCart className="h-3 w-3" />
                              Add
                            </button>
                          ) : (
                            <span className="text-xs text-red-500">Out of Stock</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-surface-400" />
            </div>
            <div className="bg-white border border-surface-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                <span className="text-sm text-surface-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-surface-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-2.5 border border-surface-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <p className="text-xs text-surface-400 text-center mt-2">
          AI recommendations are personalized based on your activity
        </p>
      </form>
    </div>
  );
}
