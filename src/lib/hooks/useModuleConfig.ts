/**
 * useModuleConfig Hook
 *
 * Manages configuration state for the currently active module.
 */

'use client';

import { useModuleContext } from '@/lib/context/ModuleProvider';
import { useCallback, useMemo } from 'react';

/**
 * Hook to manage configuration for the active module
 * @returns Configuration state and controls
 */
export function useModuleConfig<T = Record<string, any>>() {
  const { activeModuleId, getModuleConfig, setModuleConfig, resetModuleConfig } = useModuleContext();

  const config = useMemo<T>(() => {
    if (!activeModuleId) {
      return {} as T;
    }
    return getModuleConfig<T>(activeModuleId);
  }, [activeModuleId, getModuleConfig]);

  const setConfig = useCallback((partialConfig: Partial<T>) => {
    if (!activeModuleId) {
      console.warn('Cannot set config: no active module');
      return;
    }
    const currentConfig = getModuleConfig<T>(activeModuleId);
    setModuleConfig(activeModuleId, { ...currentConfig, ...partialConfig });
  }, [activeModuleId, getModuleConfig, setModuleConfig]);

  const resetConfig = useCallback(() => {
    if (!activeModuleId) {
      console.warn('Cannot reset config: no active module');
      return;
    }
    resetModuleConfig(activeModuleId);
  }, [activeModuleId, resetModuleConfig]);

  return {
    config,
    setConfig,
    resetConfig,
  };
}
