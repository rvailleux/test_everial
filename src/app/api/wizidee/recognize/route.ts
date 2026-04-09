import { NextRequest, NextResponse } from 'next/server';
import { recognizeDocument } from '@/lib/wizidee';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = ['image/jpeg', 'image/png'];

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get('file');

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large — maximum 10 MB' }, { status: 413 });
  }

  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported format — use JPEG or PNG' }, { status: 415 });
  }

  try {
    const result = await recognizeDocument(file as File);
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
      { error: 'Recognition failed', step: 'recognize' },
      { status: 502 },
    );
  }
}
