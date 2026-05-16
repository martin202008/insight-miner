// src/app/prompts/components/PromptGrid.tsx
"use client";

import { PromptTemplate } from "@/lib/data/prompts";
import { PromptCard } from "./PromptCard";

interface PromptGridProps {
  templates: PromptTemplate[];
  onCopy: (template: PromptTemplate) => void;
  onOptimize: (template: PromptTemplate) => void;
  onCardClick: (template: PromptTemplate) => void;
  copiedId: string | null;
}

export function PromptGrid({ templates, onCopy, onOptimize, onCardClick, copiedId }: PromptGridProps) {
  if (templates.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-4">🔍</div>
        <p className="text-muted-foreground">未找到匹配的模板</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <PromptCard
          key={template.id}
          template={template}
          onCopy={() => onCopy(template)}
          onOptimize={() => onOptimize(template)}
          onClick={() => onCardClick(template)}
          isCopied={copiedId === template.id}
        />
      ))}
    </div>
  );
}