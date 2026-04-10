/**
 * useAllModules Hook
 *
 * Provides access to all registered modules.
 */

import { useModuleContext } from '@/lib/context/ModuleProvider';
import { WizideeModule } from '@lib/modules/types';

/**
 * Get all registered modules
 * @returns Array of all module descriptors
 */
export function useAllModules(): WizideeModule[] {
  const { modules } = useModuleContext();
  return modules;
}
