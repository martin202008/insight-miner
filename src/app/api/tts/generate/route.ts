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

    if (text.length > 10000) {
      return NextResponse.json(
        { error: "Text too long. Maximum 10000 characters." },
        { status: 400 }
      );
    }

    // Generate unique filename
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.mp3`;
    const outputPath = join(process.cwd(), "uploads", "tts", filename);

    const result = await generateSpeech({
      text,
      voice,
      outputPath,
      style,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "TTS generation failed", details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      audioPath: `/api/tts/file?file=${filename}`,
    });
  } catch (error) {
    console.error("[tts/generate] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
