import { NextRequest, NextResponse } from 'next/server';
import { extractFromUrl } from '@/lib/extractors/url';
import { extractFromVideoUrl } from '@/lib/extractors/video';
import { generateId } from '@/lib/utils';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { type, url } = await req.json();

    if (!type || !url) {
      return NextResponse.json({ error: 'Missing type or url' }, { status: 400 });
    }

    const id = generateId();
    let title = '';
    let content = '';

    if (type === 'url') {
      const result = await extractFromUrl(url);
      title = result.title;
      content = result.content;
    } else if (type === 'video') {
      const result = await extractFromVideoUrl(url);
      title = result.title;
      content = result.description ?? '';
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({ id, title, content, url });
  } catch (err) {
    console.error('Extract error:', err);
    return NextResponse.json(
      { error: 'Failed to extract content' },
      { status: 500 }
    );
  }
}
