// src/app/prompts/components/PromptCard.tsx
"use client";

import { PromptTemplate, TOOLS } from "@/lib/data/prompts";
import { CheckIcon } from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";

interface PromptCardProps {
  template: PromptTemplate;
  onCopy: () => void;
  onOptimize: () => void;
  onClick: () => void;
  isCopied: boolean;
}

export function PromptCard({ template, onCopy, onOptimize, onClick, isCopied }: PromptCardProps) {
  const toolLabel = TOOLS.find((t) => t.value === template.tool)?.label || template.tool;

  return (
    <div onClick={onClick} className="bg-secondary/30 rounded-xl p-5 flex flex-col h-full hover:bg-secondary/40 transition-colors cursor-pointer">
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-foreground">{template.title}</h3>
          {template.source === "ai_optimized" && (
            <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded">AI优化</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {template.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
            {toolLabel}
          </span>
          {template.scenes.map((scene) => (
            <span key={scene} className="text-xs px-2 py-1 bg-accent/10 text-accent rounded">
              {scene}
            </span>
          ))}
        </div>
      </div>
      <div onClick={(e) => e.stopPropagation()} className="flex gap-2 pt-4 border-t border-border/50">
        <button
          onClick={onCopy}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isCopied
              ? "bg-green-500/20 text-green-400"
              : "bg-primary text-primary-foreground hover:brightness-110"
          }`}
        >
          {isCopied ? (
            <>
              <CheckIcon className="w-4 h-4" />
              已复制
            </>
          ) : (
            "复制"
          )}
        </button>
        <button
          onClick={onOptimize}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary text-foreground rounded-lg text-sm font-medium transition-all"
        >
          <SparklesIcon className="w-4 h-4" />
          AI优化
        </button>
      </div>
    </div>
  );
}