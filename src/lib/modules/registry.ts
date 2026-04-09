/**
 * Module Registry Implementation
 *
 * Provides registration, retrieval, and management of WIZIDEE modules.
 */

import { WizideeModule } from './types';

/**
 * Module registry interface
 */
export interface ModuleRegistry {
  /**
   * Register a new module with the kernel
   * @param module - Complete module descriptor
   * @throws Error if module is missing required fields
   * @warns Console warning if module ID already exists (overwrites)
   */
  register: <TConfig>(module: WizideeModule<TConfig>) => void;

  /**
   * Retrieve a specific module by ID
   * @param id - Module identifier
   * @returns Module descriptor or undefined if not found
   */
  get: <TConfig>(id: string) => WizideeModule<TConfig> | undefined;

  /**
   * Retrieve all registered modules
   * @returns Array of all module descriptors
   */
  getAll: () => WizideeModule[];

  /**
   * Check if a module with given ID exists
   * @param id - Module identifier
   * @returns true if module exists
   */
  has: (id: string) => boolean;

  /**
   * Unregister a module by ID
   * @param id - Module identifier
   * @returns true if module was removed, false if not found
   */
  unregister: (id: string) => boolean;

  /**
   * Get count of registered modules
   * @returns Number of modules in registry
   */
  count: () => number;

  /**
   * Clear all registered modules
   * Primarily for testing purposes
   */
  clear: () => void;
}

/**
 * Validates that a module descriptor has all required fields
 * @param module - Module to validate
 * @throws Error if any required field is missing
 */
function validateModule<TConfig>(module: Partial<WizideeModule<TConfig>>): asserts module is WizideeModule<TConfig> {
  const requiredFields: (keyof WizideeModule)[] = [
    'id',
    'name',
    'description',
    'ConfigComponent',
    'ResultComponent',
    'process',
    'defaultConfig',
  ];

  for (const field of requiredFields) {
    if (module[field] === undefined || module[field] === null) {
      throw new Error(`Module ${field} is required`);
    }
  }
}

/**
 * Creates a new ModuleRegistry instance
 * @returns ModuleRegistry implementation
 */
export function createModuleRegistry(): ModuleRegistry {
  const modules = new Map<string, WizideeModule>();

  return {
    register: <TConfig>(module: WizideeModule<TConfig>) => {
      // Validate module has all required fields (T003)
      validateModule(module);

      // Warn on duplicate ID (T007)
      if (modules.has(module.id)) {
        console.warn(`Module with id "${module.id}" already exists. Overwriting.`);
      }

      // Store module in Map (T004)
      modules.set(module.id, module);
    },

    get: <TConfig>(id: string): WizideeModule<TConfig> | undefined => {
      // Retrieve by ID (T005)
      return modules.get(id) as WizideeModule<TConfig> | undefined;
    },

    getAll: (): WizideeModule[] => {
      // Return array of all modules (T006)
      return Array.from(modules.values());
    },

    has: (id: string): boolean => {
      return modules.has(id);
    },

    unregister: (id: string): boolean => {
      return modules.delete(id);
    },

    count: (): number => {
      return modules.size;
    },

    clear: (): void => {
      modules.clear();
    },
  };
}

/**
 * Singleton registry instance used by the application
 */
const globalRegistry = createModuleRegistry();

/**
 * Convenience function to register a module with the singleton registry
 */
export const registerModule = globalRegistry.register;

/**
 * Convenience function to get a module from the singleton registry
 */
export const getModule = globalRegistry.get;

/**
 * Convenience function to get all modules from the singleton registry
 */
export const getAllModules = globalRegistry.getAll;

/**
 * Export the singleton registry for advanced use cases
 */
export { globalRegistry as registry };
