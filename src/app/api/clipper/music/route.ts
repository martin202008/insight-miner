import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import * as fs from "fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("music") as File;

    if (!file) {
      return NextResponse.json({ error: "No music file provided" }, { status: 400 });
    }

    // Validate file type
    const validTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/m4a", "audio/x-m4a"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid audio format. Supported: MP3, WAV, OGG, M4A" }, { status: 400 });
    }

    // Generate music ID
    const musicId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const ext = file.name.split(".").pop() || "mp3";

    // Save to music directory
    const musicDir = join(process.cwd(), "uploads", "music");
    await fs.promises.mkdir(musicDir, { recursive: true });

    const musicPath = join(musicDir, `${musicId}.${ext}`);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.promises.writeFile(musicPath, buffer);

    return NextResponse.json({
      musicId,
      filename: `${musicId}.${ext}`,
      path: musicPath,
      size: buffer.length,
    });
  } catch (error) {
    console.error("[music] Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed", details: String(error) },
      { status: 500 }
    );
  }
}
