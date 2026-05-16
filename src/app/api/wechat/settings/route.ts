import { NextRequest, NextResponse } from "next/server";
import { getWechatConfig, saveWechatConfig } from "@/lib/wechat-config-store";

export async function GET(request: NextRequest) {
  try {
    const config = await getWechatConfig();
    if (!config) {
      return NextResponse.json({ configured: false, appId: null, account: null });
    }
    return NextResponse.json({
      configured: true,
      appId: `${config.appId.slice(0, 4)}***${config.appId.slice(-4)}`,
      account: config.account,
    });
  } catch (error) {
    console.error("[wechat/settings] Error:", error);
    return NextResponse.json(
      { error: "获取设置失败", code: "FETCH_FAILED" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { appId, appSecret, account } = body;

    if (!appId || appId.trim().length === 0) {
      return NextResponse.json(
        { error: "请输入AppID", code: "INVALID_APP_ID" },
        { status: 400 }
      );
    }
    if (!appSecret || appSecret.trim().length === 0) {
      return NextResponse.json(
        { error: "请输入AppSecret", code: "INVALID_APP_SECRET" },
        { status: 400 }
      );
    }

    // Verify credentials by getting access token
    const verifyResponse = await fetch(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`
    );
    const verifyData = await verifyResponse.json();

    if (verifyData.errcode) {
      return NextResponse.json(
        { error: `微信公众号验证失败: ${verifyData.errmsg}`, code: "VERIFY_FAILED" },
        { status: 400 }
      );
    }

    // Save to encrypted file store
    await saveWechatConfig({
      appId,
      appSecret,
      account: account || "",
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "配置已保存",
      verified: true,
    });
  } catch (error) {
    console.error("[wechat/settings] Error:", error);
    return NextResponse.json(
      { error: "保存设置失败", code: "SAVE_FAILED" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const dataDir = path.join(process.cwd(), ".data");
    const configFile = path.join(dataDir, "wechat-config.json");
    try {
      await fs.unlink(configFile);
    } catch {}
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}