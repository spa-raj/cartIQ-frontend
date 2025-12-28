import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { EventProvider } from '@/context/EventContext';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatWidget from '@/components/chat/ChatWidget';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'CartIQ - AI-Powered Shopping Assistant',
  description:
    'Experience personalized shopping with CartIQ. Our AI assistant understands your preferences and delivers real-time recommendations.',
  keywords: ['e-commerce', 'AI shopping', 'personalized recommendations', 'online shopping'],
  openGraph: {
    title: 'CartIQ - AI-Powered Shopping Assistant',
    description: 'Experience personalized shopping with CartIQ',
    type: 'website',
  },
  icons: {
    icon: '/icon',
    apple: '/apple-icon',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-[#f1f3f6] text-gray-900 antialiased">
        <AuthProvider>
          <EventProvider>
            <CartProvider>
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <ChatWidget />
              </div>
            </CartProvider>
          </EventProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
