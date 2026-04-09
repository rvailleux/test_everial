import { NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import type { VideoGrant } from 'livekit-server-sdk';

/**
 * POST /api/livekit/token
 * Generates a LiveKit JWT token for room access.
 *
 * Request body:
 * - room_name: string (required) - The room to join
 * - participant_identity: string (required) - Unique identifier for the participant
 * - participant_name: string (optional) - Display name for the participant
 *
 * Response:
 * - participant_token: JWT token for LiveKit connection
 * - server_url: LiveKit server WebSocket URL
 * - participant_name: The participant's display name
 * - room_name: The room name
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || apiKey.trim() === '' || !apiSecret || apiSecret.trim() === '') {
      return NextResponse.json(
        { error: 'LiveKit credentials not configured' },
        { status: 500 }
      );
    }

    let body: {
      room_name?: string;
      participant_identity?: string;
      participant_name?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { room_name, participant_identity, participant_name } = body;

    if (!room_name || room_name.trim() === '') {
      return NextResponse.json(
        { error: 'room_name is required' },
        { status: 400 }
      );
    }

    if (!participant_identity || participant_identity.trim() === '') {
      return NextResponse.json(
        { error: 'participant_identity is required' },
        { status: 400 }
      );
    }

    // Create VideoGrant with room permissions
    const grant: VideoGrant = {
      room: room_name,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
      canUpdateOwnMetadata: true,
    };

    // Generate JWT token
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participant_identity,
      name: participant_name || participant_identity,
    });

    at.addGrant(grant);
    const token = await at.toJwt();

    return NextResponse.json({
      participant_token: token,
      server_url: serverUrl || 'wss://livekit.cloud',
      participant_name: participant_name || participant_identity,
      room_name: room_name,
    });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
