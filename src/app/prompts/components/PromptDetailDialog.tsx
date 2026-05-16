// src/app/prompts/components/PromptDetailDialog.tsx
"use client";

import { XMarkIcon, CheckIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { PromptTemplate, TOOLS } from "@/lib/data/prompts";

interface PromptDetailDialogProps {
  template: PromptTemplate;
  onClose: () => void;
  onCopy: (template: PromptTemplate) => void;
  onOptimize: (template: PromptTemplate) => void;
  isCopied: boolean;
}

export function PromptDetailDialog({
  template,
  onClose,
  onCopy,
  onOptimize,
  isCopied,
}: PromptDetailDialogProps) {
  const toolLabel = TOOLS.find((t) => t.value === template.tool)?.label || template.tool;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">{template.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 描述 */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">描述</h3>
            <p className="text-foreground">{template.description}</p>
          </div>

          {/* 标签 */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
              {toolLabel}
            </span>
            {template.scenes.map((scene) => (
              <span key={scene} className="text-xs px-2 py-1 bg-accent/10 text-accent rounded">
                {scene}
              </span>
            ))}
          </div>

          {/* 完整内容 */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">提示词内容</h3>
            <div className="bg-secondary/30 rounded-lg p-4 text-sm whitespace-pre-wrap font-mono">
              {template.content}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border flex gap-3">
          <button
            onClick={() => onCopy(template)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
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
              "复制提示词"
            )}
          </button>
          <button
            onClick={() => onOptimize(template)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary/50 hover:bg-secondary text-foreground rounded-lg text-sm font-medium transition-all"
          >
            <SparklesIcon className="w-4 h-4" />
            AI 优化
          </button>
        </div>
      </div>
    </div>
  );
}
