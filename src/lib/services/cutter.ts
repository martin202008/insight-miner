import { execSync } from "child_process";
import { mkdirSync, existsSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";

export interface SubtitleStyle {
  position: "top" | "bottom";
  fontSize: number;
  color: string;  // hex color like "#FFFFFF"
  bgColor: string; // hex color like "#000000" with alpha
}

export interface CutOptions {
  videoId: string;
  inputPath: string;
  outputDir: string;
  clips: { start: number; end: number; title?: string }[];
  format?: "9:16" | "16:9" | "1:1";
  includeSubtitles?: boolean;
  transcript?: { start: number; end: number; text: string }[];
  subtitleStyle?: SubtitleStyle;
  backgroundMusic?: string;  // path to music file
  musicVolume?: number;      // 0.0 - 1.0
}

export interface CutResult {
  success: boolean;
  clips: { start: number; end: number; outputPath: string }[];
  errors?: string[];
}

export async function cutVideo(options: CutOptions): Promise<CutResult> {
  const { inputPath, outputDir, clips, format = "16:9", includeSubtitles, transcript, subtitleStyle, backgroundMusic, musicVolume = 0.3 } = options;
  const results: CutResult["clips"] = [];
  const errors: string[] = [];

  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Calculate output resolution
  const resolution = getResolution(format);

  // Generate ASS subtitle file if needed
  let subtitlePath: string | null = null;
  if (includeSubtitles && transcript && transcript.length > 0) {
    subtitlePath = join(outputDir, "subtitles.ass");
    writeFileSync(subtitlePath, generateASS(transcript, subtitleStyle));
  }

  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i];
    const outputPath = join(outputDir, `clip_${i + 1}_${clip.start}-${clip.end}.mp4`);

    try {
      const duration = clip.end - clip.start;

      // Build ffmpeg command
      let vfFilters = `scale=${resolution.width}:${resolution.height}:force_original_aspect_ratio=decrease,pad=${resolution.width}:${resolution.height}:(ow-iw)/2:(oh-ih)/2`;

      // Add subtitle filter if available
      if (subtitlePath) {
        vfFilters += `,subtitles='${subtitlePath.replace(/'/g, "'\\''")}'`;
      }

      const vfFilterEscaped = vfFilters.replace(/'/g, "'\\''");
      let cmd: string[];

      if (backgroundMusic && existsSync(backgroundMusic)) {
        // Mix original audio with background music
        cmd = [
          "ffmpeg",
          "-ss", clip.start.toString(),
          "-i", inputPath,
          "-i", backgroundMusic,
          "-filter_complex", `[0:a]volume=1.0[orig];[1:a]volume=${musicVolume}[bg];[orig][bg]amix=inputs=2:duration=first[aout]`,
          "-map", "0:v",
          "-vf", `'${vfFilterEscaped}'`,
          "-map", "[aout]",
          "-c:v", "libx264",
          "-preset", "fast",
          "-crf", "23",
          "-c:a", "aac",
          "-b:a", "128k",
          "-shortest",
          "-y",
          outputPath
        ];
      } else {
        cmd = [
          "ffmpeg",
          "-ss", clip.start.toString(),
          "-i", inputPath,
          "-t", duration.toString(),
          "-vf", `'${vfFilterEscaped}'`,
          "-c:v", "libx264",
          "-preset", "fast",
          "-crf", "23",
          "-c:a", "aac",
          "-b:a", "128k",
          "-y",
          outputPath
        ];
      }

      execSync(cmd.join(" "), { stdio: "pipe", encoding: "utf-8" });

      results.push({
        start: clip.start,
        end: clip.end,
        outputPath,
      });
    } catch (error) {
      errors.push(`Failed to cut clip ${i + 1}: ${error}`);
    }
  }

  return {
    success: errors.length === 0,
    clips: results,
    errors: errors.length > 0 ? errors : undefined,
  };
}

function getResolution(format: "9:16" | "16:9" | "1:1") {
  switch (format) {
    case "9:16":
      return { width: 720, height: 1280 };   // TikTok/Reels vertical
    case "1:1":
      return { width: 1080, height: 1080 };  // Square
    case "16:9":
    default:
      return { width: 1920, height: 1080 };   // Landscape
  }
}

function generateSRT(segments: { start: number; end: number; text: string }[]): string {
  return segments.map((seg, i) => {
    const start = formatSRTTime(seg.start);
    const end = formatSRTTime(seg.end);
    const index = i + 1;
    return `${index}\n${start} --> ${end}\n${seg.text}\n`;
  }).join("\n");
}

