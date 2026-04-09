/**
 * Tests for LiveKitVideoCall component
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import LiveKitVideoCall from '../../src/components/LiveKitVideoCall';

// Mock LiveKit components-react
const mockUseLocalParticipant = jest.fn();
const mockUseRemoteParticipants = jest.fn();
const mockUseTracks = jest.fn();
const mockUseConnectionState = jest.fn();

jest.mock('@livekit/components-react', () => ({
  LiveKitRoom: ({ children }: { children: React.ReactNode }) => <div data-testid="livekit-room">{children}</div>,
  useLocalParticipant: () => mockUseLocalParticipant(),
  useRemoteParticipants: () => mockUseRemoteParticipants(),
  useTracks: () => mockUseTracks(),
  useConnectionState: () => mockUseConnectionState(),
  useRoomContext: () => ({ disconnect: jest.fn() }),
  VideoTrack: ({ trackRef }: { trackRef: { publication: { trackSid: string } } }) => (
    <div data-testid={`video-track-${trackRef.publication.trackSid}`}>Video</div>
  ),
}));

// Mock fetch
global.fetch = jest.fn();

describe('LiveKitVideoCall', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalParticipant.mockReturnValue({
      localParticipant: { identity: 'test-user', isCameraEnabled: true },
    });
    mockUseRemoteParticipants.mockReturnValue([]);
    mockUseTracks.mockReturnValue([]);
    mockUseConnectionState.mockReturnValue('disconnected');
  });

  it('shows loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<LiveKitVideoCall roomName="test-room" />);

    expect(screen.getByText(/loading video call/i)).toBeInTheDocument();
  });

  it('fetches token on mount', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        participant_token: 'mock-token',
        server_url: 'wss://test.livekit.cloud',
        participant_name: 'Test User',
        room_name: 'test-room',
      }),
    });

    render(<LiveKitVideoCall roomName="test-room" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('test-room'),
      });
    });
  });

  it('renders LiveKitRoom when token is received', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        participant_token: 'mock-token',
        server_url: 'wss://test.livekit.cloud',
        participant_name: 'Test User',
        room_name: 'test-room',
      }),
    });

    render(<LiveKitVideoCall roomName="test-room" />);

    await waitFor(() => {
      expect(screen.getByTestId('livekit-room')).toBeInTheDocument();
    });
  });

  it('shows error when token fetch fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ error: 'Server error' }),
    });

    render(<LiveKitVideoCall roomName="test-room" />);

    await waitFor(() => {
      expect(screen.getByText(/error:/i)).toBeInTheDocument();
    });
  });

  it('displays room name in status bar', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        participant_token: 'mock-token',
        server_url: 'wss://test.livekit.cloud',
        participant_name: 'Test User',
        room_name: 'test-room',
      }),
    });

    render(<LiveKitVideoCall roomName="test-room" />);

    await waitFor(() => {
      expect(screen.getByText(/room:/i)).toBeInTheDocument();
      expect(screen.getByText('test-room')).toBeInTheDocument();
    });
  });
});
