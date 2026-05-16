import { execSync } from "child_process";
import { join } from "path";
import { unlinkSync, existsSync } from "fs";

export interface TranscriptSegment {
  start: number;    // seconds
  end: number;
  text: string;
}

export interface TranscriptResult {
  videoId: string;
  duration: number;
  segments: TranscriptSegment[];
  fullText: string;
}

export async function transcribeVideo(
  videoId: string,
  videoPath: string
): Promise<TranscriptResult> {
  // Extract audio from video using ffmpeg
  const audioPath = await extractAudio(videoId, videoPath);

  try {
    // Call faster-whisper via Python script
    const scriptPath = join(process.cwd(), "scripts", "transcribe.py");
    const venvPython = "/Users/chenstar/Library/ApplicationSupport/insight-miner/venv/bin/python3";

    const cmd = `${venvPython} "${scriptPath}" "${audioPath}" small`;
    const output = execSync(cmd, { encoding: "utf-8", maxBuffer: 50 * 1024 * 1024 });

    const result = JSON.parse(output);

    if (result.error) {
      throw new Error(result.error);
    }

    return {
      videoId,
      duration: result.duration || 0,
      segments: result.segments || [],
      fullText: result.fullText || "",
    };
  } finally {
    // Clean up temp audio file
    try {
      if (existsSync(audioPath)) {
        unlinkSync(audioPath);
      }
    } catch {
      // ignore cleanup errors
    }
  }
}

async function extractAudio(videoId: string, videoPath: string): Promise<string> {
  const audioPath = join(process.cwd(), "uploads", "videos", `${videoId}_audio.wav`);

  // Ensure ffmpeg is available (user should have it installed)
  // Command: ffmpeg -i input.mp4 -vn -acodec pcm_s16le -ar 16000 -ac 1 output.wav
  execSync(`ffmpeg -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${audioPath}" -y`, {
    stdio: "pipe",
  });

  return audioPath;
}
