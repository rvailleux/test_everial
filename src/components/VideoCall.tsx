/**
 * VideoCall Component
 *
 * Unified video component that wraps LiveKitVideoCall and provides
 * snapshot capture capability from the video stream.
 */

'use client';

import React, { useRef, useCallback, useState } from 'react';
import LiveKitVideoCall from './LiveKitVideoCall';

interface VideoCallProps {
  /** Room name for the video call */
  roomName: string;
  /** Called when a snapshot is captured from the video stream */
  onSnapshotCapture?: (blob: Blob) => void;
}

export function VideoCall({ roomName, onSnapshotCapture }: VideoCallProps) {
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);

  /**
   * Captures a snapshot from the video stream.
   * Finds the local video element and draws it to a canvas.
   */
  const captureSnapshot = useCallback(() => {
    setCaptureError(null);

    if (!videoContainerRef.current) {
      setCaptureError('Video container not available');
      return;
    }

    // Find the local video element within the LiveKit component
    const videoElement = videoContainerRef.current.querySelector('video');
    if (!videoElement) {
      setCaptureError('Video stream not available');
      return;
    }

    try {
      // Create canvas with video dimensions
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth || 640;
      canvas.height = videoElement.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setCaptureError('Could not create canvas context');
        return;
      }

      // Draw video frame to canvas
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            onSnapshotCapture?.(blob);
          } else {
            setCaptureError('Failed to create snapshot blob');
          }
        },
        'image/png',
        0.95
      );
    } catch (err) {
      setCaptureError(err instanceof Error ? err.message : 'Capture failed');
    }
  }, [onSnapshotCapture]);

  return (
    <div className="video-call flex flex-col gap-4">
      <div ref={videoContainerRef} className="video-container">
        <LiveKitVideoCall roomName={roomName} />
      </div>

      {captureError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          Capture error: {captureError}
        </div>
      )}
    </div>
  );
}

export default VideoCall;
