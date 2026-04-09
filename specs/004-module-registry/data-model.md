# Data Model: Module Registry System

**Feature**: 004-module-registry  
**Date**: 2026-04-09

## Core Entities

### WizideeModule

The interface that all document processing modules must implement.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Unique kebab-case identifier (e.g., 'identity-cni') |
| `name` | `string` | Yes | Display name shown in kernel menu |
| `description` | `string` | Yes | Brief explanation for tooltips/docs |
| `icon` | `string` | No | Optional icon identifier (Lucide icon name) |
| `ConfigComponent` | `React.FC<ConfigProps>` | Yes | Configuration UI component |
| `ResultComponent` | `React.FC<ResultProps>` | Yes | Results display component |
| `process` | `(snapshot: Blob, config: any) => Promise<WizideeResult>` | Yes | Document processing function |
| `defaultConfig` | `Record<string, any>` | Yes | Default configuration values |

### WizideeResult

Standard result format returned by all module processing functions.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `success` | `boolean` | Yes | Whether processing succeeded |
| `data` | `any` | No | Extracted document data (human-readable) |
| `raw` | `any` | No | Raw WIZIDEE API response |
| `error` | `string` | No | Error message if failed |

### ModuleRegistry

Internal registry storage structure.

| Field | Type | Description |
|-------|------|-------------|
| `modules` | `Map<string, WizideeModule>` | Storage of all registered modules |
| `register` | `(module: WizideeModule) => void` | Registration method |
| `get` | `(id: string) => WizideeModule \| undefined` | Retrieve single module |
| `getAll` | `() => WizideeModule[]` | Retrieve all modules |

### ModuleContextState

React context state structure.

| Field | Type | Description |
|-------|------|-------------|
| `modules` | `WizideeModule[]` | All registered modules (array for React) |
| `activeModuleId` | `string \| null` | Currently selected module ID |
| `configStates` | `Map<string, Record<string, any>>` | Per-module configuration |
| `setActiveModule` | `(id: string) => void` | Change active module |
| `setModuleConfig` | `(id: string, config: any) => void` | Update module config |
| `resetModuleConfig` | `(id: string) => void` | Reset to defaultConfig |

## State Transitions

### Module Registration (Init-time)

```
[Module Developer] --registerModule()--> [ModuleRegistry]
                                         (validates descriptor)
                                         (stores in Map)
```

### Module Selection (Runtime)

```
[User clicks menu] --setActiveModule(id)--> [ModuleContextState]
                                            (updates activeModuleId)
                                            (preserves existing config)
```

### Configuration Update (Runtime)

```
[User changes config] --setModuleConfig(id, newConfig)--> [ModuleContextState]
                                                          (updates configStates Map)
                                                          (triggers re-render)
```

### Processing Execution (Runtime)

```
[User clicks Process] --module.process(snapshot, config)--> [WIZIDEE API]
                                                          (returns WizideeResult)
                                                          (passed to ResultComponent)
```

## Key Runtime Objects (Not Persisted)

All state is transient React state, cleared on page reload:

| Object | Lifecycle | Notes |
|--------|-----------|-------|
| `ModuleRegistry` | App initialization | Created once, modules registered at init |
| `ModuleContext` | Component tree | Wrapped around app by ModuleProvider |
| `activeModuleId` | Session | User selection, null initially |
| `configStates` | Session | Preserved when switching modules |

## Validation Rules

### Module Registration Validation

1. **id**: Must be non-empty string, kebab-case recommended
2. **name**: Must be non-empty string
3. **description**: Must be non-empty string
4. **ConfigComponent**: Must be a valid React component (function or class)
5. **ResultComponent**: Must be a valid React component
6. **process**: Must be an async function (returns Promise)
7. **defaultConfig**: Must be a plain object (not null, not array)

### Duplicate ID Handling

- Console warning: `Module with id "${id}" already exists. Overwriting.`
- New registration replaces old (allows hot-reload in dev)

## TypeScript Interfaces

See `contracts/module.types.ts` for complete type definitions.

## Relationships

```
ModuleProvider (React Context)
    ├── ModuleRegistry (Map storage)
    │       └── WizideeModule[]
    ├── activeModuleId: string | null
    └── configStates: Map<string, any>

Hooks
    ├── useModule(id) -> WizideeModule
    ├── useAllModules() -> WizideeModule[]
    ├── useActiveModule() -> { activeModule, setActiveModule }
    └── useModuleConfig<T>() -> { config, setConfig, resetConfig }
```
