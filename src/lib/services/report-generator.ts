import { v4 as uuidv4 } from "uuid";
import { reportTemplates, ReportSection } from "@/lib/plugins/reportTemplates";
import { getMiniMaxClient } from "@/lib/openai";

export interface GeneratedReport {
  reportId: string;
  title: string;
  template: string;
  sections: {
    id: string;
    title: string;
    content: string;
    level: number;
  }[];
  metadata: {
    wordCount: number;
    createdAt: string;
    fileCount: number;
  };
}

export async function generateReport(
  parsedFiles: { name: string; content: string }[],
  templateId: string
): Promise<GeneratedReport> {
  const client = getMiniMaxClient();
  const template = reportTemplates[templateId];
  if (!template) {
    throw new Error(`Unknown template: ${templateId}`);
  }

  const context = parsedFiles
    .map((f, i) => `【文档${i + 1}: ${f.name}】\n${f.content.substring(0, 3000)}`)
    .join("\n\n");

  const sectionsPrompt = template.sections
    .map((s, i) => `${i + 1}. ${s.title}: ${s.prompt}`)
    .join("\n");

  const systemPrompt = `你是一位专业的报告撰写专家，擅长撰写深度分析报告。

根据提供的源文件内容撰写一份完整的${template.name}。

报告要求：
- 内容真实，基于提供的文件数据
- 分析深入，避免空话套话
- 结构清晰，层次分明
- 使用Markdown格式

报告章节：
${sectionsPrompt}

重要：
- 严格按上述8个章节撰写，每个章节都需要有实质性内容
- 执行摘要应包含报告最核心的结论
- 各章节内容应互相呼应，形成完整逻辑
- 数据引用要准确，注明来源`;

  const userPrompt = `请根据以下文档内容撰写${template.name}：

${context}

请开始撰写报告，严格按照指定的8个章节结构进行。`;

  const completion = await client.chat.completions.create({
    model: "MiniMax-M2.7",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 8000,
  });

  const reportContent = completion.choices[0]?.message?.content;
  if (!reportContent) {
    throw new Error("Failed to generate report");
  }

  const sections = parseReportSections(reportContent, template.sections);

  const wordCount = sections.reduce(
    (sum, s) => sum + s.content.length,
    0
  );

  return {
    reportId: uuidv4(),
    title: `${template.name} - ${new Date().toLocaleDateString("zh-CN")}`,
    template: templateId,
    sections,
    metadata: {
      wordCount,
      createdAt: new Date().toISOString(),
      fileCount: parsedFiles.length,
    },
  };
}

function parseReportSections(
  content: string,
  templateSections: ReportSection[]
): { id: string; title: string; content: string; level: number }[] {
  const lines = content.split("\n");
  const sections: { id: string; title: string; content: string; level: number }[] = [];
  let currentSection: { id: string; title: string; content: string[]; level: number } | null = null;

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      if (currentSection) {
        sections.push({
          id: currentSection.id,
          title: currentSection.title,
          content: currentSection.content.join("\n").trim(),
          level: currentSection.level,
        });
      }

      const headingText = headingMatch[2].trim();
      const matchedTemplate = templateSections.find(
        (ts) => ts.title.includes(headingText) || headingText.includes(ts.title)
      ) || templateSections[sections.length];

      currentSection = {
        id: matchedTemplate?.id || `section-${sections.length}`,
        title: headingText,
        content: [],
        level: headingMatch[1].length,
      };
    } else if (currentSection) {
      currentSection.content.push(line);
    }
  }

  if (currentSection) {
    sections.push({
      id: currentSection.id,
      title: currentSection.title,
      content: currentSection.content.join("\n").trim(),
      level: currentSection.level,
    });
  }

  if (sections.length === 0) {
    sections.push({
      id: templateSections[0].id,
      title: templateSections[0].title,
      content: content.trim(),
      level: 1,
    });
  }

  return sections;
}
