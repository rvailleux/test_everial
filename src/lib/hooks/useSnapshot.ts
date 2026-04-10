/**
 * useSnapshot Hook
 *
 * Handles capturing frames from video elements for document processing.
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Snapshot } from '@/types/snapshot';

interface UseSnapshotReturn {
  /** The current snapshot or null if none captured */
  snapshot: Snapshot | null;
  /** Whether a capture operation is in progress */
  isCapturing: boolean;
  /** Error from the last capture attempt, if any */
  error: Error | null;
  /**
   * Capture a frame from a video element
   * @param videoElement - The HTML video element to capture from
   * @returns Promise that resolves when capture is complete
   */
  capture: (videoElement: HTMLVideoElement) => Promise<void>;
  /** Clear the current snapshot and revoke the object URL */
  clear: () => void;
}

/**
 * Hook to capture snapshots from video elements
 * @returns Snapshot state and capture controls
 */
export function useSnapshot(): UseSnapshotReturn {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const snapshotRef = useRef<Snapshot | null>(null);

  // Keep ref in sync with state for cleanup
  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  const capture = useCallback(async (videoElement: HTMLVideoElement): Promise<void> => {
    // Clear previous error
    setError(null);

    if (!videoElement) {
      const error = new Error('Video element is required');
      setError(error);
      throw error;
    }

    // Check video dimensions
    const width = videoElement.videoWidth ?? videoElement.width ?? 640;
    const height = videoElement.videoHeight ?? videoElement.height ?? 480;

    if (width === 0 || height === 0) {
      const error = new Error('Video has no dimensions');
      setError(error);
      throw error;
    }

    setIsCapturing(true);

    try {
      // Create canvas with video dimensions
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Draw video frame to canvas
      ctx.drawImage(videoElement, 0, 0, width, height);

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) {
              resolve(b);
            } else {
              reject(new Error('Failed to create blob from canvas'));
            }
          },
          'image/png',
          0.95
        );
      });

      // Revoke previous URL if exists
      if (snapshotRef.current?.url) {
        URL.revokeObjectURL(snapshotRef.current.url);
      }

      // Create new snapshot
      const newSnapshot: Snapshot = {
        blob,
        url: URL.createObjectURL(blob),
        width,
        height,
        timestamp: Date.now(),
      };

      setSnapshot(newSnapshot);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Capture failed');
      setError(error);
      throw error;
    } finally {
      setIsCapturing(false);
    }
  }, []);

  const clear = useCallback(() => {
    if (snapshotRef.current?.url) {
      URL.revokeObjectURL(snapshotRef.current.url);
    }
    setSnapshot(null);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (snapshotRef.current?.url) {
        URL.revokeObjectURL(snapshotRef.current.url);
      }
    };
  }, []);

  return {
    snapshot,
    isCapturing,
    error,
    capture,
    clear,
  };
}
