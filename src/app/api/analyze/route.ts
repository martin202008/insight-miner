import { NextRequest, NextResponse } from 'next/server';
import { extractInsights } from '@/lib/ai/analyzer';
import { createJob, saveJob } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { verifyToken } from '@/lib/auth';
import type { AnalysisJob, Source } from '@/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const user = token ? await verifyToken(token) : null;

    const { sources } = await req.json() as {
      sources: Array<{ id: string; type: string; url?: string; title?: string; content: string }>;
    };

    if (!sources || sources.length === 0) {
      return NextResponse.json({ error: 'No sources provided' }, { status: 400 });
    }

    const maxSources = user?.plan === 'pro'
      ? Number(process.env.MAX_SOURCES_PRO || 20)
      : Number(process.env.MAX_SOURCES_FREE || 5);

    if (sources.length > maxSources) {
      return NextResponse.json(
        { error: `Free tier limited to ${maxSources} sources. Upgrade to Pro for more.` },
        { status: 403 }
      );
    }

    const jobId = generateId();
    const job: AnalysisJob = {
      id: jobId,
      userId: user?.sub,
      status: 'processing',
      mode: 'insights',
      sources: sources.map((s) => ({
        id: s.id,
        jobId,
        type: s.type as Source['type'],
        url: s.url,
        title: s.title,
        content: s.content,
        status: 'extracted',
        createdAt: new Date().toISOString(),
      })),
      cards: [],
      createdAt: new Date().toISOString(),
    };

    await createJob(job);

    const sourceInputs = sources.map((s) => ({
      title: s.title,
      content: s.content.substring(0, 4000),
      url: s.url,
    }));

    const result = await extractInsights(sourceInputs);

    job.cards = result.cards.map((c) => ({
      ...c,
      id: generateId(),
      jobId,
    }));
    job.status = 'completed';
    job.completedAt = new Date().toISOString();

    await saveJob(job);

    return NextResponse.json({ jobId, cards: job.cards, status: 'completed' });
  } catch (err) {
    console.error('Analyze error:', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
