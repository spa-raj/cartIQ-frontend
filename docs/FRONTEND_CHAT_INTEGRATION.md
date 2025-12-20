# Frontend Chat Integration Guide

This guide explains how to integrate the CartIQ AI Chat API into your frontend chat window.

## API Endpoint

```
POST /api/chat
```

## Request Format

### Headers

```javascript
{
  "Content-Type": "application/json",
  "X-Session-Id": "optional-session-id",  // For conversation continuity
  "X-User-Id": "optional-user-id"          // Alternative to body userId
}
```

### Request Body

```typescript
interface ChatRequest {
  // Required
  message: string;                    // User's chat message

  // Optional - User identification
  userId?: string;                    // User ID for tracking & personalization

  // Optional - Context for personalization
  recentlyViewedProductIds?: string[];  // Product IDs user recently viewed
  recentCategories?: string[];          // Categories user browsed
  cartProductIds?: string[];            // Products in user's cart
  cartTotal?: number;                   // Current cart total
  pricePreference?: "budget" | "mid-range" | "premium";
  preferredCategories?: string[];       // User's preferred categories
}
```

### Minimal Request

```javascript
{
  "message": "show me headphones",
  "userId": "user-123"
}
```

### Full Request with Context

```javascript
{
  "message": "recommend something for me",
  "userId": "user-123",
  "pricePreference": "budget",
  "preferredCategories": ["Electronics", "Accessories"],
  "recentCategories": ["Headphones", "Mobile Accessories"],
  "recentlyViewedProductIds": ["prod-1", "prod-2"],
  "cartTotal": 2500.00
}
```

---

## Response Format

```typescript
interface ChatResponse {
  sessionId: string;           // Use this for follow-up messages
  message: string;             // AI-generated response (markdown)
  products: ProductDTO[];      // Array of product objects (can be empty)
  hasProducts: boolean;        // Quick check if products were returned
  processingTimeMs: number;    // Response time in milliseconds
}

interface ProductDTO {
  id: string;                  // UUID - use for product links
  name: string;
  description: string;
  price: number;
  brand: string;
  categoryId: string;
  categoryName: string;
  rating: number;              // 0-5
  thumbnailUrl: string;        // Product image URL
  inStock: boolean;
}
```

### Example Response

```json
{
  "sessionId": "abc-123-def",
  "message": "Here are some headphones I found:\n\n* **Sony WH-CH520** - ₹5990, Rating: 4.2\n* **boAt Rockerz 450** - ₹1399, Rating: 4.0",
  "products": [
    {
      "id": "prod-uuid-1",
      "name": "Sony WH-CH520 Wireless Headphones",
      "description": "Lightweight on-ear headphones with 50hr battery",
      "price": 5990.00,
      "brand": "Sony",
      "categoryId": "cat-uuid",
      "categoryName": "Headphones",
      "rating": 4.2,
      "thumbnailUrl": "https://...",
      "inStock": true
    }
  ],
  "hasProducts": true,
  "processingTimeMs": 2341
}
```

---

## React Integration Example

### 1. Types

```typescript
// types/chat.ts
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: ProductDTO[];
  timestamp: Date;
}

export interface ProductDTO {
  id: string;
  name: string;
  description: string;
  price: number;
  brand: string;
  categoryName: string;
  rating: number;
  thumbnailUrl: string;
  inStock: boolean;
}
```

### 2. API Service

```typescript
// services/chatApi.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8082";

export interface ChatRequest {
  message: string;
  userId?: string;
  recentlyViewedProductIds?: string[];
  recentCategories?: string[];
  pricePreference?: string;
}

export interface ChatResponse {
  sessionId: string;
  message: string;
  products: ProductDTO[];
  hasProducts: boolean;
  processingTimeMs: number;
}

export async function sendChatMessage(
  request: ChatRequest,
  sessionId?: string
): Promise<ChatResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (sessionId) {
    headers["X-Session-Id"] = sessionId;
  }

  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Chat API error: ${response.status}`);
  }

  return response.json();
}
```

### 3. Chat Hook

```typescript
// hooks/useChat.ts
import { useState, useCallback } from "react";
import { sendChatMessage, ChatResponse } from "../services/chatApi";
import { ChatMessage, ProductDTO } from "../types/chat";

export function useChat(userId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string, context?: { recentCategories?: string[] }) => {
      // Add user message immediately
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await sendChatMessage(
          {
            message: content,
            userId,
            ...context,
          },
          sessionId || undefined
        );

        // Save session ID for conversation continuity
        if (!sessionId) {
          setSessionId(response.sessionId);
        }

        // Add assistant message
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response.message,
          products: response.products,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        return response;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, sessionId]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    sessionId,
  };
}
```

### 4. Chat Component

```tsx
// components/ChatWindow.tsx
import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../hooks/useChat";
import { ProductCard } from "./ProductCard";
import ReactMarkdown from "react-markdown";

