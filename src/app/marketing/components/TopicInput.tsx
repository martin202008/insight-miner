"use client";

import { useState } from "react";

interface TopicInputProps {
  onSubmit: (topic: string) => Promise<void>;
}

export function TopicInput({ onSubmit }: TopicInputProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setError(null);
    setLoading(true);
    try {
      await onSubmit(input.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "分析失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">输入主题或产品链接</h3>
      <div className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入产品主题、品牌名称或产品链接..."
          className="w-full h-32 bg-card border border-border rounded-lg p-3 text-foreground resize-none"
        />
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-lg text-sm text-destructive">
            {error}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:brightness-110 disabled:opacity-50 transition-all"
        >
          {loading ? "分析中..." : "开始分析"}
        </button>
      </div>
    </div>
  );
}