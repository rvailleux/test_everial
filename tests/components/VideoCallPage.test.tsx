/**
 * Tests for VideoCallPage (kernel page)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VideoCallPage from '@/app/video-call/page';
import { registerModule, WizideeModule } from '@/lib/modules';

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

const MockConfigComponent: React.FC<{ config: any; onConfigChange: (config: any) => void }> = () => (
  <div data-testid="mock-config">Config Component</div>
);

const MockResultComponent: React.FC<{ result: any }> = ({ result }) => (
  <div data-testid="mock-result">Result: {result.success ? 'Success' : 'Failed'}</div>
);

const createTestModule = (id: string, name: string): WizideeModule => ({
  id,
  name,
  description: `Description for ${name}`,
  ConfigComponent: MockConfigComponent,
  ResultComponent: MockResultComponent,
  process: async () => ({ success: true, data: { test: 'data' } }),
  defaultConfig: { value: 'default' },
});

describe('VideoCallPage', () => {
  beforeEach(() => {
    const { registry } = require('@/lib/modules');
    registry.clear();
  });

  it('should show room entry form initially', () => {
    render(<VideoCallPage />);

    expect(screen.getByText('Enter a Room')).toBeInTheDocument();
    expect(screen.getByLabelText('Room Name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Join Room' })).toBeInTheDocument();
  });

  it('should join room when form submitted', async () => {
    render(<VideoCallPage />);

    const input = screen.getByLabelText('Room Name');
    fireEvent.change(input, { target: { value: 'test-room' } });

    const joinButton = screen.getByRole('button', { name: 'Join Room' });
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(screen.getByText('Room: test-room')).toBeInTheDocument();
    });
  });

  it('should render module selector after joining', async () => {
    registerModule(createTestModule('test-mod', 'Test Module'));

    render(<VideoCallPage />);

    const input = screen.getByLabelText('Room Name');
    fireEvent.change(input, { target: { value: 'test-room' } });

    const joinButton = screen.getByRole('button', { name: 'Join Room' });
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(screen.getByText('Test Module')).toBeInTheDocument();
    });
  });

  it('should render action bar with capture and process buttons', async () => {
    render(<VideoCallPage />);

    const input = screen.getByLabelText('Room Name');
    fireEvent.change(input, { target: { value: 'test-room' } });

    const joinButton = screen.getByRole('button', { name: 'Join Room' });
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(screen.getByTestId('capture-button')).toBeInTheDocument();
      expect(screen.getByTestId('process-button')).toBeInTheDocument();
    });
  });

  it('should show leave room button after joining', async () => {
    render(<VideoCallPage />);

    const input = screen.getByLabelText('Room Name');
    fireEvent.change(input, { target: { value: 'test-room' } });

    const joinButton = screen.getByRole('button', { name: 'Join Room' });
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Leave Room' })).toBeInTheDocument();
    });
  });

  it('should return to room entry when leaving', async () => {
    render(<VideoCallPage />);

    const input = screen.getByLabelText('Room Name');
    fireEvent.change(input, { target: { value: 'test-room' } });

    const joinButton = screen.getByRole('button', { name: 'Join Room' });
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Leave Room' })).toBeInTheDocument();
    });

    const leaveButton = screen.getByRole('button', { name: 'Leave Room' });
    fireEvent.click(leaveButton);

    await waitFor(() => {
      expect(screen.getByText('Enter a Room')).toBeInTheDocument();
    });
  });
});
