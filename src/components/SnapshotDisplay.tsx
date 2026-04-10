/**
 * SnapshotDisplay Component
 *
 * Displays a captured snapshot alongside module processing results.
 * Follows the single-page workflow principle: results are shown
 * on the same page alongside the snapshot, not on a separate page.
 */

'use client';

import React from 'react';
import { WizideeResult } from '@/lib/modules/types';

interface SnapshotDisplayProps {
  /** Object URL of the captured snapshot image */
  snapshotUrl: string;
  /** Alt text for the snapshot image */
  snapshotAlt?: string;
  /** Processing result to display alongside the snapshot */
  result?: WizideeResult | null;
  /** Error message if processing failed */
  error?: string | null;
  /** Optional result component to render for the active module */
  ResultComponent?: React.ComponentType<{ result: WizideeResult }>;
  /** Optional CSS class */
  className?: string;
}

/**
 * Displays a captured snapshot with optional processing results.
 * Layout shows snapshot on the left and results panel on the right (on desktop),
 * or stacked on mobile.
 */
export function SnapshotDisplay({
  snapshotUrl,
  snapshotAlt = 'Captured document',
  result,
  error,
  ResultComponent,
  className = '',
}: SnapshotDisplayProps) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {/* Snapshot section */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
        <h3 className="text-sm font-medium text-zinc-700 mb-3">Captured Snapshot</h3>
        <div className="relative rounded-lg overflow-hidden border border-zinc-200">
          <img
            src={snapshotUrl}
            alt={snapshotAlt}
            className="w-full h-auto object-contain max-h-[500px]"
            data-testid="snapshot-image"
          />
        </div>
      </div>

      {/* Results section */}
      <div className="space-y-4">
        {/* Error display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700" data-testid="snapshot-error">
            <div className="flex items-center gap-2 mb-2">
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
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <strong>Processing Error</strong>
            </div>
            {error}
          </div>
        )}

        {/* Results display */}
        {result && (
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4" data-testid="snapshot-result">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-zinc-100">
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
                className={result.success ? 'text-green-600' : 'text-amber-600'}
              >
                {result.success ? (
                  <>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </>
                ) : (
                  <>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </>
                )}
              </svg>
              <h3 className="text-sm font-medium text-zinc-700">
                {result.success ? 'Processing Results' : 'Processing Failed'}
              </h3>
            </div>

            {ResultComponent ? (
              <ResultComponent result={result} />
            ) : (
              <div className="space-y-2">
                {result.data && (
                  <div className="bg-zinc-50 rounded-lg p-3">
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                      Extracted Data
                    </h4>
                    <pre className="text-sm text-zinc-700 overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
                {result.raw && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-zinc-500 hover:text-zinc-700">
                      Raw Response
                    </summary>
                    <pre className="mt-2 p-3 bg-zinc-50 rounded-lg text-xs text-zinc-600 overflow-x-auto">
                      {JSON.stringify(result.raw, null, 2)}
                    </pre>
                  </details>
                )}
                {result.error && (
                  <p className="text-sm text-red-600">{result.error}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* No results yet */}
        {!result && !error && (
          <div className="bg-zinc-50 rounded-xl border border-zinc-200 border-dashed p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto text-zinc-300 mb-3"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <p className="text-zinc-500 text-sm">
              Select a module and click Process to analyze the captured document
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
