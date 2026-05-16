import { NextRequest, NextResponse } from "next/server";
import { getWechatConfig } from "@/lib/wechat-config-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, author, digest, coverImageUrl, category, tags } = body;

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: "请输入标题", code: "INVALID_TITLE" }, { status: 400 });
    }
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "请输入正文内容", code: "INVALID_CONTENT" }, { status: 400 });
    }
    if (title.length > 64) {
      return NextResponse.json({ error: "标题不能超过64个字符", code: "INVALID_TITLE" }, { status: 400 });
    }
    if (content.length > 20000) {
      return NextResponse.json({ error: "正文内容不能超过20000个字符", code: "INVALID_CONTENT" }, { status: 400 });
    }
    if (digest && digest.length > 120) {
      return NextResponse.json({ error: "摘要不能超过120个字符", code: "INVALID_DIGEST" }, { status: 400 });
    }

    // Get stored credentials
    const config = await getWechatConfig();
    if (!config) {
      return NextResponse.json({ error: "微信公众号未配置，请在设置页面配置 AppID 和 AppSecret", code: "WECHAT_NOT_CONFIGURED" }, { status: 400 });
    }

    const accessToken = await getWechatAccessToken(config.appId, config.appSecret);
    const draftResult = await createWechatDraft(accessToken, {
      title, author, digest: digest || content.slice(0, 120), content, coverImageUrl, category, tags,
    });

    return NextResponse.json({ success: true, mediaId: draftResult.media_id, msgId: draftResult.msg_id, index: draftResult.index, articleId: draftResult.article_id, url: draftResult.url });
  } catch (error: any) {
    console.error("[wechat/draft] Error:", error);
    return NextResponse.json({ error: error.message || "创建草稿失败", code: "DRAFT_FAILED" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const config = await getWechatConfig();
    if (!config) {
      return NextResponse.json({ error: "微信公众号未配置", code: "WECHAT_NOT_CONFIGURED" }, { status: 400 });
    }
    const accessToken = await getWechatAccessToken(config.appId, config.appSecret);
    const countResponse = await fetch(`https://api.weixin.qq.com/cgi-bin/draft/count?access_token=${accessToken}`);
    const countData = await countResponse.json();
    const listResponse = await fetch(`https://api.weixin.qq.com/cgi-bin/draft/list?access_token=${accessToken}&no_content=0`);
    const listData = await listResponse.json();
    return NextResponse.json({ success: true, total: countData.total_count || 0, items: listData.item || [] });
  } catch (error) {
    console.error("[wechat/draft] GET Error:", error);
    return NextResponse.json({ error: "获取草稿列表失败", code: "FETCH_FAILED" }, { status: 500 });
  }
}

async function getWechatAccessToken(appId: string, appSecret: string): Promise<string> {
  const response = await fetch(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`);
  const data = await response.json();
  if (data.errcode) throw new Error(`微信AccessToken获取失败: ${data.errmsg}`);
  return data.access_token;
}

async function createWechatDraft(accessToken: string, article: { title: string; author?: string; digest?: string; content: string; coverImageUrl?: string; category?: string; tags?: string[] }): Promise<any> {
  const contentHtml = transformToWechatHtml(article.content);
  const payload = {
    articles: [{
      title: article.title,
      author: article.author || "",
      digest: article.digest || article.content.slice(0, 120),
      content: contentHtml,
      content_source_url: "",
      thumb_media_id: article.coverImageUrl || "",
      need_open_comment: 1,
      only_fans_can_comment: 0,
    }],
  };
  const response = await fetch(`https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${accessToken}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (data.errcode) throw new Error(`微信API错误: ${data.errmsg}`);
  return data;
}

function transformToWechatHtml(content: string): string {
  let html = content
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/```(\w+)?\n([\s\S]+?)```/g, "<pre><code>$2</code></pre>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
  if (!html.startsWith("<")) html = `<p>${html}</p>`;
  return html;
}