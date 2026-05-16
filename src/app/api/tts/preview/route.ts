import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { generateSpeech } from "@/lib/services/tts";

export async function POST(request: NextRequest) {
  try {
    const { text, voice, style } = await request.json();

    if (!text || !voice) {
      return NextResponse.json(
        { error: "text and voice are required" },
        { status: 400 }
      );
    }

    // Limit preview to first 100 characters
    const previewText = text.slice(0, 100);

    const filename = `preview_${Date.now()}.mp3`;
    const outputPath = join(process.cwd(), "uploads", "tts", filename);

    const result = await generateSpeech({
      text: previewText,
      voice,
      outputPath,
      style,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Preview generation failed", details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      audioPath: `/api/tts/file?file=${filename}`,
    });
  } catch (error) {
    console.error("[tts/preview] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
