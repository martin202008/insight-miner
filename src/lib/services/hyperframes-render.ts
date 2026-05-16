import { spawn } from "child_process";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

interface CompositionConfig {
  script: string;
  videoClips: string[];
  audioPath?: string;
  visualStyle?: string;
  outputWidth?: number;
  outputHeight?: number;
}

export async function renderWithHyperFrames(
  config: CompositionConfig,
  jobId: string
): Promise<string> {
  const workDir = join("/tmp", `hyperframes-${jobId}`);
  await mkdir(workDir, { recursive: true });

  // 生成 HyperFrames HTML 组合文件
  const htmlContent = generateCompositionHTML(config);
  const htmlPath = join(workDir, "composition.html");
  await writeFile(htmlPath, htmlContent, "utf-8");

  // 渲染视频
  const outputPath = join(workDir, "output.mp4");
  await runCommand(
    "hyperframes",
    [
      "render",
      "--input", htmlPath,
      "--output", outputPath,
      "--width", String(config.outputWidth || 720),
      "--height", String(config.outputHeight || 1280),
      "--fps", "30",
      "--no-audio",
    ],
    workDir
  );

  return outputPath;
}

function generateCompositionHTML(config: CompositionConfig): string {
  const script = config.script.replace(/"/g, '&quot;').replace(/\n/g, '<br/>');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      width: ${config.outputWidth || 720}px;
      height: ${config.outputHeight || 1280}px;
      overflow: hidden;
    }
    .container {
      width: 100%;
      height: 100%;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      box-sizing: border-box;
    }
    .title {
      font-size: 56px;
      font-weight: bold;
      color: white;
      text-align: center;
      margin-bottom: 40px;
      text-shadow: 2px 2px 20px rgba(0,0,0,0.5);
      animation: fadeInUp 1s ease-out;
    }
    .script {
      font-size: 28px;
      color: rgba(255,255,255,0.9);
      text-align: center;
      line-height: 1.6;
      text-shadow: 1px 1px 8px rgba(0,0,0,0.5);
      max-width: 600px;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="title">${script.split('<br/>')[0]}</div>
    <div class="script">${script}</div>
  </div>
</body>
</html>`;
}

function runCommand(cmd: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { cwd, stdio: "pipe" });
    let stdout = "";
    let stderr = "";

    proc.stdout?.on("data", (data) => { stdout += data.toString(); });
    proc.stderr?.on("data", (data) => { stderr += data.toString(); });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed: ${cmd} ${args.join(" ")}\n${stderr}`));
      }
    });

    proc.on("error", reject);
  });
}
