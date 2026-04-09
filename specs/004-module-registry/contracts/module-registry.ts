/**
 * Module Registry API Contract
 *
 * This file defines the public API for registering and retrieving modules.
 */

import { WizideeModule, RegisterModule, GetModule, GetAllModules } from './module.types';

/**
 * Module Registry interface
 *
 * Internal implementation uses Map<string, WizideeModule> for storage.
 */
export interface ModuleRegistry {
  /**
   * Register a new module with the kernel
   * @param module - Complete module descriptor
   * @throws Error if module is missing required fields
   * @warns Console warning if module ID already exists (overwrites)
   */
  register: RegisterModule;

  /**
   * Retrieve a specific module by ID
   * @param id - Module identifier
   * @returns Module descriptor or undefined if not found
   */
  get: GetModule;

  /**
   * Retrieve all registered modules
   * @returns Array of all module descriptors
   */
  getAll: GetAllModules;

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
 * Create a new ModuleRegistry instance
 * @returns ModuleRegistry implementation
 */
export declare function createModuleRegistry(): ModuleRegistry;

/**
 * Singleton registry instance used by the application
 */
export declare const registry: ModuleRegistry;

/**
 * Convenience function to register a module with the singleton registry
 */
export declare const registerModule: RegisterModule;

/**
 * Convenience function to get a module from the singleton registry
 */
export declare const getModule: GetModule;

/**
 * Convenience function to get all modules from the singleton registry
 */
export declare const getAllModules: GetAllModules;
