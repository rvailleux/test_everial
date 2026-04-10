/**
 * ConfigComponent for Proof of Address Module
 *
 * Provides UI for configuring document category (utility/tax/telecom/auto).
 */

'use client';

import React from 'react';
import { ConfigProps } from '@/lib/modules/types';
import { AddressConfig, AddressDocumentCategory, categoryLabels } from './types';

/**
 * Configuration component for proof of address document processing
 */
export function ConfigComponent({ config, onConfigChange }: ConfigProps<AddressConfig>) {
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onConfigChange({ documentCategory: e.target.value as AddressDocumentCategory });
  };

  const handleRawResponseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onConfigChange({ includeRawResponse: e.target.checked });
  };

  return (
    <div className="address-config space-y-4">
      <div className="config-field">
        <label
          htmlFor="document-category"
          className="block text-sm font-medium text-zinc-700 mb-1"
        >
          Document Category
        </label>
        <select
          id="document-category"
          value={config.documentCategory}
          onChange={handleCategoryChange}
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="utility">{categoryLabels.utility}</option>
          <option value="tax">{categoryLabels.tax}</option>
          <option value="telecom">{categoryLabels.telecom}</option>
          <option value="auto">{categoryLabels.auto}</option>
        </select>
        <p className="text-xs text-zinc-500 mt-1">
          Select the type of address document, or choose Auto-detect to let WIZIDEE identify it
        </p>
      </div>

      <div className="config-field">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="include-raw"
            checked={config.includeRawResponse}
            onChange={handleRawResponseChange}
            className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
          />
          <label
            htmlFor="include-raw"
            className="text-sm font-medium text-zinc-700"
          >
            Include Raw API Response
          </label>
        </div>
        <p className="text-xs text-zinc-500 mt-1 ml-6">
          Include the complete WIZIDEE API response for debugging
        </p>
      </div>

      <div className="config-summary text-sm text-zinc-600 bg-zinc-50 p-3 rounded">
        <p>
          <strong>Current:</strong> {' '}
          {categoryLabels[config.documentCategory]}
        </p>
      </div>
    </div>
  );
}

export default ConfigComponent;
