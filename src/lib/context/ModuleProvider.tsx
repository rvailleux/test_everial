/**
 * Module Provider - React Context for Module Registry
 *
 * Provides module registry access and state management to the component tree.
 */

'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { WizideeModule, ModuleContextValue } from '@lib/modules/types';
import { registry } from '@lib/modules/registry';

// Side-effect imports — each module calls registerModule() at the top level
import '@/modules/identity-cni';
import '@/modules/proof-address';
import '@/modules/proof-income';
import '@/modules/rib-extraction';

const ModuleContext = createContext<ModuleContextValue | null>(null);

interface ModuleProviderProps {
  children: React.ReactNode;
  initialModules?: WizideeModule[];
}

export function ModuleProvider({ children, initialModules = [] }: ModuleProviderProps) {
  // Register initial modules on mount
  const [modules] = useState<WizideeModule[]>(() => {
    // Register any initial modules
    initialModules.forEach((module) => {
      if (!registry.has(module.id)) {
        registry.register(module);
      }
    });
    return registry.getAll();
  });

  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [configStates, setConfigStates] = useState<Map<string, Record<string, any>>>(
    new Map()
  );

  const setActiveModule = useCallback((id: string) => {
    setActiveModuleId(id);
  }, []);

  const getModuleConfig = useCallback(<T,>(id: string): T => {
    const module = registry.get(id);
    if (!module) {
      throw new Error(`Module with id "${id}" not found`);
    }
    return (configStates.get(id) as T) ?? (module.defaultConfig as T);
  }, [configStates]);

  const setModuleConfig = useCallback(<T,>(id: string, config: T) => {
    setConfigStates((prev) => {
      const next = new Map(prev);
      next.set(id, config as Record<string, any>);
      return next;
    });
  }, []);

  const resetModuleConfig = useCallback((id: string) => {
    const module = registry.get(id);
    if (module) {
      setConfigStates((prev) => {
        const next = new Map(prev);
        next.set(id, module.defaultConfig as Record<string, any>);
        return next;
      });
    }
  }, []);

  const value: ModuleContextValue = {
    modules,
    activeModuleId,
    setActiveModule,
    getModuleConfig,
    setModuleConfig,
    resetModuleConfig,
  };

  return (
    <ModuleContext.Provider value={value}>
      {children}
    </ModuleContext.Provider>
  );
}

/**
 * Hook to access the ModuleContext
 * @throws Error if used outside of ModuleProvider
 */
export function useModuleContext(): ModuleContextValue {
  const context = useContext(ModuleContext);
  if (!context) {
    throw new Error('useModuleContext must be used within a ModuleProvider');
  }
  return context;
}
