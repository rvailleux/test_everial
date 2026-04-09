/**
 * useAllModules Hook
 *
 * Returns all registered modules from the kernel registry.
 */

'use client';

import { useModuleContext } from '@/lib/context/ModuleProvider';

/**
 * Hook to retrieve all registered modules
 * @returns Array of all WizideeModule descriptors
 */
export function useAllModules() {
  const { modules } = useModuleContext();
  return modules;
}
