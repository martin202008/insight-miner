import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { videoPath, captionPackage } = await request.json();

    // TODO: 接入微信视频号 API
    // 需要用户配置 WECHAT_APP_ID, WECHAT_APP_SECRET

    return NextResponse.json({
      success: false,
      error: "视频号 API 资质未配置",
      downloadUrl: videoPath.replace("/tmp", "/uploads"),
    });
  } catch (err) {
    console.error("[publish-video]", err);
    return NextResponse.json({ error: "发布失败" }, { status: 500 });
  }
}