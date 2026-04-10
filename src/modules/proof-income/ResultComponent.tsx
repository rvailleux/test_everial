/**
 * ResultComponent for Proof of Income Module
 *
 * Displays extracted income data in a summary card with employer info
 * and raw JSON for debugging.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { ResultProps } from '@/lib/modules/types';
import { IncomeData } from './types';

/**
 * Format a currency value for display
 */
function formatCurrency(value: string | null): string {
  if (!value) return '—';

  // Try to parse and format as currency
  const numericValue = parseFloat(value.replace(/[^\d.-]/g, ''));
  if (isNaN(numericValue)) return value;

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(numericValue);
}

/**
 * Result component for displaying proof of income extraction results
 */
export function ResultComponent({ result }: ResultProps) {
  const [showRaw, setShowRaw] = useState(false);

  if (!result.success) {
    return (
      <div className="income-result error p-4 bg-red-50 border border-red-200 rounded-lg">
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

  const data = result.data as IncomeData | undefined;

  if (!data) {
    return (
      <div className="income-result empty p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">No income data extracted</p>
      </div>
    );
  }

  const formatValue = (value: string | null): string => {
    return value || '—';
  };

  // Determine if this looks like a payslip or tax notice based on available fields
  const isPayslip = useMemo(() => {
    return data.grossPay !== null || data.netPay !== null || data.employeeName !== null;
  }, [data]);

  return (
    <div className="income-result space-y-4">
      {/* Success header */}
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h4 className="font-semibold text-green-700">Income Data Extracted Successfully</h4>
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

      {/* Income Summary Card */}
      <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
        <div className="flex items-start gap-3">
          {/* Income Icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Income Details */}
          <div className="flex-1">
            <h5 className="font-medium text-zinc-900 mb-3">
              {isPayslip ? 'Pay Slip Summary' : 'Income Summary'}
            </h5>

            {/* Primary Income Display */}
            {data.revenus && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-700 uppercase tracking-wide">Income Amount</p>
                <p className="text-2xl font-bold text-green-800">
                  {formatCurrency(data.revenus)}
                </p>
              </div>
            )}

            {/* Detailed Breakdown for Payslip */}
            {isPayslip && (data.grossPay || data.netPay) && (
              <div className="space-y-2 text-sm border-t border-zinc-100 pt-3">
                {data.grossPay && (
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Gross Pay:</span>
                    <span className="font-medium">{formatCurrency(data.grossPay)}</span>
                  </div>
                )}
                {data.netPay && (
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Net Pay:</span>
                    <span className="font-medium text-green-700">{formatCurrency(data.netPay)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Employer / Source Info */}
      <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200">
        <h5 className="font-medium text-zinc-900 mb-3">
          {isPayslip ? 'Employment Details' : 'Document Source'}
        </h5>
        <dl className="space-y-2">
          <div className="flex justify-between py-1 border-b border-zinc-200 last:border-0">
            <dt className="text-sm text-zinc-600">
              {isPayslip ? 'Employer:' : 'Tax Authority:'}
            </dt>
            <dd className="text-sm font-medium text-zinc-900">{formatValue(data.employeur)}</dd>
          </div>
          {data.employeeName && (
            <div className="flex justify-between py-1 border-b border-zinc-200 last:border-0">
              <dt className="text-sm text-zinc-600">Employee:</dt>
              <dd className="text-sm font-medium text-zinc-900">{formatValue(data.employeeName)}</dd>
            </div>
          )}
          <div className="flex justify-between py-1 border-b border-zinc-200 last:border-0">
            <dt className="text-sm text-zinc-600">Period:</dt>
            <dd className="text-sm font-medium text-zinc-900">{formatValue(data.periode)}</dd>
          </div>
          <div className="flex justify-between py-1 border-b border-zinc-200 last:border-0">
            <dt className="text-sm text-zinc-600">Document Date:</dt>
            <dd className="text-sm font-medium text-zinc-900">{formatValue(data.dateDocument)}</dd>
          </div>
          {data.taxYear && (
            <div className="flex justify-between py-1 border-b border-zinc-200 last:border-0">
              <dt className="text-sm text-zinc-600">Tax Year:</dt>
              <dd className="text-sm font-medium text-zinc-900">{formatValue(data.taxYear)}</dd>
            </div>
          )}
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
