
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
  productUrlSource = 'recommendation'
}: ChatViewProps) {
  return (
    <>
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
                <div className="mt-4 ml-14 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {message.products.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white border border-surface-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-4">
                        <Link href={`/products/${product.id}?source=${productUrlSource}`}>
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
                            href={`/products/${product.id}?source=${productUrlSource}`}
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
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleCompareProduct(product)}
                                disabled={
                                  !isProductInCompare(product.id) &&
                                  compareProducts.length >= MAX_COMPARE_PRODUCTS
                                }
                                className={`p-2 rounded-lg transition-colors ${
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
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Scale className="h-4 w-4" />
                                )}
                              </button>
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
