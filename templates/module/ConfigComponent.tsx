/**
 * ConfigComponent for [MODULE_NAME]
 *
 * Provides UI for configuring module options before processing.
 * This component is rendered in the kernel's configuration panel
 * when the user selects this module.
 *
 * @example
 * ```tsx
 * // In the kernel, the component is used like:
 * <ConfigComponent
 *   config={currentConfig}
 *   onConfigChange={(updates) => setConfig({ ...config, ...updates })}
 * />
 * ```
 */

'use client';

import React from 'react';

/**
 * Configuration interface for this module.
 *
 * Define all configurable options here. These values are passed
 * to the process() function when the user clicks "Process".
 *
 * Copy-paste and customize for your module's needs.
 */
export interface MODULE_IDConfig {
  /** Master toggle - if false, processing will be skipped */
  enabled: boolean;
  /** Minimum confidence threshold for accepting extraction results (0-1) */
  confidenceThreshold: number;
  /** Document subtype filter - empty string means "auto-detect" */
  documentType: string;
  /** Whether to include raw API response in results */
  includeRawResponse: boolean;
}

/**
 * Props passed to ConfigComponent by the kernel.
 *
 * The kernel manages config state and passes these props.
 * Use onConfigChange with partial updates - the kernel merges them.
 */
interface ConfigComponentProps {
  /** Current configuration values */
  config: MODULE_IDConfig;
  /** Called when any config value changes - supports partial updates */
  onConfigChange: (config: Partial<MODULE_IDConfig>) => void;
}

/**
 * Configuration UI Component
 *
 * Renders form controls for module configuration.
 * Keep the UI simple and focused on the most important options.
 *
 * @param config - Current configuration values
 * @param onConfigChange - Callback to update configuration
 */
export const ConfigComponent: React.FC<ConfigComponentProps> = ({
  config,
  onConfigChange,
}) => {
  return (
    <div className="space-y-4">
      {/* Enabled Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="enabled"
          checked={config.enabled}
          onChange={(e) => onConfigChange({ enabled: e.target.checked })}
          className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="enabled" className="text-sm font-medium text-zinc-700">
          Enable Processing
        </label>
      </div>

      {/* Confidence Threshold Slider */}
      <div>
        <label htmlFor="threshold" className="block text-sm font-medium text-zinc-700 mb-1">
          Confidence Threshold: {(config.confidenceThreshold * 100).toFixed(0)}%
        </label>
        <input
          type="range"
          id="threshold"
          min="0"
          max="1"
          step="0.05"
          value={config.confidenceThreshold}
          onChange={(e) => onConfigChange({ confidenceThreshold: parseFloat(e.target.value) })}
          className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
        />
        <p className="text-xs text-zinc-500 mt-1">
          Higher values require more confidence in extraction results
        </p>
      </div>

      {/* Document Type Selector */}
      <div>
        <label htmlFor="docType" className="block text-sm font-medium text-zinc-700 mb-1">
          Document Type
        </label>
        <select
          id="docType"
          value={config.documentType}
          onChange={(e) => onConfigChange({ documentType: e.target.value })}
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="">Auto-detect</option>
          <option value="type1">Type 1</option>
          <option value="type2">Type 2</option>
          <option value="type3">Type 3</option>
        </select>
        <p className="text-xs text-zinc-500 mt-1">
          Leave as "Auto-detect" to let WIZIDEE identify the document
        </p>
      </div>

      {/* Include Raw Response Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="includeRaw"
          checked={config.includeRawResponse}
          onChange={(e) => onConfigChange({ includeRawResponse: e.target.checked })}
          className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="includeRaw" className="text-sm font-medium text-zinc-700">
          Include Raw API Response
        </label>
      </div>

      {/* Add your custom configuration fields below */}
    </div>
  );
};

export default ConfigComponent;
