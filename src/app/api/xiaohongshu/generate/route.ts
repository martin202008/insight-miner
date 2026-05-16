import { NextRequest, NextResponse } from "next/server";
import { xhsTemplates } from "@/lib/plugins/templateData";
import { hotspotTopics } from "@/lib/plugins/hotspotData";
import { getMiniMaxClient } from "@/lib/openai";

interface GenerateRequest {
  topic: string;
  template: string;
  withHotspot?: boolean;
  withCoverPrompt?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { topic, template, withHotspot = false, withCoverPrompt = false } = body;

    if (!topic || topic.trim().length === 0) {
      return NextResponse.json(
        { error: "请输入主题", code: "INVALID_TOPIC" },
        { status: 400 }
      );
    }
    if (topic.length > 200) {
      return NextResponse.json(
        { error: "主题不能超过200字", code: "INVALID_TOPIC" },
        { status: 400 }
      );
    }
    if (!template || !xhsTemplates[template]) {
      return NextResponse.json(
        { error: "请选择有效的模板", code: "INVALID_TEMPLATE" },
        { status: 400 }
      );
    }

    const templateData = xhsTemplates[template];
    const systemPrompt = templateData.systemPrompt;

    let hotspotHint = "";
    if (withHotspot) {
      const randomHotspots = hotspotTopics
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .join("、");
      hotspotHint = `适当融入以下热点话题元素：${randomHotspots}`;
    }

    const userPrompt = `主题：${topic}
${hotspotHint ? hotspotHint + "\n" : ""}`;

    const client = getMiniMaxClient();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let completion;
    try {
      completion = await client.chat.completions.create(
        {
          model: "MiniMax-M2.7",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 4000,
          reasoning_effort: "low",
        },
        { signal: controller.signal }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "生成失败，请重试", code: "GENERATION_FAILED" },
        { status: 500 }
      );
    }

    const result = parseContentResponse(content, template, withCoverPrompt);

    return NextResponse.json({
      ...result,
      usage: {
        tokens: completion.usage?.total_tokens || 0,
        model: "MiniMax-M2.7",
      },
    });
  } catch (error) {
    console.error("[xiaohongshu/generate] Error:", error);
    return NextResponse.json(
      { error: "生成失败", code: "GENERATION_FAILED" },
      { status: 500 }
    );
  }
}

function parseContentResponse(
  content: string,
  template: string,
  withCoverPrompt: boolean
): {
  titles: string[];
  content: string;
  tags: string[];
  coverPrompt?: string;
} {
  let cleanContent = content
    .replace(/\*\*/g, "")
    .replace(/##/g, "");

  const jsonMatch = cleanContent.match(/\{[\s\S]*?"titles"[\s\S]*?\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.titles && parsed.content && parsed.tags) {
        return {
          titles: Array.isArray(parsed.titles) ? parsed.titles.slice(0, 3) : [parsed.titles],
          content: parsed.content,
          tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 8) : [parsed.tags],
        };
      }
    } catch {}
  }

  const lines = cleanContent.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

  let titles: string[] = [];
  let mainContent = "";
  let tags: string[] = [];

  const potentialTitleLines: string[] = [];
  const tagLines: string[] = [];
  const contentLines: string[] = [];

  let skipCount = 0;
  for (const line of lines) {
    if (/^(用户|需要|主题|特点|结构|选项|格式|说明|思考)/.test(line)) { skipCount++; continue; }
    if (/需要我/.test(line)) { skipCount++; continue; }
    if (/^[0-9]+[.、]?[一-龥]*要求/.test(line)) { skipCount++; continue; }
    if (line.includes("关于") && line.includes("的主题")) { skipCount++; continue; }
    if (line.startsWith("```")) { skipCount++; continue; }
    if (/^[-*]\s*\d*.*要求/.test(line)) { skipCount++; continue; }
    if (/^[-*]\s*[一-龥]*$/.test(line)) { skipCount++; continue; }
    if (line.includes("输出内容") || line.includes("只输出")) { skipCount++; continue; }
    if (skipCount > 0 && (/[🌟💡✨🔹📌💬👍❤️🉑✅⚡🎯🎉📝✅⏰💪🌅]/.test(line) || /[一-龥]{5,}/.test(line))) {
      break;
    }
    if (skipCount > 0) skipCount++;
    if (skipCount > 10) break;
  }

  const processedLines = skipCount > 0 ? lines.slice(skipCount - 1) : lines;

  for (const line of processedLines) {
    if (line.startsWith("#") || /^#\w/.test(line)) {
      tagLines.push(line.replace(/^#+/, ""));
      continue;
    }
    const hashCount = (line.match(/#/g) || []).length;
    if (hashCount >= 2) {
      const matches = line.match(/#([^#\s,，。！、]+)/g);
      if (matches) {
        for (const match of matches) {
          const tag = match.replace(/#/g, "");
          if (tag.length > 0 && tag.length < 15) {
            tagLines.push(tag);
          }
        }
      }
      continue;
    }
    if (line.startsWith("标签")) {
      const matches = line.match(/#([^#\s,，。！、]+)/g);
      if (matches) {
        for (const match of matches) {
          const tag = match.replace(/#/g, "");
          if (tag.length > 0 && tag.length < 15) {
            tagLines.push(tag);
          }
        }
      }
      continue;
    }

    if (/^(标题要求?|正文要求?|标签要求?|开始输出|直接输出|不要|思考|说明|格式)/.test(line)) continue;
    if (line.includes("<think>")) continue;
    if (line.startsWith("---") || line === "---") continue;

    const hasEmoji = /[🌟💡✨🔹📌💬👍❤️🉑✅⚡🎯🎉📝✅⏰💪🌅]/.test(line);
    if (hasEmoji && line.length < 50) {
      potentialTitleLines.push(line);
      continue;
    }

    const isInstructionLine = /要求|格式|输出|说明|解释|思考|标签.*标签/.test(line);
    if (!isInstructionLine && line.length >= 10 && line.length <= 35 && !line.includes("。") && !line.includes("，") && !line.includes("！") && !line.includes("？")) {
      potentialTitleLines.push(line);
      continue;
    }

    contentLines.push(line);
  }

  titles = potentialTitleLines.slice(0, 3);

  tags = tagLines
    .map((t) => t.replace(/[#,，。！？. ]/g, "").trim())
    .filter((t) => t.length > 0 && t.length < 15)
    .slice(0, 8);

  mainContent = contentLines.join("\n");

  let coverPrompt: string | undefined;
  if (withCoverPrompt && mainContent) {
    coverPrompt = generateCoverPrompt(mainContent, template);
  }

  return { titles, content: mainContent, tags, coverPrompt };
}

function generateCoverPrompt(content: string, template: string): string {
  const templateNames: Record<string, string> = {
    ganhuo: "productivity tips, clean desk setup",
    plog: "daily life, cozy atmosphere, lifestyle",
    haowu: "product showcase, clean aesthetic",
    zhishi: "educational, professional, knowledge",
    qinggan: "emotional, warm, relatable",
  };
  const style = templateNames[template] || "modern, clean";
  const summary = content.slice(0, 50).replace(/[^一-龥a-zA-Z]/g, " ");
  return `Xiaohongshu cover image: ${style}, ${summary}, minimalist design, soft lighting, high quality photograph, 3:4 aspect ratio`;
}
