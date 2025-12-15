// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  preference?: UserPreference;
}

export interface UserPreference {
  id: string;
  minPricePreference?: number;
  maxPricePreference?: number;
  preferredCategories: string[];
  preferredBrands: string[];
  emailNotifications: boolean;
  pushNotifications: boolean;
  currency: string;
  language: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// Product Types
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  stockQuantity: number;
  brand?: string;
  categoryId?: string;
  categoryName?: string;
  imageUrls: string[];
  thumbnailUrl?: string;
  rating: number;
  reviewCount: number;
  status: 'ACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED';
  featured: boolean;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  parentCategoryId?: string;
  active: boolean;
  productCount: number;
  subCategories?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
}

// Cart Types
export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// Order Types
export interface OrderItem {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  thumbnailUrl?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items?: OrderItem[]; // Optional - not included in list response, only in detail
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  totalQuantity: number;
  shippingAddress: string;
  shippingCity: string;
  shippingState?: string;
  shippingZipCode: string;
  shippingCountry: string;
  contactPhone: string;
  notes?: string;
  cancellable: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface CreateOrderRequest {
  shippingAddress: string;
  shippingCity: string;
  shippingState?: string;
  shippingZipCode: string;
  shippingCountry: string;
  contactPhone: string;
  notes?: string;
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  recommendations?: ProductRecommendation[];
}

export interface ProductRecommendation {
  productId: string;
  name: string;
  price: number;
  thumbnailUrl?: string;
  category?: string;
  reason: string;
}

export interface ChatRequest {
  message: string;
  sessionId: string;
}

export interface ChatResponse {
  response: string;
  recommendations: ProductRecommendation[];
}

// Event Types (for Kafka tracking)
export interface BaseEvent {
  eventId: string;
  userId?: string;
  sessionId: string;
  timestamp: string;
}

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface UserEvent extends BaseEvent {
  eventType: 'page_view' | 'login' | 'logout' | 'session_start' | 'session_end';
  pageType?: string;
  pagePath?: string;
  pageUrl?: string;
  deviceType?: DeviceType;
  referrer?: string;
}

export type ProductViewSource = 'search' | 'category' | 'home' | 'recommendation' | 'direct' | 'cart';

export interface ProductViewEvent extends BaseEvent {
  productId: string;
  productName: string;
  category?: string;
  price: number;
  source?: ProductViewSource;
  searchQuery?: string;
  viewDurationMs?: number;
}

// Backend expects lowercase enum values for cart events
export type CartEventAction = 'add' | 'remove' | 'update_quantity' | 'clear';

export interface CartEvent extends BaseEvent {
  action: CartEventAction;
  productId?: string;
  productName?: string;
  category?: string;
  quantity?: number;
  price?: number;
  cartTotal?: number;
  cartItemCount?: number;
}

export interface OrderEventItem {
  productId: string;
  productName: string;
  category?: string;
  quantity: number;
  price: number;
}

// Backend expects lowercase enum values for order events
export type OrderEventStatus = 'pending' | 'placed' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type OrderEventPaymentMethod = 'cod' | 'card' | 'upi' | 'netbanking' | 'wallet';

export interface OrderEvent extends BaseEvent {
  action: 'PLACED' | 'CANCELLED' | 'COMPLETED';
  orderId: string;
  orderNumber: string;
  items: OrderEventItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: OrderEventPaymentMethod;
  status: OrderEventStatus;
  shippingCity: string;
  shippingState: string;
}

// API Error
export interface ApiError {
  error: string;
  code?: string;
  fieldErrors?: { field: string; message: string }[];
}
