'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { InsightCard as InsightCardType } from '@/types';

interface Props {
  card: InsightCardType;
  onCopy?: (content: string) => void;
}

const confidenceColors = {
  high: 'text-primary',
  medium: 'text-yellow-500',
  low: 'text-muted-foreground',
};

const confidenceLabels = {
  high: '高置信',
  medium: '中置信',
  low: '低置信',
};

export function InsightCard({ card, onCopy }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(card.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.(card.content);
  };

  return (
    <div className="liquid-glass rounded-lg p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-heading-italic text-foreground text-lg leading-snug">
          {card.title}
        </h3>
        <span className={cn('text-xs font-medium flex-shrink-0', confidenceColors[card.confidence])}>
          {confidenceLabels[card.confidence]}
        </span>
      </div>

      <p className="text-muted-foreground text-sm leading-relaxed flex-1">
        {card.content}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <span className="text-xs text-muted-foreground truncate max-w-[60%]">
          {card.sourceRef}
        </span>
        <button
          onClick={handleCopy}
          className="text-xs text-primary hover:text-primary/80 transition-colors"
        >
          {copied ? '已复制!' : '复制'}
        </button>
      </div>
    </div>
  );
}
