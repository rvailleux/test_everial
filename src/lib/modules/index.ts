/**
 * Module Registry Public API
 *
 * Export all types and functions for module registration and retrieval.
 */

// Types
export type {
  WizideeModule,
  WizideeResult,
  ConfigProps,
  ResultProps,
  RegisterModule,
  GetModule,
  GetAllModules,
  ModuleContextValue,
  UseActiveModuleReturn,
  UseModuleConfigReturn,
} from './types';

// Registry functions
export {
  createModuleRegistry,
  registerModule,
  getModule,
  getAllModules,
  registry,
} from './registry';

// Re-export registry type
export type { ModuleRegistry } from './registry';
