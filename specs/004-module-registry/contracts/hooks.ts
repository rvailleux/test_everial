/**
 * React Hooks API Contract
 *
 * These hooks provide React components with access to the module registry.
 * All hooks must be used within a ModuleProvider.
 */

import { WizideeModule, UseActiveModuleReturn, UseModuleConfigReturn } from './module.types';

/**
 * Get a specific module by ID
 * @param id - Module identifier
 * @returns Module descriptor or null if not found
 */
export declare function useModule<TConfig = Record<string, any>>(
  id: string
): WizideeModule<TConfig> | null;

/**
 * Get all registered modules
 * @returns Array of all module descriptors
 */
export declare function useAllModules(): WizideeModule[];

/**
 * Get the currently active module and setter
 * @returns Active module state and controls
 */
export declare function useActiveModule(): UseActiveModuleReturn;

/**
 * Get/set configuration for the currently active module
 * @returns Configuration state and controls
 */
export declare function useModuleConfig<T = Record<string, any>>(): UseModuleConfigReturn<T>;

/**
 * Props for ModuleProvider component
 */
export interface ModuleProviderProps {
  /** Child components */
  children: React.ReactNode;
  /** Optional initial modules to register */
  initialModules?: WizideeModule[];
}

/**
 * Provider component that makes module registry available to child components
 */
export declare function ModuleProvider(props: ModuleProviderProps): JSX.Element;
