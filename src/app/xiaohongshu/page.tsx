"use client";

import { useState } from "react";
import { TopicInput } from "./components/TopicInput";
import { TemplateSelector } from "./components/TemplateSelector";
import { ContentPreview } from "./components/ContentPreview";

interface GenerationResult {
  titles: string[];
  content: string;
  tags: string[];
  coverPrompt?: string;
}

export default function XiaohongshuPage() {
  const [topic, setTopic] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [withHotspot, setWithHotspot] = useState(false);
  const [withCoverPrompt, setWithCoverPrompt] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("请输入主题");
      return;
    }
    if (!selectedTemplate) {
      setError("请选择模板");
      return;
    }

    setError(null);
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/xiaohongshu/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic.trim(),
          template: selectedTemplate,
          withHotspot,
          withCoverPrompt,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "生成失败");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">小红书内容生成</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            输入主题，选择模板，AI 帮你创作
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Panel - Input */}
          <div className="space-y-4 md:space-y-6">
            <TopicInput
              value={topic}
              onChange={setTopic}
              disabled={isLoading}
            />

            <TemplateSelector
              selected={selectedTemplate}
              onSelect={setSelectedTemplate}
              disabled={isLoading}
            />

            {/* Options */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={withHotspot}
                  onChange={(e) => setWithHotspot(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">
                  融入热点话题元素
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={withCoverPrompt}
                  onChange={(e) => setWithCoverPrompt(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">
                  生成封面图提示词
                </span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-lg text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || !topic.trim() || !selectedTemplate}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? "生成中..." : "生成内容"}
            </button>
          </div>

          {/* Right Panel - Preview */}
          <div className="bg-secondary/30 rounded-xl p-4 md:p-6 min-h-[400px] md:min-h-[500px]">
            <ContentPreview result={result} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
