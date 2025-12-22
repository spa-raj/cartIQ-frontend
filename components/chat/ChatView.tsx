
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Send,
  Sparkles,
  User,
  Loader2,
  ShoppingCart,
  Star,
  Scale,
  Check,
} from 'lucide-react';
import { ChatMessage, ChatProductDTO } from '@/lib/types';
import { formatPrice, getPlaceholderImage } from '@/lib/utils';
import Button from '@/components/ui/Button';
import ChatMarkdown from '@/components/chat/ChatMarkdown';
import { CompareBar } from '@/components/chat/CompareBar';
import { MAX_COMPARE_PRODUCTS } from '@/hooks/useChat';

interface ChatViewProps {
  messages: ChatMessage[];
  input: string;
  isLoading: boolean;
  compareProducts: ChatProductDTO[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleAddToCart: (product: ChatProductDTO) => Promise<void>;
  isProductInCompare: (productId: string) => boolean;
  toggleCompareProduct: (product: ChatProductDTO) => void;
  handleCompare: () => Promise<void>;
  clearCompareProducts: () => void;
  // This prop is for the product card links, which differ between popup and full-page
  productUrlSource?: string;
  // Optional suggested questions to show when chat is empty
  suggestedQuestions?: string[];
  // Compact mode for popup (single column, smaller text)
  compact?: boolean;
}

export function ChatView({
  messages,
  input,
  isLoading,
  compareProducts,
  messagesEndRef,
  setInput,
  handleSubmit,
  handleAddToCart,
  isProductInCompare,
  toggleCompareProduct,
  handleCompare,
  clearCompareProducts,
  productUrlSource = 'recommendation',
  suggestedQuestions = [],
  compact = false,
}: ChatViewProps) {
  return (
    <>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-surface-50">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          {messages.map((message) => (
            <div key={message.id} className="animate-fade-in">
              <div
                className={`flex gap-4 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
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
                <div className={`mt-4 grid gap-3 ${compact ? 'ml-0 grid-cols-1' : 'ml-14 grid-cols-1 sm:grid-cols-2 gap-4'}`}>
                  {message.products.map((product) => (
                    <div
                      key={product.id}
                      className={`bg-white border border-surface-200 rounded-xl shadow-sm hover:shadow-md transition-shadow ${compact ? 'p-3' : 'p-4'}`}
                    >
                      <div className={`flex ${compact ? 'gap-3' : 'gap-4'}`}>
                        <Link href={`/products/${product.id}?source=${productUrlSource}`}>
                          <div className={`relative rounded-lg overflow-hidden bg-surface-100 flex-shrink-0 ${compact ? 'h-16 w-16' : 'h-20 w-20'}`}>
                            <Image
                              src={product.thumbnailUrl || getPlaceholderImage(compact ? 64 : 80, compact ? 64 : 80)}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes={compact ? '64px' : '80px'}
                            />
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${product.id}?source=${productUrlSource}`}
                            className={`font-medium text-surface-900 hover:text-primary-600 ${compact ? 'text-sm line-clamp-2' : 'line-clamp-2'}`}
                          >
                            {product.name}
                          </Link>
                          <div className={`flex items-center gap-2 ${compact ? 'mt-0.5' : 'mt-1'}`}>
                            <span className={`text-surface-500 ${compact ? 'text-xs' : 'text-sm'}`}>{product.brand}</span>
                            {product.rating > 0 && (
                              <span className={`flex items-center gap-0.5 text-yellow-600 ${compact ? 'text-xs' : 'text-sm'}`}>
                                <Star className={`fill-current ${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                {product.rating.toFixed(1)}
                              </span>
                            )}
                          </div>
                          <div className={`flex items-center justify-between ${compact ? 'mt-2' : 'mt-3'}`}>
                            <span className={`font-bold text-primary-600 ${compact ? 'text-base' : 'text-lg'}`}>
                              {formatPrice(product.price, 'INR')}
                            </span>
                            <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2'}`}>
                              <button
                                onClick={() => toggleCompareProduct(product)}
                                disabled={
                                  !isProductInCompare(product.id) &&
                                  compareProducts.length >= MAX_COMPARE_PRODUCTS
                                }
                                className={`rounded-lg transition-colors ${compact ? 'p-1.5' : 'p-2'} ${
                                  isProductInCompare(product.id)
                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                    : compareProducts.length >= MAX_COMPARE_PRODUCTS
                                    ? 'bg-surface-100 text-surface-400 cursor-not-allowed'
                                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                                }`}
                                title={
                                  isProductInCompare(product.id)
                                    ? 'Remove from compare'
                                    : compareProducts.length >= MAX_COMPARE_PRODUCTS
                                    ? `Max ${MAX_COMPARE_PRODUCTS} products to compare`
                                    : 'Add to compare'
                                }
                              >
                                {isProductInCompare(product.id) ? (
                                  <Check className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
                                ) : (
                                  <Scale className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
                                )}
                              </button>
                              {product.inStock ? (
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={() => handleAddToCart(product)}
                                  leftIcon={<ShoppingCart className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />}
                                  className={compact ? 'text-xs px-2 py-1' : ''}
                                >
                                  Add
                                </Button>
                              ) : (
                                <span className={`text-red-500 ${compact ? 'text-xs' : 'text-sm'}`}>Out of Stock</span>
                              )}
                            </div>
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
      
      {/* Compare Bar */}
      <CompareBar
        compareProducts={compareProducts}
        onCompare={handleCompare}
        onRemove={toggleCompareProduct}
        onClear={clearCompareProducts}
      />

      {/* Suggested Questions */}
      {suggestedQuestions.length > 0 && messages.length === 1 && !isLoading && (
        <div className="bg-white border-t border-surface-200">
          <div className="max-w-4xl mx-auto px-4 pt-4 pb-2">
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
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-surface-200">
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
        </form>
      </div>
    </>
  );
}
