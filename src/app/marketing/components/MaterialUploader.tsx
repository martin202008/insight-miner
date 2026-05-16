"use client";

import { useState, useRef } from "react";

interface MaterialUploaderProps {
  onUpload: (url: string) => void;
}

export function MaterialUploader({ onUpload }: MaterialUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file || (!file.type.startsWith("video/") && !file.type.startsWith("image/"))) {
      alert("请上传视频或图片文件");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("material", file);
      const res = await fetch("/api/marketing/upload-material", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (result.url) {
        onUpload(result.url);
      } else {
        alert("上传失败: " + (result.error || "未知错误"));
      }
    } catch (err) {
      alert("上传失败: " + String(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">或上传素材（视频/图片）</h3>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
        onClick={() => fileRef.current?.click()}
      >
        <div className="text-3xl mb-2">📁</div>
        <p className="text-sm text-muted-foreground mb-2">拖拽文件到此处，或点击选择</p>
        <input
          ref={fileRef}
          type="file"
          accept="video/*,image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
          className="hidden"
          disabled={uploading}
        />
        <span className="text-sm text-primary">{uploading ? "上传中..." : "选择文件"}</span>
      </div>
    </div>
  );
}