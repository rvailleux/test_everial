import { NextRequest, NextResponse } from 'next/server';
import { analyzeDocument } from '@/lib/wizidee';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('file');
  const dbId = form.get('dbId');
  const radId = form.get('radId');

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!dbId || typeof dbId !== 'string') {
    return NextResponse.json(
      { error: 'Missing required fields: dbId' },
      { status: 400 },
    );
  }

  if (!radId || typeof radId !== 'string') {
    return NextResponse.json(
      { error: 'Missing required fields: radId' },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large — maximum 10 MB' }, { status: 413 });
  }

  try {
    const result = await analyzeDocument(file as File, dbId, radId);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Auth failed')) {
      return NextResponse.json(
        { error: 'Service unavailable', step: 'auth' },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: 'Extraction failed', step: 'analyze' },
      { status: 502 },
    );
  }
}
