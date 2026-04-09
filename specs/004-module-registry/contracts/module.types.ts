/**
 * TypeScript contracts for the Module Registry System
 *
 * These types define the interface between kernel and modules.
 * All modules MUST implement WizideeModule interface.
 */

import { FC } from 'react';

/**
 * Result returned by module process() function
 */
export interface WizideeResult {
  /** Whether processing succeeded */
  success: boolean;
  /** Extracted document data (human-readable structure) */
  data?: any;
  /** Raw WIZIDEE API response */
  raw?: any;
  /** Error message if processing failed */
  error?: string;
}

/**
 * Props passed to ConfigComponent
 */
export interface ConfigProps<T = Record<string, any>> {
  /** Current configuration values */
  config: T;
  /** Called when configuration changes */
  onConfigChange: (config: T) => void;
}

/**
 * Props passed to ResultComponent
 */
export interface ResultProps {
  /** Result from process() function */
  result: WizideeResult;
}

/**
 * Interface that all WIZIDEE document processing modules MUST implement
 */
export interface WizideeModule<TConfig = Record<string, any>> {
  /** Unique kebab-case identifier (e.g., 'identity-cni') */
  id: string;
  /** Display name shown in kernel menu */
  name: string;
  /** Brief description for tooltips and documentation */
  description: string;
  /** Optional icon identifier (Lucide icon name) */
  icon?: string;

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
  process: (snapshot: Blob, config: TConfig) => Promise<WizideeResult>;

  /** Default configuration values */
  defaultConfig: TConfig;
}

/**
 * Module registration function type
 */
export type RegisterModule = <TConfig>(module: WizideeModule<TConfig>) => void;

/**
 * Module retrieval function type
 */
export type GetModule = <TConfig>(id: string) => WizideeModule<TConfig> | undefined;

/**
 * Get all modules function type
 */
export type GetAllModules = () => WizideeModule[];

/**
 * Context value provided by ModuleProvider
 */
export interface ModuleContextValue {
  /** All registered modules */
  modules: WizideeModule[];
  /** Currently selected module ID */
  activeModuleId: string | null;
  /** Set the active module by ID */
  setActiveModule: (id: string) => void;
  /** Get configuration for a specific module */
  getModuleConfig: <T>(id: string) => T;
  /** Set configuration for a specific module */
  setModuleConfig: <T>(id: string, config: T) => void;
  /** Reset configuration to default for a specific module */
  resetModuleConfig: (id: string) => void;
}

/**
 * Return type for useActiveModule hook
 */
export interface UseActiveModuleReturn {
  /** Currently active module or null if none selected */
  activeModule: WizideeModule | null;
  /** Set active module by ID */
  setActiveModule: (id: string) => void;
  /** Clear active module selection */
  clearActiveModule: () => void;
}

/**
 * Return type for useModuleConfig hook
 */
export interface UseModuleConfigReturn<T> {
  /** Current configuration values */
  config: T;
  /** Update configuration (partial updates supported) */
  setConfig: (config: Partial<T>) => void;
  /** Reset configuration to default values */
  resetConfig: () => void;
}
