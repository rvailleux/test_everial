/**
 * ConfigComponent for RIB Extraction Module
 *
 * Minimal configuration component - RIB detection is fully automatic.
 * No user-configurable options needed as WIZIDEE auto-detects RIB documents.
 */

'use client';

import React from 'react';
import { ConfigProps } from '@/lib/modules/types';
import { RibConfig } from './types';

/**
 * Configuration component for RIB extraction
 *
 * Since RIB detection is automatic, this component simply displays
 * an informational message about the auto-detect feature.
 */
export function ConfigComponent({ config }: ConfigProps<RibConfig>) {
  return (
    <div className="rib-config space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-blue-900">Automatic Detection</h4>
            <p className="text-sm text-blue-700 mt-1">
              RIB documents are detected automatically. Simply capture a clear image
              of your Relevé d&apos;Identité Bancaire and click Process.
            </p>
          </div>
        </div>
      </div>

      <div className="config-summary text-sm text-zinc-600 bg-zinc-50 p-3 rounded">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <p>
            <strong>Status:</strong>{' '}
            {config.autoDetect ? 'Auto-detect enabled' : 'Manual mode'}
          </p>
        </div>
      </div>

      <div className="text-xs text-zinc-500 space-y-1">
        <p>Extracted data includes:</p>
        <ul className="list-disc list-inside ml-2 space-y-1">
          <li>IBAN (International Bank Account Number)</li>
          <li>BIC / SWIFT code</li>
          <li>Bank name</li>
          <li>Account holder name</li>
        </ul>
      </div>
    </div>
  );
}

export default ConfigComponent;
