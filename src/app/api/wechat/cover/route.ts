import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import OpenAI from "openai";

const miniMaxClient = new OpenAI({
  apiKey: process.env.MINIMAX_API_KEY,
  baseURL: "https://token-plan-cn.xiaomimimo.com/v1",
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, template, style } = body;

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: "请输入标题", code: "INVALID_TITLE" }, { status: 400 });
    }

    const styleMap: Record<string, string> = {
      modern: "modern minimalist design, clean layout, soft gradient, professional photography, WeChat article cover style",
      professional: "corporate business style, clean and professional, trustworthy atmosphere, blue and white color scheme",
      creative: "artistic and creative, vibrant colors, unique composition, eye-catching design",
      tech: "futuristic technology style, dark blue and purple gradient, glowing elements, cyber aesthetic",
      minimal: "ultra minimal white design, simple and elegant, clean typography, sophisticated",
    };

    const selectedStyle = styleMap[style || "modern"] || styleMap.modern;
    const summary = content ? content.slice(0, 80).replace(/[^\u4e00-\u9fa5a-zA-Z0-9 ]/g, " ").trim() : title;
    const typeMap: Record<string, string> = {
      ganhuo: "knowledge sharing article",
      news: "news and information article",
      case: "case study feature",
      interview: "interview and profile piece",
      opinion: "opinion and commentary editorial",
    };
    const articleType = template ? typeMap[template] || "WeChat article" : "WeChat article";

    const prompt = `WeChat official account article cover, ${articleType}: "${summary}", ${selectedStyle}, 16:9 aspect ratio, high quality, professional Chinese content style`;

    // Generate 3 images using MiniMax image API via OpenAI-compatible endpoint
    const urls: string[] = [];
    const staticDir = join(process.cwd(), "public", "wechat-covers");
    await mkdir(staticDir, { recursive: true });

    for (let i = 0; i < 3; i++) {
      try {
        const imageFileName = `${randomUUID()}.png`;
        const imagePath = join(staticDir, imageFileName);

        const response = await miniMaxClient.images.generate({
          model: "MiniMax-Image-01",
          prompt: prompt,
          size: "1024x1024",
          n: 1,
        });

        const imageData = response.data; const imageUrl = imageData && imageData[0]?.url;
        if (imageUrl) {
          // Download the image
          const imgResponse = await fetch(imageUrl);
          const arrayBuffer = await imgResponse.arrayBuffer();
          await writeFile(imagePath, Buffer.from(arrayBuffer));
          urls.push(`/wechat-covers/${imageFileName}`);
        }
      } catch (imgErr) {
        console.error(`Image gen ${i} failed:`, imgErr);
      }
    }

    if (urls.length === 0) {
      return NextResponse.json({
        success: true,
        prompt,
        images: [],
        message: "封面图生成服务暂时不可用，已生成提示词，请复制后使用其他工具生成",
      });
    }

    return NextResponse.json({ success: true, prompt, images: urls });
  } catch (error: any) {
    console.error("[wechat/cover] Error:", error);
    return NextResponse.json({ error: "生成封面失败: " + (error.message || "未知错误"), code: "GENERATION_FAILED" }, { status: 500 });
  }
}