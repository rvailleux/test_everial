/**
 * Tests for src/lib/wizidee.ts
 * WIZIDEE server-side client: token cache + API helpers
 */

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Reset module state between tests so the in-memory token cache is cleared
beforeEach(() => {
  jest.resetModules();
  mockFetch.mockReset();
});

function makeTokenResponse(expiresIn = 300) {
  return {
    ok: true,
    json: async () => ({ access_token: 'test-token-abc', expires_in: expiresIn }),
  };
}

describe('getToken()', () => {
  it('acquires a token on first call and returns it', async () => {
    mockFetch.mockResolvedValueOnce(makeTokenResponse());

    const { getToken } = await import('../../src/lib/wizidee');
    const token = await getToken();

    expect(token).toBe('test-token-abc');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('returns cached token on second call without re-fetching', async () => {
    mockFetch.mockResolvedValueOnce(makeTokenResponse(300));

    const { getToken } = await import('../../src/lib/wizidee');
    await getToken(); // first call — acquires token
    const token = await getToken(); // second call — should use cache

    expect(token).toBe('test-token-abc');
    expect(mockFetch).toHaveBeenCalledTimes(1); // only one fetch
  });

  it('re-acquires token when within 60s of expiry', async () => {
    // First token expires in 30s (within proactive refresh window)
    mockFetch.mockResolvedValueOnce(makeTokenResponse(30));
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'fresh-token-xyz', expires_in: 300 }),
    });

    const { getToken } = await import('../../src/lib/wizidee');
    await getToken(); // first call — acquires token (expires in 30s)
    const token = await getToken(); // second call — should detect near-expiry, re-acquire

    expect(token).toBe('fresh-token-xyz');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('throws when auth endpoint returns non-2xx', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });

    const { getToken } = await import('../../src/lib/wizidee');

    await expect(getToken()).rejects.toThrow();
  });
});

describe('recognizeDocument()', () => {
  it('calls the recognize endpoint with Authorization header and returns dbId + radId', async () => {
    // Auth token fetch
    mockFetch.mockResolvedValueOnce(makeTokenResponse());
    // Recognize response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ dbId: 'db-123', radId: 'rad-456', documentType: 'CNI_FRANCE' }),
    });

    const { recognizeDocument } = await import('../../src/lib/wizidee');
    const file = new File(['img'], 'cni.jpg', { type: 'image/jpeg' });
    const result = await recognizeDocument(file);

    expect(result.dbId).toBe('db-123');
    expect(result.radId).toBe('rad-456');
    expect(result.documentType).toBe('CNI_FRANCE');

    const recognizeCall = mockFetch.mock.calls[1];
    expect(recognizeCall[1]?.headers?.Authorization).toBe('Bearer test-token-abc');
  });

  it('throws when WIZIDEE recognize returns non-2xx', async () => {
    mockFetch.mockResolvedValueOnce(makeTokenResponse());
    mockFetch.mockResolvedValueOnce({ ok: false, status: 422 });

    const { recognizeDocument } = await import('../../src/lib/wizidee');
    const file = new File(['img'], 'test.jpg', { type: 'image/jpeg' });

    await expect(recognizeDocument(file)).rejects.toThrow();
  });
});

describe('analyzeDocument()', () => {
  it('calls the analyze endpoint with Authorization header and returns fields + raw', async () => {
    mockFetch.mockResolvedValueOnce(makeTokenResponse());
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        fields: { lastName: 'DUPONT', firstName: 'JEAN' },
        raw: { wizidee: 'response' },
      }),
    });

    const { analyzeDocument } = await import('../../src/lib/wizidee');
    const file = new File(['img'], 'cni.jpg', { type: 'image/jpeg' });
    const result = await analyzeDocument(file, 'db-123', 'rad-456');

    expect(result.fields.lastName).toBe('DUPONT');

    const analyzeCall = mockFetch.mock.calls[1];
    expect(analyzeCall[1]?.headers?.Authorization).toBe('Bearer test-token-abc');
  });

  it('throws when WIZIDEE analyze returns non-2xx', async () => {
    mockFetch.mockResolvedValueOnce(makeTokenResponse());
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const { analyzeDocument } = await import('../../src/lib/wizidee');
    const file = new File(['img'], 'test.jpg', { type: 'image/jpeg' });

    await expect(analyzeDocument(file, 'db-1', 'rad-1')).rejects.toThrow();
  });
});
