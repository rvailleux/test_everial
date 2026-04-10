/**
 * Module Registry
 *
 * Provides registration and discovery of WIZIDEE document processing modules.
 * All modules are stored in-memory.
 */

import { WizideeModule } from './types';

// In-memory registry storage
const registry = new Map<string, WizideeModule>();

/**
 * Register a module in the registry
 * If a module with the same ID already exists, it will be overwritten
 *
 * @param module - The module to register
 */
export function registerModule<TConfig>(module: WizideeModule<TConfig>): void {
  registry.set(module.id, module as WizideeModule);
}

/**
 * Get all registered modules
 *
 * @returns Array of all registered modules (copy of internal array)
 */
export function getAllModules(): WizideeModule[] {
  return Array.from(registry.values());
}

/**
 * Get a single module by its ID
 *
 * @param id - The module ID to look up
 * @returns The module if found, undefined otherwise
 */
export function getModuleById(id: string): WizideeModule | undefined {
  return registry.get(id);
}

/**
 * Clear all modules from the registry
 */
export function clearRegistry(): void {
  registry.clear();
}
