import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { description, style } = await request.json();

    // TODO: 调用 AI 图片生成服务
    // 目前返回占位符
    return NextResponse.json({
      success: true,
      imageUrl: "/placeholder.jpg",
      description,
      style,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "生成失败" },
      { status: 500 }
    );
  }
}
