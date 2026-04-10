/**
 * ModuleSelector Component
 *
 * Displays a selectable list of all registered modules.
 * Clicking a module sets it as the active module.
 * This is the kernel's module selection UI.
 */

'use client';

import React from 'react';
import { useAllModules } from '@/lib/hooks/useAllModules';
import { useActiveModule } from '@/lib/hooks/useActiveModule';

export function ModuleSelector() {
  const modules = useAllModules();
  const { activeModule, setActiveModule } = useActiveModule();

  if (modules.length === 0) {
    return (
      <div className="module-selector p-4 bg-white rounded-lg border border-zinc-200">
        <h2 className="text-lg font-semibold text-zinc-900 mb-2">Modules</h2>
        <p className="text-sm text-zinc-500">No modules registered</p>
      </div>
    );
  }

  return (
    <div className="module-selector p-4 bg-white rounded-lg border border-zinc-200">
      <h2 className="text-lg font-semibold text-zinc-900 mb-3">Select Module</h2>
      <div className="space-y-2">
        {modules.map((module) => (
          <button
            key={module.id}
            onClick={() => setActiveModule(module.id)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
              activeModule?.id === module.id
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700'
            }`}
            aria-pressed={activeModule?.id === module.id}
            data-testid={`module-${module.id}`}
          >
            <div className="font-medium">{module.name}</div>
            <div className={`text-sm ${activeModule?.id === module.id ? 'text-blue-100' : 'text-zinc-500'}`}>
              {module.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
