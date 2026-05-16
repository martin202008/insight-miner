"use client";

import { useState } from "react";

interface CaptionPackage {
  title: string;
  script: string;
  coverPrompt: string;
  tags: string[];
  hashtag: string;
}

interface PublishPanelProps {
  videoPath: string;
  captionPackage: CaptionPackage;
  topic: string;
}

export function PublishPanel({ videoPath, captionPackage, topic }: PublishPanelProps) {
  const [publishing, setPublishing] = useState(false);
  const [douyinStatus, setDouyinStatus] = useState<string>("");
  const [videoStatus, setVideoStatus] = useState<string>("");

  const handlePublishDouyin = async () => {
    setPublishing(true);
    setDouyinStatus("正在发布到抖音...");
    try {
      const res = await fetch("/api/marketing/publish-douyin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoPath, captionPackage }),
      });
      const result = await res.json();
      if (result.success) {
        setDouyinStatus("已发布到抖音草稿箱");
      } else {
        setDouyinStatus("抖音发布失败: " + (result.error || "请下载手动发布"));
      }
    } catch (err) {
      setDouyinStatus("抖音发布失败，请下载手动发布");
    } finally {
      setPublishing(false);
    }
  };

  const handlePublishVideo = async () => {
    setPublishing(true);
    setVideoStatus("正在发布到视频号...");
    try {
      const res = await fetch("/api/marketing/publish-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoPath, captionPackage }),
      });
      const result = await res.json();
      if (result.success) {
        setVideoStatus("已发布到视频号草稿箱");
      } else {
        setVideoStatus("视频号发布失败: " + (result.error || "请下载手动发布"));
      }
    } catch (err) {
      setVideoStatus("视频号发布失败，请下载手动发布");
    } finally {
      setPublishing(false);
    }
  };

  const handleDownload = () => {
    // 视频在 /tmp 下，通过 uploads 路径访问
    const downloadUrl = videoPath.replace("/tmp", "");
    window.open(downloadUrl, "_blank");
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">发布</h3>

      {/* 配图文案包 */}
      <div className="p-4 bg-card border border-border rounded-lg mb-4">
        <h4 className="font-medium mb-2">配图文案包</h4>
        <div className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">标题：</span>{captionPackage.title}</p>
          <p><span className="text-muted-foreground">hashtag：</span>{captionPackage.hashtag}</p>
          <p><span className="text-muted-foreground">标签：</span>{captionPackage.tags?.join(", ")}</p>
        </div>
      </div>

      {/* 发布按钮 */}
      <div className="space-y-3">
        <button
          onClick={handlePublishDouyin}
          disabled={publishing}
          className="w-full px-6 py-3 bg-[#fe2c55] text-white rounded-lg font-medium hover:brightness-110 disabled:opacity-50 transition-all"
        >
          发布到抖音
        </button>
        {douyinStatus && (
          <p className="text-sm text-muted-foreground">{douyinStatus}</p>
        )}

        <button
          onClick={handlePublishVideo}
          disabled={publishing}
          className="w-full px-6 py-3 bg-[#07c160] text-white rounded-lg font-medium hover:brightness-110 disabled:opacity-50 transition-all"
        >
          发布到视频号
        </button>
        {videoStatus && (
          <p className="text-sm text-muted-foreground">{videoStatus}</p>
        )}

        <button
          onClick={handleDownload}
          className="w-full px-6 py-3 border border-border rounded-lg hover:bg-muted transition-all"
        >
          下载视频
        </button>
      </div>
    </div>
  );
}