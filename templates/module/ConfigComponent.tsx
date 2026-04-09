/**
 * ConfigComponent for [MODULE_NAME]
 *
 * Provides UI for configuring module options before processing.
 */

'use client';

import React from 'react';

export interface MODULE_IDConfig {
  enabled: boolean;
  threshold: number;
  // Add your configuration fields here
}

interface ConfigComponentProps {
  config: MODULE_IDConfig;
  onConfigChange: (config: Partial<MODULE_IDConfig>) => void;
}

export const ConfigComponent: React.FC<ConfigComponentProps> = ({
  config,
  onConfigChange,
}) => {
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
          Confidence Threshold: {config.threshold.toFixed(2)}
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

      {/* Add your custom configuration fields here */}
    </div>
  );
};

export default ConfigComponent;
