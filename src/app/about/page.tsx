'use client';

import Link from 'next/link';
import { ArrowLeft, Sparkles, Zap, Brain, Rocket, Coffee, FileText, Mic, Video, FileSearch, BookOpen, Shield, Scale, Layers, Wand2, FileUp, MessageSquare, Settings2, Megaphone, Image } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen px-6 py-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">关于我们</h1>
      </div>

      {/* Product Introduction */}
      <div className="bg-secondary/30 rounded-xl p-6 mb-6 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">产品介绍</h2>
        </div>

        <div className="space-y-6">
          {/* Current Products */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4" /> AI 产品矩阵
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-xl p-4 border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <FileSearch className="w-5 h-5 text-primary" />
                  <h4 className="text-foreground font-medium">洞察挖掘器</h4>
                </div>
                <p className="text-muted-foreground text-xs">输入 URL / 文档 / 视频链接，5 分钟生成结构化洞察卡片。支持网页解析、文档上传、视频内容提取。</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Video className="w-5 h-5 text-primary" />
                  <h4 className="text-foreground font-medium">视频智剪</h4>
                </div>
                <p className="text-muted-foreground text-xs">上传视频，AI 自动识别高光片段。支持 Whisper 语音转字幕，Claude 智能分析，一键导出精彩片段。</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Mic className="w-5 h-5 text-primary" />
                  <h4 className="text-foreground font-medium">AI 配音</h4>
                </div>
                <p className="text-muted-foreground text-xs">文字转语音，支持多种音色选择。即时试听，下载高质量音频文件。</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h4 className="text-foreground font-medium">小红书内容生成</h4>
                </div>
                <p className="text-muted-foreground text-xs">AI 深度学习平台调性，生成具有强情绪感染力的爆款标题与正文，支持热点话题融入。</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h4 className="text-foreground font-medium">文档报告生成</h4>
                </div>
                <p className="text-muted-foreground text-xs">上传 Excel、PDF、DOCX 等文档，AI 分析内容并生成结构化报告。支持多格式导出。</p>
              </div>
            </div>
          </div>

          {/* More Features */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4" /> 更多功能
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-xl p-4 border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <FileUp className="w-5 h-5 text-primary" />
                  <h4 className="text-foreground font-medium">内容提取分析</h4>
                </div>
                <p className="text-muted-foreground text-xs">支持长篇小说、长文、PDF 等超长内容的一键提取与结构化分析，快速提炼核心信息与关键洞察。</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h4 className="text-foreground font-medium">提示词广场</h4>
                </div>
                <p className="text-muted-foreground text-xs">收录并优化各主流 AI 工具（ChatGPT、Midjourney、Claude 等）的精选提示词模板库，支持分类筛选与一键复制。</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Image className="w-5 h-5 text-primary" />
                  <h4 className="text-foreground font-medium">公众号配图生成</h4>
                </div>
                <p className="text-muted-foreground text-xs">输入主题，AI 自动生成配套封面图和文中插图，支持多种风格，一键下载。</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Megaphone className="w-5 h-5 text-primary" />
                  <h4 className="text-foreground font-medium">数字营销中心</h4>
                </div>
                <p className="text-muted-foreground text-xs">输入主题，AI 自动生成营销方案、视频脚本和配图文案。支持抖音、B站、小红书等多平台内容分发与一键发布。</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <Settings2 className="w-5 h-5 text-primary" />
                  <h4 className="text-foreground font-medium">智能体配置</h4>
                </div>
                <p className="text-muted-foreground text-xs">支持灵活配置 AI 模型：文本生成模型（GPT / Claude / DeepSeek 等）与图像生成模型（DALL-E / Stable Diffusion 等）独立设置、自定义 API 端点。</p>
              </div>
            </div>
          </div>

          {/* AI Capabilities */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4" /> 核心 AI 能力
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-xl p-4 border border-border">
                <h4 className="text-foreground font-medium mb-2">深度语义理解</h4>
                <p className="text-muted-foreground text-xs">基于海量数据训练的模型，精准理解内容意图与上下文关系</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 border border-border">
                <h4 className="text-foreground font-medium mb-2">多模态处理</h4>
                <p className="text-muted-foreground text-xs">支持文本、文档、网页、视频等多种内容格式的统一处理</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 border border-border">
                <h4 className="text-foreground font-medium mb-2">结构化输出</h4>
                <p className="text-muted-foreground text-xs">智能生成格式化内容，便于直接使用和二次编辑</p>
              </div>
            </div>
          </div>

          {/* Future Plans */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Rocket className="w-4 h-4" /> 未来规划
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-xl p-4 border border-primary/20">
                <h4 className="text-foreground font-medium mb-2">PPT 制作</h4>
                <p className="text-muted-foreground text-xs">输入主题或文档，AI 自动生成专业 PPT。支持多种风格模板，一键导出。</p>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-xl p-4 border border-primary/20">
                <h4 className="text-foreground font-medium mb-2">全自动化数字营销工具</h4>
                <p className="text-muted-foreground text-xs">从内容创作到多平台分发，全流程 AI 自动化。支持数据分析与效果追踪。</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Client */}
      <div className="bg-secondary/30 rounded-xl p-6 mb-6 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <Wand2 className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">桌面客户端</h2>
        </div>
        <div className="bg-gradient-to-br from-primary/5 to-transparent rounded-2xl p-6 border border-primary/20">
          <p className="text-foreground/90 leading-relaxed mb-4">
            订正星提供跨平台桌面客户端（macOS / Windows），将公众号文章创作能力带到桌面端。本地存储 AppID / AppSecret，数据不过服务器，使用更安心。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-muted/50 rounded-lg p-3 border border-border">
              <h4 className="text-foreground font-medium mb-1 text-sm">输入主题，AI 生成全文</h4>
              <p className="text-muted-foreground text-xs">支持多种风格模板，自动生成标题、正文、标签，可编辑后一键发布到公众号草稿箱</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 border border-border">
              <h4 className="text-foreground font-medium mb-1 text-sm">独立配置文本与图像模型</h4>
              <p className="text-muted-foreground text-xs">文本生成和图像生成可分别选择不同 AI 提供商和模型，自定义 API 端点</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/download" className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm font-medium transition-colors">
              下载客户端
            </Link>
            <Link href="/wechat" className="px-4 py-2 bg-secondary hover:bg-muted rounded-lg text-sm text-foreground transition-colors">
              在线使用网页版
            </Link>
          </div>
        </div>
      </div>

      {/* Developer Introduction */}
      <div className="bg-secondary/30 rounded-xl p-6 mb-6 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <Coffee className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">关于创始人</h2>
        </div>

        <div className="bg-gradient-to-br from-primary/5 to-transparent rounded-2xl p-6 border border-primary/20">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <img src="/logo.png" alt="订正星" className="w-20 h-20 rounded-2xl object-contain border border-primary/30" />
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-1">订正星</h3>
              <p className="text-primary text-sm font-medium">AI 工具开发者 | 全栈工程师</p>
            </div>
          </div>

          {/* Wulishitou Introduction */}
          <div className="space-y-4 text-foreground/90">
            <p className="text-lg leading-relaxed">
              你可能会问，<strong className="text-primary">订正星</strong>是谁？
            </p>
            <p className="leading-relaxed">
              传说中<strong className="text-foreground">精通多款 AI 工具</strong>的男人。
              他的键盘上敲出的不是代码，而是<strong className="text-primary">prompt 咒语</strong>。
              当别人还在和 AI "商量"的时候，他已经在<strong className="text-primary">指挥</strong> AI 干活了。
            </p>
            <p className="leading-relaxed">
              他用 ChatGPT 写需求，用 Midjourney 做设计，
              用 Claude 改文案，用 Stable Diffusion 做素材，
              用 Cursor 写代码，用 Copilot Debug，
              用 KIMI 翻译文档，用文心一言写报告。
            </p>
            <p className="leading-relaxed">
              江湖人称：<strong className="text-primary">
                "prompt 工程师"
              </strong>
            </p>
            <p className="leading-relaxed">
              他创办订正星的初衷很简单：
              <strong className="text-foreground">让每个人都能用 AI 提升工作效率</strong>，
              毕竟——<strong className="text-primary">效率就是生命</strong>。
            </p>
          </div>

          {/* Skills Tags */}
          <div className="flex flex-wrap gap-2 mt-6">
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">Prompt 工程</span>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">AI 模型集成</span>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">全栈开发</span>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">Next.js</span>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">云原生</span>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">持续迭代</span>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-muted-foreground text-sm text-center">
            有问题或建议？欢迎交流探讨！
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Link
              href="/"
              className="px-4 py-2 bg-secondary hover:bg-muted rounded-lg text-sm text-foreground transition-colors"
            >
              体验产品
            </Link>
          </div>
        </div>
      </div>

      {/* Legal */}
      <div className="bg-secondary/30 rounded-xl p-6 mb-6 border border-border">
        <div className="flex items-center gap-3 mb-6">
          <Scale className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">法律信息</h2>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" /> 隐私政策
            </h3>
            <div className="bg-muted/50 rounded-xl p-4 border border-border space-y-3 text-sm text-muted-foreground">
              <p><strong className="text-foreground">数据收集：</strong>我们仅收集您主动提交的内容（文本、文档、视频链接等）用于 AI 处理。</p>
              <p><strong className="text-foreground">数据存储：</strong>所有上传内容在处理完成后即删除，不会永久存储在服务器。</p>
              <p><strong className="text-foreground">第三方服务：</strong>我们使用 MiniMax API 进行 AI 处理，您的数据会发送到该服务提供商。</p>
              <p><strong className="text-foreground">Cookie：</strong>本站使用必要的 Cookie 确保服务正常运行，不用于追踪用户行为。</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" /> 服务条款
            </h3>
            <div className="bg-muted/50 rounded-xl p-4 border border-border space-y-3 text-sm text-muted-foreground">
              <p><strong className="text-foreground">服务说明：</strong>订正星提供多种 AI 工具服务，帮助用户提升内容创作和数据处理效率。</p>
              <p><strong className="text-foreground">使用规范：</strong>请勿使用本服务生成违法、侵权或有害内容。我们有权终止违规用户的服务。</p>
              <p><strong className="text-foreground">免责声明：</strong>AI 生成内容仅供参考，使用前请自行判断内容的准确性和适用性。</p>
              <p><strong className="text-foreground">服务变更：</strong>我们保留随时修改或中断服务的权利，恕不另行通知。</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-muted-foreground text-xs">
        <p>订正星 © 2026 · AI 驱动效率工具</p>
        <p className="mt-1">用 AI 点亮创作之路 ✨</p>
      </div>
    </div>
  );
}