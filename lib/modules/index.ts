/**
 * Module Registry - Public API
 *
 * Export all module registry types and functions.
 */

export * from './types';
export {
  createModuleRegistry,
  registerModule,
  getModule,
  getAllModules,
  clearRegistry,
  registry,
} from './registry';
export type { ModuleRegistry } from './registry';
