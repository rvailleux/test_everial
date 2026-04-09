/**
 * Test Page: Module Registry System
 *
 * Manual verification page for the module registry system.
 * Demonstrates module registration, menu display, configuration, and processing.
 */

'use client';

import React from 'react';
import { ModuleProvider } from '@/lib/context/ModuleProvider';
import { ModuleMenu } from '@/components/ModuleMenu';
import { ModuleConfigPanel } from '@/components/ModuleConfigPanel';
import { registerModule, WizideeModule, WizideeResult } from '@/lib/modules';

// Test Configuration Component
interface TestConfig {
  enabled: boolean;
  threshold: number;
  mode: 'fast' | 'accurate';
}

const TestConfigComponent: React.FC<{
  config: TestConfig;
  onConfigChange: (config: Partial<TestConfig>) => void;
}> = ({ config, onConfigChange }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="enabled"
          checked={config.enabled}
          onChange={(e) => onConfigChange({ enabled: e.target.checked })}
          className="w-4 h-4"
        />
        <label htmlFor="enabled" className="text-sm font-medium">
          Enable Processing
        </label>
      </div>

      <div>
        <label htmlFor="threshold" className="block text-sm font-medium mb-1">
          Threshold: {config.threshold.toFixed(2)}
        </label>
        <input
          type="range"
          id="threshold"
          min="0"
          max="1"
          step="0.05"
          value={config.threshold}
          onChange={(e) => onConfigChange({ threshold: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>

      <div>
        <label htmlFor="mode" className="block text-sm font-medium mb-1">
          Mode
        </label>
        <select
          id="mode"
          value={config.mode}
          onChange={(e) => onConfigChange({ mode: e.target.value as 'fast' | 'accurate' })}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="fast">Fast</option>
          <option value="accurate">Accurate</option>
        </select>
      </div>
    </div>
  );
};

// Test Result Component
const TestResultComponent: React.FC<{
  result: WizideeResult;
}> = ({ result }) => {
  if (!result.success) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <h4 className="font-semibold text-red-700 mb-2">Processing Failed</h4>
        <p className="text-red-600 text-sm">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded">
      <h4 className="font-semibold text-green-700 mb-2">Processing Successful</h4>
      {result.data && (
        <div className="space-y-2">
          <p className="text-sm text-green-600">Extracted Data:</p>
          <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
            {JSON.stringify(result.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

// Register test modules
const testModule: WizideeModule<TestConfig> = {
  id: 'test-extraction',
  name: 'Test Document Extraction',
  description: 'A test module for demonstrating the registry system',
  ConfigComponent: TestConfigComponent,
  ResultComponent: TestResultComponent,
  defaultConfig: {
    enabled: true,
    threshold: 0.5,
    mode: 'accurate',
  },
  process: async (snapshot: Blob, config: TestConfig): Promise<WizideeResult> => {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (!config.enabled) {
      return {
        success: false,
        error: 'Processing is disabled in configuration',
      };
    }

    // Mock successful result
    return {
      success: true,
      data: {
        documentType: 'Test Document',
        confidence: config.threshold,
        mode: config.mode,
        processedAt: new Date().toISOString(),
        snapshotSize: snapshot.size,
      },
    };
  },
};

const identityModule: WizideeModule = {
  id: 'identity-verification',
  name: 'Identity Verification',
  description: 'Verify identity documents (CNI, Passport)',
  ConfigComponent: () => (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">Extracts: Name, DOB, Document Number, MRZ</p>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="mrz" defaultChecked className="w-4 h-4" />
        <label htmlFor="mrz" className="text-sm">Parse MRZ</label>
      </div>
    </div>
  ),
  ResultComponent: ({ result }) => (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded">
      <h4 className="font-semibold text-blue-700">Identity Data</h4>
      <pre className="text-xs mt-2">{JSON.stringify(result, null, 2)}</pre>
    </div>
  ),
  defaultConfig: {},
  process: async () => ({
    success: true,
    data: { type: 'identity', name: 'Mock Result' },
  }),
};

// Register modules (in a real app, this would happen at app initialization)
registerModule(testModule);
registerModule(identityModule);

export default function TestModuleRegistryPage() {
  return (
    <ModuleProvider>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Module Registry System Test
            </h1>
            <p className="text-gray-600 mt-2">
              Verify module registration, configuration, and processing functionality.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Module Menu */}
            <div className="md:col-span-1">
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Available Modules</h2>
                <ModuleMenu />
              </div>
            </div>

            {/* Configuration Panel */}
            <div className="md:col-span-2">
              <div className="bg-white p-4 rounded-lg shadow">
                <ModuleConfigPanel />
              </div>
            </div>
          </div>

          {/* Test Instructions */}
          <div className="mt-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Manual Test Checklist</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-gray-400">☐</span>
                Module list displays both test modules
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-400">☐</span>
                Clicking a module shows its configuration panel
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-400">☐</span>
                Config values can be changed (slider, checkbox, select)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-400">☐</span>
                Reset to Defaults restores original values
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-400">☐</span>
                Select Snapshot button works (choose any image file)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-400">☐</span>
                Process button executes and shows results
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-400">☐</span>
                Disabling processing in config and running shows error
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-400">☐</span>
                Console has no errors during any operation
              </li>
            </ul>
          </div>
        </div>
      </div>
    </ModuleProvider>
  );
}
