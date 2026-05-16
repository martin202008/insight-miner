'use client';

import { useState, useCallback } from 'react';
import { SourcePanel } from '@/components/SourcePanel';
import { CardGrid } from '@/components/CardGrid';
import type { Source, InsightCard } from '@/types';

export default function AnalyzePage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [cards, setCards] = useState<InsightCard[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddSource = useCallback((source: Source) => {
    setSources(prev => {
      const existing = prev.find(s => s.id === source.id);
      if (existing) {
        return prev.map(s => s.id === source.id ? { ...s, ...source } : s);
      }
      return [...prev, source];
    });
  }, []);

  const handleRemoveSource = useCallback((id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
  }, []);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    setCards([]);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sources }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setCards(data.cards);
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
      <SourcePanel
        sources={sources}
        onAddSource={handleAddSource}
        onRemoveSource={handleRemoveSource}
        onAnalyze={handleAnalyze}
        analyzing={analyzing}
        sourceLimit={5}
      />

      <section className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 md:mb-8">
            <h1 className="font-heading-italic text-2xl md:text-3xl text-foreground mb-2">洞察结果</h1>
            <p className="text-muted-foreground text-sm">
              {cards.length > 0
                ? `共生成 ${cards.length} 张洞察卡片`
                : '添加来源后点击「开始分析」，AI 将提取关键洞察'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-sm text-destructive text-sm">
              {error}
            </div>
          )}

          {analyzing && (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">AI 正在分析来源内容...</p>
              </div>
            </div>
          )}

          {!analyzing && <CardGrid cards={cards} />}

          {cards.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border flex items-center gap-4">
              <button
                onClick={async () => {
                  const allText = cards.map(c => `## ${c.title}\n\n${c.content}`).join('\n\n---\n\n');
                  await navigator.clipboard.writeText(allText);
                }}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-sm hover:brightness-110 transition-all"
              >
                复制全部卡片
              </button>
              <button
                onClick={() => {
                  const md = cards.map(c => `## ${c.title}\n\n${c.content}\n\n*来源: ${c.sourceRef}*`).join('\n\n---\n\n');
                  const blob = new Blob([md], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'insights.md';
                  a.click();
                }}
                className="px-4 py-2 border border-border text-foreground text-sm rounded-sm hover:bg-secondary/50 transition-all"
              >
                导出 Markdown
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
