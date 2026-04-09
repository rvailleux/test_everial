/**
 * ResultComponent for [MODULE_NAME]
 *
 * Displays the results of document processing.
 */

'use client';

import React from 'react';
import { WizideeResult } from '@/lib/modules';

interface ResultComponentProps {
  result: WizideeResult;
}

interface MODULE_IDData {
  // Define your expected data structure
  fieldName?: string;
  confidence?: number;
  // Add your data fields
}

export const ResultComponent: React.FC<ResultComponentProps> = ({ result }) => {
  if (!result.success) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <h4 className="font-semibold text-red-700 mb-2">Processing Failed</h4>
        <p className="text-red-600 text-sm">{result.error}</p>
      </div>
    );
  }

  const data = result.data as MODULE_IDData | undefined;

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded">
      <h4 className="font-semibold text-green-700 mb-2">Extraction Successful</h4>

      {data && (
        <div className="space-y-2">
          <p className="text-sm text-green-600">Extracted Data:</p>
          <div className="bg-white p-3 rounded border">
            {/* Replace with your data display */}
            <pre className="text-xs overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Add your custom result display here */}
    </div>
  );
};

export default ResultComponent;
