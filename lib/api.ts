import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  UserPreference,
  Product,
  Category,
  PaginatedResponse,
  Cart,
  AddToCartRequest,
  UpdateCartItemRequest,
  Order,
  CreateOrderRequest,
  ChatRequest,
  ChatResponse,
  UserEvent,
  ProductViewEvent,
  CartEvent,
  OrderEvent,
  SuggestionsResponse,
} from './types';
import { generateSessionId } from './utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082';

class ApiClient {
  private getHeaders(includeAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = false
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const headers = this.getHeaders(includeAuth);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || error.message || 'Request failed');
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth APIs
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<void> {
    return this.request<void>('/api/auth/logout', {
      method: 'POST',
    }, true);
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/users/me', {}, true);
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request<User>('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);
  }

  async getPreferences(): Promise<UserPreference> {
    return this.request<UserPreference>('/api/users/me/preferences', {}, true);
  }

  async updatePreferences(data: Partial<UserPreference>): Promise<UserPreference> {
    return this.request<UserPreference>('/api/users/me/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);
  }

  // Product APIs
  async getProducts(
    page: number = 0,
    size: number = 20,
    sort: string = 'createdAt,desc'
  ): Promise<PaginatedResponse<Product>> {
    return this.request<PaginatedResponse<Product>>(
      `/api/products?page=${page}&size=${size}&sort=${sort}`
    );
  }

  async getProduct(id: string): Promise<Product> {
    return this.request<Product>(`/api/products/${id}`);
  }

  async searchProducts(
    query: string,
    page: number = 0,
    size: number = 20,
    filters?: {
      minPrice?: number;
      maxPrice?: number;
      minRating?: number;
    }
  ): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.minRating !== undefined) params.append('minRating', filters.minRating.toString());
    return this.request<PaginatedResponse<Product>>(`/api/products/search?${params}`);
  }

  async getFeaturedProducts(size: number = 10, page: number = 0): Promise<PaginatedResponse<Product>> {
    return this.request<PaginatedResponse<Product>>(`/api/products/featured?page=${page}&size=${size}`);
  }

  async getProductsByCategory(
    categoryId: string,
    page: number = 0,
    size: number = 20,
    sort: string = 'rating,desc'
  ): Promise<PaginatedResponse<Product>> {
    return this.request<PaginatedResponse<Product>>(
      `/api/products/category/${categoryId}?page=${page}&size=${size}&sort=${sort}`
    );
  }

  async getProductsByBrand(
    brand: string,
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedResponse<Product>> {
    return this.request<PaginatedResponse<Product>>(
      `/api/products/brand/${encodeURIComponent(brand)}?page=${page}&size=${size}`
    );
  }

  async getProductsByPriceRange(
    minPrice?: number,
    maxPrice?: number,
    page: number = 0,
    size: number = 20
  ): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    if (minPrice !== undefined) params.append('minPrice', minPrice.toString());
    if (maxPrice !== undefined) params.append('maxPrice', maxPrice.toString());
    params.append('page', page.toString());
    params.append('size', size.toString());
    return this.request<PaginatedResponse<Product>>(`/api/products/price-range?${params}`);
  }

  async getBrands(): Promise<string[]> {
    return this.request<string[]>('/api/products/brands');
  }

  async getBestOfElectronics(
    page: number = 0,
    size: number = 8
  ): Promise<PaginatedResponse<Product>> {
    return this.request<PaginatedResponse<Product>>(
      `/api/products/best-of-electronics?page=${page}&size=${size}`
    );
  }

  async getProductsByIds(ids: string[]): Promise<Product[]> {
    return this.request<Product[]>('/api/products/batch', {
      method: 'POST',
      body: JSON.stringify(ids),
    });
  }

  // Suggestions API
  async getSuggestions(limit: number = 12, userId?: string): Promise<SuggestionsResponse> {
    const headers: Record<string, string> = {};
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    return this.request<SuggestionsResponse>(
      `/api/suggestions?limit=${limit}`,
      { headers }
    );
  }

