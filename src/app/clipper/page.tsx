"use client";

import { useState } from "react";
import Link from "next/link";

export default function ClipperPage() {
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const handleUpload = async (file: File) => {
    if (!file || !file.type.startsWith("video/")) {
      alert("请上传视频文件");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("video", file);
      const res = await fetch("/api/clipper/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (result.videoId) {
        window.location.href = `/clipper/${result.videoId}`;
      } else {
        alert("上传失败: " + (result.error || "未知错误"));
      }
    } catch (err) {
      alert("上传失败: " + String(err));
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleUrlImport = async () => {
    if (!urlInput.trim()) {
      alert("请输入视频链接");
      return;
    }
    setDownloading(true);
    try {
      const res = await fetch("/api/clipper/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      const result = await res.json();
      if (result.videoId) {
        window.location.href = `/clipper/${result.videoId}`;
      } else {
        alert("下载失败: " + (result.error || result.details || "未知错误"));
      }
    } catch (err) {
      alert("下载失败: " + String(err));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="pt-20 md:pt-24 px-4 md:px-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">视频智剪</h1>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 md:p-16 text-center transition-all ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
      >
        <div className="text-4xl mb-4">📹</div>
        <p className="text-base md:text-lg mb-4">拖拽视频文件到这里，或点击下方按钮选择</p>
        <label className="inline-block">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          <span className="bg-primary text-primary-foreground px-6 md:px-8 py-3 rounded-lg cursor-pointer hover:brightness-110 disabled:opacity-50">
            {uploading ? "上传中..." : "选择视频"}
          </span>
        </label>
        <p className="text-xs md:text-sm text-muted-foreground mt-4">支持 MP4, MOV, AVI 等格式</p>
      </div>

      {/* URL Import */}
      <div className="mt-6 md:mt-8 p-4 md:p-6 border border-border rounded-xl">
        <h3 className="font-semibold mb-3 md:mb-4">从链接导入</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="粘贴 B站 / 抖音 / YouTube 链接..."
            className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleUrlImport()}
          />
          <button
            onClick={handleUrlImport}
            disabled={downloading}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:brightness-110 disabled:opacity-50 transition-all"
          >
            {downloading ? "下载中..." : "下载"}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">支持 B站、抖音、YouTube 等平台</p>
      </div>

      {/* Project list placeholder */}
      <div className="mt-8 md:mt-12">
        <h2 className="text-lg md:text-xl font-semibold mb-4">项目列表</h2>
        <div className="text-muted-foreground">暂无项目</div>
      </div>
    </div>
  );
}