import { getMiniMaxClient } from "@/lib/openai";

export interface Highlight {
  start: number;
  end: number;
  score: number;
  reason: string;
  title?: string;
}

export interface AnalysisResult {
  videoId: string;
  highlights: Highlight[];
  summary: string;
}

export async function analyzeTranscription(
  videoId: string,
  transcript: { start: number; end: number; text: string }[],
  duration: number
): Promise<AnalysisResult> {
  const client = getMiniMaxClient();
  const transcriptText = transcript
    .map(t => `[${t.start.toFixed(1)}s] ${t.text}`)
    .join("\n");

  const prompt = `你是一个专业的视频剪辑师，擅长从长视频中识别高光时刻。

分析以下转录文本，识别出最精彩的片段：

${transcriptText}

视频总时长: ${duration.toFixed(1)}秒

请识别 3-5 个高光片段，每个片段需要：
- start: 开始时间（秒）
- end: 结束时间（秒）
- score: 置信度 0-1
- reason: 为什么这是高光（如：笑声、掌声、精彩论点、金句）

以 JSON 格式返回：
{
  "highlights": [{ "start": 12.5, "end": 25.3, "score": 0.92, "reason": "..." }],
  "summary": "视频内容摘要一句话"
}`;

  const response = await client.chat.completions.create({
    model: "MiniMax-M2.7",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1024,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response content");
  }

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse analysis response");
  }

  const result = JSON.parse(jsonMatch[0]) as AnalysisResult;
  return { ...result, videoId };
}
