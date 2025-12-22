'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { ChatView } from '@/components/chat/ChatView';

export default function ChatPage() {
  const chat = useChat();

  useEffect(() => {
    chat.trackPageView('CHAT_FULL', '/chat');
  }, [chat.trackPageView]);

  const suggestedQuestions = [
    'Recommend me headphones under ₹7000',
    'Compare iPhone 15 and iPhone 16',
    "Find women's kurtas under ₹5000",
    "What's the best budget smartphone?",
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

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <ChatView {...chat} productUrlSource="chat_recommendation" />
      </div>

      {/* Suggested Questions & Footer outside ChatView so they can be scrolled independently if needed */}
      {chat.messages.length === 1 && !chat.isLoading && (
        <div className="bg-white border-t border-surface-200">
            <div className="max-w-4xl mx-auto px-4 pt-4 pb-2">
                <p className="text-sm text-surface-500 mb-3">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((question, i) => (
                        <button
                            key={i}
                            onClick={() => chat.setInput(question)}
                            className="px-4 py-2 bg-white border border-surface-200 rounded-full text-sm text-surface-700 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                        >
                            {question}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}
       <div className="bg-white">
          <p className="text-xs text-surface-400 text-center pb-3">
              AI recommendations are personalized based on your browsing activity via real-time Kafka
              streaming
          </p>
       </div>
    </div>
  );
}
