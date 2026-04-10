/**
 * useModule Hook
 *
 * Returns a specific module by ID from the kernel registry.
 */

'use client';

import { useModuleContext } from '@/lib/context/ModuleProvider';

/**
 * Hook to retrieve a specific module by ID
 * @param id - Module identifier
 * @returns WizideeModule or null if not found
 */
export function useModule(id: string) {
  const { modules } = useModuleContext();
  if (!id) return null;
  return modules.find((module) => module.id === id);
}
