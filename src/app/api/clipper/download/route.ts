import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";
import { join } from "path";
import * as fs from "fs";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL required" }, { status: 400 });
    }

    // Generate a video ID for the downloaded file
    const videoId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Create upload directory
    const uploadDir = join(process.cwd(), "uploads", "videos");
    await fs.promises.mkdir(uploadDir, { recursive: true });

    const outputPath = join(uploadDir, `${videoId}.mp4`);

    console.log("[download] Starting download:", url);
    console.log("[download] Output path:", outputPath);

    // Use yt-dlp to download video - use full path
    const ytDlpPath = "/opt/homebrew/bin/yt-dlp";

    // Detect platform and build appropriate command
    const isBilibili = url.includes("bilibili.com") || url.includes("b23.tv");
    let cmd: string[];

    if (isBilibili) {
      // Bilibili requires cookies from browser - try chrome first
      cmd = [
        ytDlpPath,
        "--cookies-from-browser", "chrome",
        "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "--merge-output-format", "mp4",
        "-o", outputPath,
        url
      ];
    } else {
      cmd = [
        ytDlpPath,
        "--no-warnings",
        "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "--merge-output-format", "mp4",
        "-o", outputPath,
        url
      ];
    }

    console.log("[download] Running command:", cmd.join(" "));
    try {
      execSync(cmd.join(" "), { stdio: "pipe", encoding: "utf-8", maxBuffer: 500 * 1024 * 1024 });
    } catch (execError: any) {
      const errorMsg = execError.message || String(execError);
      console.error("[download] yt-dlp exec error:", errorMsg);
      if (isBilibili && errorMsg.includes("412")) {
        throw new Error("B站下载需要登录，请在浏览器中登录B站后重试");
      }
      throw new Error("下载失败: " + errorMsg);
    }

    // Check if file was created
    if (!fs.existsSync(outputPath)) {
      throw new Error("Download failed - no output file");
    }

    const stats = fs.statSync(outputPath);
    console.log("[download] Success! File size:", stats.size);

    return NextResponse.json({
      videoId,
      filename: `${videoId}.mp4`,
      size: stats.size,
    });
  } catch (error) {
    console.error("[download] Error:", error);
    return NextResponse.json(
      { error: "Download failed", details: String(error) },
      { status: 500 }
    );
  }
}
