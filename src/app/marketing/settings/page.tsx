"use client";

import { useState } from "react";

const platforms = [
  { id: "douyin", name: "抖音", icon: "🎵", color: "from-pink-500 to-rose-500" },
  { id: "xiaohongshu", name: "小红书", icon: "📕", color: "from-red-500 to-orange-500" },
  { id: "kuaishou", name: "快手", icon: "📱", color: "from-purple-500 to-indigo-500" },
  { id: "bilibili", name: "B站", icon: "📺", color: "from-blue-500 to-cyan-500" },
];

export default function SettingsPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [configs, setConfigs] = useState<Record<string, { appId: string; appSecret: string }>>({});
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/marketing/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configs),
      });
      const data = await res.json();
      if (data.success) {
        alert("保存成功");
      } else {
        alert("保存失败");
      }
    } catch (error) {
      alert("保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">平台设置</h1>
        <p className="text-muted-foreground mb-8">
          配置你的平台账号信息，用于内容发布
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              className={`p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all ${
                selectedPlatform === platform.id ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className={`text-3xl mb-2 bg-gradient-to-br ${platform.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                {platform.icon}
              </div>
              <div className="font-medium">{platform.name}</div>
            </button>
          ))}
        </div>

        {selectedPlatform && (
          <div className="bg-secondary/30 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">
              {platforms.find((p) => p.id === selectedPlatform)?.name} 配置
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">App ID</label>
                <input
                  type="text"
                  value={configs[selectedPlatform]?.appId || ""}
                  onChange={(e) =>
                    setConfigs({
                      ...configs,
                      [selectedPlatform]: {
                        ...configs[selectedPlatform],
                        appId: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="输入 App ID"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-1">App Secret</label>
                <input
                  type="password"
                  value={configs[selectedPlatform]?.appSecret || ""}
                  onChange={(e) =>
                    setConfigs({
                      ...configs,
                      [selectedPlatform]: {
                        ...configs[selectedPlatform],
                        appSecret: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="输入 App Secret"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
              >
                {saving ? "保存中..." : "保存配置"}
              </button>
            </div>
          </div>
        )}

        {!selectedPlatform && (
          <div className="text-center py-12 text-muted-foreground">
            选择要配置的平台
          </div>
        )}
      </div>
    </div>
  );
}