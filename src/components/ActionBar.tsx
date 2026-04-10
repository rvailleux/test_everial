/**
 * ActionBar Component
 *
 * Provides Capture and Process buttons for the kernel.
 * Capture: Acquires snapshot from video stream
 * Process: Triggers module.process() with captured snapshot
 */

'use client';

import React from 'react';

interface ActionBarProps {
  /** Called when user clicks Capture button */
  onCapture: () => void;
  /** Called when user clicks Process button */
  onProcess: () => void;
  /** Whether Process button should be enabled */
  canProcess: boolean;
  /** Whether processing is in progress (shows loading state) */
  isProcessing: boolean;
  /** Whether capture is available */
  canCapture?: boolean;
}

export function ActionBar({
  onCapture,
  onProcess,
  canProcess,
  isProcessing,
  canCapture = true,
}: ActionBarProps) {
  return (
    <div className="action-bar flex items-center justify-center gap-4 p-4 bg-white rounded-lg border border-zinc-200">
      <button
        onClick={onCapture}
        disabled={!canCapture}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        data-testid="capture-button"
      >
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
      </button>

      <button
        onClick={onProcess}
        disabled={!canProcess || isProcessing}
        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        data-testid="process-button"
      >
        {isProcessing ? (
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
            Processing...
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
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
              <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
            </svg>
            Process
          </>
        )}
      </button>
    </div>
  );
}
