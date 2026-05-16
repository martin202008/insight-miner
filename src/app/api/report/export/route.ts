import { NextRequest, NextResponse } from "next/server";
import { Document, Packer, Paragraph, HeadingLevel, AlignmentType, BorderStyle } from "docx";

export const runtime = "nodejs";

type ExportFormat = "pdf" | "docx" | "md" | "html";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("reportId");
    const format = searchParams.get("format") as ExportFormat;

    if (!reportId || !format) {
      return NextResponse.json(
        { error: "缺少 reportId 或 format 参数" },
        { status: 400 }
      );
    }

    if (!["pdf", "docx", "md", "html"].includes(format)) {
      return NextResponse.json(
        { error: "不支持的导出格式" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Export requires report data. Use POST /api/report/export" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[report/export] Error:", error);
    return NextResponse.json(
      { error: "导出失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { report, format } = body as { report: unknown; format: ExportFormat };

    if (!report || !format) {
      return NextResponse.json(
        { error: "缺少 report 或 format 参数" },
        { status: 400 }
      );
    }

    const typedReport = report as {
      title: string;
      sections: { title: string; content: string; level: number }[];
    };

    let contentType: string;
    let filename: string;
    let responseBody: string | ArrayBuffer = "";

    switch (format) {
      case "md":
        try {
          responseBody = generateMarkdown(typedReport);
          contentType = "text/markdown; charset=utf-8";
          filename = "report.md";
        } catch (e) {
          console.error("[report/export] Markdown error:", e);
          return NextResponse.json({ error: `Markdown 导出失败: ${e instanceof Error ? e.message : String(e)}` }, { status: 500 });
        }
        break;

      case "html":
        try {
          responseBody = generateHtml(typedReport);
          contentType = "text/html; charset=utf-8";
          filename = "report.html";
        } catch (e) {
          console.error("[report/export] HTML error:", e);
          return NextResponse.json({ error: `HTML 导出失败: ${e instanceof Error ? e.message : String(e)}` }, { status: 500 });
        }
        break;

      case "docx": {
        try {
          const docxBuffer = await generateDocx(typedReport);
          responseBody = docxBuffer.buffer as ArrayBuffer;
          contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
          filename = "report.docx";
        } catch (e) {
          console.error("[report/export] DOCX error:", e);
          return NextResponse.json({ error: `Word 导出失败: ${e instanceof Error ? e.message : String(e)}` }, { status: 500 });
        }
        break;
      }

      case "pdf": {
        try {
          const pdfBuffer = generatePdf(typedReport);
          responseBody = pdfBuffer.buffer as ArrayBuffer;
          contentType = "application/pdf";
          filename = "report.pdf";
        } catch (e) {
          console.error("[report/export] PDF error:", e);
          return NextResponse.json({ error: `PDF 导出失败: ${e instanceof Error ? e.message : String(e)}` }, { status: 500 });
        }
        break;
      }

      default:
        return NextResponse.json({ error: "不支持的格式" }, { status: 400 });
    }

    return new NextResponse(responseBody, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[report/export] Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `导出失败: ${errorMessage}` }, { status: 500 });
  }
}

function generateMarkdown(report: {
  title: string;
  sections: { title: string; content: string; level: number }[];
}): string {
  const lines: string[] = [];

  // Title with decorative separator
  lines.push(`# ${report.title}`);
  lines.push("");
  lines.push("*".repeat(60));
  lines.push("");

  for (const section of report.sections) {
    // Section heading
    if (section.level === 1) {
      lines.push("");
      lines.push(`## ${section.title}`);
      lines.push("");
    } else if (section.level === 2) {
      lines.push("");
      lines.push(`### ${section.title}`);
      lines.push("");
    } else {
      lines.push(`#### ${section.title}`);
      lines.push("");
    }

    // Process content - split by double newlines into paragraphs
    const paragraphs = section.content.split(/\n{2,}/);
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (trimmed) {
        // If paragraph is a list, keep it as list; otherwise format as paragraph
        if (trimmed.includes("\n- ") || trimmed.startsWith("- ")) {
          lines.push(trimmed.replace(/\n/g, "\n"));
        } else {
          lines.push(trimmed);
        }
        lines.push("");
      }
    }
  }

  return lines.join("\n");
}

