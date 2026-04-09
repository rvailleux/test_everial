/**
 * useActiveModule Hook
 *
 * Tracks and manages the currently selected module.
 */

'use client';

import { useModuleContext } from '@/lib/context/ModuleProvider';
import { useMemo, useCallback } from 'react';

/**
 * Hook to track and manage the active module
 * @returns Active module state and controls
 */
export function useActiveModule() {
  const { modules, activeModuleId, setActiveModule } = useModuleContext();

  const activeModule = useMemo(() => {
    if (!activeModuleId) return null;
    return modules.find((m) => m.id === activeModuleId) ?? null;
  }, [modules, activeModuleId]);

  const clearActiveModule = useCallback(() => {
    setActiveModule('');
  }, [setActiveModule]);

  return {
    activeModule,
    setActiveModule,
    clearActiveModule,
  };
}
