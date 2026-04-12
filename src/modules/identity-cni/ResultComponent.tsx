/**
 * ResultComponent for Identity CNI/Passport Module
 *
 * Displays extracted identity data in an ID card format with photo placeholder
 * and raw JSON for debugging.
 */

'use client';

import React, { useState } from 'react';
import { ResultProps } from '@/lib/modules/types';
import { IdentityData } from './types';

/**
 * Result component for displaying identity document extraction results
 */
export function ResultComponent({ result }: ResultProps) {
  const [showRaw, setShowRaw] = useState(false);

  if (!result.success) {
    return (
      <div className="identity-result error p-4 bg-red-50 border border-red-200 rounded-lg">
        <h4 className="font-semibold text-red-700 mb-2">Extraction Failed</h4>
        <p className="text-red-600">{result.error || 'Unknown error occurred'}</p>
      </div>
    );
  }

  const data = result.data as IdentityData | undefined;

  if (!data) {
    return (
      <div className="identity-result empty p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">No data extracted</p>
      </div>
    );
  }

  const formatValue = (value: string | null): string => {
    return value || '—';
  };

  return (
    <div className="identity-result space-y-4">
      {/* ID Card Display */}
      <div className="id-card bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6 shadow-sm">
        <div className="flex gap-4">
          {/* Photo */}
          <div className="photo-placeholder flex-shrink-0">
            {data.photo ? (
              <img
                src={data.photo}
                alt="Photo"
                className="w-24 h-32 object-cover rounded border-2 border-zinc-300"
              />
            ) : (
              <div className="w-24 h-32 bg-zinc-200 border-2 border-zinc-300 rounded flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
            <p className="text-xs text-zinc-500 text-center mt-1">Photo</p>
          </div>

          {/* Identity Fields */}
          <div className="identity-fields flex-1 space-y-3">
            <div className="field">
              <label className="block text-xs font-semibold text-blue-700 uppercase tracking-wide">
                Nom / Last Name
              </label>
              <p className="text-lg font-medium text-zinc-900">
                {formatValue(data.nom)}
              </p>
            </div>

            <div className="field">
              <label className="block text-xs font-semibold text-blue-700 uppercase tracking-wide">
                Prénom / First Name
              </label>
              <p className="text-lg font-medium text-zinc-900">
                {formatValue(data.prenom)}
              </p>
            </div>

            <div className="field">
              <label className="block text-xs font-semibold text-blue-700 uppercase tracking-wide">
                Lieu de Naissance
              </label>
              <p className="text-sm font-medium text-zinc-900">
                {formatValue(data.lieuNaissance)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="field">
                <label className="block text-xs font-semibold text-blue-700 uppercase tracking-wide">
                  Date de Naissance
                </label>
                <p className="text-sm font-medium text-zinc-900">
                  {formatValue(data.dateNaissance)}
                </p>
              </div>

              <div className="field">
                <label className="block text-xs font-semibold text-blue-700 uppercase tracking-wide">
                  Date d&apos;Expiration
                </label>
                <p className="text-sm font-medium text-zinc-900">
                  {formatValue(data.dateExpiration)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="field">
                <label className="block text-xs font-semibold text-blue-700 uppercase tracking-wide">
                  Numéro de Document
                </label>
                <p className="text-sm font-medium text-zinc-900">
                  {formatValue(data.numeroDocument)}
                </p>
              </div>

              <div className="field">
                <label className="block text-xs font-semibold text-blue-700 uppercase tracking-wide">
                  Sexe
                </label>
                <p className="text-sm font-medium text-zinc-900">
                  {formatValue(data.sexe)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MRZ Section */}
        <div className="mt-4 pt-4 border-t border-blue-200">
          <label className="block text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
            MRZ (Machine Readable Zone)
          </label>
          <p className="font-mono text-sm bg-white/50 p-2 rounded border border-blue-200 overflow-x-auto">
            {formatValue(data.mrz)}
          </p>
        </div>
      </div>

      {/* Raw JSON Toggle */}
      <div className="raw-json-section">
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          {showRaw ? 'Hide' : 'Show'} Raw JSON
        </button>

        {showRaw && (
          <pre className="mt-2 p-4 bg-zinc-900 text-zinc-100 rounded-lg text-xs overflow-x-auto">
            {JSON.stringify(result.raw, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
