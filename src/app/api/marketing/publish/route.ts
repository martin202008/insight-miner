import { NextRequest, NextResponse } from "next/server";
import { douyinPlatform, xiaohongshuPlatform, kuaishouPlatform, bilibiliPlatform } from "@/lib/channels";
import type { ChannelConfig, ContentPayload } from "@/lib/channels";

const platforms = {
  douyin: douyinPlatform,
  xiaohongshu: xiaohongshuPlatform,
  kuaishou: kuaishouPlatform,
  bilibili: bilibiliPlatform,
};

export async function POST(request: NextRequest) {
  try {
    const { content, targetPlatforms, configs } = await request.json();

    if (!content || !targetPlatforms || !Array.isArray(targetPlatforms)) {
      return NextResponse.json(
        { success: false, error: "缺少必要参数" },
        { status: 400 }
      );
    }

    const results = [];

    for (const platformId of targetPlatforms) {
      const platform = platforms[platformId as keyof typeof platforms];
      const config = configs?.[platformId] as ChannelConfig | undefined;

      if (platform) {
        if (!config || !config.accessToken) {
          results.push({
            success: false,
            platformId,
            error: `${platform.name} 未配置或未授权`,
          });
        } else {
          const result = await platform.publish(content, config);
          results.push(result);
        }
      } else {
        results.push({
          success: false,
          platformId,
          error: "不支持的平台",
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Publish failed:", error);
    return NextResponse.json(
      { success: false, error: "发布失败" },
      { status: 500 }
    );
  }
}
