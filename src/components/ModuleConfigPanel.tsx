/**
 * ModuleConfigPanel Component
 *
 * Renders the configuration UI for the currently active module.
 * Includes processing execution and result display.
 */

'use client';

import React, { useState } from 'react';
import { useActiveModule } from '@/lib/hooks/useActiveModule';
import { useModuleConfig } from '@/lib/hooks/useModuleConfig';
import { useModuleProcess } from '@/lib/hooks/useModuleProcess';

export function ModuleConfigPanel() {
  const { activeModule } = useActiveModule();
  const { config, setConfig, resetConfig } = useModuleConfig();
  const { result, isProcessing, error, process, clearResult } = useModuleProcess();
  const [snapshot, setSnapshot] = useState<Blob | null>(null);

  if (!activeModule) {
    return (
      <div className="module-config-panel p-4 border rounded">
        <p className="text-gray-500">Select a module to configure</p>
      </div>
    );
  }

  const { ConfigComponent, ResultComponent, name, description } = activeModule;

  const handleProcess = async () => {
    if (!snapshot) {
      // For testing purposes, create a mock blob if none provided
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      await process(mockBlob);
    } else {
      await process(snapshot);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSnapshot(file);
      clearResult();
    }
  };

  return (
    <div className="module-config-panel p-4 border rounded">
      <h3 className="text-lg font-semibold mb-1">{name} Configuration</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>

      <div className="config-form mb-4">
        <ConfigComponent config={config} onConfigChange={setConfig} />
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={resetConfig}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          disabled={isProcessing}
        >
          Reset to Defaults
        </button>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="snapshot-input"
        />
        <label
          htmlFor="snapshot-input"
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
        >
          {snapshot ? 'Change Snapshot' : 'Select Snapshot'}
        </label>

        <button
          onClick={handleProcess}
          disabled={isProcessing}
          className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : 'Process'}
        </button>
      </div>

      {snapshot && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">Snapshot: {(snapshot as File).name || 'Captured'}</p>
        </div>
      )}

      {error && (
        <div className="error-message p-3 mb-4 bg-red-50 border border-red-200 rounded text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="results-section mt-4">
          <h4 className="font-semibold mb-2">Results</h4>
          <ResultComponent result={result} />
        </div>
      )}
    </div>
  );
}
