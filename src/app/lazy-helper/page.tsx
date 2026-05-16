"use client";

import { useState } from "react";
import { Download, Apple, Monitor, Terminal, Scan, Clock, Database, Sparkles, CheckCircle, Shield, Zap, Star, Settings } from "lucide-react";

export default function LazyHelperDownloadPage() {
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
    { icon: Scan, title: "发票 OCR", desc: "拖拽图片，本地 Tesseract.js 识别，自动提取发票号码/金额/税额，批量导出 CSV", color: "text-blue-400" },
    { icon: Clock, title: "会议纪要", desc: "上传音频 → AI 自动转写 → 生成结构化纪要 → 支持 TTS 朗读会议摘要", color: "text-purple-400" },
    { icon: Database, title: "本地知识库", desc: "上传 PDF/DOCX/TXT，本地 Embedding 向量化，智能问答精准检索", color: "text-green-400" },
    { icon: Sparkles, title: "AI 任务管理", desc: "任务优先级管理 + 截止日期 + AI 智能建议，让待办事项井井有条", color: "text-orange-400" },
    { icon: Shield, title: "数据完全本地", desc: "所有文档/音频/知识库数据存储在您本地电脑，不上传任何服务器", color: "text-red-400" },
    { icon: Settings, title: "多模型支持", desc: "支持 OpenAI / MiniMax / Claude / 智谱 / 通义千问 / DeepSeek / 自定义 API", color: "text-cyan-400" },
  ];

  const platforms = [
    {
      name: "macOS",
      icon: Apple,
      iconColor: "text-gray-300",
      bgColor: "bg-gray-900/50",
      badge: "推荐",
      badgeColor: "bg-blue-500",
      version: "v1.0.0 · Apple Silicon (M1/M2/M3/M4)",
      size: "205 MB",
      format: "DMG 安装包",
      features: ["macOS 12+ (Monterey 及以上)", "Apple Silicon 原生支持", "双击安装，拖入 Applications", "首次打开需右键→打开（未签名）"],
      downloads: [
        { label: "下载 DMG", url: "/client-download/lazy-helper/lazy-mac.dmg", filename: "订正星偷懒助手-1.0.0-arm64.dmg" },
        { label: "下载 ZIP", url: "/client-download/lazy-helper/lazy-mac.zip", filename: "订正星偷懒助手-1.0.0-arm64-mac.zip" },
      ],
    },
    {
      name: "Windows",
      icon: Monitor,
      iconColor: "text-blue-400",
      bgColor: "bg-blue-900/30",
      badge: "",
      badgeColor: "",
      version: "v1.0.0 · Windows x64",
      size: "190 MB",
      format: "tar.gz 压缩包",
      features: ["Windows 10/11 (x64)", "解压即用，无需安装", "支持中文界面", "需 Python 3.10+（知识库功能）"],
      downloads: [
        { label: "下载 for Windows (x64)", url: "/client-download/lazy-helper/dingzhenxing-lazy-helper-win-x64.tar.gz", filename: "dingzhenxing-lazy-helper-win-x64.tar.gz" },
      ],
    },
    {
      name: "Linux",
      icon: Terminal,
      iconColor: "text-yellow-400",
      bgColor: "bg-yellow-900/20",
      badge: "",
      badgeColor: "",
      version: "v1.0.0 · Linux x64",
      size: "168 MB",
      format: "tar.gz 压缩包",
      features: ["Ubuntu 20.04+ / Debian 11+", "解压即用，chmod +x 运行", "需 Python 3.10+（知识库功能）", "需 edge-tts（会议纪要 TTS）"],
      downloads: [
        { label: "下载 for Linux (x64)", url: "/client-download/lazy-helper/dingzhenxing-lazy-helper-1.0.0.tar.gz", filename: "dingzhenxing-lazy-helper-1.0.0.tar.gz" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-purple-900/20" />
        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            桌面客户端下载
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            订正星 · 智能偷懒助手
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-4">
            本地桌面应用 · 四合一效率工具箱 · 让 AI 帮你处理繁琐工作
          </p>
          <p className="text-sm text-gray-500 max-w-xl mx-auto mb-8">
            发票 OCR + 会议纪要 + 本地知识库 + AI 任务管理 — 所有数据存储在您的电脑，零隐私泄露风险
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#downloads" className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition">
              <Download size={18} />
              立即下载
            </a>
            <a href="#features" className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 rounded-lg font-medium transition">
              查看功能介绍
            </a>
          </div>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">四大核心功能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="rounded-xl bg-white/5 border border-white/10 p-6 hover:bg-white/8 transition-colors">
                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${f.color}`}>
                  <Icon size={24} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Downloads */}
      <div id="downloads" className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-center mb-12">选择您的平台</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {platforms.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.name} className={`rounded-xl border border-white/10 overflow-hidden ${p.bgColor}`}>
                <div className="p-6 border-b border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${p.iconColor}`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{p.name}</h3>
                        {p.badge && (
                          <span className={`text-xs px-2 py-0.5 rounded-full text-white ${p.badgeColor}`}>
                            {p.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{p.version}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">{p.format} · {p.size}</p>
                  <ul className="space-y-2 text-sm text-gray-400 mb-6">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="space-y-2">
                    {p.downloads.map((d, i) => (
                      <button
                        key={i}
                        onClick={() => handleDownload(`${p.name}-${i}`, d.url, d.filename)}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition ${
                          i === 0
                            ? "bg-blue-600 hover:bg-blue-500"
                            : "bg-white/10 hover:bg-white/15 text-gray-300"
                        }`}
                      >
                        <Download size={18} />
                        {downloading === `${p.name}-${i}` ? "下载中..." : d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Setup guide */}
        <div className="mt-10 p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="font-semibold mb-4">首次使用配置步骤</h3>
          <ol className="space-y-3 text-sm text-gray-400">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">1</span>
              <span>下载并解压客户端（macOS 双击 DMG 安装，Windows/Linux 解压即用）</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">2</span>
              <span>打开客户端 → 点击左下角「设置」→ 选择 AI 模型 Provider（OpenAI / MiniMax / Claude / 智谱 / 通义千问 / DeepSeek / 自定义）</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">3</span>
              <span>填入 API Key → 点击「测试连接」确认可用 → 保存配置</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">4</span>
              <span>开始使用：拖入发票图片识别 / 上传会议录音 / 导入文档构建知识库 / 管理 AI 任务</span>
            </li>
          </ol>

          {/* Supported models */}
          <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/5">
            <h4 className="text-white font-medium mb-2">支持的 AI 模型</h4>
            <ul className="space-y-1 text-xs text-gray-400">
              <li>• <strong className="text-white">LLM 对话</strong>：OpenAI GPT-4o / MiniMax / Claude / 智谱 GLM / 通义千问 / Moonshot / DeepSeek / 豆包 / 自定义 API</li>
              <li>• <strong className="text-white">语音识别 (STT)</strong>：MiniMax Speech / OpenAI Whisper（自动从 LLM 配置读取）</li>
              <li>• <strong className="text-white">语音合成 (TTS)</strong>：Microsoft Edge TTS（本地免费，支持多种中文音色）</li>
              <li>• <strong className="text-white">知识库 Embedding</strong>：sentence-transformers（paraphrase-multilingual-MiniLM-L12-v2，本地运行）</li>
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