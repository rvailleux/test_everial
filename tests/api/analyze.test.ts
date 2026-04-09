/**
 * Tests for POST /api/wizidee/analyze
 * Mocks src/lib/wizidee analyzeDocument
 */

import { NextRequest } from 'next/server';

jest.mock('../../src/lib/wizidee', () => ({
  recognizeDocument: jest.fn(),
  analyzeDocument: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { analyzeDocument } = require('../../src/lib/wizidee') as {
  analyzeDocument: jest.MockedFunction<() => Promise<unknown>>;
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { POST } = require('../../src/app/api/wizidee/analyze/route') as {
  POST: (req: NextRequest) => Promise<Response>;
};

function makeRequest(opts: { file?: File; dbId?: string; radId?: string } = {}) {
  const form = new FormData();
  if (opts.file) form.append('file', opts.file);
  if (opts.dbId) form.append('dbId', opts.dbId);
  if (opts.radId) form.append('radId', opts.radId);
  return new NextRequest('http://localhost/api/wizidee/analyze', {
    method: 'POST',
    body: form,
  });
}

const validFile = new File(['img'], 'cni.jpg', { type: 'image/jpeg' });

describe('POST /api/wizidee/analyze', () => {
  beforeEach(() => {
    analyzeDocument.mockReset();
  });

  it('returns 200 with fields and raw on success', async () => {
    analyzeDocument.mockResolvedValueOnce({
      fields: { lastName: 'DUPONT', firstName: 'JEAN', dateOfBirth: '1985-06-15' },
      raw: { wizideeResponse: true },
    });

    const res = await POST(makeRequest({ file: validFile, dbId: 'db-1', radId: 'rad-1' }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.fields.lastName).toBe('DUPONT');
    expect(body.raw).toBeDefined();
  });

  it('returns 400 when dbId is missing', async () => {
    const res = await POST(makeRequest({ file: validFile, radId: 'rad-1' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/dbId/i);
  });

  it('returns 400 when radId is missing', async () => {
    const res = await POST(makeRequest({ file: validFile, dbId: 'db-1' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/radId/i);
  });

  it('returns 400 when no file is provided', async () => {
    const res = await POST(makeRequest({ dbId: 'db-1', radId: 'rad-1' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/no file/i);
  });

  it('returns 502 when WIZIDEE analyze fails', async () => {
    analyzeDocument.mockRejectedValueOnce(new Error('Analyze failed: 500'));

    const res = await POST(makeRequest({ file: validFile, dbId: 'db-1', radId: 'rad-1' }));
    const body = await res.json();

    expect(res.status).toBe(502);
    expect(body.step).toBe('analyze');
  });

  it('returns 413 when file exceeds 10MB', async () => {
    const bigFile = new File([new Uint8Array(11 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' });
    const res = await POST(makeRequest({ file: bigFile, dbId: 'db-1', radId: 'rad-1' }));
    const body = await res.json();

    expect(res.status).toBe(413);
    expect(body.error).toMatch(/too large/i);
  });

  it('returns 503 when auth fails', async () => {
    analyzeDocument.mockRejectedValueOnce(new Error('Auth failed: 401'));

    const res = await POST(makeRequest({ file: validFile, dbId: 'db-1', radId: 'rad-1' }));
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.step).toBe('auth');
  });

  describe('passport scenario (US2)', () => {
    it('includes nationality and multi-line MRZ in fields', async () => {
      analyzeDocument.mockResolvedValueOnce({
        fields: {
          lastName: 'MARTIN',
          firstName: 'SOPHIE',
          nationality: 'FRA',
          mrz: 'P<FRAMARTIN<<SOPHIE<<<<<<<<<\nABC123456789FRA8506151F3012221',
        },
        raw: {},
      });

      const res = await POST(makeRequest({ file: validFile, dbId: 'db-2', radId: 'rad-2' }));
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.fields.nationality).toBe('FRA');
      expect(body.fields.mrz).toContain('\n');
    });
  });
});
