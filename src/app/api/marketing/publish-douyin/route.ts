import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { videoPath, captionPackage } = await request.json();

    // TODO: 接入抖音开放平台 API
    // 需要用户配置 DOUYIN_APP_ID, DOUYIN_APP_SECRET, DOUYIN_ACCESS_TOKEN

    // 暂时返回下载链接，让用户手动发布
    return NextResponse.json({
      success: false,
      error: "抖音 API 资质未配置",
      downloadUrl: videoPath.replace("/tmp", "/uploads"),
    });
  } catch (err) {
    console.error("[publish-douyin]", err);
    return NextResponse.json({ error: "发布失败" }, { status: 500 });
  }
}