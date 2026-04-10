/**
 * Tests for VideoCall component
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { VideoCall } from '@/components/VideoCall';

// Mock LiveKitVideoCall
jest.mock('@/components/LiveKitVideoCall', () => {
  return function MockLiveKitVideoCall({ roomName }: { roomName: string }) {
    return (
      <div data-testid="livekit-video-call">
        <video data-testid="mock-video" width="640" height="480" />
        <span>Room: {roomName}</span>
      </div>
    );
  };
});

describe('VideoCall', () => {
  const mockOnSnapshotCapture = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render LiveKitVideoCall with room name', () => {
    render(<VideoCall roomName="test-room" />);

    expect(screen.getByTestId('livekit-video-call')).toBeInTheDocument();
    expect(screen.getByText('Room: test-room')).toBeInTheDocument();
  });

  it('should render without onSnapshotCapture', () => {
    render(<VideoCall roomName="test-room" />);

    expect(screen.getByTestId('livekit-video-call')).toBeInTheDocument();
  });

  it('should accept onSnapshotCapture prop', () => {
    render(
      <VideoCall
        roomName="test-room"
        onSnapshotCapture={mockOnSnapshotCapture}
      />
    );

    expect(screen.getByTestId('livekit-video-call')).toBeInTheDocument();
  });
});
