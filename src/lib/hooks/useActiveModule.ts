/**
 * useActiveModule Hook
 *
 * Provides access to the currently active module and controls for setting it.
 */

import { useCallback, useMemo } from 'react';
import { useModuleContext } from '@/lib/context/ModuleProvider';
import { getModule } from '@lib/modules/registry';
import { WizideeModule } from '@lib/modules/types';

/**
 * Get the currently active module and setter
 * @returns Active module state and controls
 */
export function useActiveModule(): {
  activeModule: WizideeModule | null;
  setActiveModule: (id: string) => void;
  clearActiveModule: () => void;
} {
  const { activeModuleId, setActiveModule } = useModuleContext();

  const activeModule = useMemo<WizideeModule | null>(() => {
    if (!activeModuleId) return null;
    return getModule(activeModuleId) || null;
  }, [activeModuleId]);

  const clearActiveModule = useCallback(() => {
    setActiveModule('');
  }, [setActiveModule]);

  return {
    activeModule,
    setActiveModule,
    clearActiveModule,
  };
}