  // Category APIs
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/api/categories');
  }

  async getCategoryTree(): Promise<Category[]> {
    return this.request<Category[]>('/api/categories/tree');
  }

  async getCategory(id: string): Promise<Category> {
    return this.request<Category>(`/api/categories/${id}`);
  }

  async getSubcategories(id: string): Promise<Category[]> {
    return this.request<Category[]>(`/api/categories/${id}/subcategories`);
  }

  // Cart APIs
  async getCart(): Promise<Cart> {
    return this.request<Cart>('/api/cart', {}, true);
  }

  async addToCart(data: AddToCartRequest): Promise<Cart> {
    return this.request<Cart>('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async updateCartItem(itemId: string, data: UpdateCartItemRequest): Promise<Cart> {
    return this.request<Cart>(`/api/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, true);
  }

  async removeFromCart(itemId: string): Promise<Cart> {
    return this.request<Cart>(`/api/cart/items/${itemId}`, {
      method: 'DELETE',
    }, true);
  }

  async clearCart(): Promise<void> {
    return this.request<void>('/api/cart', {
      method: 'DELETE',
    }, true);
  }

  async getCartCount(): Promise<{ count: number }> {
    return this.request<{ count: number }>('/api/cart/count', {}, true);
  }

  // Order APIs
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    return this.request<Order>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async getOrders(
    page: number = 0,
    size: number = 10,
    status?: string
  ): Promise<PaginatedResponse<Order>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (status) params.append('status', status);
    return this.request<PaginatedResponse<Order>>(`/api/orders?${params}`, {}, true);
  }

  async getOrder(id: string): Promise<Order> {
    return this.request<Order>(`/api/orders/${id}`, {}, true);
  }

  async getOrderByNumber(orderNumber: string): Promise<Order> {
    return this.request<Order>(`/api/orders/number/${orderNumber}`, {}, true);
  }

  async cancelOrder(id: string): Promise<Order> {
    return this.request<Order>(`/api/orders/${id}/cancel`, {
      method: 'POST',
    }, true);
  }

  // Chat API
  async sendChatMessage(data: ChatRequest, sessionId?: string): Promise<ChatResponse> {
    const headers: Record<string, string> = {};
    if (sessionId) {
      headers['X-Session-Id'] = sessionId;
    }
    return this.request<ChatResponse>('/api/chat', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    }, true);
  }

  async checkChatHealth(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/api/chat/health');
  }

  // Event Tracking APIs
  // All event tracking methods send sessionId via X-Session-Id header (required by backend)
  async trackUserEvent(event: Omit<UserEvent, 'eventId' | 'timestamp'>): Promise<void> {
    const sessionId = event.sessionId || generateSessionId();
    const fullEvent: UserEvent = {
      ...event,
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    return this.request<void>('/api/events/user', {
      method: 'POST',
      headers: { 'X-Session-Id': sessionId },
      body: JSON.stringify(fullEvent),
    }, true);
  }

  async trackProductView(event: Omit<ProductViewEvent, 'eventId' | 'timestamp'>): Promise<void> {
    const sessionId = event.sessionId || generateSessionId();
    const fullEvent: ProductViewEvent = {
      ...event,
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    return this.request<void>('/api/events/product-view', {
      method: 'POST',
      headers: { 'X-Session-Id': sessionId },
      body: JSON.stringify(fullEvent),
    }, true);
  }

  async trackCartEvent(event: Omit<CartEvent, 'eventId' | 'timestamp'>): Promise<void> {
    const sessionId = event.sessionId || generateSessionId();
    const fullEvent: CartEvent = {
      ...event,
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    return this.request<void>('/api/events/cart', {
      method: 'POST',
      headers: { 'X-Session-Id': sessionId },
      body: JSON.stringify(fullEvent),
    }, true);
  }

  async trackOrderEvent(event: Omit<OrderEvent, 'eventId' | 'timestamp'>): Promise<void> {
    const sessionId = event.sessionId || generateSessionId();
    const fullEvent: OrderEvent = {
      ...event,
      eventId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    return this.request<void>('/api/events/order', {
      method: 'POST',
      headers: { 'X-Session-Id': sessionId },
      body: JSON.stringify(fullEvent),
    }, true);
  }

}

export const api = new ApiClient();
