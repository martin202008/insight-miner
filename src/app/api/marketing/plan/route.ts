import { NextRequest, NextResponse } from "next/server";
import { generateMarketingPlans } from "@/lib/services/marketing-plan";

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: "请提供主题" }, { status: 400 });
    }

    const plans = await generateMarketingPlans(topic.trim());

    return NextResponse.json({ plans });
  } catch (err) {
    console.error("[marketing/plan]", err);
    return NextResponse.json(
      { error: "生成方案失败: " + (err instanceof Error ? err.message : "未知错误") },
      { status: 500 }
    );
  }
}