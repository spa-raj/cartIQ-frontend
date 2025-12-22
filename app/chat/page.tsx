'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Send,
  Sparkles,
  User,
  Loader2,
  ArrowLeft,
  ShoppingCart,
  Star,
} from 'lucide-react';
import { ChatMessage, ChatProductDTO } from '@/lib/types';
import { api } from '@/lib/api';
import { useEvent } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { formatPrice, getPlaceholderImage } from '@/lib/utils';
import Button from '@/components/ui/Button';
import ChatMarkdown from '@/components/chat/ChatMarkdown';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Welcome to CartIQ! I'm your AI shopping assistant powered by advanced RAG technology. I can help you:\n\n- Find products based on your preferences\n- Get personalized recommendations\n- Answer questions about products\n- Compare items and prices\n\nWhat are you looking for today?",
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
    trackPageView('CHAT_FULL', '/chat');
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
          "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or browse our products directly.",
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

  const suggestedQuestions = [
    'Recommend me headphones under ₹7000',
    'Compare iPhone 15 and iPhone 16',
    'Find women\'s kurtas under ₹5000',
    'What\'s the best budget smartphone?',
  ];

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-surface-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-surface-600 hover:text-primary-600">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-surface-900">CartIQ AI Assistant</h1>
              <p className="text-xs text-surface-500">Powered by Gemini + RAG</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          {messages.map((message) => (
            <div key={message.id} className="animate-fade-in">
              <div
                className={`flex gap-4 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-primary-100 text-primary-700'
                      : ''
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="h-5 w-5" />
                  ) : (
                    <Sparkles className="h-6 w-6 text-surface-400" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-2xl px-5 py-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-primary-100 text-surface-800 rounded-br-sm'
                      : 'bg-white border border-surface-200 text-surface-800 rounded-bl-sm shadow-sm'
                  }`}
                >
                  <ChatMarkdown content={message.content} className="leading-relaxed" />
                </div>
              </div>

              {/* Product Cards */}
              {message.products && message.products.length > 0 && (
                <div className="mt-4 ml-14 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {message.products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white border border-surface-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-4">
                        <Link href={`/products/${product.id}?source=recommendation`}>
                          <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-surface-100 flex-shrink-0">
                            <Image
                              src={product.thumbnailUrl || getPlaceholderImage(80, 80)}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${product.id}?source=recommendation`}
                            className="font-medium text-surface-900 hover:text-primary-600 line-clamp-2"
                          >
                            {product.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-surface-500">{product.brand}</span>
                            {product.rating > 0 && (
                              <span className="flex items-center gap-0.5 text-sm text-yellow-600">
                                <Star className="h-3.5 w-3.5 fill-current" />
                                {product.rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-lg font-bold text-primary-600">
                              {formatPrice(product.price, 'INR')}
                            </span>
                            {product.inStock ? (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleAddToCart(product)}
                                leftIcon={<ShoppingCart className="h-4 w-4" />}
                              >
                                Add
                              </Button>
                            ) : (
                              <span className="text-sm text-red-500">Out of Stock</span>
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
            <div className="flex gap-4 animate-fade-in">
              <div className="h-10 w-10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-6 w-6 text-surface-400" />
              </div>
              <div className="bg-white border border-surface-200 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
                  <span className="text-surface-500">Analyzing your request...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="max-w-4xl mx-auto px-4 pb-4">
          <p className="text-sm text-surface-500 mb-3">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, i) => (
              <button
                key={i}
                onClick={() => setInput(question)}
                className="px-4 py-2 bg-white border border-surface-200 rounded-full text-sm text-surface-700 hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-surface-200 sticky bottom-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about products..."
              className="flex-1 px-5 py-3 border border-surface-300 rounded-xl text-surface-800 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={isLoading}
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!input.trim() || isLoading}
              leftIcon={<Send className="h-5 w-5" />}
            >
              Send
            </Button>
          </div>
          <p className="text-xs text-surface-400 text-center mt-3">
            AI recommendations are personalized based on your browsing activity via real-time Kafka
            streaming
          </p>
        </form>
      </div>
    </div>
  );
}
