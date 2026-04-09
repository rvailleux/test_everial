/**
 * Tests for LiveKit token generation API route
 * TDD approach - write tests first, then implement
 */

import { POST } from '@/app/api/livekit/token/route';

// Mock livekit-server-sdk
const mockToJwt = jest.fn();
const mockAddGrant = jest.fn();
const mockAccessToken = jest.fn();

jest.mock('livekit-server-sdk', () => ({
  AccessToken: jest.fn().mockImplementation((apiKey, apiSecret, options) => ({
    addGrant: mockAddGrant,
    toJwt: mockToJwt,
  })),
}));

describe('POST /api/livekit/token', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.LIVEKIT_API_KEY = 'test-api-key';
    process.env.LIVEKIT_API_SECRET = 'test-api-secret';
    process.env.NEXT_PUBLIC_LIVEKIT_URL = 'wss://test.livekit.cloud';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Happy path', () => {
    it('returns token with valid room_name and participant_identity', async () => {
      mockToJwt.mockResolvedValue('mock-jwt-token');

      const request = new Request('http://localhost/api/livekit/token', {
        method: 'POST',
        body: JSON.stringify({
          room_name: 'test-room',
          participant_identity: 'user-123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.participant_token).toBe('mock-jwt-token');
      expect(data.server_url).toBe('wss://test.livekit.cloud');
      expect(data.room_name).toBe('test-room');
    });

    it('uses participant_name when provided', async () => {
      mockToJwt.mockResolvedValue('mock-jwt-token');

      const request = new Request('http://localhost/api/livekit/token', {
        method: 'POST',
        body: JSON.stringify({
          room_name: 'test-room',
          participant_identity: 'user-123',
          participant_name: 'John Doe',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.participant_name).toBe('John Doe');
    });

    it('adds correct VideoGrant permissions', async () => {
      mockToJwt.mockResolvedValue('mock-jwt-token');

      const request = new Request('http://localhost/api/livekit/token', {
        method: 'POST',
        body: JSON.stringify({
          room_name: 'test-room',
          participant_identity: 'user-123',
        }),
      });

      await POST(request);

      expect(mockAddGrant).toHaveBeenCalledWith({
        room: 'test-room',
        roomJoin: true,
        canPublish: true,
        canPublishData: true,
        canSubscribe: true,
        canUpdateOwnMetadata: true,
      });
    });
  });

  describe('Error handling', () => {
    it('returns 500 when LIVEKIT_API_KEY is not configured', async () => {
      delete process.env.LIVEKIT_API_KEY;

      const request = new Request('http://localhost/api/livekit/token', {
        method: 'POST',
        body: JSON.stringify({
          room_name: 'test-room',
          participant_identity: 'user-123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('LiveKit credentials not configured');
    });

    it('returns 500 when LIVEKIT_API_SECRET is not configured', async () => {
      delete process.env.LIVEKIT_API_SECRET;

      const request = new Request('http://localhost/api/livekit/token', {
        method: 'POST',
        body: JSON.stringify({
          room_name: 'test-room',
          participant_identity: 'user-123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('LiveKit credentials not configured');
    });

    it('returns 400 when room_name is missing', async () => {
      const request = new Request('http://localhost/api/livekit/token', {
        method: 'POST',
        body: JSON.stringify({
          participant_identity: 'user-123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('room_name');
    });

    it('returns 400 when participant_identity is missing', async () => {
      const request = new Request('http://localhost/api/livekit/token', {
        method: 'POST',
        body: JSON.stringify({
          room_name: 'test-room',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('participant_identity');
    });

    it('returns 500 when token generation fails', async () => {
      mockToJwt.mockRejectedValue(new Error('JWT generation failed'));

      const request = new Request('http://localhost/api/livekit/token', {
        method: 'POST',
        body: JSON.stringify({
          room_name: 'test-room',
          participant_identity: 'user-123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to generate token');
    });
  });

  describe('Default values', () => {
    it('uses participant_identity as participant_name when name not provided', async () => {
      mockToJwt.mockResolvedValue('mock-jwt-token');

      const request = new Request('http://localhost/api/livekit/token', {
        method: 'POST',
        body: JSON.stringify({
          room_name: 'test-room',
          participant_identity: 'user-123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.participant_name).toBe('user-123');
    });

    it('uses environment variable for server_url', async () => {
      process.env.NEXT_PUBLIC_LIVEKIT_URL = 'wss://custom.livekit.io';
      mockToJwt.mockResolvedValue('mock-jwt-token');

      const request = new Request('http://localhost/api/livekit/token', {
        method: 'POST',
        body: JSON.stringify({
          room_name: 'test-room',
          participant_identity: 'user-123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.server_url).toBe('wss://custom.livekit.io');
    });
  });
});
