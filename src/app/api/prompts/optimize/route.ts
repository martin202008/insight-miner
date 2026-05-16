// src/app/api/prompts/optimize/route.ts
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { template } = await request.json();

    if (!template) {
      return NextResponse.json({ error: "模板内容不能为空" }, { status: 400 });
    }

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-7-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `你是一位提示词工程专家。请优化以下提示词，使其更加清晰、有效、能够产生更好的 AI 输出结果。\n\n原提示词：\n${template}\n\n请直接返回优化后的提示词，不要添加任何解释或其他内容。`,
        },
      ],
    });

    const optimized = msg.content[0].type === "text" ? msg.content[0].text : "";

    return NextResponse.json({ optimized });
  } catch (error) {
    console.error("优化失败:", error);
    return NextResponse.json({ error: "优化失败" }, { status: 500 });
  }
}