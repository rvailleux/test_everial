/**
 * SnapshotCapture Component
 *
 * Provides a capture button that triggers snapshot acquisition from video.
 * This is a presentational component - the actual capture logic is handled
 * by the parent via the onCapture callback.
 */

'use client';

import React from 'react';

interface SnapshotCaptureProps {
  /** Called when user clicks the capture button */
  onCapture: () => void;
  /** Whether capture is available (e.g., video is connected) */
  canCapture?: boolean;
  /** Whether capture is in progress */
  isCapturing?: boolean;
  /** Optional CSS class */
  className?: string;
}

/**
 * Capture button for acquiring snapshots from video streams.
 * The parent component is responsible for the actual capture implementation.
 */
export function SnapshotCapture({
  onCapture,
  canCapture = true,
  isCapturing = false,
  className = '',
}: SnapshotCaptureProps) {
  return (
    <button
      onClick={onCapture}
      disabled={!canCapture || isCapturing}
      className={`flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors ${className}`}
      data-testid="snapshot-capture-button"
    >
      {isCapturing ? (
        <>
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Capturing...
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          Capture
        </>
      )}
    </button>
  );
}
