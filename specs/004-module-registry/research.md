# Research: Module Registry System

**Feature**: 004-module-registry  
**Date**: 2026-04-09  
**Phase**: 0 - Research & Clarification

## Questions to Resolve

No major unknowns requiring external research. This feature uses well-established React patterns.

## Decisions Made

### Decision 1: React Context vs External State Management

**Choice**: React Context + hooks

**Rationale**: 
- Constitution Principle III (Demonstrator Clarity) favors simple, built-in solutions
- Module registry is read-heavy, write-light (registration happens once at init)
- No cross-cutting state updates needed
- React 19's improved context performance is sufficient

**Alternatives considered**:
- Zustand: Excellent but adds dependency for simple use case
- Redux: Overkill for this demonstrator
- Jotai/Recoil: Atomic state unnecessary for module registry

### Decision 2: Module Storage Structure

**Choice**: Map<string, WizideeModule>

**Rationale**:
- O(1) lookup by module ID
- Preserves insertion order (useful for menu display)
- Type-safe with TypeScript
- No serialization needed (no persistence)

**Alternatives considered**:
- Array: O(n) lookup, would need filtering
- Object: No guaranteed key order, less type-safe

### Decision 3: Configuration State Management

**Choice**: Per-module config state in context, keyed by module ID

**Rationale**:
- Each module has its own config shape
- Switching modules preserves previous config
- Config reset is simply re-assigning defaultConfig

**Structure**:
```typescript
configState: Map<string, Record<string, any>> // moduleId -> config
```

### Decision 4: Hook API Design

**Choice**: Separate focused hooks rather than one large hook

**Rationale**:
- `useModule(id)` - for kernel to get specific module
- `useAllModules()` - for menu to list all modules
- `useActiveModule()` - for tracking selection
- `useModuleConfig<T>()` - for type-safe config access

Each hook has a single responsibility per Constitution Principle III.

### Decision 5: Module Validation

**Choice**: Runtime validation at registration time

**Rationale**:
- Fail fast during development
- Descriptive error messages help module developers
- Prevents invalid modules from entering the system

**Validation checks**:
- All required fields present
- Components are valid React components (via `isValidElement` or typeof check)
- `process` is an async function
- `id` is unique (warn on duplicate)

## Assumptions Validated

1. **Modules registered at init time**: Confirmed as requirement in spec
2. **No dynamic loading**: No need for code-splitting or lazy loading
3. **Single-session state**: No persistence across page reloads
4. **TypeScript generics for config**: Standard React pattern with `useState<T>`

## References

- React Context: https://react.dev/reference/react/createContext
- Custom Hooks: https://react.dev/learn/reusing-logic-with-custom-hooks
- Constitution Principle VIII: Kernel/Modules Architecture (already defined in project)
