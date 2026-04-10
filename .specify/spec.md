# K1 — Module Registry System

## Overview
Implement a module registry system for the WIZIDEE demo app kernel that enables:
- Module registration and discovery
- React context for dependency injection
- Hooks for module access

## Requirements

### Functional Requirements
1. Module registry with register/get/getAll operations
2. TypeScript types for module contracts (ConfigProps, ResultProps, WizideeModule)
3. ModuleProvider React context for dependency injection
4. useModule(id) hook for accessing specific modules
5. useAllModules() hook for listing all registered modules
6. useActiveModule() hook for tracking selected module
7. useModuleConfig<T>() hook for module configuration management

### Technical Requirements
- Follow existing patterns in src/lib/modules/types.ts
- Store configuration in React state (session-only)
- No persistence - reset on page refresh
- Type-safe with generics for config types

### Acceptance Criteria
- [ ] npm test passes
- [ ] npx tsc --noEmit clean
- [ ] Module registration works with validation
- [ ] Hooks work within ModuleProvider
- [ ] Configuration updates are reactive

## Files to Modify/Created
- lib/modules/types.ts (exists - review/update)
- lib/modules/registry.ts (create)
- src/lib/context/ModuleProvider.tsx (create)
- src/lib/hooks/useModule.ts (create)
- src/lib/hooks/useActiveModule.ts (create)
- src/lib/hooks/useModuleConfig.ts (create)
