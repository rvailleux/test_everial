# Implementation Plan: Module Registry System

**Branch**: `005-module-registry` | **Date**: 2026-04-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-module-registry/spec.md`

## Summary

Create a module registry system that enables pluggable document processing features for the WIZIDEE Demo App. The registry provides registration, discovery, and React context integration for modules that extend the video call kernel.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js (Next.js 16.2.2 runtime)  
**Primary Dependencies**: React 19, Next.js App Router  
**Storage**: In-memory (no persistence)  
**Testing**: Jest + React Testing Library  
**Target Platform**: Web browsers (desktop, tablet, mobile)  
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: Module registration <10ms, retrieval <5ms  
**Constraints**: No external state management libraries (use React Context)  
**Scale/Scope**: Single-user demonstrator app  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Credentials Never Exposed | N/A | No credentials involved in registry |
| II. Proxy-First Architecture | N/A | Registry is client-side only |
| III. Demonstrator Clarity | Pass | Simple, readable code |
| IV. Test-First (TDD) | Pass | Tests written before implementation |
| V. Modern, Responsive UI | N/A | No UI in this feature |
| VI. Video-First Integration | Pass | Supports kernel/modules architecture |
| VII. Visual Verification | N/A | No visual components to verify |
| VIII. Kernel/Modules Architecture | Pass | Core enabler of this architecture |

## Project Structure

### Documentation (this feature)

```text
specs/005-module-registry/
├── plan.md              # This file
├── spec.md              # Feature specification
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Implementation tasks (Phase 2)
```

### Source Code (repository root)

```text
lib/
└── modules/
    ├── registry.ts      # Module registration system
    └── types.ts         # Module interface definitions

src/
└── lib/
    └── context/
        └── ModuleProvider.tsx  # React context provider

src/
└── lib/
    └── hooks/
        └── useModule.ts  # Hook for module access
```

**Structure Decision**: Follows the existing lib/modules/ structure defined in CLAUDE.md architecture section. The registry is in lib/modules/, React context is in src/lib/context/, and hooks are in src/lib/hooks/.

## Design Decisions

### Module Registration Pattern

**Decision**: Use an in-memory registry with simple functions (not a class).

**Rationale**: 
- Simpler and more readable for a demonstrator
- No need for complex lifecycle management
- Easy to test and understand

**Implementation**:
```typescript
const registry = new Map<string, WizideeModule>();

export function registerModule(module: WizideeModule): void
export function getAllModules(): WizideeModule[]
export function getModuleById(id: string): WizideeModule | undefined
export function clearRegistry(): void
```

### React Context Design

**Decision**: Single context exposing modules array, activeModule state, and setActiveModule function.

**Rationale**:
- Simple API that covers all use cases
- Co-locating related state reduces prop drilling
- Follows React best practices

**Implementation**:
```typescript
interface ModuleContextValue {
  modules: WizideeModule[];
  activeModule: string | null;
  setActiveModule: (id: string | null) => void;
}
```

### Type Definitions

**Decision**: Define WizideeModule interface with generic config type.

**Rationale**:
- Type-safe module configurations
- Each module can have its own config shape
- Process function receives typed config

**Implementation**:
```typescript
export interface WizideeModule<TConfig = Record<string, unknown>> {
  id: string;
  name: string;
  description: string;
  defaultConfig: TConfig;
  ConfigComponent: React.ComponentType<ConfigProps<TConfig>>;
  ResultComponent: React.ComponentType<ResultProps>;
  process: (snapshot: Blob, config: TConfig) => Promise<ProcessResult>;
}
```

## Complexity Tracking

N/A - This is a foundational feature with minimal complexity.
