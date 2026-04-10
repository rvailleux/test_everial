/**
 * Tests for useSnapshot hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useSnapshot } from '@/lib/hooks/useSnapshot';

// Mock canvas and its context
const mockDrawImage = jest.fn();
const mockToBlob = jest.fn();
const mockGetContext = jest.fn();

// Store original implementations
const originalCreateObjectURL = global.URL.createObjectURL;
const originalRevokeObjectURL = global.URL.revokeObjectURL;

describe('useSnapshot', () => {
  // Setup mocks that persist for all tests
  const mockCreateObjectURL = jest.fn();
  const mockRevokeObjectURL = jest.fn();

  beforeAll(() => {
    // Mock URL methods once for all tests
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    mockCreateObjectURL.mockReturnValue('blob:mock-url');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateObjectURL.mockReturnValue('blob:mock-url');

    // Mock canvas methods
    mockGetContext.mockReturnValue({
      drawImage: mockDrawImage,
    });

    // Mock HTMLCanvasElement
    global.HTMLCanvasElement.prototype.getContext = mockGetContext;
    global.HTMLCanvasElement.prototype.toBlob = mockToBlob;
  });

  afterAll(() => {
    // Restore original implementations
    global.URL.createObjectURL = originalCreateObjectURL;
    global.URL.revokeObjectURL = originalRevokeObjectURL;
    jest.restoreAllMocks();
  });

  it('should initialize with null snapshot', () => {
    const { result } = renderHook(() => useSnapshot());

    expect(result.current.snapshot).toBeNull();
    expect(result.current.isCapturing).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should capture a snapshot from video element', async () => {
    const { result } = renderHook(() => useSnapshot());

    // Create a mock video element
    const mockVideo = document.createElement('video');
    Object.defineProperties(mockVideo, {
      videoWidth: { value: 1280 },
      videoHeight: { value: 720 },
      readyState: { value: 4 }, // HAVE_ENOUGH_DATA
    });

    // Mock the blob returned by canvas.toBlob
    const mockBlob = new Blob(['mock-image-data'], { type: 'image/png' });
    mockToBlob.mockImplementation((callback: BlobCallback) => {
      callback(mockBlob);
    });

    // Trigger capture
    await act(async () => {
      await result.current.capture(mockVideo);
    });

    // Wait for state updates
    await waitFor(() => {
      expect(result.current.isCapturing).toBe(false);
    });

    // Verify canvas operations
    expect(mockGetContext).toHaveBeenCalledWith('2d');
    expect(mockDrawImage).toHaveBeenCalledWith(mockVideo, 0, 0, 1280, 720);
    expect(mockToBlob).toHaveBeenCalled();

    // Verify snapshot state
    expect(result.current.snapshot).not.toBeNull();
    expect(result.current.snapshot?.blob).toBe(mockBlob);
    expect(result.current.snapshot?.width).toBe(1280);
    expect(result.current.snapshot?.height).toBe(720);
    expect(result.current.snapshot?.url).toBe('blob:mock-url');
    expect(result.current.error).toBeNull();
  });

  it('should set error when video element is null', async () => {
    const { result } = renderHook(() => useSnapshot());

    let captureError: Error | null = null;
    await act(async () => {
      try {
        await result.current.capture(null as unknown as HTMLVideoElement);
      } catch (err: unknown) {
        captureError = err as Error;
      }
    });

    expect(captureError).not.toBeNull();
    expect(captureError!.message).toBe('Video element is required');
    expect(result.current.error?.message).toBe('Video element is required');
  });

  it('should set error when canvas context is unavailable', async () => {
    mockGetContext.mockReturnValue(null);

    const { result } = renderHook(() => useSnapshot());

    const mockVideo = document.createElement('video');
    Object.defineProperties(mockVideo, {
      videoWidth: { value: 1280 },
      videoHeight: { value: 720 },
    });

    let captureError: Error | null = null;
    await act(async () => {
      try {
        await result.current.capture(mockVideo);
      } catch (err: unknown) {
        captureError = err as Error;
      }
    });

    expect(captureError).not.toBeNull();
    expect(captureError!.message).toBe('Could not get canvas context');
    expect(result.current.error?.message).toBe('Could not get canvas context');
  });

  it('should set isCapturing to true during capture', async () => {
    const { result } = renderHook(() => useSnapshot());

    const mockVideo = document.createElement('video');
    Object.defineProperties(mockVideo, {
      videoWidth: { value: 1280 },
      videoHeight: { value: 720 },
      readyState: { value: 4 },
    });

    // Delay the blob creation to check isCapturing state
    mockToBlob.mockImplementation((callback: BlobCallback) => {
      setTimeout(() => {
        callback(new Blob(['data'], { type: 'image/png' }));
      }, 10);
    });

    // Start capture - don't await yet so we can check intermediate state
    let capturePromise: Promise<void>;
    act(() => {
      capturePromise = result.current.capture(mockVideo);
    });

    // Check isCapturing is true immediately
    expect(result.current.isCapturing).toBe(true);

    // Wait for completion
    await act(async () => {
      await capturePromise;
    });

    await waitFor(() => {
      expect(result.current.isCapturing).toBe(false);
    });
  });

  it('should clear snapshot and revoke object URL', async () => {
    const { result } = renderHook(() => useSnapshot());

    const mockVideo = document.createElement('video');
    Object.defineProperties(mockVideo, {
      videoWidth: { value: 1280 },
      videoHeight: { value: 720 },
      readyState: { value: 4 },
    });

    const mockBlob = new Blob(['mock-image-data'], { type: 'image/png' });
    mockToBlob.mockImplementation((callback: BlobCallback) => {
      callback(mockBlob);
    });

    // Capture first
    await act(async () => {
      await result.current.capture(mockVideo);
    });

    const snapshotUrl = result.current.snapshot?.url;

    // Clear the snapshot
    act(() => {
      result.current.clear();
    });

    expect(result.current.snapshot).toBeNull();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith(snapshotUrl);
  });

  it('should revoke object URL on unmount', async () => {
    const { result, unmount } = renderHook(() => useSnapshot());

    const mockVideo = document.createElement('video');
    Object.defineProperties(mockVideo, {
      videoWidth: { value: 1280 },
      videoHeight: { value: 720 },
      readyState: { value: 4 },
    });

    const mockBlob = new Blob(['mock-image-data'], { type: 'image/png' });
    mockToBlob.mockImplementation((callback: BlobCallback) => {
      callback(mockBlob);
    });

    // Capture first
    await act(async () => {
      await result.current.capture(mockVideo);
    });

    const snapshotUrl = result.current.snapshot?.url;

    // Unmount
    unmount();

    expect(mockRevokeObjectURL).toHaveBeenCalledWith(snapshotUrl);
  });

  it('should set error when video has 0 dimensions', async () => {
    const { result } = renderHook(() => useSnapshot());

    const mockVideo = document.createElement('video');
    Object.defineProperties(mockVideo, {
      videoWidth: { value: 0 },
      videoHeight: { value: 0 },
    });

    let captureError: Error | null = null;
    await act(async () => {
      try {
        await result.current.capture(mockVideo);
      } catch (err: unknown) {
        captureError = err as Error;
      }
    });

    expect(captureError).not.toBeNull();
    expect(captureError!.message).toBe('Video has no dimensions');
    expect(result.current.error?.message).toBe('Video has no dimensions');
  });
});
