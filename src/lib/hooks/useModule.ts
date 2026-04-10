/**
 * useModule Hook
 *
 * Provides access to a specific module by ID from the module registry.
 */

import { useMemo } from 'react';
import { getModule } from '@lib/modules/registry';
import { WizideeModule } from '@lib/modules/types';

/**
 * Get a specific module by ID
 * @param id - Module identifier
 * @returns Module descriptor or null/undefined if not found
 */
export function useModule<TConfig = Record<string, any>>(
  id: string
): WizideeModule<TConfig> | null | undefined {
  return useMemo(() => {
    if (!id) return null;
    return getModule<TConfig>(id);
  }, [id]);
}
