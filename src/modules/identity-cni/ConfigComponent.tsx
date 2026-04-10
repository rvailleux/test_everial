/**
 * ConfigComponent for Identity CNI/Passport Module
 *
 * Provides UI for configuring document type (CNI/Passport) and region (FR/EU/Other).
 */

'use client';

import React from 'react';
import { ConfigProps } from '@/lib/modules/types';
import { IdentityConfig, DocumentType, Region } from './types';

/**
 * Configuration component for identity document processing
 */
export function ConfigComponent({ config, onConfigChange }: ConfigProps<IdentityConfig>) {
  const handleDocumentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onConfigChange({ documentType: e.target.value as DocumentType });
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onConfigChange({ region: e.target.value as Region });
  };

  return (
    <div className="identity-config space-y-4">
      <div className="config-field">
        <label
          htmlFor="document-type"
          className="block text-sm font-medium text-zinc-700 mb-1"
        >
          Document Type
        </label>
        <select
          id="document-type"
          value={config.documentType}
          onChange={handleDocumentTypeChange}
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="cni">Carte Nationale d&apos;Identité (CNI)</option>
          <option value="passport">Passport</option>
        </select>
        <p className="text-xs text-zinc-500 mt-1">
          Select the type of identity document
        </p>
      </div>

      <div className="config-field">
        <label
          htmlFor="region"
          className="block text-sm font-medium text-zinc-700 mb-1"
        >
          Region
        </label>
        <select
          id="region"
          value={config.region}
          onChange={handleRegionChange}
          className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="FR">France</option>
          <option value="EU">European Union</option>
          <option value="OTHER">Other</option>
        </select>
        <p className="text-xs text-zinc-500 mt-1">
          Select the region of issuance
        </p>
      </div>

      <div className="config-summary text-sm text-zinc-600 bg-zinc-50 p-3 rounded">
        <p>
          <strong>Current:</strong>{' '}
          {config.documentType === 'cni' ? 'CNI' : 'Passport'} ({config.region})
        </p>
      </div>
    </div>
  );
}
