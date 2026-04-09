/**
 * Tests for POST /api/wizidee/recognize
 * Mocks src/lib/wizidee recognizeDocument
 */

import { NextRequest } from 'next/server';

jest.mock('../../src/lib/wizidee', () => ({
  recognizeDocument: jest.fn(),
  analyzeDocument: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { recognizeDocument } = require('../../src/lib/wizidee') as {
  recognizeDocument: jest.MockedFunction<() => Promise<unknown>>;
};

// Import route after mock registration
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { POST } = require('../../src/app/api/wizidee/recognize/route') as {
  POST: (req: NextRequest) => Promise<Response>;
};

function makeRequest(file?: File) {
  const form = new FormData();
  if (file) form.append('file', file);
  return new NextRequest('http://localhost/api/wizidee/recognize', {
    method: 'POST',
    body: form,
  });
}

describe('POST /api/wizidee/recognize', () => {
  beforeEach(() => {
    recognizeDocument.mockReset();
  });

  it('returns 200 with dbId and radId on success', async () => {
    recognizeDocument.mockResolvedValueOnce({ dbId: 'db-1', radId: 'rad-1', documentType: 'CNI_FRANCE' });

    const file = new File(['img'], 'cni.jpg', { type: 'image/jpeg' });
    const res = await POST(makeRequest(file));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.dbId).toBe('db-1');
    expect(body.radId).toBe('rad-1');
  });

  it('returns 400 when no file is provided', async () => {
    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/no file/i);
  });

  it('returns 413 when file exceeds 10MB', async () => {
    const bigFile = new File([new Uint8Array(11 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' });
    const res = await POST(makeRequest(bigFile));
    const body = await res.json();

    expect(res.status).toBe(413);
    expect(body.error).toMatch(/too large/i);
  });

  it('returns 415 for non-image MIME type', async () => {
    const textFile = new File(['hello'], 'doc.txt', { type: 'text/plain' });
    const res = await POST(makeRequest(textFile));
    const body = await res.json();

    expect(res.status).toBe(415);
    expect(body.error).toMatch(/unsupported/i);
  });

  it('returns 502 when WIZIDEE returns non-2xx', async () => {
    recognizeDocument.mockRejectedValueOnce(new Error('Recognize failed: 422'));

    const file = new File(['img'], 'cni.jpg', { type: 'image/jpeg' });
    const res = await POST(makeRequest(file));
    const body = await res.json();

    expect(res.status).toBe(502);
    expect(body.step).toBe('recognize');
  });

  it('returns 503 when auth fails', async () => {
    recognizeDocument.mockRejectedValueOnce(new Error('Auth failed: 401'));

    const file = new File(['img'], 'cni.jpg', { type: 'image/jpeg' });
    const res = await POST(makeRequest(file));
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.step).toBe('auth');
  });
});
