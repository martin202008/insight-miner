"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import LoginDialog from "@/components/LoginDialog";

const PLATFORMS = [
  { value: "xiaohongshu", label: "小红书" },
  { value: "douyin", label: "抖音" },
  { value: "kuaishou", label: "快手" },
  { value: "bilibili", label: "B站" },
];

const STYLES = [
  { value: "casual", label: "轻松有趣" },
  { value: "professional", label: "专业严谨" },
  { value: "emotional", label: "情感共鸣" },
  { value: "humorous", label: "幽默搞笑" },
];

export default function CreatePage() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("xiaohongshu");
  const [style, setStyle] = useState("casual");
  const [script, setScript] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      setShowLogin(true);
    }
  }, [user, loading]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("请输入主题");
      return;
    }

    setGenerating(true);
    setError("");
    setScript("");

    try {
      const res = await fetch("/api/marketing/create/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platform, style }),
      });

      const data = await res.json();

      if (data.success) {
        setScript(data.script.content);
      } else {
        setError(data.error || "生成失败");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <div className="min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">AI 创作</h1>

          <div className="space-y-6">
            {/* 输入区域 */}
            <div className="bg-card border border-border rounded-sm p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">创作主题</label>
                <Input
                  placeholder="输入你想要创作的内容主题..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">目标平台</label>
                  <select
                    className="flex h-10 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">风格</label>
                  <select
                    className="flex h-10 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                  >
                    {STYLES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button onClick={handleGenerate} disabled={generating} className="w-full">
                {generating ? "生成中..." : "生成脚本"}
              </Button>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            {/* 输出区域 */}
            {script && (
              <div className="bg-card border border-border rounded-sm p-6">
                <h2 className="text-lg font-medium mb-4">生成的脚本</h2>
                <div className="bg-muted/50 rounded-sm p-4 whitespace-pre-wrap text-sm">
                  {script}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <LoginDialog
        open={showLogin}
        onClose={() => setShowLogin(false)}
      />
    </>
  );
}
