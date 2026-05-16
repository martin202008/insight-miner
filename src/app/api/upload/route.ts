import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { extractFromPdf, extractFromDocx } from '@/lib/extractors/document';
import { generateId } from '@/lib/utils';

export const runtime = 'nodejs';

const UPLOAD_DIR = path.join(process.cwd(), '.uploads');

async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch {}
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const maxSize = Number(process.env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    await ensureUploadDir();
    const fileId = generateId();
    const ext = file.name.split('.').pop() || 'bin';
    const filePath = path.join(UPLOAD_DIR, `${fileId}.${ext}`);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    let title = file.name.replace(/\.[^.]+$/, '');
    let content = '';

    if (file.type === 'application/pdf') {
      const result = await extractFromPdf(buffer);
      title = result.title;
      content = result.content;
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.type === 'application/msword'
    ) {
      const result = await extractFromDocx(buffer);
      content = result.content;
    } else {
      content = buffer.toString('utf-8');
    }

    return NextResponse.json({ id: fileId, title, content });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
