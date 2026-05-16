"use client";

import { useState, useEffect } from "react";
import { WeChatTopicInput } from "./components/TopicInput";
import { WeChatTemplateSelector } from "./components/TemplateSelector";
import { WeChatContentPreview } from "./components/ContentPreview";
import { CoverGenerator } from "./components/CoverGenerator";
import { ArticleEditor } from "./components/ArticleEditor";
import { Settings, FileText, Image, ChevronRight, AlertTriangle } from "lucide-react";

interface CoverResult {
  prompt: string;
  images: string[];
}

interface GenerationResult {
  titles: string[];
  content: string;
  tags: string[];
  coverPrompt?: string;
}

export default function WeChatPage() {
  const [topic, setTopic] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [withHotspot, setWithHotspot] = useState(false);
  const [withCoverPrompt, setWithCoverPrompt] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [coverResult, setCoverResult] = useState<CoverResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"generate" | "cover" | "publish" | "settings">("generate");
  const [wechatConfig, setWechatConfig] = useState<{
    configured: boolean;
    appId: string | null;
    account: string | null;
  } | null>(null);

  useEffect(() => {
    fetch("/api/wechat/settings")
      .then((res) => res.json())
      .then((data) => setWechatConfig(data))
      .catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) { setError("请输入主题"); return; }
    if (!selectedTemplate) { setError("请选择模板"); return; }
    setError(null);
    setIsLoading(true);
    setResult(null);
    setCoverResult(null);
    try {
      const res = await fetch("/api/wechat/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim(), template: selectedTemplate, withHotspot, withCoverPrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "生成失败");
      setResult(data);
      // Reset cover result when new article is generated
      setCoverResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToCover = () => {
    setActiveTab("cover");
  };

  const handleGoToPublish = () => {
    setActiveTab("publish");
  };

  const handleCoverGenerated = (cover: CoverResult) => {
    setCoverResult(cover);
  };

  const tabs = [
    { id: "generate" as const, name: "文章生成", icon: FileText },
    { id: "cover" as const, name: "封面生成", icon: Image },
    { id: "publish" as const, name: "发布文章", icon: ChevronRight },
    { id: "settings" as const, name: "微信设置", icon: Settings },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">微信公众号文章助手</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            输入主题，选择模板，AI 帮你创作并发布高质量公众号文章
          </p>
        </div>

        {wechatConfig && !wechatConfig.configured && (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/50 rounded-lg text-sm flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-yellow-600 dark:text-yellow-500 font-medium">微信公众号未配置，发布功能暂时无法使用</p>
              <p className="text-yellow-600/70 text-xs mt-0.5">请先在「微信设置」中配置 AppID 和 AppSecret，并添加服务器IP到白名单</p>
            </div>
          </div>
        )}

        <div className="flex gap-1 p-1 bg-muted/50 rounded-lg mb-6 w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 md:gap-2 ${
                  activeTab === tab.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            );
          })}
        </div>

        {activeTab === "generate" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="space-y-4 md:space-y-6">
              <WeChatTopicInput value={topic} onChange={setTopic} disabled={isLoading} />
              <WeChatTemplateSelector selected={selectedTemplate} onSelect={setSelectedTemplate} disabled={isLoading} />
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={withHotspot} onChange={(e) => setWithHotspot(e.target.checked)} disabled={isLoading} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                  <span className="text-sm text-foreground">融入热点话题元素</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={withCoverPrompt} onChange={(e) => setWithCoverPrompt(e.target.checked)} disabled={isLoading} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                  <span className="text-sm text-foreground">生成封面图提示词</span>
                </label>
              </div>
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/50 rounded-lg text-sm text-destructive">{error}</div>
              )}
              <button
                onClick={handleGenerate}
                disabled={isLoading || !topic.trim() || !selectedTemplate}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? "生成中..." : "生成文章"}
              </button>
              {result && (
                <div className="flex gap-2">
                  <button onClick={handleGoToCover} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-all">生成封面</button>
                  <button onClick={handleGoToPublish} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:brightness-110 transition-all">发布文章</button>
                </div>
              )}
            </div>
            <div className="bg-secondary/30 rounded-xl p-4 md:p-6 min-h-[400px] md:min-h-[500px]">
              <WeChatContentPreview result={result} isLoading={isLoading} />
            </div>
          </div>
        )}

        {activeTab === "cover" && (
          <div className="max-w-2xl">
            <CoverGenerator
              title={result?.titles?.[0] || ""}
              content={result?.content || ""}
              template={selectedTemplate || undefined}
              onGenerated={handleCoverGenerated}
            />
          </div>
        )}

        {activeTab === "publish" && (
          <div className="max-w-2xl">
            {result ? (
              <ArticleEditor
                title={result.titles[0] || ""}
                content={result.content}
                tags={result.tags}
                coverResult={coverResult}
              />
            ) : (
              <div className="bg-card rounded-xl p-6 text-center">
                <p className="text-muted-foreground mb-2">暂无文章内容</p>
                <button onClick={() => setActiveTab("generate")} className="text-primary hover:underline text-sm">前往生成文章</button>
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && <WeChatSettings />}
      </div>
    </div>
  );
}

function WeChatSettings() {
  const [appId, setAppId] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleVerify = async () => {
    if (!appId.trim() || !appSecret.trim()) { setMessage({ type: "error", text: "请输入完整的 AppID 和 AppSecret" }); return; }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/wechat/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appId, appSecret, account }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "验证失败");
      setMessage({ type: "success", text: "配置验证成功！" });
      setAppSecret("");
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "验证失败" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-blue-500/10 border border-blue-500/40 rounded-xl p-4">
        <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          微信公众号白名单配置（重要）
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          在使用发布功能之前，请先将以下服务器IP地址添加到微信公众号的IP白名单中：
        </p>
        <div className="bg-background rounded-lg p-3 flex items-center justify-between">
          <code className="text-lg font-mono font-bold text-foreground">122.51.8.235</code>
          <button
            onClick={() => navigator.clipboard.writeText("122.51.8.235")}
            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 border border-border rounded"
          >
            复制
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          添加位置：微信公众平台 → 设置与开发 → 基本配置 → IP白名单 → 添加以上IP
        </p>
      </div>

      <div className="bg-card rounded-xl p-6 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Settings className="w-4 h-4" />
          微信公众号配置
        </h3>
        <p className="text-sm text-muted-foreground">
          配置您的微信公众号凭证，用于将文章直接发布到微信草稿箱。凭证加密存储在服务器端。
        </p>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">公众号名称</label>
          <input type="text" value={account} onChange={(e) => setAccount(e.target.value)} placeholder="例如：洞察精灵" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">AppID</label>
          <input type="text" value={appId} onChange={(e) => setAppId(e.target.value)} placeholder="wx1234567890abcdef" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono" />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">AppSecret</label>
          <input type="password" value={appSecret} onChange={(e) => setAppSecret(e.target.value)} placeholder="请输入 AppSecret" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono" />
        </div>
        {message && (
          <div className={`p-3 rounded-lg text-sm ${message.type === "success" ? "bg-primary/10 text-primary border border-primary/50" : "bg-destructive/10 text-destructive border border-destructive/50"}`}>
            {message.text}
          </div>
        )}
        <button onClick={handleVerify} disabled={loading} className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:brightness-110 disabled:opacity-50 transition-all">
          {loading ? "验证中..." : "验证并保存配置"}
        </button>
        <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
          <p className="font-medium text-foreground">如何获取 AppID 和 AppSecret？</p>
          <p>1. 登录微信公众平台：<a href="https://mp.weixin.qq.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://mp.weixin.qq.com</a></p>
          <p>2. 进入「设置与开发」→「基本配置」</p>
          <p>3. 复制 AppID 和 AppSecret</p>
          <p>4. 在同一页面找到「IP白名单」，添加服务器IP：122.51.8.235</p>
        </div>
      </div>
    </div>
  );
}