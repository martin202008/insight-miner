"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { VideoPlayer } from "@/components/clipper/VideoPlayer";

interface Highlight {
  start: number;
  end: number;
  score: number;
  reason: string;
}

interface ClipData {
  videoId: string;
  transcript: { start: number; end: number; text: string }[];
  highlights: Highlight[];
  summary: string;
}

export default function ClipEditorPage() {
  const params = useParams();
  const videoId = params.videoId as string;

  const [data, setData] = useState<ClipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedClips, setSelectedClips] = useState<number[]>([]);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<"9:16" | "16:9" | "1:1">("9:16");
  const [includeSubtitles, setIncludeSubtitles] = useState(false);
  const [mergeClips, setMergeClips] = useState(false);
  const [exportedClips, setExportedClips] = useState<any[]>([]);
  const [mergedPath, setMergedPath] = useState<string | null>(null);
  const [videoExists, setVideoExists] = useState(true);
  const [selectedHighlightIndex, setSelectedHighlightIndex] = useState<number | undefined>();
  // Local highlights that can be adjusted by user
  const [localHighlights, setLocalHighlights] = useState<Highlight[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  // Subtitle style
  const [subtitlePosition, setSubtitlePosition] = useState<"top" | "bottom">("bottom");
  const [subtitleFontSize, setSubtitleFontSize] = useState(48);
  const [subtitleColor, setSubtitleColor] = useState("#FFFFFF");
  const [subtitleBgColor, setSubtitleBgColor] = useState("#000000");
  // Intro/Outro
  const [addIntro, setAddIntro] = useState(false);
  const [introText, setIntroText] = useState("视频智剪");
  const [addOutro, setAddOutro] = useState(false);
  const [outroText, setOutroText] = useState("感谢观看");
  // Background music
  const [backgroundMusic, setBackgroundMusic] = useState<string | null>(null);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const [uploadingMusic, setUploadingMusic] = useState(false);

  useEffect(() => {
    loadAnalysis();
  }, [videoId]);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clipper/clips/${videoId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLocalHighlights(json.highlights);
        setSelectedClips(json.highlights.map((_: any, i: number) => i));
      } else {
        // No analysis yet - that's ok, video might still exist
        setData(null);
      }
    } catch (err) {
      console.error("Failed to load analysis:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleHighlightChange = (index: number, newStart: number, newEnd: number) => {
    setLocalHighlights((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], start: newStart, end: newEnd };
      return updated;
    });
  };

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMusic(true);
    try {
      const formData = new FormData();
      formData.append("music", file);
      const res = await fetch("/api/clipper/music", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (result.path) {
        setBackgroundMusic(result.path);
      } else {
        alert("上传失败: " + (result.error || "未知错误"));
      }
    } catch (err) {
      alert("上传失败: " + String(err));
    } finally {
      setUploadingMusic(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/clipper/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
      console.log("[analyze] Response status:", res.status, "ok:", res.ok);
      const result = await res.json();
      console.log("[analyze] Response body:", JSON.stringify(result));
      if (result.error) {
        alert("分析失败: " + (result.details || result.error));
      } else {
        await loadAnalysis();
      }
    } catch (err) {
      console.error("[analyze] Fetch error:", err);
      alert("分析失败: " + String(err));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExport = async () => {
    if (selectedClips.length === 0) {
      alert("请先选择要导出的片段");
      return;
    }
    setExporting(true);
    try {
      const res = await fetch("/api/clipper/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          clipIds: selectedClips,
          format: exportFormat,
          includeSubtitles,
          highlights: localHighlights,
          merge: mergeClips,
          subtitleStyle: includeSubtitles ? {
            position: subtitlePosition,
            fontSize: subtitleFontSize,
            color: subtitleColor,
            bgColor: subtitleBgColor,
          } : undefined,
          addIntro,
          introText,
          addOutro,
          outroText,
          backgroundMusic,
          musicVolume,
        }),
      });
      const result = await res.json();
      console.log("[export] Response:", JSON.stringify(result));
      if (result.clips) {
        setExportedClips(result.clips);
      }
      if (result.mergedPath) {
        setMergedPath(result.mergedPath);
      }
      if (result.errors && result.errors.length > 0) {
        alert(`导出完成，但有 ${result.errors.length} 个错误:\n${result.errors.join("\n")}`);
      } else if (result.error) {
        alert("导出失败: " + (result.details || result.error));
      } else {
        alert("导出成功！");
      }
    } catch (err) {
      alert("导出失败: " + String(err));
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  const highlights = localHighlights.length > 0 ? localHighlights : (data?.highlights || []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/clipper" className="text-muted-foreground hover:text-foreground">
              ← 返回
            </Link>
            <h1 className="text-xl font-semibold">视频智剪</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            {data?.summary || "未分析"}
          </div>
        </div>
      </header>

      <main className="pt-20 px-8 pb-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Video Player */}
          <div className="lg:col-span-2">
            <VideoPlayer
              src={`/uploads/videos/${videoId}.mp4`}
              highlights={localHighlights.length > 0 ? localHighlights : highlights}
              onTimeUpdate={setCurrentTime}
              onHighlightChange={handleHighlightChange}
              selectedHighlightIndex={selectedHighlightIndex}
              onSelectHighlight={setSelectedHighlightIndex}
            />

            {/* Analysis button */}
            {!data && (
              <div className="mt-6 p-6 bg-card rounded-lg border border-border text-center">
                <p className="text-muted-foreground mb-4">视频已上传，点击开始 AI 分析</p>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  {analyzing ? "分析中..." : "开始 AI 分析"}
                </button>
              </div>
            )}

            {/* Export section - only show if we have highlights */}
            {highlights.length > 0 && (
              <div className="mt-6 p-6 bg-card rounded-lg border border-border">
                <h3 className="font-semibold mb-4">导出设置</h3>

                <div className="flex items-center gap-4 mb-4">
                  <label className="text-sm text-muted-foreground">输出比例:</label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                    className="bg-background border border-border rounded px-3 py-1.5 text-sm"
                  >
                    <option value="9:16">9:16 (抖音/短视频)</option>
                    <option value="16:9">16:9 (横版)</option>
                    <option value="1:1">1:1 (方形)</option>
                  </select>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSubtitles}
                      onChange={(e) => setIncludeSubtitles(e.target.checked)}
                      className="w-4 h-4 rounded border-border"
                    />
                    烧录字幕
                  </label>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mergeClips}
                      onChange={(e) => setMergeClips(e.target.checked)}
                      className="w-4 h-4 rounded border-border"
                    />
                    合并成一个视频
                  </label>
                </div>

                {/* Subtitle style options */}
                {includeSubtitles && (
                  <div className="mb-4 p-4 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex items-center gap-4">
                      <label className="text-sm text-muted-foreground w-16">位置:</label>
                      <select
                        value={subtitlePosition}
                        onChange={(e) => setSubtitlePosition(e.target.value as "top" | "bottom")}
                        className="bg-background border border-border rounded px-2 py-1 text-sm"
                      >
                        <option value="bottom">底部</option>
                        <option value="top">顶部</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="text-sm text-muted-foreground w-16">大小:</label>
                      <input
                        type="range"
                        min="24"
                        max="72"
                        value={subtitleFontSize}
                        onChange={(e) => setSubtitleFontSize(Number(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm w-12">{subtitleFontSize}px</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="text-sm text-muted-foreground w-16">颜色:</label>
                      <input
                        type="color"
                        value={subtitleColor}
                        onChange={(e) => setSubtitleColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                      <span className="text-sm text-muted-foreground">{subtitleColor}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="text-sm text-muted-foreground w-16">背景:</label>
                      <input
                        type="color"
                        value={subtitleBgColor}
                        onChange={(e) => setSubtitleBgColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                      <span className="text-sm text-muted-foreground">{subtitleBgColor}</span>
                    </div>
                  </div>
                )}

                {/* Intro/Outro options */}
                {mergeClips && (
                  <div className="mb-4 p-4 bg-muted/50 rounded-lg space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addIntro}
                        onChange={(e) => setAddIntro(e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm">添加片头</span>
                      {addIntro && (
                        <input
                          type="text"
                          value={introText}
                          onChange={(e) => setIntroText(e.target.value)}
                          className="ml-2 flex-1 bg-background border border-border rounded px-2 py-1 text-sm"
                          placeholder="片头文字"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addOutro}
                        onChange={(e) => setAddOutro(e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm">添加片尾</span>
                      {addOutro && (
                        <input
                          type="text"
                          value={outroText}
                          onChange={(e) => setOutroText(e.target.value)}
                          className="ml-2 flex-1 bg-background border border-border rounded px-2 py-1 text-sm"
                          placeholder="片尾文字"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Background music */}
                <div className="mb-4 p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleMusicUpload}
                      className="hidden"
                      id="music-upload"
                    />
                    <label
                      htmlFor="music-upload"
                      className="text-sm px-3 py-1.5 bg-primary/20 text-primary rounded cursor-pointer hover:bg-primary/30 transition-colors"
                    >
                      {uploadingMusic ? "上传中..." : backgroundMusic ? "更换音乐" : "添加背景音乐"}
                    </label>
                    {backgroundMusic && (
                      <span className="text-sm text-muted-foreground truncate flex-1">
                        已选择音乐
                      </span>
                    )}
                  </div>
                  {backgroundMusic && (
                    <div className="flex items-center gap-4">
                      <label className="text-sm text-muted-foreground w-16">音量:</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={musicVolume}
                        onChange={(e) => setMusicVolume(Number(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm w-12">{Math.round(musicVolume * 100)}%</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleExport}
                  disabled={exporting || selectedClips.length === 0}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  {exporting ? "导出中..." : mergeClips ? `合并导出 (${selectedClips.length}个片段)` : `导出已选片段 (${selectedClips.length}个)`}
                </button>

                {mergedPath && (
                  <div className="mt-4">
                    <p className="text-sm text-green-500 mb-2">合并导出成功！</p>
                    <a
                      href={mergedPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-muted-foreground hover:text-foreground"
                    >
                      {mergedPath}
                    </a>
                  </div>
                )}

                {exportedClips.length > 0 && !mergedPath && (
                  <div className="mt-4">
                    <p className="text-sm text-green-500 mb-2">导出成功！</p>
                    <div className="space-y-1">
                      {exportedClips.map((clip, i) => (
                        <a
                          key={i}
                          href={clip.outputPath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs text-muted-foreground hover:text-foreground"
                        >
                          {clip.outputPath}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Highlights List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">高光片段</h2>
              <span className="text-sm text-muted-foreground">
                {highlights.length} 个
              </span>
            </div>

            {highlights.length > 0 ? (
              <div className="space-y-2 mb-6">
                {highlights.map((h, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setSelectedClips((prev) =>
                        prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
                      );
                    }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedClips.includes(i)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-sm">
                        {h.start.toFixed(1)}s → {h.end.toFixed(1)}s
                      </span>
                      <span className="text-primary text-sm font-medium">
                        {Math.round(h.score * 100)}%
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{h.reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>暂无分析结果</p>
                <p className="text-sm mt-2">点击上方"开始 AI 分析"按钮</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
