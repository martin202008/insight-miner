import { getMiniMaxClient } from "@/lib/openai";

interface Plan {
  id: string;
  title: string;
  description: string;
  script: string;
  coverPrompt: string;
  tags: string[];
  hashtag: string;
}

export async function generateMarketingPlans(topic: string): Promise<Plan[]> {
  const client = getMiniMaxClient();
  const systemPrompt = "你是一个专业的数字营销策划师。用户输入一个产品主题或链接，你需要生成3个不同角度的营销视频方案。\n\n每个方案包含：\n1. title: 视频主题标题（15字以内）\n2. description: 视频角度描述（50字以内）\n3. script: 分镜脚本（包含镜头说明和台词，200字以内）\n4. coverPrompt: 封面图生成提示词（英文，描述封面构图，50词以内）\n5. tags: 3-5个标签（数组）\n6. hashtag: 一个主推hashtag\n\n以JSON数组格式返回3个方案，格式如：{\"plans\":[{\"title\":\"...\",\"description\":\"...\",\"script\":\"...\",\"coverPrompt\":\"...\",\"tags\":[\"...\"],\"hashtag\":\"...\"}]}";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  let response;
  try {
    response = await client.chat.completions.create({
      model: "MiniMax-M2.7",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "产品主题: " + topic },
      ],
      reasoning_effort: "low",
    }, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }

  let content = response.choices[0].message.content || "{}";
  content = content.replace(/<think>/gi, "").replace(/<\/think>/gi, "");

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch {
        return [];
      }
    } else {
      return [];
    }
  }

  const plans = parsed.plans || parsed.plan || [parsed.plan1, parsed.plan2, parsed.plan3].filter(Boolean) || [];

  return plans.map((p: any, i: number) => ({
    id: "plan-" + (i + 1),
    title: p.title || "方案" + (i + 1),
    description: p.description || "",
    script: p.script || "",
    coverPrompt: p.coverPrompt || "",
    tags: Array.isArray(p.tags) ? p.tags : [],
    hashtag: p.hashtag || "",
  }));
}
