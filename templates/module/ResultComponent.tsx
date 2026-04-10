/**
 * ResultComponent for [MODULE_NAME]
 *
 * Displays the results of document processing.
 * This component is rendered in the kernel's results area
 * after processing completes.
 *
 * The component should handle:
 * - Error states (when result.success is false)
 * - Success states with extracted data
 * - Empty/null states gracefully
 *
 * @example
 * ```tsx
 * // In the kernel, the component is used like:
 * <ResultComponent result={processingResult} />
 * ```
 */

'use client';

import React from 'react';
import { WizideeResult } from '@/lib/modules';

/**
 * Props passed to ResultComponent by the kernel.
 */
interface ResultComponentProps {
  /** Result object from the process() function */
  result: WizideeResult;
}

/**
 * Expected data structure for extraction results.
 *
 * Customize this interface to match the actual data returned
 * by the WIZIDEE API for your document type.
 *
 * @example
 * For identity documents:
 * {
 *   firstName: string;
 *   lastName: string;
 *   dateOfBirth: string;
 *   documentNumber: string;
 * }
 */
interface MODULE_IDData {
  /** Example field - replace with actual extracted fields */
  fieldName?: string;
  /** Confidence score for the extraction (0-1) */
  confidence?: number;
  /** Document type detected by WIZIDEE */
  documentType?: string;
  /** Add your specific data fields here */
}

/**
 * Result Display Component
 *
 * Renders extraction results in a user-friendly format.
 * Shows error states, extracted data, and raw JSON for debugging.
 *
 * @param result - The WizideeResult from process()
 */
export const ResultComponent: React.FC<ResultComponentProps> = ({ result }) => {
  // Handle error state
  if (!result.success) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-red-500 text-xl">⚠️</span>
          <h4 className="font-semibold text-red-700">Processing Failed</h4>
        </div>
        <p className="text-red-600 text-sm">
          {result.error || 'An unknown error occurred during processing'}
        </p>
      </div>
    );
  }

  // Extract data with type safety
  const data = result.data as MODULE_IDData | undefined;
  const raw = result.raw;

  return (
    <div className="space-y-4">
      {/* Success header */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-green-500 text-xl">✓</span>
          <h4 className="font-semibold text-green-700">Extraction Successful</h4>
        </div>

        {/* Confidence indicator */}
        {data?.confidence !== undefined && (
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

        {/* Document type */}
        {data?.documentType && (
          <p className="text-sm text-green-600 mb-2">
            Document Type: <span className="font-medium">{data.documentType}</span>
          </p>
        )}
      </div>

      {/* Extracted data card */}
      {data && (
        <div className="bg-white p-4 rounded-lg border border-zinc-200">
          <h5 className="font-medium text-zinc-900 mb-3">Extracted Data</h5>

          {/* Replace this with your specific data fields */}
          <dl className="space-y-2">
            <div className="flex justify-between py-1 border-b border-zinc-100">
              <dt className="text-sm text-zinc-600">Field Name:</dt>
              <dd className="text-sm font-medium text-zinc-900">
                {data.fieldName || 'N/A'}
              </dd>
            </div>

            {/* Add more fields as needed */}
          </dl>

          {/* Raw data toggle */}
          {raw && (
            <details className="mt-4">
              <summary className="text-sm text-zinc-500 cursor-pointer hover:text-zinc-700">
                View Raw API Response
              </summary>
              <pre className="mt-2 p-3 bg-zinc-50 rounded text-xs overflow-auto max-h-64 text-zinc-700">
                {JSON.stringify(raw, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      {/* No data state */}
      {!data && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            Processing succeeded but no data was extracted.
          </p>
        </div>
      )}
    </div>
  );
};

export default ResultComponent;
