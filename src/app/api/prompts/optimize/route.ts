import { NextRequest, NextResponse } from "next/server";
import { getMiniMaxClient } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { template } = await request.json();

    if (!template) {
      return NextResponse.json({ error: "模板内容不能为空" }, { status: 400 });
    }

    const client = getMiniMaxClient();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let msg;
    try {
      msg = await client.chat.completions.create({
        model: "MiniMax-M2.7",
        messages: [
          {
            role: "user",
            content: `你是一位提示词工程专家。请优化以下提示词，使其更加清晰、有效、能够产生更好的 AI 输出结果。

原提示词：
${template}

请直接返回优化后的提示词，不要添加任何解释或其他内容。`,
          },
        ],
        max_tokens: 1024,
      }, { signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }

    const optimized = msg.choices[0]?.message?.content || "";

    return NextResponse.json({ optimized });
  } catch (error) {
    console.error("优化失败:", error);
    return NextResponse.json({ error: "优化失败" }, { status: 500 });
  }
}
