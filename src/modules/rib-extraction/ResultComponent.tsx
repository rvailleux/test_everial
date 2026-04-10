/**
 * ResultComponent for RIB Extraction Module
 *
 * Displays extracted banking data with masked IBAN for security,
 * BIC code, bank name, account holder, and raw JSON for debugging.
 */

'use client';

import React, { useState } from 'react';
import { ResultProps } from '@/lib/modules/types';
import { RibData, maskIban } from './types';

/**
 * Result component for displaying RIB extraction results
 */
export function ResultComponent({ result }: ResultProps) {
  const [showRaw, setShowRaw] = useState(false);
  const [showFullIban, setShowFullIban] = useState(false);

  if (!result.success) {
    return (
      <div className="rib-result error p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h4 className="font-semibold text-red-700">Extraction Failed</h4>
        </div>
        <p className="text-red-600">{result.error || 'Unknown error occurred'}</p>
      </div>
    );
  }

  const data = result.data as RibData | undefined;

  if (!data) {
    return (
      <div className="rib-result empty p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">No banking data extracted</p>
      </div>
    );
  }

  const formatValue = (value: string | null): string => {
    return value || '—';
  };

  const displayIban = showFullIban ? data.iban : maskIban(data.iban);

  return (
    <div className="rib-result space-y-4">
      {/* Success header */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h4 className="font-semibold text-green-700">Banking Details Extracted</h4>
        </div>

        {/* Confidence indicator */}
        {data.confidence !== undefined && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600">Confidence:</span>
              <span className={`font-medium ${
                data.confidence > 0.8 ? 'text-green-600' :
                data.confidence > 0.5 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {(data.confidence * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2 bg-zinc-200 rounded-full mt-1 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  data.confidence > 0.8 ? 'bg-green-500' :
                  data.confidence > 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${data.confidence * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Banking Details Card */}
      <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
        <div className="flex items-start gap-3">
          {/* Bank Icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
          </div>

          {/* Banking Fields */}
          <div className="flex-1 space-y-4">
            {/* IBAN Field with Masking */}
            <div className="field">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                IBAN
              </label>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-mono text-lg text-zinc-900">
                  {displayIban}
                </p>
                {data.iban && (
                  <button
                    onClick={() => setShowFullIban(!showFullIban)}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                    title={showFullIban ? 'Hide full IBAN' : 'Show full IBAN'}
                  >
                    {showFullIban ? 'Mask' : 'Show'}
                  </button>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {showFullIban ? 'Full IBAN visible' : 'IBAN masked for security'}
              </p>
            </div>

            {/* BIC Field */}
            <div className="field">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                BIC / SWIFT
              </label>
              <p className="font-mono text-lg text-zinc-900">
                {formatValue(data.bic)}
              </p>
            </div>

            {/* Bank Name */}
            <div className="field">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                Bank
              </label>
              <p className="text-lg text-zinc-900">
                {formatValue(data.banque)}
              </p>
            </div>

            {/* Account Holder */}
            <div className="field">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                Account Holder
              </label>
              <p className="text-lg text-zinc-900">
                {formatValue(data.titulaire)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional RIB Details */}
      {(data.codeBanque || data.codeGuichet || data.numeroCompte || data.cleRib) && (
        <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200">
          <h5 className="font-medium text-zinc-900 mb-3">Additional RIB Details</h5>
          <dl className="grid grid-cols-2 gap-3">
            {data.codeBanque && (
              <div>
                <dt className="text-xs text-zinc-500">Bank Code</dt>
                <dd className="font-mono text-sm text-zinc-900">{data.codeBanque}</dd>
              </div>
            )}
            {data.codeGuichet && (
              <div>
                <dt className="text-xs text-zinc-500">Branch Code</dt>
                <dd className="font-mono text-sm text-zinc-900">{data.codeGuichet}</dd>
              </div>
            )}
            {data.numeroCompte && (
              <div>
                <dt className="text-xs text-zinc-500">Account Number</dt>
                <dd className="font-mono text-sm text-zinc-900">{data.numeroCompte}</dd>
              </div>
            )}
            {data.cleRib && (
              <div>
                <dt className="text-xs text-zinc-500">RIB Key</dt>
                <dd className="font-mono text-sm text-zinc-900">{data.cleRib}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Raw JSON Toggle */}
      {result.raw && (
        <div className="raw-json-section">
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-800"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showRaw ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {showRaw ? 'Hide' : 'Show'} Raw JSON
          </button>

          {showRaw && (
            <pre className="mt-2 p-4 bg-zinc-900 text-zinc-100 rounded-lg text-xs overflow-x-auto">
              {JSON.stringify(result.raw, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export default ResultComponent;
