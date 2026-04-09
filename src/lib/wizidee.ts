/**
 * WIZIDEE server-side API client.
 * Handles token acquisition/caching and document recognition/analysis.
 * NEVER imported by client-side code — Next.js server only.
 */

import type { RecognizeResponse, ExtractionResult, TokenCache } from './types';

const AUTH_URL = process.env.WIZIDEE_AUTH_URL!;
const API_URL = process.env.WIZIDEE_API_URL!;
const WIZIDEE_USER = process.env.WIZIDEE_USER!;
const WIZIDEE_PASSWORD = process.env.WIZIDEE_PASSWORD!;

// Module-level cache — persists across requests in a single Next.js process
let tokenCache: TokenCache | null = null;

export async function getToken(): Promise<string> {
  const now = Date.now();
  // Proactive refresh: re-acquire if token expires within 60 seconds
  if (tokenCache && tokenCache.expiresAt - now > 60_000) {
    return tokenCache.value;
  }

  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'password',
      client_id: 'tools',
      scope: 'openid',
      username: WIZIDEE_USER,
      password: WIZIDEE_PASSWORD,
    }),
  });

  if (!res.ok) {
    throw new Error(`Auth failed: ${res.status}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number };
  tokenCache = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return tokenCache.value;
}

export async function recognizeDocument(file: File): Promise<RecognizeResponse> {
  const token = await getToken();

  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${API_URL}/api/v1/recognize`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Recognize failed: ${res.status}`);
  }

  return res.json() as Promise<RecognizeResponse>;
}

export async function analyzeDocument(
  file: File,
  dbId: string,
  radId: string,
): Promise<ExtractionResult> {
  const token = await getToken();

  const form = new FormData();
  form.append('file', file);
  form.append('dbId', dbId);
  form.append('radId', radId);

  const res = await fetch(`${API_URL}/api/v1/analyze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Analyze failed: ${res.status}`);
  }

  return res.json() as Promise<ExtractionResult>;
}
