'use client';

import React from 'react';
import { Sparkles, Link2, FolderOpen, TrendingUp } from 'lucide-react';
import { SuggestionStrategy } from '@/lib/types';

interface RecommendationBadgeProps {
  reason: string;
  strategy: SuggestionStrategy;
}

const strategyConfig: Record<SuggestionStrategy, {
  styles: string;
  icon: React.ReactNode;
}> = {
  ai_intent: {
    styles: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: <Sparkles className="h-3 w-3" />,
  },
  similar_products: {
    styles: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <Link2 className="h-3 w-3" />,
  },
  category_affinity: {
    styles: 'bg-green-100 text-green-700 border-green-200',
    icon: <FolderOpen className="h-3 w-3" />,
  },
  trending: {
    styles: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: <TrendingUp className="h-3 w-3" />,
  },
};

export default function RecommendationBadge({ reason, strategy }: RecommendationBadgeProps) {
  if (!reason) return null;

  const config = strategyConfig[strategy] || strategyConfig.trending;

  return (
    <span
      className={`
        inline-flex items-center gap-1
        text-xs font-medium px-2 py-0.5
        rounded-full border
        ${config.styles}
      `}
    >
      {config.icon}
      <span className="truncate max-w-[140px]">{reason}</span>
    </span>
  );
}