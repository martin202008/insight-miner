import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import * as fs from "fs";
import { transcribeVideo } from "@/lib/services/transcriber";
import { analyzeTranscription } from "@/lib/services/clip-analyzer";

export async function POST(request: NextRequest) {
  let videoId: string;
  try {
    const body = await request.json();
    videoId = body.videoId;
    console.log("[analyze] Received videoId:", videoId);

    if (!videoId) {
      return NextResponse.json({ error: "videoId required" }, { status: 400 });
    }

    // Get video file path
    const uploadDir = join(process.cwd(), "uploads", "videos");
    const ext = ["mp4", "mov", "avi", "webm"].find(ext =>
      fs.existsSync(join(uploadDir, `${videoId}.${ext}`))
    ) || "mp4";
    const videoPath = join(uploadDir, `${videoId}.${ext}`);
    console.log("[analyze] Video path:", videoPath, "exists:", fs.existsSync(videoPath));

    // 1. Transcribe video
    console.log("[analyze] Starting transcription...");
    const transcript = await transcribeVideo(videoId, videoPath);
    console.log("[analyze] Transcription done, segments:", transcript.segments.length);

    // 2. Analyze highlights
    console.log("[analyze] Starting analysis...");
    const analysis = await analyzeTranscription(
      videoId,
      transcript.segments,
      transcript.duration
    );
    console.log("[analyze] Analysis done, highlights:", analysis.highlights.length);

    // Save results to storage
    const resultDir = join(uploadDir, "analysis");
    await fs.promises.mkdir(resultDir, { recursive: true });
    const resultPath = join(resultDir, `${videoId}.json`);
    await fs.promises.writeFile(resultPath, JSON.stringify({
      videoId,
      transcript,
      analysis,
    }, null, 2));
    console.log("[analyze] Saved to:", resultPath);

    return NextResponse.json({
      videoId,
      status: "completed",
      highlights: analysis.highlights,
      summary: analysis.summary,
    });
  } catch (error) {
    console.error("[analyze] Analysis error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[analyze] Error stack:", error instanceof Error ? error.stack : "no stack");
    return NextResponse.json(
      { error: "Analysis failed", details: errorMessage },
      { status: 500 }
    );
  }
}
