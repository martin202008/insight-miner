import { getMiniMaxClient } from "@/lib/openai";

export interface Insight {
  title: string;
  content: string;
  confidence: "high" | "medium" | "low";
  sourceRef: string;
  sourceUrl?: string;
}

export interface AnalyzeResult {
  cards: Insight[];
}

const EXTRACT_PROMPT = `You are an insight extraction AI. Given the following content from a source, extract the top 3-5 key insights. Each insight should be:
- A clear, specific observation or takeaway
- 2-4 sentences of substantive analysis
- Actionable or noteworthy for someone researching this topic

Respond in JSON format:
{
  "cards": [
    {
      "title": "Insight title (short, specific)",
      "content": "2-4 sentence analysis explaining this insight",
      "confidence": "high",
      "sourceRef": "Source title or URL"
    }
  ]
}

Content:
CONTENT_PLACEHOLDER
---

Respond only with valid JSON.`;

const CROSS_ANALYZE_PROMPT = `You are an insight extraction AI. Given content from multiple sources on the same topic, extract the top 5-8 key insights that synthesize across these sources. Look for:
- Common themes or patterns across sources
- Contrasting viewpoints or disagreements
- Unique insights from individual sources
- Key statistics or data points

Respond in JSON format:
{
  "cards": [
    {
      "title": "Cross-source insight title",
      "content": "3-5 sentence synthesis explaining this insight, referencing multiple sources",
      "confidence": "high",
      "sourceRef": "Primary source name"
    }
  ]
}

Sources:
SOURCES_PLACEHOLDER

Respond only with valid JSON.`;

function buildPrompt(sources: Array<{ title?: string; content: string; url?: string }>): string {
  if (sources.length === 1) {
    return EXTRACT_PROMPT.replace("CONTENT_PLACEHOLDER", sources[0].content);
  }

  const sourcesText = sources.map((s, i) =>
    `[Source ${i + 1}: ${s.title || s.url || "Unknown"}]\n${s.content}`).join("\n\n");
  return CROSS_ANALYZE_PROMPT.replace("SOURCES_PLACEHOLDER", sourcesText);
}

export async function extractInsights(
  sources: Array<{ title?: string; content: string; url?: string }>
): Promise<AnalyzeResult> {
  const client = getMiniMaxClient();
  const prompt = buildPrompt(sources);

  const response = await client.chat.completions.create({
    model: "MiniMax-M2.7",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 2048,
  });

  const text = response.choices[0]?.message?.content || "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response as JSON");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  const cards = (parsed.cards || []).map((card: Record<string, unknown>, i: number) => ({
    id: `card-${Date.now()}-${i}`,
    title: String(card.title || "Untitled Insight"),
    content: String(card.content || ""),
    confidence: ["high", "medium", "low"].includes(String(card.confidence))
      ? card.confidence as "high" | "medium" | "low"
      : "medium" as const,
    sourceRef: String(card.sourceRef || sources[0]?.title || "Source"),
    sourceUrl: sources[0]?.url,
  }));

  return { cards };
}
