"use client";

import { useState } from "react";
import { Download, Monitor, Smartphone, Star, Shield, Zap, ChevronRight, CheckCircle, XCircle } from "lucide-react";

export default function DownloadPage() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const handleDownload = (platform: string, url: string, filename: string) => {
    setDownloading(platform);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => setDownloading(null), 3000);
  };



  const features = [
    { icon: Shield, title: "数据安全", desc: "AppID/AppSecret 仅存储在您本地电脑，不经过任何服务器" },
    { icon: Zap, title: "极速体验", desc: "桌面原生应用，响应迅速，无网页加载等待" },
    { icon: Star, title: "AI 智能创作", desc: "输入主题，AI 自动生成标题、正文、标签，一键发布到公众号草稿箱" },
    { icon: Monitor, title: "多平台支持", desc: "支持 macOS（Apple Silicon & Intel）和 Windows 系统" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-blue-900/20" />
        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            客户端下载
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            订正星 · 智能公众号助手
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            本地桌面客户端 · 数据完全存储在您的电脑 · 支持 AI 文章生成与封面图创作
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#downloads" className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition">
              <Download size={18} />
              立即下载
            </a>
            <a href="/wechat" className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 rounded-lg font-medium transition">
              在线使用网页版
            </a>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-10">为什么选择桌面客户端？</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/30 transition">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-green-400" />
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Architecture */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="font-semibold mb-4 text-center">产品架构</h3>
          <div className="flex items-center justify-between gap-4 text-sm text-center">
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-2">网站入口</div>
              <div className="p-3 rounded bg-white/10 text-xs">dingzhenxing.cn<br/>落地页 + 下载</div>
            </div>
            <ChevronRight size={16} className="text-gray-600 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-2">客户端</div>
              <div className="p-3 rounded bg-green-500/10 text-xs">本地存储凭证<br/>调用 AI 生成</div>
            </div>
            <ChevronRight size={16} className="text-gray-600 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-2">微信</div>
              <div className="p-3 rounded bg-blue-500/10 text-xs">直接发布到<br/>公众号草稿箱</div>
            </div>
          </div>
        </div>
      </div>

      {/* Downloads */}
      <div id="downloads" className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-2">下载客户端</h2>
        <p className="text-gray-400 text-center mb-10 text-sm">服务器 IP：122.51.8.235 · 首次使用请先在微信公众平台配置 IP 白名单</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mac */}
          <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">macOS</h3>
                  <p className="text-xs text-gray-500">Apple Silicon · 289 MB · ZIP</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-400 mb-6">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> 适用 macOS 11+</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> 支持 Apple M 系列芯片</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> 支持 Intel 芯片</li>
              </ul>
              <button
                onClick={() => handleDownload("mac", "/client-download/dingzhenxing-mac-arm64.zip", "dingzhenxing-mac-arm64.zip")}
                disabled={downloading !== null}
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-lg font-semibold transition"
              >
                <Download size={18} />
                {downloading === "mac" ? "下载中..." : "下载 for macOS"}
              </button>
            </div>
          </div>

          {/* Windows */}
          <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden opacity-80">
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-900/50 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 12V6.75L9 5.43V11.91L3 12M20 3V11.75L10 11.9V5.21L20 3M3 13L9 13.09V19.9L3 18.75V13M20 13.25V22L10 20.09V13.1L20 13.25Z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Windows</h3>
                  <p className="text-xs text-gray-500">tar.gz 压缩包 · 104 MB · 需解压后运行</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-400 mb-6">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> 适用 Windows 10/11</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> 支持 x64 架构</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-400" /> Windows 10/11</li>
              </ul>
              <button
                onClick={() => handleDownload('win', '/client-download/dingzhenxing-win-x64.tar.gz', 'dingzhenxing-win-x64.tar.gz')}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition"
              >
                <Download size={18} />
                下载 for Windows (x64)
              </button>
            </div>
          </div>
        </div>

        {/* Setup guide */}
        <div className="mt-10 p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="font-semibold mb-4">首次使用配置步骤</h3>
          <ol className="space-y-3 text-sm text-gray-400">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">1</span>
              <span>下载并解压客户端（macOS 双击打开，Windows 运行安装程序）</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">2</span>
              <span>登录微信公众平台 → 设置与开发 → 基本配置 → IP白名单</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">3</span>
              <span>添加服务器IP：<code className="text-white bg-white/10 px-1.5 py-0.5 rounded text-xs">122.51.8.235</code></span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">4</span>
              <span>打开客户端 → 微信公众号凭证 → 填入 AppID + AppSecret → 验证并保存</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">5</span>
              <span>打开客户端 → API 设置 → 配置大模型 API Key（用于文章生成）和图像生成 API Key（用于封面图生成）</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">6</span>
              <span>开始创作文章 → 发布到公众号草稿箱</span>
            </li>
          </ol>

          {/* Model config tips */}
          <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/5">
            <h4 className="text-white font-medium mb-2">支持的 AI 模型</h4>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>• <strong className="text-white">文章生成</strong>：OpenAI GPT 系列、Anthropic Claude、DeepSeek、智谱 AI、百度千帆、MiniMax、自定义 API</li>
              <li>• <strong className="text-white">封面图生成</strong>：OpenAI DALL-E、MiniMax、Stability AI、自定义 API</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-gray-600 text-xs py-8 border-t border-white/5">
        <p>© 2026 订正星 dingzhenxing.cn · 服务器 IP：122.51.8.235</p>
      </footer>
    </div>
  );
}