function generateHtml(report: {
  title: string;
  sections: { title: string; content: string; level: number }[];
}): string {
  const sectionsHtml = report.sections
    .map((s) => {
      const paragraphs = s.content
        .split(/\n{2,}/)
        .filter((p) => p.trim())
        .map((p) => {
          // Check if it's a list
          if (p.includes("\n- ") || p.startsWith("- ")) {
            const items = p.split("\n").filter((i) => i.trim());
            const listItems = items
              .map((item) => `<li>${item.replace(/^-\s*/, "").trim()}</li>`)
              .join("\n");
            return `<ul>${listItems}</ul>`;
          }
          // Check if it's a single line (possible list item)
          if (p.includes("、") || (p.length < 100 && p.includes("。"))) {
            return `<p style="margin: 8px 0; line-height: 1.8;">${p.replace(/\n/g, "<br>")}</p>`;
          }
          return `<p>${p.replace(/\n/g, "<br>")}</p>`;
        })
        .join("\n");

      const headingClass = s.level === 1 ? "section-h1" : "section-h2";
      return `<div class="${headingClass}">
  <div class="section-title">${s.title}</div>
  ${paragraphs}
</div>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${report.title}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", "Segoe UI", Roboto, sans-serif;
      max-width: 210mm;
      margin: 0 auto;
      padding: 50px 60px;
      line-height: 1.8;
      color: #1a1a1a;
      font-size: 11pt;
    }
    .report-title {
      font-size: 24pt;
      font-weight: bold;
      text-align: center;
      color: #1a1a1a;
      padding-bottom: 15px;
      border-bottom: 3px solid #10b981;
      margin-bottom: 30px;
    }
    .section-h1 {
      margin: 30px 0 20px 0;
      padding: 15px 20px;
      background: linear-gradient(90deg, #f0fdf4 0%, transparent 100%);
      border-left: 5px solid #10b981;
      border-radius: 0 8px 8px 0;
    }
    .section-h2 {
      margin: 25px 0 15px 0;
      padding: 10px 15px;
      background: #f9fafb;
      border-left: 4px solid #6b7280;
      border-radius: 0 6px 6px 0;
    }
    .section-title {
      font-size: 14pt;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 12px;
    }
    p {
      margin: 10px 0;
      text-align: justify;
      text-indent: 2em;
    }
    ul {
      margin: 10px 0;
      padding-left: 2em;
    }
    li {
      margin: 5px 0;
      line-height: 1.6;
    }
    @media print {
      body { padding: 30px 40px; }
      .section-h1 { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1 class="report-title">${report.title}</h1>
  ${sectionsHtml}
</body>
</html>`;
}

async function generateDocx(report: {
  title: string;
  sections: { title: string; content: string; level: number }[];
}): Promise<Buffer> {
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      text: report.title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Separator line
  children.push(
    new Paragraph({
      children: [],
      border: {
        bottom: {
          color: "10b981",
          size: 18,
          style: BorderStyle.SINGLE,
        },
      },
      spacing: { after: 400, before: 0 },
    })
  );

  for (const section of report.sections) {
    // Section heading with background
    children.push(
      new Paragraph({
        text: section.title,
        heading: section.level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 },
      })
    );

    // Split content into paragraphs
    const paragraphs = section.content.split(/\n{2,}/);
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (trimmed) {
        // Check if it's a list item
        if (trimmed.includes("\n- ") || trimmed.startsWith("- ")) {
          const items = trimmed.split("\n").filter((i) => i.trim());
          for (const item of items) {
            const cleanItem = item.replace(/^-\s*/, "").trim();
            if (cleanItem) {
              children.push(
                new Paragraph({
                  text: cleanItem,
                  bullet: { level: 0 },
                  spacing: { after: 80 },
                })
              );
            }
          }
        } else {
          children.push(
            new Paragraph({
              text: trimmed.replace(/\n/g, " "),
              spacing: { after: 120 },
              alignment: AlignmentType.JUSTIFIED,
            })
          );
        }
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1080,
              bottom: 1440,
              left: 1080,
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

function generatePdf(report: {
  title: string;
  sections: { title: string; content: string; level: number }[];
}): Uint8Array {
  // Use dynamic import to handle jsPDF
  const { jsPDF } = require("jspdf");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(report.title, contentWidth);
  doc.text(titleLines, pageWidth / 2, y, { align: "center" });
  y += titleLines.length * 8 + 10;

  // Separator line
  doc.setDrawColor(16, 185, 129); // #10b981
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 15;

  // Sections
  for (const section of report.sections) {
    // Section heading
    doc.setFontSize(section.level === 1 ? 14 : 12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(section.level === 1 ? 16 : 50, section.level === 1 ? 185 : 50, section.level === 1 ? 129 : 50);

    const headingLines = doc.splitTextToSize(section.title, contentWidth);
    doc.text(headingLines, margin, y);
    y += headingLines.length * 6 + 5;

    // Section content
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);

    // Process content paragraphs
    const paragraphs = section.content.split(/\n{2,}/);
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;

      // Check if it's a list
      if (trimmed.includes("\n- ") || trimmed.startsWith("- ")) {
        const items = trimmed.split("\n").filter((i) => i.trim());
        for (const item of items) {
          const cleanItem = item.replace(/^-\s*/, "").trim();
          if (cleanItem) {
            if (y > pageHeight - 20) {
              doc.addPage();
              y = margin;
            }
            doc.text("• " + cleanItem, margin + 5, y);
            y += 5;
          }
        }
      } else {
        const contentLines = doc.splitTextToSize(trimmed.replace(/\n/g, " "), contentWidth);
        for (const line of contentLines) {
          if (y > pageHeight - 20) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y);
          y += 5;
        }
      }
      y += 3;
    }
    y += 8;
  }

  return new Uint8Array(doc.output("arraybuffer"));
}