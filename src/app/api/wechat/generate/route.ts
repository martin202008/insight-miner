import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { wechatTemplates } from "@/lib/plugins/wechatTemplateData";
import { wechatHotspotTopics } from "@/lib/plugins/wechatHotspotData";

const miniMaxClient = new OpenAI({
  apiKey: process.env.MINIMAX_API_KEY,
  baseURL: "https://token-plan-cn.xiaomimimo.com/v1",
});

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
      return NextResponse.json({ error: "请输入主题", code: "INVALID_TOPIC" }, { status: 400 });
    }
    if (topic.length > 200) {
      return NextResponse.json({ error: "主题不能超过200字", code: "INVALID_TOPIC" }, { status: 400 });
    }
    if (!template || !wechatTemplates[template]) {
      return NextResponse.json({ error: "请选择有效的模板", code: "INVALID_TEMPLATE" }, { status: 400 });
    }

    const templateData = wechatTemplates[template];
    const systemPrompt = templateData.systemPrompt;

    let hotspotHint = "";
    if (withHotspot) {
      const randomHotspots = wechatHotspotTopics.sort(() => Math.random() - 0.5).slice(0, 3).join("、");
      hotspotHint = `适当融入以下热点话题元素：${randomHotspots}`;
    }

    const userPrompt = `主题：${topic}\n${hotspotHint ? hotspotHint + "\n" : ""}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    let completion;
    try {
      completion = await miniMaxClient.chat.completions.create(
        {
          model: "MiniMax-M2.7",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 8000,
        },
        { signal: controller.signal }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) {
      return NextResponse.json({ error: "生成失败，请重试", code: "GENERATION_FAILED" }, { status: 500 });
    }

    // Strip thinking blocks BEFORE parsing
    const cleanContent = stripThinkingContent(rawContent);

    // Parse the cleaned content
    const result = parseContentResponse(cleanContent, template, withCoverPrompt);

    return NextResponse.json({
      ...result,
      usage: { tokens: completion.usage?.total_tokens || 0, model: "MiniMax-M2.7" },
    });
  } catch (error: any) {
    console.error("[wechat/generate] Error:", error);
    const message = error?.message || "生成失败";
    return NextResponse.json({ error: message, code: "GENERATION_FAILED" }, { status: 500 });
  }
}

/**
 * Strip all thinking/reasoning content from the raw model output.
 * Handles: <think>...</think>, 【思考】...【/思考】, (reasoning chains), etc.
 */
function stripThinkingContent(raw: string): string {
  let s = raw;

  // Remove XML-style think blocks (case-insensitive, handles newlines inside)
  s = s.replace(/<think[\s\S]*?<\/think>/gi, "");
  s = s.replace(/<思考[\s\S]*?<\/思考>/gi, "");

  // Remove 【思考】...【/思考】 blocks
  s = s.replace(/【思考】[\s\S]*?【\/思考】/g, "");
  s = s.replace(/【思考过程】[\s\S]*?【\/思考过程】/g, "");

  // Remove reasoning blocks wrapped in various brackets
  s = s.replace(/\[推理[\s\S]*?\]\[\/推理\]/g, "");
  s = s.replace(/\[reasoning[\s\S]*?\]\[\/reasoning\]/gi, "");

  // Remove parenthetical reasoning
  s = s.replace(/\(思考中[\s\S]*?\)/g, "");
  s = s.replace(/\(reasoning[\s\S]*?\)/gi, "");

  // Remove constraint/instruction lines that appear as content
  // These are lines that ONLY contain requirement-like text
  const lines = s.split("\n");
  const skipPrefixes = [
    "用户：", "你：", "系统：",
    "请确保", "请注意", "请生成", "请输出", "请直接",
    "要求：", "约束条件", "输出要求", "格式要求", "内容要求",
    "需要包含", "需要满足", "必须包含", "必须满足",
    "首先", "其次", "最后",
    "我会", "我将", "我会先", "我将先",
  ];

  const filtered = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed) return false;
    // Skip lines that are pure constraint/instruction text
    for (const prefix of skipPrefixes) {
      if (trimmed.startsWith(prefix)) return false;
    }
    // Skip lines that look like internal instructions
    if (/^[-*]\s*仅输出/.test(trimmed)) return false;
    if (/^[-*]\s*只返回/.test(trimmed)) return false;
    if (/^[-*]\s*不要输出/.test(trimmed)) return false;
    if (/^[-*]\s*确保/.test(trimmed)) return false;
    if (/^[-*]\s*必须/.test(trimmed)) return false;
    // Skip markdown code blocks used as constraints
    if (trimmed === "```json" || trimmed === "```" || trimmed === "```yaml") return false;
    // Skip lines with only symbols/dashes
    if (/^[-_=*]{3,}$/.test(trimmed)) return false;
    return true;
  });

  return filtered.join("\n").trim();
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
  // Double-pass: strip any remaining thinking content
  let clean = stripThinkingContent(content);

  // Remove markdown bold/heading markers
  clean = clean.replace(/\*\*/g, "").replace(/##/g, "").replace(/^#{1,6}\s+/gm, "");

  // Try JSON extraction first
  const jsonMatch = clean.match(/\{[\s\S]*?"titles"[\s\S]*?"content"[\s\S]*?"tags"[\s\S]*?\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.titles && parsed.content) {
        return {
          titles: Array.isArray(parsed.titles) ? parsed.titles.slice(0, 3) : [parsed.titles],
          content: stripThinkingContent(parsed.content),
          tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 8) : [],
        };
      }
    } catch {
      // JSON parse failed
    }
  }

  const lines = clean.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  const titleLines: string[] = [];
  const tagLines: string[] = [];
  const contentLines: string[] = [];
  const emojiPattern = /[🌟💡✨🔹📌💬👍❤️🉑✅⚡🎯🎉📝⏰💪🌅📖🔥💡]/;

  for (const line of lines) {
    // Skip clearly non-content lines
    if (line.startsWith("```") || line.startsWith("---") || line === "--") continue;
    if (/^(标题要求|正文要求|标签要求|开始输出|直接输出|不要|说明)：/.test(line)) continue;

    // Tag extraction: lines that are mostly hashtags
    const hashCount = (line.match(/#/g) || []).length;
    if (hashCount >= 2) {
      const matches = line.match(/#([^#\s,，。！？、]+)/g);
      if (matches) {
        for (const m of matches) {
          const tag = m.replace(/#/g, "");
          if (tag.length > 0 && tag.length < 20) tagLines.push(tag);
        }
      }
      continue;
    }
    if (line.startsWith("#")) {
      const tag = line.replace(/^#+/, "").replace(/[#,，。！？. ]/g, "").trim();
      if (tag.length > 0 && tag.length < 20) tagLines.push(tag);
      continue;
    }

    // Short lines with emoji at start = likely titles
    if (emojiPattern.test(line) && line.length < 60) {
      const titleText = line.replace(emojiPattern, "").replace(/^[：:、，,]\s*/, "").trim();
      if (titleText.length > 3) titleLines.push(titleText);
      continue;
    }

    // Short lines (8-30 chars) without punctuation = likely titles
    const hasPunctuation = /[。！？，、；:]/.test(line);
    if (!hasPunctuation && line.length >= 5 && line.length <= 30 && !line.includes("的") && !line.includes("是")) {
      titleLines.push(line);
      continue;
    }

    // Lines with common sentence-ending punctuation = content
    if (/[。！？！？]/.test(line) && line.length > 10) {
      contentLines.push(line);
      continue;
    }

    // Multi-sentence content lines
    if (line.length > 20 && (line.includes("。") || line.includes("，") || line.includes("："))) {
      contentLines.push(line);
    }
  }

  const titles = titleLines.slice(0, 3);
  const tags = [...new Set(tagLines)].filter((t) => t.length > 0 && t.length < 20).slice(0, 8);
  const mainContent = contentLines.join("\n");

  let coverPrompt: string | undefined;
  if (withCoverPrompt && mainContent) {
    const summary = mainContent.slice(0, 60).replace(/[^\u4e00-\u9fa5a-zA-Z0-9 ]/g, " ").trim();
    coverPrompt = `WeChat article cover: ${summary}, clean professional design, high quality, 16:9 aspect ratio`;
  }

  return { titles, content: mainContent, tags, coverPrompt };
}