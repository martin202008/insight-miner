"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, RefreshCw, CheckCircle } from "lucide-react";

interface CoverGeneratorProps {
  title?: string;
  content?: string;
  template?: string;
  onGenerated?: (result: { prompt: string; images: string[] }) => void;
}

interface CoverResult {
  prompt: string;
  images: string[];
}

export function CoverGenerator({ title = "", content = "", template, onGenerated }: CoverGeneratorProps) {
  const [customTitle, setCustomTitle] = useState(title);
  const [customContent, setCustomContent] = useState(content);
  const [style, setStyle] = useState("modern");
  const [result, setResult] = useState<CoverResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!customTitle.trim()) { setError("请输入标题"); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/wechat/cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: customTitle, content: customContent, template, style }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "生成失败");
      setResult({ prompt: data.prompt || "", images: data.images || [] });
      onGenerated?.({ prompt: data.prompt || "", images: data.images || [] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成封面失败");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPrompt = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.prompt);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = result.prompt;
      textarea.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const styles = [
    { id: "modern", name: "现代简约", emoji: "✨" },
    { id: "professional", name: "专业商务", emoji: "💼" },
    { id: "creative", name: "创意艺术", emoji: "🎨" },
    { id: "tech", name: "科技感", emoji: "🔮" },
    { id: "minimal", name: "极简主义", emoji: "◻️" },
  ];

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">封面图生成器</h3>
        {result && result.images.length > 0 && (
          <span className="ml-auto text-xs text-primary flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> 已生成 {result.images.length} 张
          </span>
        )}
      </div>

      <div>
        <label className="block text-sm text-muted-foreground mb-1">文章标题</label>
        <input
          type="text"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          placeholder="输入文章标题获取封面提示词"
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          maxLength={64}
        />
      </div>

      <div>
        <label className="block text-sm text-muted-foreground mb-2">封面风格</label>
        <div className="flex flex-wrap gap-2">
          {styles.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-all ${
                style === s.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80 text-foreground"
              }`}
            >
              <span>{s.emoji}</span>
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-muted-foreground mb-1">内容摘要（可选）</label>
        <textarea
          value={customContent}
          onChange={(e) => setCustomContent(e.target.value)}
          placeholder="输入内容摘要，帮助生成更精准的封面"
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/50"
          maxLength={200}
        />
      </div>

      {error && (
        <div className="p-2 bg-destructive/10 border border-destructive/50 rounded-lg text-sm text-destructive">{error}</div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading || !customTitle.trim()}
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {loading ? (<><RefreshCw className="w-4 h-4 animate-spin" /><span>生成中...</span></>) : (<><Sparkles className="w-4 h-4" /><span>生成封面图</span></>)}
      </button>

      {result && (
        <div className="space-y-3 pt-2">
          {result.images.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">生成结果</label>
              <div className="grid grid-cols-3 gap-2">
                {result.images.map((url, i) => (
                  <div key={i} className="relative aspect-video bg-muted rounded overflow-hidden">
                    <img src={url} alt={`封面 ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              {result.images.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">图片已保存到服务器，可点击查看大图</p>
              )}
            </div>
          )}
          {result.prompt && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium">封面提示词</label>
                <button onClick={handleCopyPrompt} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  {copied ? (<><Check className="w-3 h-3 text-primary" /><span className="text-primary">已复制</span></>) : (<><Copy className="w-3 h-3" /><span>复制</span></>)}
                </button>
              </div>
              <div className="p-3 bg-background border border-border rounded-lg text-sm">{result.prompt}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}