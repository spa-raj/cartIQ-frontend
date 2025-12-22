
import { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatProductDTO } from '@/lib/types';
import { api } from '@/lib/api';
import { useEvent } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export const MAX_COMPARE_PRODUCTS = 2;

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome to CartIQ! I'm your AI shopping assistant. How can I help you find the perfect product today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [compareProducts, setCompareProducts] = useState<ChatProductDTO[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { trackPageView, recentlyViewedProductIds, recentCategories } = useEvent();
  const { isAuthenticated, user } = useAuth();
  const { addToCart, cart } = useCart();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageContent.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await api.sendChatMessage(
        {
          message: userMessage.content,
          userId: user?.id,
          recentlyViewedProductIds,
          recentCategories,
          cartProductIds: cart?.items?.map((item) => item.productId),
          cartTotal: cart?.totalAmount,
        },
        chatSessionId || undefined
      );

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
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
    setInput('');
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

  const isProductInCompare = (productId: string) => {
    return compareProducts.some((p) => p.id === productId);
  };

  const toggleCompareProduct = (product: ChatProductDTO) => {
    if (isProductInCompare(product.id)) {
      setCompareProducts((prev) => prev.filter((p) => p.id !== product.id));
    } else if (compareProducts.length < MAX_COMPARE_PRODUCTS) {
      setCompareProducts((prev) => [...prev, product]);
    }
  };

  const handleCompare = async () => {
    if (compareProducts.length !== MAX_COMPARE_PRODUCTS || isLoading) return;

    const [product1, product2] = compareProducts;
    const comparePrompt = `Compare "${product1.name}" (${product1.brand}, ${formatPrice(
      product1.price,
      'INR'
    )}) with "${product2.name}" (${product2.brand}, ${formatPrice(
      product2.price,
      'INR'
    )}). Help me decide which one to buy.`;

    setCompareProducts([]);
    await sendMessage(comparePrompt);
  };
  
  const clearCompareProducts = () => {
    setCompareProducts([]);
  }

  return {
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
    trackPageView,
  };
}
