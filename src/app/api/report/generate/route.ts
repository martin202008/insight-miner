import { NextRequest, NextResponse } from "next/server";
import { parseFile } from "@/lib/services/report-parser";
import { generateReport } from "@/lib/services/report-generator";

export const runtime = "nodejs";

interface GenerateRequest {
  files: {
    name: string;
    type: string;
    content: string; // base64 encoded
  }[];
  template: string;
}

// Store generated reports temporarily (in production, use Redis or DB)
const reportStore = new Map<string, unknown>();

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { files, template } = body;

    // Validate
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "请上传至少一个文件", code: "NO_FILES" },
        { status: 400 }
      );
    }

    if (!template || !["industry", "project", "market"].includes(template)) {
      return NextResponse.json(
        { error: "请选择有效的报告模板", code: "INVALID_TEMPLATE" },
        { status: 400 }
      );
    }

    // Check file sizes (10MB per file, 50MB total)
    const totalSize = files.reduce((sum, f) => sum + f.content.length, 0);
    if (totalSize > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "文件总大小不能超过50MB", code: "FILE_TOO_LARGE" },
        { status: 400 }
      );
    }

    // Parse files
    const parsedFiles = [];
    for (const file of files) {
      try {
        console.log(`[report/generate] Processing file: ${file.name}, base64 content length: ${file.content.length}`);

        // Validate base64 format before processing
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
        if (!base64Regex.test(file.content)) {
          throw new Error(`Invalid base64 format for file ${file.name}`);
        }

        // Decode base64 to binary
        const buffer = Buffer.from(file.content, "base64");
        console.log(`[report/generate] Decoded buffer length: ${buffer.length}`);

        const parsed = await parseFile({
          name: file.name,
          content: buffer, // Pass Buffer directly
        });
        parsedFiles.push(parsed);
      } catch (parseError) {
        console.error(`Failed to parse file ${file.name}:`, parseError);
        return NextResponse.json(
          { error: `无法解析文件 ${file.name}: ${parseError instanceof Error ? parseError.message : String(parseError)}`, code: "PARSE_ERROR" },
          { status: 400 }
        );
      }
    }

    // Generate report
    const report = await generateReport(parsedFiles, template);

    // Store report temporarily
    reportStore.set(report.reportId, report);

    return NextResponse.json(report);
  } catch (error) {
    console.error("[report/generate] Error:", error);
    return NextResponse.json(
      { error: "报告生成失败", code: "GENERATION_FAILED" },
      { status: 500 }
    );
  }
}

// Export the store for use by export route
export { reportStore };
