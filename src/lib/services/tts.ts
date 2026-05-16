import { spawn } from "child_process";
import { join } from "path";
import * as fs from "fs";

export interface TTSOptions {
  text: string;
  voice: string;
  outputPath: string;
  style?: string;
}

export interface TTSResult {
  success: boolean;
  outputPath?: string;
  error?: string;
}

// Use system python3 on cloud, or local venv python on Mac
const PYTHON_BIN = process.platform === "darwin"
  ? "/Users/chenstar/Library/ApplicationSupport/insight-miner/venv/bin/python3"
  : "python3";
const SCRIPT_PATH = join(process.cwd(), "scripts", "tts.py");

export async function generateSpeech(options: TTSOptions): Promise<TTSResult> {
  const { text, voice, outputPath, style } = options;

  // Ensure output directory exists
  const outputDir = join(process.cwd(), "uploads", "tts");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  return new Promise((resolve) => {
    const args = [SCRIPT_PATH, voice, outputPath];
    if (style) {
      args.push(style);
    }

    const process_ = spawn(PYTHON_BIN, args);

    let output = "";
    let errorOutput = "";

    process_.stdout.on("data", (data) => {
      output += data.toString();
    });

    process_.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    process_.on("close", (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(output));
        } catch {
          resolve({ success: false, error: "Failed to parse output" });
        }
      } else {
        console.error("[tts] Error:", errorOutput);
        resolve({ success: false, error: errorOutput || "Process failed" });
      }
    });

    // Write text to stdin
    process_.stdin.write(text);
    process_.stdin.end();
  });
}
