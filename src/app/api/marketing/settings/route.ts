import { NextRequest, NextResponse } from "next/server";

// 模拟数据存储，实际应使用数据库
let channelConfigs: Record<string, any> = {};

export async function GET() {
  return NextResponse.json({
    success: true,
    channels: channelConfigs,
  });
}

export async function PUT(request: NextRequest) {
  try {
    const settings = await request.json();
    channelConfigs = { ...channelConfigs, ...settings };
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "保存失败" },
      { status: 500 }
    );
  }
}
