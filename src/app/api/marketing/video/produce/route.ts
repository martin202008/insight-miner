import { NextRequest, NextResponse } from "next/server";
import { renderWithHyperFrames } from "@/lib/services/hyperframes-render";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { plan, materialUrl } = await request.json();

    if (!plan) {
      return NextResponse.json({ error: "请选择营销方案" }, { status: 400 });
    }

    const jobId = randomUUID();

    // 生成 TTS 音频（如果需要）
    let audioPath = "";
    if (plan.script) {
      try {
        const ttsRes = await fetch(`${request.nextUrl.origin}/api/tts/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: plan.script.substring(0, 200), voice: "zh-CN-XiaoxiaoNeural", style: "default" }),
        });
        const ttsData = await ttsRes.json();
        audioPath = ttsData.audioPath || "";
      } catch (e) {
        console.warn("[video/produce] TTS failed, continuing without audio");
      }
    }

    // HyperFrames 渲染
    const outputPath = await renderWithHyperFrames({
      script: plan.script || "数字营销视频",
      videoClips: [],
      audioPath,
      visualStyle: "swiss-pulse",
      outputWidth: 720,
      outputHeight: 1280,
    }, jobId);

    return NextResponse.json({
      jobId,
      videoPath: outputPath,
      captionPackage: {
        title: plan.title,
        script: plan.script,
        coverPrompt: plan.coverPrompt,
        tags: plan.tags,
        hashtag: plan.hashtag,
      },
    });
  } catch (err) {
    console.error("[marketing/video/produce]", err);
    return NextResponse.json(
      { error: "视频制作失败: " + (err instanceof Error ? err.message : "未知错误") },
      { status: 500 }
    );
  }
}
