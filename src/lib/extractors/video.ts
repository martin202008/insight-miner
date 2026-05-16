export interface VideoExtractResult {
  title: string;
  description?: string;
  thumbnail?: string;
  author?: string;
}

const OEMBED_PROVIDERS: Record<string, string> = {
  'youtube.com': 'https://www.youtube.com/oembed?url=',
  'youtu.be': 'https://www.youtube.com/oembed?url=',
  'vimeo.com': 'https://vimeo.com/api/oembed.json?url=',
};

export async function extractFromVideoUrl(url: string): Promise<VideoExtractResult> {
  // For YouTube/Vimeo, try oEmbed
  for (const [domain, oembedBase] of Object.entries(OEMBED_PROVIDERS)) {
    if (url.includes(domain)) {
      try {
        const oembedUrl = oembedBase + encodeURIComponent(url);
        const response = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) });
        if (response.ok) {
          const data = await response.json();
          return {
            title: data.title || 'Video',
            description: data.author_name ? `By ${data.author_name}` : undefined,
            thumbnail: data.thumbnail_url,
            author: data.author_name,
          };
        }
      } catch {
        // fallback to Open Graph
      }
    }
  }

  // Fallback: try to get Open Graph metadata
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; InsightMiner/1.0)' },
    signal: AbortSignal.timeout(5000),
  });
  const html = await response.text();

  // Simple regex-based OG extraction
  const getOg = (prop: string) => {
    const match = html.match(new RegExp(`property=["']og:${prop}["'][^>]*content=["']([^"']+)["']`));
    return match?.[1];
  };

  return {
    title: getOg('title') || 'Video',
    description: getOg('description'),
    thumbnail: getOg('image'),
  };
}