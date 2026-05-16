"use client";

import { useState } from "react";

const VOICES = [
  { id: "zh-CN-XiaoxiaoNeural", name: "女声-知性", gender: "female" },
  { id: "zh-CN-XiaoyiNeural", name: "女声-活泼", gender: "female" },
  { id: "zh-CN-YunyangNeural", name: "男声-成熟", gender: "male" },
  { id: "zh-CN-YunxiNeural", name: "男声-自然", gender: "male" },
];

const STYLES = [
  { id: "default", name: "默认" },
  { id: "news", name: "新闻播报" },
  { id: "novel", name: "故事讲述" },
  { id: "customerservice", name: "客服对话" },
  { id: "chat", name: "日常对话" },
];

export default function TTSPage() {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState(VOICES[0].id);
  const [style, setStyle] = useState("default");
  const [generating, setGenerating] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [audioPath, setAudioPath] = useState<string | null>(null);
  const [previewPath, setPreviewPath] = useState<string | null>(null);

  const handlePreview = async () => {
    if (!text.trim()) {
      alert("请输入文字");
      return;
    }
    setPreviewing(true);
    try {
      const res = await fetch("/api/tts/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice, style }),
      });
      const result = await res.json();
      if (result.audioPath) {
        setPreviewPath(result.audioPath);
      } else {
        alert("试听失败: " + (result.error || "未知错误"));
      }
    } catch (err) {
      alert("试听失败: " + String(err));
    } finally {
      setPreviewing(false);
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      alert("请输入文字");
      return;
    }
    setGenerating(true);
    setAudioPath(null);
    try {
      const res = await fetch("/api/tts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice, style }),
      });
      const result = await res.json();
      if (result.audioPath) {
        setAudioPath(result.audioPath);
        setPreviewPath(null);
      } else {
        alert("生成失败: " + (result.error || "未知错误"));
      }
    } catch (err) {
      alert("生成失败: " + String(err));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="pt-20 md:pt-24 px-4 md:px-8 max-w-4xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">AI 配音</h1>
        <p className="text-muted-foreground text-sm md:text-base">一键文字转配音</p>
      </div>

      {/* Text Input */}
      <div className="mb-4 md:mb-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入要转换的文字..."
          className="w-full h-40 md:h-48 bg-card border border-border rounded-lg p-3 md:p-4 text-foreground resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">{text.length} / 10000 字符</p>
      </div>

      {/* Voice & Style Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        <div>
          <h3 className="text-sm font-medium mb-3">音色</h3>
          <div className="space-y-2">
            {VOICES.map((v) => (
              <label key={v.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="voice"
                  value={v.id}
                  checked={voice === v.id}
                  onChange={() => setVoice(v.id)}
                />
                <span className="text-sm">{v.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">风格</h3>
          <div className="space-y-2">
            {STYLES.map((s) => (
              <label key={s.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="style"
                  value={s.id}
                  checked={style === s.id}
                  onChange={() => setStyle(s.id)}
                />
                <span className="text-sm">{s.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 md:mb-6">
        <button
          onClick={handlePreview}
          disabled={previewing || !text.trim()}
          className="px-6 py-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 transition-all"
        >
          {previewing ? "试听中..." : "试听 5 秒"}
        </button>
        <button
          onClick={handleGenerate}
          disabled={generating || !text.trim()}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:brightness-110 disabled:opacity-50 transition-all"
        >
          {generating ? "生成中..." : "生成完整配音"}
        </button>
      </div>

      {/* Preview Player */}
      {previewPath && (
        <div className="mb-6 p-4 bg-card border border-border rounded-lg">
          <p className="text-sm font-medium mb-2">试听预览</p>
          <audio src={previewPath} controls className="w-full" />
        </div>
      )}

      {/* Download */}
      {audioPath && (
        <div className="p-6 bg-card border border-green-500/50 rounded-lg">
          <p className="text-green-500 font-medium mb-2">生成成功！</p>
          <a
            href={audioPath}
            download
            className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:brightness-110 transition-all"
          >
            下载 MP3
          </a>
        </div>
      )}
    </div>
  );
}