'use client';

import { InsightCard } from './InsightCard';
import type { InsightCard as InsightCardType } from '@/types';

interface Props {
  cards: InsightCardType[];
  onCopy?: (content: string) => void;
}

export function CardGrid({ cards }: Props) {
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-4xl mb-4">📋</div>
        <p className="text-muted-foreground text-lg">暂无洞察卡片</p>
        <p className="text-muted-foreground/60 text-sm mt-1">添加来源并开始分析后，这里会显示洞察结果</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <InsightCard key={card.id} card={card} />
      ))}
    </div>
  );
}
