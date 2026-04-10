/**
 * ResultComponent for Proof of Address Module
 *
 * Displays extracted address data in a formatted address block with map link
 * and raw JSON for debugging.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { ResultProps } from '@/lib/modules/types';
import { AddressData } from './types';

/**
 * Result component for displaying proof of address extraction results
 */
export function ResultComponent({ result }: ResultProps) {
  const [showRaw, setShowRaw] = useState(false);

  if (!result.success) {
    return (
      <div className="address-result error p-4 bg-red-50 border border-red-200 rounded-lg">
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

  const data = result.data as AddressData | undefined;

  if (!data) {
    return (
      <div className="address-result empty p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">No address data extracted</p>
      </div>
    );
  }

  const formatValue = (value: string | null): string => {
    return value || '—';
  };

  // Build full address for map link
  const mapAddress = useMemo(() => {
    const parts = [data.rue, data.codePostal, data.ville, data.pays].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : data.adresse || '';
  }, [data]);

  const mapUrl = useMemo(() => {
    if (!mapAddress) return null;
    const encoded = encodeURIComponent(mapAddress);
    return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
  }, [mapAddress]);

  return (
    <div className="address-result space-y-4">
      {/* Success header */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h4 className="font-semibold text-green-700">Address Extracted Successfully</h4>
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

      {/* Address Card */}
      <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
        <div className="flex items-start gap-3">
          {/* Address Icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          {/* Address Block */}
          <div className="flex-1">
            <h5 className="font-medium text-zinc-900 mb-2">Extracted Address</h5>
            <div className="space-y-1 text-sm">
              {data.rue && (
                <p className="text-zinc-800">{data.rue}</p>
              )}
              {(data.codePostal || data.ville) && (
                <p className="text-zinc-800">
                  {[data.codePostal, data.ville].filter(Boolean).join(' ')}
                </p>
              )}
              {data.pays && (
                <p className="text-zinc-800">{data.pays}</p>
              )}
              {!data.rue && data.adresse && (
                <p className="text-zinc-800 whitespace-pre-line">{data.adresse}</p>
              )}
            </div>

            {/* Map Link */}
            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7m0 0L9 4" />
                </svg>
                View on Map
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Document Details */}
      <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200">
        <h5 className="font-medium text-zinc-900 mb-3">Document Details</h5>
        <dl className="space-y-2">
          <div className="flex justify-between py-1 border-b border-zinc-200 last:border-0">
            <dt className="text-sm text-zinc-600">Issuer (Émetteur):</dt>
            <dd className="text-sm font-medium text-zinc-900">{formatValue(data.emetteur)}</dd>
          </div>
          <div className="flex justify-between py-1 border-b border-zinc-200 last:border-0">
            <dt className="text-sm text-zinc-600">Document Date:</dt>
            <dd className="text-sm font-medium text-zinc-900">{formatValue(data.dateDocument)}</dd>
          </div>
          <div className="flex justify-between py-1 border-b border-zinc-200 last:border-0">
            <dt className="text-sm text-zinc-600">Reference:</dt>
            <dd className="text-sm font-medium text-zinc-900">{formatValue(data.reference)}</dd>
          </div>
        </dl>
      </div>

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
            {showRaw ? 'Hide' : 'Show'} Raw API Response
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
