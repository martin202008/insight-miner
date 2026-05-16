import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import * as fs from "fs";
import { cutVideo, mergeVideos, generateIntroOutro } from "@/lib/services/cutter";

export async function POST(request: NextRequest) {
  try {
    const {
      videoId,
      clipIds,
      format = "16:9",
      includeSubtitles = false,
      highlights: editedHighlights,
      merge: shouldMerge = false,
      subtitleStyle,
      addIntro = false,
      introText = "视频智剪",
      addOutro = false,
      outroText = "感谢观看",
      backgroundMusic,
      musicVolume = 0.3,
    } = await request.json();

    if (!videoId || !clipIds || !Array.isArray(clipIds) || clipIds.length === 0) {
      return NextResponse.json(
        { error: "videoId and clipIds array required" },
        { status: 400 }
      );
    }

    // Load analysis results to get clip timestamps
    const uploadDir = join(process.cwd(), "uploads", "videos");
    const analysisPath = join(uploadDir, "analysis", `${videoId}.json`);

    let analysisHighlights: { start: number; end: number }[];
    let transcript: { start: number; end: number; text: string }[] = [];
    try {
      const data = await fs.promises.readFile(analysisPath, "utf-8");
      const parsed = JSON.parse(data);
      // The file structure is { videoId, transcript, analysis: AnalysisResult }
      analysisHighlights = parsed.analysis?.highlights || [];
      transcript = parsed.transcript?.segments || [];
    } catch {
      return NextResponse.json(
        { error: "Analysis not found. Please run analyze first." },
        { status: 404 }
      );
    }

    // Use edited highlights if provided, otherwise use analysis highlights
    const highlights = editedHighlights || analysisHighlights;

    // Filter clips by selected IDs
    const clips = clipIds
      .map((id: number) => highlights[id])
      .filter(Boolean)
      .map((h: { start: number; end: number }) => ({
        start: h.start,
        end: h.end,
      }));

    if (clips.length === 0) {
      return NextResponse.json({ error: "No valid clips selected" }, { status: 400 });
    }

    // Find video file extension
    const ext = ["mp4", "mov", "avi", "webm"].find(ext =>
      fs.existsSync(join(uploadDir, `${videoId}.${ext}`))
    ) || "mp4";

    // Execute cutting
    const inputPath = join(uploadDir, `${videoId}.${ext}`);
    const outputDir = join(uploadDir, "exports", videoId);

    console.log("[export] Cutting video:", videoId, "clips:", clips.length, "format:", format);
    console.log("[export] Input path:", inputPath, "exists:", fs.existsSync(inputPath));
    console.log("[export] Output dir:", outputDir);

    const result = await cutVideo({
      videoId,
      inputPath,
      outputDir,
      clips,
      format: format as "9:16" | "16:9" | "1:1",
      includeSubtitles,
      transcript,
      subtitleStyle,
      backgroundMusic,
      musicVolume,
    });

    console.log("[export] Result:", JSON.stringify(result));

    // Merge clips if requested
    if (shouldMerge && result.success && result.clips.length > 0) {
      // Build merge list: intro + clips + outro
      const mergePaths: string[] = [];

      // Get resolution for intro/outro
      const resolutions: Record<string, { width: number; height: number }> = {
        "9:16": { width: 720, height: 1280 },
        "1:1": { width: 1080, height: 1080 },
        "16:9": { width: 1920, height: 1080 },
      };
      const res = resolutions[format] || resolutions["16:9"];

      // Generate intro if requested
      if (addIntro) {
        const introResult = await generateIntroOutro({
          title: introText,
          duration: 3,
          width: res.width,
          height: res.height,
          type: "intro",
        });
        if (introResult.success) {
          mergePaths.push(introResult.path);
        }
      }

      // Add all clips
      mergePaths.push(...result.clips.map(c => c.outputPath));

      // Generate outro if requested
      if (addOutro) {
        const outroResult = await generateIntroOutro({
          title: outroText,
          duration: 3,
          width: res.width,
          height: res.height,
          type: "outro",
        });
        if (outroResult.success) {
          mergePaths.push(outroResult.path);
        }
      }

      const mergedPath = join(outputDir, "merged.mp4");
      console.log("[export] Merging into:", mergedPath, "with parts:", mergePaths.length);

      const mergeResult = await mergeVideos({
        inputPaths: mergePaths,
        outputPath: mergedPath,
      });

      if (mergeResult.success) {
        return NextResponse.json({
          videoId,
          status: "completed",
          mergedPath,
          clips: result.clips,
        });
      } else {
        return NextResponse.json({
          videoId,
          status: "partial",
          clips: result.clips,
          errors: [...(result.errors || []), `Merge failed: ${mergeResult.error}`],
        });
      }
    }

    return NextResponse.json({
      videoId,
      status: result.success ? "completed" : "partial",
      clips: result.clips,
      errors: result.errors,
    });
  } catch (error) {
    console.error("[export] Export error:", error);
    return NextResponse.json(
      { error: "Export failed", details: String(error) },
      { status: 500 }
    );
  }
}
