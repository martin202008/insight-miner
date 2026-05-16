"use client";

import { useState } from "react";

interface Plan {
  id: string;
  title: string;
  script: string;
  coverPrompt: string;
  tags: string[];
}

interface VideoPreviewProps {
  plan: Plan;
  materialUrl: string | null;
  onProduced: (videoPath: string, captionPackage: any) => void;
}

export function VideoPreview({ plan, materialUrl, onProduced }: VideoPreviewProps) {
  const [producing, setProducing] = useState(false);
  const [progress, setProgress] = useState("");

  const handleProduce = async () => {
    setProducing(true);
    setProgress("正在生成配音...");
    try {
      setProgress("正在制作视频...");
      const res = await fetch("/api/marketing/video/produce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, materialUrl }),
      });
      const result = await res.json();
      if (result.videoPath) {
        setProgress("视频制作完成！");
        onProduced(result.videoPath, result.captionPackage);
      } else {
        alert("视频制作失败: " + (result.error || "未知错误"));
      }
    } catch (err) {
      alert("视频制作失败: " + String(err));
    } finally {
      setProducing(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">视频制作</h3>
      <div className="p-4 bg-card border border-border rounded-lg mb-4">
        <h4 className="font-medium mb-2">{plan.title}</h4>
        <p className="text-sm text-muted-foreground mb-2">脚本：{plan.script}</p>
        {materialUrl && (
          <p className="text-sm text-muted-foreground">素材：已上传</p>
        )}
      </div>
      {producing && (
        <div className="mb-4 p-3 bg-primary/10 rounded-lg text-sm">
          {progress}
        </div>
      )}
      <button
        onClick={handleProduce}
        disabled={producing}
        className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:brightness-110 disabled:opacity-50 transition-all"
      >
        {producing ? "制作中..." : "开始制作视频"}
      </button>
    </div>
  );
}
