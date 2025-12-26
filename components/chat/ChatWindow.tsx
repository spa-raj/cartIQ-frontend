'use client';

import React, { useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { ChatView } from '@/components/chat/ChatView';

interface ChatWindowProps {
  onClose: () => void;
}

export default function ChatWindow({ onClose }: ChatWindowProps) {
  const chat = useChat();

  useEffect(() => {
    chat.trackPageView('CHAT_POPUP', undefined);
  }, [chat.trackPageView]);

  return (
    <div className="w-[500px] h-[700px] bg-white rounded-2xl shadow-2xl border border-surface-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <h2 className="font-semibold text-surface-800">CartIQ AI Assistant</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-surface-500 hover:bg-surface-100 rounded-lg"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative bg-surface-50">
        <ChatView {...chat} productUrlSource="chat_popup_recommendation" compact />
      </div>
       <div className="bg-white border-t border-surface-200">
          <p className="text-xs text-surface-400 text-center pb-3 px-4">
              Your searches help improve recommendations
          </p>
       </div>
    </div>
  );
}
