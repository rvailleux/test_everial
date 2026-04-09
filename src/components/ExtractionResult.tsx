'use client';

import React, { useState } from 'react';
import type { ExtractionResult as ExtractionResultType } from '@/lib/types';

interface Props {
  result: ExtractionResultType;
  documentType?: string;
}

const FIELD_LABELS: Record<string, string> = {
  lastName: 'Last name',
  firstName: 'First name',
  dateOfBirth: 'Date of birth',
  expiryDate: 'Expiry date',
  mrz: 'MRZ',
  nationality: 'Nationality',
};

function getDocumentBadgeLabel(documentType?: string): string | null {
  if (!documentType) return null;
  if (documentType.includes('CNI')) return 'CNI';
  if (documentType.includes('PASSPORT')) return 'PASSPORT';
  return documentType;
}

function MrzValue({ value }: { value: string }) {
  const lines = value.split('\n');
  return (
    <pre className="font-mono text-xs whitespace-pre-wrap break-all">
      {lines.join('\n')}
    </pre>
  );
}

export default function ExtractionResult({ result, documentType }: Props) {
  const [showRaw, setShowRaw] = useState(false);

  const badgeLabel = getDocumentBadgeLabel(documentType);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Document type badge */}
      {badgeLabel && (
        <span className="self-start px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
          {badgeLabel}
        </span>
      )}

      {/* Field card */}
      <div className="rounded-xl border border-zinc-200 overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {Object.entries(result.fields).map(([key, value]) => (
              <tr key={key} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3 font-medium text-zinc-500 w-1/3">
                  {FIELD_LABELS[key] ?? key}
                </td>
                <td className="px-4 py-3 text-zinc-900">
                  {value === null ? (
                    <span className="text-zinc-400">—</span>
                  ) : key === 'mrz' && value.includes('\n') ? (
                    <MrzValue value={value} />
                  ) : (
                    value
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Raw JSON toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowRaw((v) => !v)}
          className="text-sm text-zinc-500 underline"
        >
          {showRaw ? 'Hide' : 'Show'} Raw JSON
        </button>
        {showRaw && (
          <pre className="mt-2 p-4 bg-zinc-50 rounded-lg text-xs overflow-x-auto border border-zinc-200">
            {JSON.stringify(result.raw, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
