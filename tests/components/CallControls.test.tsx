/**
 * Tests for CallControls component with LiveKit
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CallControls from '../../src/components/CallControls';

// Mock LiveKit components-react
const mockSetMicrophoneEnabled = jest.fn();
const mockSetCameraEnabled = jest.fn();
const mockDisconnect = jest.fn();

const mockLocalParticipant = {
  identity: 'test-user',
  isMicrophoneEnabled: true,
  isCameraEnabled: true,
  setMicrophoneEnabled: mockSetMicrophoneEnabled,
  setCameraEnabled: mockSetCameraEnabled,
};

const mockRoom = {
  disconnect: mockDisconnect,
};

jest.mock('@livekit/components-react', () => ({
  useLocalParticipant: jest.fn(() => ({
    localParticipant: mockLocalParticipant,
  })),
  useRoomContext: jest.fn(() => mockRoom),
}));

describe('CallControls', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Mute, Camera, and Leave buttons', () => {
    render(<CallControls />);

    expect(screen.getByRole('button', { name: /mute/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /camera/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /leave/i })).toBeInTheDocument();
  });

  it('calls setMicrophoneEnabled when Mute button is clicked', async () => {
    render(<CallControls />);

    await user.click(screen.getByRole('button', { name: /mute/i }));

    expect(mockSetMicrophoneEnabled).toHaveBeenCalledWith(false);
  });

  it('calls setCameraEnabled when Camera button is clicked', async () => {
    render(<CallControls />);

    await user.click(screen.getByRole('button', { name: /camera/i }));

    expect(mockSetCameraEnabled).toHaveBeenCalledWith(false);
  });

  it('calls room.disconnect when Leave button is clicked', async () => {
    render(<CallControls />);

    await user.click(screen.getByRole('button', { name: /leave/i }));

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });
});
