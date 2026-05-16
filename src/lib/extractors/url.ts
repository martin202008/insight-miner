import * as cheerio from 'cheerio';

export interface UrlExtractResult {
  title: string;
  content: string;
  favicon?: string;
}

export async function extractFromUrl(url: string): Promise<UrlExtractResult> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; InsightMiner/1.0; +https://dingzhengxing.cn)',
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove script, style, nav, footer, header, aside elements
  $('script, style, nav, footer, header, aside, [class*="sidebar"], [class*="advertisement"], [class*="ads"], [class*="cookie"], [class*="popup"]').remove();

  const title = $('title').text().trim() ||
    $('h1').first().text().trim() ||
    $('meta[property="og:title"]').attr('content')?.trim() || '';

  // Get main content
  let content = '';
  const article = $('article').first();
  const main = $('main').first();

  if (article.length) {
    content = article.text().trim();
  } else if (main.length) {
    content = main.text().trim();
  } else {
    content = $('body').text().trim();
  }

  // Clean up whitespace
  content = content.replace(/\s+/g, ' ').substring(0, 8000);

  const favicon =
    $('link[rel="icon"]').attr('href') ||
    $('link[rel="shortcut icon"]').attr('href') ||
    '/favicon.ico';

  return {
    title: title.substring(0, 200),
    content,
    favicon: favicon?.startsWith('http') ? favicon : new URL(favicon, url).href,
  };
}