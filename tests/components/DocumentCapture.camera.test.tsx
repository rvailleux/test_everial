/**
 * Tests for DocumentCapture — camera capture mode
 */

import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DocumentCapture from '../../src/components/DocumentCapture';

// Mock getUserMedia
const mockGetUserMedia = jest.fn();
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: { getUserMedia: mockGetUserMedia },
  writable: true,
});

// Mock HTMLVideoElement.play (jsdom doesn't implement it)
HTMLVideoElement.prototype.play = jest.fn().mockResolvedValue(undefined);

const mockStream = {
  getTracks: () => [{ stop: jest.fn() }],
} as unknown as MediaStream;

beforeEach(() => {
  mockGetUserMedia.mockReset();
});

describe('DocumentCapture — camera mode', () => {
  it('renders a "Use Camera" button', () => {
    render(<DocumentCapture onCapture={jest.fn()} />);
    expect(screen.getByRole('button', { name: /use camera/i })).toBeInTheDocument();
  });

  it('calls getUserMedia when "Use Camera" is clicked', async () => {
    const user = userEvent.setup();
    mockGetUserMedia.mockResolvedValueOnce(mockStream);

    render(<DocumentCapture onCapture={jest.fn()} />);
    await user.click(screen.getByRole('button', { name: /use camera/i }));

    expect(mockGetUserMedia).toHaveBeenCalledWith(
      expect.objectContaining({ video: expect.anything() }),
    );
  });

  it('shows video preview element after camera is opened', async () => {
    const user = userEvent.setup();
    mockGetUserMedia.mockResolvedValueOnce(mockStream);

    render(<DocumentCapture onCapture={jest.fn()} />);
    await user.click(screen.getByRole('button', { name: /use camera/i }));

    expect(document.querySelector('video')).toBeInTheDocument();
  });

  it('shows a Capture button when camera is active', async () => {
    const user = userEvent.setup();
    mockGetUserMedia.mockResolvedValueOnce(mockStream);

    render(<DocumentCapture onCapture={jest.fn()} />);
    await user.click(screen.getByRole('button', { name: /use camera/i }));

    expect(screen.getByRole('button', { name: /capture/i })).toBeInTheDocument();
  });

  it('hides camera button and continues in upload-only mode when permission is denied', async () => {
    const user = userEvent.setup();
    mockGetUserMedia.mockRejectedValueOnce(new DOMException('Permission denied', 'NotAllowedError'));

    render(<DocumentCapture onCapture={jest.fn()} />);
    await user.click(screen.getByRole('button', { name: /use camera/i }));

    // Camera button should disappear after denial
    expect(screen.queryByRole('button', { name: /use camera/i })).not.toBeInTheDocument();
    // Upload flow should still work
    expect(document.querySelector('input[type="file"]')).toBeInTheDocument();
  });
});
