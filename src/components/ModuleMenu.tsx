/**
 * ModuleMenu Component
 *
 * Displays a menu of all registered modules.
 * Clicking a module sets it as the active module.
 */

'use client';

import React from 'react';
import { useAllModules } from '@/lib/hooks/useAllModules';
import { useActiveModule } from '@/lib/hooks/useActiveModule';

export function ModuleMenu() {
  const modules = useAllModules();
  const { activeModule, setActiveModule } = useActiveModule();

  if (modules.length === 0) {
    return (
      <nav className="module-menu">
        <p className="text-gray-500">No modules registered</p>
      </nav>
    );
  }

  return (
    <nav className="module-menu">
      <h2 className="text-lg font-semibold mb-2">Modules</h2>
      <ul className="space-y-1">
        {modules.map((module) => (
          <li key={module.id}>
            <button
              onClick={() => setActiveModule(module.id)}
              className={`w-full text-left px-3 py-2 rounded ${
                activeModule?.id === module.id
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100'
              }`}
              aria-pressed={activeModule?.id === module.id}
            >
              <div className="font-medium">{module.name}</div>
              <div className="text-sm opacity-75">{module.description}</div>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
