// src/app/prompts/components/OptimizeDialog.tsx
"use client";

import { useState } from "react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { PromptTemplate } from "@/lib/data/prompts";

interface OptimizeDialogProps {
  template: PromptTemplate;
  onClose: () => void;
}

export function OptimizeDialog({ template, onClose }: OptimizeDialogProps) {
  const [optimizedContent, setOptimizedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);

  const handleOptimize = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/prompts/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: template.content }),
      });
      const data = await res.json();
      if (data.optimized) {
        setOptimizedContent(data.optimized);
      } else {
        throw new Error(data.error || "优化失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "优化失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplace = async () => {
    if (!optimizedContent) return;
    setIsReplacing(true);
    try {
      await navigator.clipboard.writeText(optimizedContent);
      onClose();
    } catch (err) {
      setError("复制失败");
    } finally {
      setIsReplacing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">AI 优化</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 原模板 */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">原模板</h3>
            <div className="bg-secondary/30 rounded-lg p-4 text-sm whitespace-pre-wrap">
              {template.content}
            </div>
          </div>

          {/* 优化后模板 */}
          {optimizedContent && (
            <div>
              <h3 className="text-sm font-medium text-primary mb-2">优化后</h3>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm whitespace-pre-wrap">
                {optimizedContent}
              </div>
            </div>
          )}

          {/* 错误信息 */}
          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}
        </div>

        <div className="p-6 border-t border-border flex justify-end gap-3">
          {!optimizedContent ? (
            <button
              onClick={handleOptimize}
              disabled={isLoading}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:brightness-110 transition-all disabled:opacity-50"
            >
              {isLoading ? "优化中..." : "开始优化"}
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-secondary/50 text-foreground rounded-lg font-medium hover:bg-secondary transition-all"
              >
                关闭
              </button>
              <button
                onClick={handleReplace}
                disabled={isReplacing}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:brightness-110 transition-all disabled:opacity-50"
              >
                {isReplacing ? "复制中..." : "复制优化结果"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}