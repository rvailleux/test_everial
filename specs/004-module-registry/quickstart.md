# Quickstart: Module Registry System

**Feature**: 004-module-registry  
**Prerequisites**: Node.js 18+, npm, existing Next.js project

## Installation

No additional dependencies required—this feature uses React built-ins.

## Setup

### 1. Copy Module Registry Files

Copy the following files to your project:

```
lib/
├── modules/
│   ├── types.ts          # From contracts/module.types.ts
│   ├── registry.ts       # Core registry implementation
│   └── index.ts          # Public exports
├── context/
│   └── ModuleProvider.tsx
└── hooks/
    ├── useModule.ts
    ├── useAllModules.ts
    ├── useActiveModule.ts
    └── useModuleConfig.ts
```

### 2. Wrap Your App with ModuleProvider

```tsx
// app/layout.tsx
import { ModuleProvider } from '@/lib/context/ModuleProvider';

export default function RootLayout({ children }) {
  return (
    <ModuleProvider>
      {children}
    </ModuleProvider>
  );
}
```

### 3. Register Your First Module

```tsx
// app/page.tsx
'use client';

import { registerModule } from '@/lib/modules';

// Define a simple test module
const testModule = {
  id: 'test-module',
  name: 'Test Module',
  description: 'A test module for demonstration',
  ConfigComponent: ({ config, onConfigChange }) => (
    <div>
      <label>
        Example setting:
        <input
          type="checkbox"
          checked={config.enabled}
          onChange={(e) => onConfigChange({ ...config, enabled: e.target.checked })}
        />
      </label>
    </div>
  ),
  ResultComponent: ({ result }) => (
    <div>
      {result.success ? (
        <pre>{JSON.stringify(result.data, null, 2)}</pre>
      ) : (
        <p>Error: {result.error}</p>
      )}
    </div>
  ),
  process: async (snapshot, config) => {
    // Simulate processing
    return {
      success: true,
      data: { processed: true, config },
    };
  },
  defaultConfig: { enabled: true },
};

// Register at module load time
registerModule(testModule);

export default function Page() {
  // Your component code
}
```

### 4. Use the Module Menu

```tsx
// components/ModuleMenu.tsx
'use client';

import { useAllModules, useActiveModule } from '@/lib/hooks';

export function ModuleMenu() {
  const modules = useAllModules();
  const { activeModule, setActiveModule } = useActiveModule();

  return (
    <nav>
      <h2>Modules</h2>
      <ul>
        {modules.map((module) => (
          <li key={module.id}>
            <button
              onClick={() => setActiveModule(module.id)}
              aria-pressed={activeModule?.id === module.id}
            >
              {module.name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

### 5. Render Active Module Config

```tsx
// components/ModuleConfigPanel.tsx
'use client';

import { useActiveModule, useModuleConfig } from '@/lib/hooks';

export function ModuleConfigPanel() {
  const { activeModule } = useActiveModule();
  const { config, setConfig, resetConfig } = useModuleConfig();

  if (!activeModule) {
    return <p>Select a module to configure</p>;
  }

  const { ConfigComponent } = activeModule;

  return (
    <div>
      <h3>{activeModule.name} Configuration</h3>
      <ConfigComponent config={config} onConfigChange={setConfig} />
      <button onClick={resetConfig}>Reset to Defaults</button>
    </div>
  );
}
```

## Running Tests

```bash
# Run Jest tests for module registry
npm test -- __tests__/modules/registry.test.ts

# Run hook tests
npm test -- __tests__/hooks/

# Run all tests with coverage
npm test -- --coverage
```

## Example: Complete Module

See `templates/module/` for a complete working example (created by K5 task).

## Troubleshooting

**Error: "useModule must be used within ModuleProvider"**
→ Ensure your component is wrapped in `<ModuleProvider>` in layout.tsx

**Error: "Module is missing required field: process"**
→ Check that your module descriptor includes all required fields

**Module not appearing in menu**
→ Verify `registerModule()` was called before rendering ModuleMenu
