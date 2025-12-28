# 🛒 CartIQ Frontend

> **AI-Powered E-Commerce Experience with Real-Time Personalization**

[![AI Partner Catalyst Hackathon](https://img.shields.io/badge/Hackathon-AI%20Partner%20Catalyst-blue)](https://ai-partner-catalyst.devpost.com/)
[![Confluent Challenge](https://img.shields.io/badge/Challenge-Confluent-orange)](https://confluent.io)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://typescriptlang.org)

The frontend for **CartIQ** — a modern e-commerce platform demonstrating real-time AI personalization powered by Confluent Kafka, Flink, and Google Vertex AI. Built with Next.js 14 for a seamless shopping experience.

---

## 📑 Table of Contents

- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Demo Flow](#-demo-flow)
- [Screenshots](#-screenshots)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Event Tracking](#-event-tracking)
- [AI Chat Interface](#-ai-chat-interface)
- [Deployment](#-deployment)
- [Related Repositories](#-related-repositories)
- [License](#-license)

---

## 🚀 Key Features

### 1. Real-Time Event Tracking
Every user interaction is captured and streamed to Kafka:
- **Page Views** → Navigation patterns
- **Product Views** → Category & price preferences
- **Cart Actions** → Purchase intent signals
- **AI Chat Queries** → Explicit intent (strongest signal!)

### 2. AI-Powered Chat Assistant
Floating chat widget with conversational product recommendations:
- Natural language product search
- Personalized suggestions based on real-time context
- Product comparisons and use-case recommendations

### 3. Personalized Home Page
- **New Users**: See curated sections (Trending, Best of Electronics, Best of Fashion)
- **Returning Users**: "Suggested For You" section with personalized recommendations
- **Infinite Scroll**: Seamless browsing with lazy loading

### 4. Full E-Commerce Experience
- Product browsing with search & filters
- Shopping cart management
- User authentication
- Order history

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **State Management** | React Context + useState |
| **Icons** | Lucide React |
| **HTTP Client** | Fetch API |
| **Deployment** | Google Cloud Run |

---

## 🎬 Demo Flow

This is the recommended flow for demonstrating CartIQ:

```
1. New User Visit
   └── Home page displays Trending, Best of Electronics, Best of Fashion
   └── PAGE_VIEW event → Kafka

2. Browse Products
   └── Click on electronics products
   └── PRODUCT_VIEW events → Kafka → Flink aggregation

3. Add to Cart
   └── Add items to shopping cart
   └── CART events → Kafka (high intent signal)

4. Gemini AI Chat
   └── Ask: "Recommend Samsung phones under 30000"
   └── AI_CHAT event → Kafka (strongest signal!)
   └── Gemini responds with personalized recommendations

5. Return to Home Page
   └── "Suggested For You" section now appears!
   └── Personalized recommendations based on Flink-aggregated context

6. Complete Purchase
   └── Checkout and place order
   └── ORDER event → Kafka
```

**The Feedback Loop:** Your browsing and chat queries → Kafka → Flink aggregation → Redis cache → Personalized homepage suggestions.

---

## 📸 Screenshots

| Home Page | AI Chat | Product Grid |
|-----------|---------|--------------|
| Curated sections for new users | Conversational recommendations | Browse with infinite scroll |

---

## 📦 Project Structure

```
cartiq-frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with Header/Footer
│   ├── page.tsx            # Home page (personalized sections)
│   ├── products/           # Product listing & details
│   ├── cart/               # Shopping cart
│   ├── orders/             # Order history
│   ├── auth/               # Login & Register
│   └── chat/               # Full-page AI chat
├── components/
│   ├── layout/             # Header, Footer, Sidebar
│   ├── products/           # ProductCard, ProductGrid
│   ├── cart/               # CartItem, CartSummary
│   ├── chat/               # ChatWidget, ChatWindow
│   └── ui/                 # Buttons, Inputs, Cards
├── context/
│   ├── AuthContext.tsx     # Authentication state
│   ├── CartContext.tsx     # Shopping cart state
│   └── EventContext.tsx    # Kafka event tracking
├── lib/
│   ├── api.ts              # Backend API client
│   ├── types.ts            # TypeScript interfaces
│   └── utils.ts            # Helper functions
└── public/                 # Static assets
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running (see [cartiq-backend](https://github.com/spa-raj/cartIQ-backend))

### Local Development

```bash
# Clone the repository
git clone https://github.com/spa-raj/cartIQ-frontend.git
cd cartIQ-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your backend URL

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8082` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `CartIQ` |

---

## 📡 Event Tracking

The frontend tracks all user interactions for real-time personalization via the `EventContext`:

```typescript
// Events sent to Kafka via backend
trackEvent('product-view', { productId, category, price });
trackEvent('cart', { action: 'ADD', productId, quantity });
trackEvent('user', { eventType: 'PAGE_VIEW', pageType: 'HOME' });
```

### Event Types

| Event | Kafka Topic | Signal Strength |
|-------|-------------|-----------------|
| Page View | `user-events` | Low |
| Product View | `product-views` | Medium |
| Cart Action | `cart-events` | High |
| Order Placed | `order-events` | High |
| AI Chat Query | `ai-events` | **Strongest** |

---

## 💬 AI Chat Interface

The AI chat widget demonstrates real-time RAG (Retrieval Augmented Generation):

### Sample Queries
```
"Recommend Samsung phones under 30000"
"Show me wireless earbuds with good bass"
"Compare Apple and Samsung laptops"
"What's good for gaming under 50000?"
"I need running shoes for marathon training"
```

### How It Works
1. User sends query → Backend receives message
2. 4-Way Hybrid Search (Vector + FTS + Category + Brand)
3. Re-ranking with Vertex AI Ranking API
4. Gemini generates conversational response
5. Chat event published to Kafka → influences future suggestions

---

## 🚀 Deployment

### GitHub Actions (Recommended)

The project includes automated CI/CD via GitHub Actions. On every push to `main`:

1. Builds the Docker image
2. Pushes to Google Artifact Registry
3. Deploys to Google Cloud Run

See [`.github/workflows/cloud-run-deploy.yml`](.github/workflows/cloud-run-deploy.yml) for the workflow configuration.

**Required GitHub Secrets:**
| Secret | Description |
|--------|-------------|
| `GCP_PROJECT_ID` | Google Cloud project ID |
| `WIF_PROVIDER` | Workload Identity Federation provider |
| `WIF_SERVICE_ACCOUNT` | Service account for WIF |
| `NEXT_PUBLIC_API_URL` | Backend API URL |

**Required GitHub Variables:**
| Variable | Description |
|----------|-------------|
| `GCP_REGION` | Deployment region (default: `us-central1`) |

### Google Cloud Run (Manual)

```bash
# Build Docker image
docker build -t gcr.io/PROJECT_ID/cartiq-frontend .

# Push to Container Registry
docker push gcr.io/PROJECT_ID/cartiq-frontend

# Deploy to Cloud Run
gcloud run deploy cartiq-frontend \
  --image gcr.io/PROJECT_ID/cartiq-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 📊 Hackathon Alignment

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| Real-time Events | All user interactions tracked to Kafka | ✅ |
| AI Integration | Chat widget with Gemini-powered responses | ✅ |
| Personalization | "Suggested For You" with Flink-enriched context | ✅ |
| New User Experience | Curated sections (Trending, Electronics, Fashion) | ✅ |
| Modern Stack | Next.js 14, TypeScript, Tailwind CSS | ✅ |
| Production Ready | Deployed on Google Cloud Run | ✅ |

---

## 📚 Documentation

- [Architecture Overview](https://github.com/spa-raj/cartIQ-backend/blob/main/docs/ARCHITECTURE.md) (Backend Repo)
- [API Testing Guides](./docs/Backend-APIs/)
- [Chat Integration](./docs/FRONTEND_CHAT_INTEGRATION.md)

---

## 🤝 Related Repositories

- **Backend**: [cartiq-backend](https://github.com/spa-raj/cartIQ-backend) - Java 17, Spring Boot, Kafka, Flink, Vertex AI, Gemini

---

## 📄 License

MIT

---

<p align="center">
  <b>Built for the AI Partner Catalyst Hackathon (Confluent Challenge)</b><br>
  <i>Real-time AI personalization that traditional batch systems can't match.</i>
</p>