import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { readFile } from "fs/promises";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const { videoId } = await params;

  try {
    const uploadDir = join(process.cwd(), "uploads", "videos", "analysis");
    const resultPath = join(uploadDir, `${videoId}.json`);

    const data = await readFile(resultPath, "utf-8");
    const { transcript, analysis } = JSON.parse(data);

    return NextResponse.json({
      videoId,
      transcript: transcript.segments,
      highlights: analysis.highlights,
      summary: analysis.summary,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Analysis not found" },
      { status: 404 }
    );
  }
}