interface ChatWindowProps {
  userId?: string;
}

export function ChatWindow({ userId }: ChatWindowProps) {
  const { messages, isLoading, error, sendMessage } = useChat(userId);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input;
    setInput("");
    await sendMessage(message);
  };

  return (
    <div className="chat-window">
      {/* Messages */}
      <div className="messages-container">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            {/* Message content */}
            <div className="message-content">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>

            {/* Product cards (if any) */}
            {msg.products && msg.products.length > 0 && (
              <div className="product-grid">
                {msg.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="message assistant loading">
            <span className="typing-indicator">●●●</span>
          </div>
        )}

        {/* Error message */}
        {error && <div className="error-message">{error}</div>}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about products..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
```

### 5. Product Card Component

```tsx
// components/ProductCard.tsx
import React from "react";
import { ProductDTO } from "../types/chat";

interface ProductCardProps {
  product: ProductDTO;
}

export function ProductCard({ product }: ProductCardProps) {
  const handleClick = () => {
    // Navigate to product page
    window.location.href = `/product/${product.id}`;
  };

  return (
    <div className="product-card" onClick={handleClick}>
      <img
        src={product.thumbnailUrl || "/placeholder.png"}
        alt={product.name}
        className="product-image"
      />
      <div className="product-info">
        <h4 className="product-name">{product.name}</h4>
        <p className="product-brand">{product.brand}</p>
        <div className="product-meta">
          <span className="product-price">₹{product.price.toLocaleString()}</span>
          <span className="product-rating">★ {product.rating.toFixed(1)}</span>
        </div>
        {!product.inStock && <span className="out-of-stock">Out of Stock</span>}
      </div>
    </div>
  );
}
```

---

## Example Queries to Test

| Query | Expected Behavior |
|-------|-------------------|
| "show me headphones" | Returns 10 headphones with product cards |
| "laptops under 50000" | Returns laptops filtered by price |
| "compare Sony vs JBL headphones" | Returns 2 products for comparison |
| "what categories do you have?" | Returns text list of categories (no products) |
| "what are your best sellers?" | Returns featured/popular products |
| "show me boAt products" | Returns products filtered by brand |

---

## Best Practices

### 1. Session Management

```typescript
// Store sessionId for conversation continuity
const [sessionId, setSessionId] = useState<string | null>(
  () => sessionStorage.getItem("chatSessionId")
);

// Save when received
useEffect(() => {
  if (sessionId) {
    sessionStorage.setItem("chatSessionId", sessionId);
  }
}, [sessionId]);
```

### 2. Error Handling

```typescript
try {
  const response = await sendChatMessage(request);
  // Handle success
} catch (error) {
  if (error.message.includes("500")) {
    // Server error - show retry option
  } else if (error.message.includes("timeout")) {
    // Timeout - AI responses can take 2-15 seconds
  }
}
```

### 3. Loading States

- Show typing indicator immediately after user sends message
- Disable input while waiting for response
- Consider timeout warning after 10 seconds

### 4. Passing User Context

```typescript
// Get context from your app state
const context = {
  recentlyViewedProductIds: getRecentlyViewed(),
  recentCategories: getRecentCategories(),
  cartTotal: getCartTotal(),
  pricePreference: getUserPricePreference(),
};

await sendMessage(userInput, context);
```

### 5. Product Card Actions

```tsx
// Add to cart directly from chat
<button onClick={() => addToCart(product.id)}>Add to Cart</button>

// Track product clicks from chat
<ProductCard
  product={product}
  onClick={() => trackEvent("chat_product_click", { productId: product.id })}
/>
```

---

## CSS Example

```css
.chat-window {
  display: flex;
  flex-direction: column;
  height: 600px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.message {
  margin-bottom: 16px;
  max-width: 80%;
}

.message.user {
  margin-left: auto;
  background: #007bff;
  color: white;
  padding: 12px;
  border-radius: 16px 16px 4px 16px;
}

.message.assistant {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 16px 16px 16px 4px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.product-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.product-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chat-input-form {
  display: flex;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
}

.chat-input-form input {
  flex: 1;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  margin-right: 8px;
}

.chat-input-form button {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 24px;
  cursor: pointer;
}

.typing-indicator {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
```

---

## Health Check

Before showing the chat window, verify the API is available:

```typescript
async function checkChatHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/health`);
    const data = await response.json();
    return data.status === "UP";
  } catch {
    return false;
  }
}
```

---

*Last updated: December 19, 2025*
