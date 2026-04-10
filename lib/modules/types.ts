/**
 * TypeScript types for the Module Registry System
 *
 * These types define the interface between kernel and modules.
 * All modules MUST implement WizideeModule interface.
 */

import { FC } from 'react';

/**
 * Result returned by module process() function
 */
export interface ProcessResult {
  /** Whether processing succeeded */
  success: boolean;
  /** Extracted document data (human-readable structure) */
  data?: unknown;
  /** Raw WIZIDEE API response */
  raw?: unknown;
  /** Error message if processing failed */
  error?: string;
}

/**
 * Props passed to ConfigComponent
 */
export interface ConfigProps<TConfig = Record<string, unknown>> {
  /** Current configuration values */
  config: TConfig;
  /** Called when configuration changes - partial updates supported */
  onConfigChange: (config: Partial<TConfig>) => void;
}

/**
 * Props passed to ResultComponent
 */
export interface ResultProps {
  /** Result from process() function */
  result: ProcessResult;
}

/**
 * Interface that all WIZIDEE document processing modules MUST implement
 */
export interface WizideeModule<TConfig = Record<string, unknown>> {
  /** Unique kebab-case identifier (e.g., 'identity-cni') */
  id: string;
  /** Display name shown in kernel menu */
  name: string;
  /** Brief description for tooltips and documentation */
  description: string;

  /** Configuration UI component - rendered in kernel's config area */
  ConfigComponent: FC<ConfigProps<TConfig>>;

  /** Results display component - rendered in kernel's results area */
  ResultComponent: FC<ResultProps>;

  /**
   * Processing function - called when user clicks "Process"
   * @param snapshot - Captured document image/video frame
   * @param config - Current module configuration
   * @returns Promise resolving to extraction results
   */
  process: (snapshot: Blob, config: TConfig) => Promise<ProcessResult>;

  /** Default configuration values */
  defaultConfig: TConfig;
}
