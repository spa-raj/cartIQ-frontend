# CartIQ Frontend

AI-powered e-commerce frontend built with Next.js for the **AI Partner Catalyst Hackathon** (Confluent Challenge).

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context
- **Icons:** Lucide React

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (default: http://localhost:8082)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8082
NEXT_PUBLIC_APP_NAME=CartIQ
```

For production, update `NEXT_PUBLIC_API_URL` to your deployed backend URL.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### 4. Build for Production

```bash
npm run build
```

## Project Structure

```
cartiq-frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── products/           # Product pages
│   ├── cart/               # Shopping cart
│   ├── orders/             # Order history
│   ├── auth/               # Login/Register
│   └── chat/               # AI Chat interface
├── components/             # Reusable components
│   ├── layout/             # Header, Footer
│   ├── products/           # Product components
│   ├── cart/               # Cart components
│   ├── chat/               # AI Chat widget
│   └── ui/                 # UI primitives
├── lib/                    # Utilities
│   ├── api.ts              # API client
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Helper functions
├── context/                # React Context providers
│   ├── AuthContext.tsx     # Authentication state
│   ├── CartContext.tsx     # Cart state
│   └── EventContext.tsx    # Event tracking
└── public/                 # Static assets
```

## Features

- User authentication (Register/Login)
- Product browsing with search and filters
- Shopping cart management
- Order placement and history
- AI-powered chat assistant
- Real-time event tracking for Kafka

## Deploy on Firebase

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase in your project

```bash
firebase init hosting
```

When prompted:
- Select your Firebase project (or create a new one)
- Set public directory to `out`
- Configure as single-page app: **No** (Next.js handles routing)
- Set up automatic builds with GitHub: Optional

### 4. Update next.config.ts for Static Export

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

### 5. Build and Export

```bash
npm run build
```

This generates static files in the `out` directory.

### 6. Deploy to Firebase

```bash
firebase deploy --only hosting
```

### Firebase Hosting Configuration

Your `firebase.json` should look like:

```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|jpg|jpeg|gif|png|svg|ico|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000, immutable"
          }
        ]
      }
    ]
  }
}
```

### Environment Variables for Firebase

Set environment variables in Firebase:

```bash
# For build-time variables, add to .env.production
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXT_PUBLIC_APP_NAME=CartIQ
```

### Continuous Deployment with GitHub Actions

Create `.github/workflows/firebase-deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
          NEXT_PUBLIC_APP_NAME: CartIQ

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: your-firebase-project-id
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Documentation

### Architecture
- [Architecture Overview](docs/ARCHITECTURE.md) - System design, components, and data flow

### API Testing Guides
See the `docs/Backend-APIs` folder for API testing guides:
- [User API Testing](docs/USER_API_TESTING.md)
- [Product API Testing](docs/PRODUCT_API_TESTING.md)
- [Order API Testing](docs/ORDER_API_TESTING.md)

## License

MIT
