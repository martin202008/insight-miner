"use client";

import { Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";

interface GenerationResult {
  titles: string[];
  content: string;
  tags: string[];
  coverPrompt?: string;
}

interface ContentPreviewProps {
  result: GenerationResult | null;
  isLoading?: boolean;
}

export function WeChatContentPreview({ result, isLoading }: ContentPreviewProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    console.log("[WeChatContentPreview] result updated:", JSON.stringify(result, null, 2));
  }, [result]);

  const handleCopy = async () => {
    if (!result) return;
    const text = [
      result.titles.map((t, i) => `标题${i + 1}：${t}`).join("\n"),
      "",
      "正文：",
      result.content,
      "",
      "标签：",
      result.tags.map((t) => `#${t}`).join(" "),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">文章生成中...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex items-center justify-center text-center">
        <div>
          <p className="text-muted-foreground mb-1">填写主题并选择模板</p>
          <p className="text-xs text-muted-foreground">点击生成按钮开始创作</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Titles */}
      <div>
        <h4 className="text-sm font-medium mb-2 text-foreground">标题</h4>
        <div className="space-y-2">
          {result.titles.length > 0 ? (
            result.titles.map((title, i) => (
              <div
                key={i}
                className="p-3 bg-card border border-border rounded-lg text-sm"
              >
                {title}
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground">暂无标题</div>
          )}
        </div>
      </div>

      {/* Content */}
      <div>
        <h4 className="text-sm font-medium mb-2 text-foreground">正文</h4>
        <div className="p-4 bg-card border border-border rounded-lg text-sm whitespace-pre-wrap max-h-[400px] overflow-y-auto">
          {result.content}
        </div>
      </div>

      {/* Tags */}
      <div>
        <h4 className="text-sm font-medium mb-2 text-foreground">标签</h4>
        <div className="flex flex-wrap gap-2">
          {result.tags.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Cover Prompt */}
      {result.coverPrompt && (
        <div>
          <h4 className="text-sm font-medium mb-2 text-foreground">
            封面提示词
          </h4>
          <div className="p-3 bg-card border border-border rounded-lg text-xs text-muted-foreground">
            {result.coverPrompt}
          </div>
        </div>
      )}

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="w-full mt-4 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-all flex items-center justify-center gap-2"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary">已复制</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            <span className="text-sm">复制全部内容</span>
          </>
        )}
      </button>
    </div>
  );
}