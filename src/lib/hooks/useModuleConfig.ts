/**
 * useModuleConfig Hook
 *
 * Provides access to configuration for the currently active module.
 */

import { useCallback } from 'react';
import { useModuleContext } from '@/lib/context/ModuleProvider';

/**
 * Get/set configuration for the currently active module
 * @returns Configuration state and controls
 */
export function useModuleConfig<T = Record<string, any>>(): {
  config: T;
  setConfig: (config: Partial<T>) => void;
  resetConfig: () => void;
} {
  const { activeModuleId, getModuleConfig, setModuleConfig, resetModuleConfig } =
    useModuleContext();

  const config = activeModuleId
    ? (getModuleConfig<T>(activeModuleId) as T)
    : ({} as T);

  const setConfig = useCallback(
    (partialConfig: Partial<T>) => {
      if (activeModuleId) {
        const currentConfig = getModuleConfig<T>(activeModuleId);
        setModuleConfig(activeModuleId, { ...currentConfig, ...partialConfig });
      }
    },
    [activeModuleId, getModuleConfig, setModuleConfig]
  );

  const resetConfig = useCallback(() => {
    if (activeModuleId) {
      resetModuleConfig(activeModuleId);
    }
  }, [activeModuleId, resetModuleConfig]);

  return {
    config,
    setConfig,
    resetConfig,
  };
}
