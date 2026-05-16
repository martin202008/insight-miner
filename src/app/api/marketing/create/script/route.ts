import { NextRequest, NextResponse } from "next/server";
import { getMiniMaxClient } from "@/lib/openai";
import { getMarketingUser } from "@/lib/marketing-auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getMarketingUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 }
      );
    }

    const { topic, platform, style } = await request.json();

    const prompt = `你是一位专业的短视频内容创作者。请为以下主题创作一个吸引人的短视频脚本：

主题：${topic}
目标平台：${platform}
风格：${style || "轻松有趣"}

请生成包含以下部分的脚本：
1. 开头（前3秒）：如何抓住观众注意力
2. 正文：内容展开（60秒以内）
3. 结尾：引导互动

直接返回脚本内容，不需要额外解释。`;

    const client = getMiniMaxClient();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let response;
    try {
      response = await client.chat.completions.create({
        model: "MiniMax-M2.7",
        messages: [
          { role: "user", content: prompt },
        ],
        reasoning_effort: "low",
      }, { signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }

    const script = response.choices[0].message.content || "";

    return NextResponse.json({
      success: true,
      script: {
        content: script,
        topic,
        platform,
        style,
      },
    });
  } catch (error) {
    console.error("Script generation failed:", error);
    return NextResponse.json(
      { success: false, error: "生成失败" },
      { status: 500 }
    );
  }
}