function generateASS(segments: { start: number; end: number; text: string }[], style?: SubtitleStyle): string {
  const pos = style?.position || "bottom";
  const fontSize = style?.fontSize || 48;
  const color = style?.color || "#FFFFFF";
  const bgColor = style?.bgColor || "#000000";

  // Convert hex color to ASS format (ABGR)
  const assColor = hexToASSColor(color);
  const assBgColor = hexToASSColor(bgColor);

  // Margin: 10% from bottom or top
  const margin = pos === "bottom" ? 60 : 600;

  const header = `[Script Info]
Title: Generated subtitles
ScriptType: v4.00+
WrapStyle: 0
PlayResX: 384
PlayResY: 640
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,${fontSize},${assColor},${assBgColor},0,0,0,0,100,100,0,0,1,2,2,${pos === "bottom" ? 2 : 8},10,10,${margin},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const dialogues = segments.map((seg) => {
    const start = formatASSTime(seg.start);
    const end = formatASSTime(seg.end);
    const text = seg.text.replace(/\n/g, "\\N");
    return `Dialogue: 0,${start},${end},Default,,0,0,0,,${text}`;
  }).join("\n");

  return header + dialogues;
}

function hexToASSColor(hex: string): string {
  // Convert #RRGGBB to &HBBGGRR& (ASS format)
  const clean = hex.replace("#", "");
  const r = clean.slice(0, 2);
  const g = clean.slice(2, 4);
  const b = clean.slice(4, 6);
  return `&H${b}${g}${r}&`;
}

function formatASSTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.round((seconds % 1) * 100);
  return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${cs.toString().padStart(2, "0")}`;
}

function formatSRTTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`;
}

export interface IntroOutroOptions {
  title: string;
  duration: number;  // seconds
  width: number;
  height: number;
  type: "intro" | "outro";
  fontSize?: number;
  textColor?: string;
  bgColor?: string;
}

export async function generateIntroOutro(options: IntroOutroOptions): Promise<{ success: boolean; path: string; error?: string }> {
  const {
    title,
    duration,
    width,
    height,
    type,
    fontSize = 48,
    textColor = "white",
    bgColor = "black",
  } = options;

  const outputPath = join(process.cwd(), "uploads", "videos", "templates", `${type}_${Date.now()}.mp4`);

  try {
    // Ensure directory exists
    const dir = join(process.cwd(), "uploads", "videos", "templates");
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // Generate video with text using FFmpeg
    const escapedTitle = title.replace(/'/g, "'\\''").replace(/:/g, "\\:").replace(/\n/g, "\\n");

    const cmd = [
      "ffmpeg",
      "-f", "lavfi",
      "-i", `color=c=${bgColor.replace("#", "0x")}:s=${width}x${height}:d=${duration},format=yuv420p`,
      "-vf", `drawtext=text='${escapedTitle}':fontsize=${fontSize}:fontcolor=${textColor.replace("#", "0x")}:x=(w-text_w)/2:y=(h-text_h)/2`,
      "-c:v", "libx264",
      "-preset", "ultrafast",
      "-y",
      outputPath
    ];

    execSync(cmd.join(" "), { stdio: "pipe", encoding: "utf-8" });

    return { success: true, path: outputPath };
  } catch (error) {
    return { success: false, path: "", error: String(error) };
  }
}

export interface MergeOptions {
  inputPaths: string[];
  outputPath: string;
}

export async function mergeVideos(options: MergeOptions): Promise<{ success: boolean; outputPath: string; error?: string }> {
  const { inputPaths, outputPath } = options;

  if (inputPaths.length === 0) {
    return { success: false, outputPath: "", error: "No input files" };
  }

  if (inputPaths.length === 1) {
    // Only one file, just copy it
    try {
      execSync(`cp "${inputPaths[0]}" "${outputPath}"`, { stdio: "pipe" });
      return { success: true, outputPath };
    } catch {
      return { success: false, outputPath: "", error: "Failed to copy single file" };
    }
  }

  try {
    // Create concat file list
    const concatListPath = outputPath + ".txt";
    const concatContent = inputPaths.map(p => `file '${p}'`).join("\n");
    writeFileSync(concatListPath, concatContent);

    // Use ffmpeg concat demuxer to merge
    const cmd = [
      "ffmpeg",
      "-f", "concat",
      "-safe", "0",
      "-i", concatListPath,
      "-c", "copy",
      "-y",
      outputPath
    ];

    execSync(cmd.join(" "), { stdio: "pipe", encoding: "utf-8" });

    // Clean up concat file
    try { require("fs").unlinkSync(concatListPath); } catch { /* ignore */ }

    return { success: true, outputPath };
  } catch (error) {
    return { success: false, outputPath: "", error: String(error) };
  }
}