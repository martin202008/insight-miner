// Simple stub - add to existing utils or create src/utils/index.ts
export function parseTopicString(text: string): { topics: string[] } {
  const topicRegex = /#[\w一-龥]+/g
  const matches = text.match(topicRegex) || []
  return { topics: matches.map(t => t.replace(/^#/, '')) }
}