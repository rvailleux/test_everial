# Tasks: Module Registry System

**Input**: Design documents from `/specs/005-module-registry/`
**Prerequisites**: plan.md, spec.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create directory structure: lib/modules/ and src/lib/context/ and src/lib/hooks/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types and interfaces that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T002 Create lib/modules/types.ts with WizideeModule interface, ConfigProps, ResultProps, ProcessResult types

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Register and Discover Modules (Priority: P1) 🎯 MVP

**Goal**: Implement the core module registry with register, getAll, getById, and clear functions

**Independent Test**: Can be fully tested by registering a test module and retrieving it by ID or listing all modules

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T003 [P] [US1] Write unit tests for registerModule in __tests__/modules/registry.test.ts
- [ ] T004 [P] [US1] Write unit tests for getAllModules in __tests__/modules/registry.test.ts
- [ ] T005 [P] [US1] Write unit tests for getModuleById in __tests__/modules/registry.test.ts
- [ ] T006 [P] [US1] Write unit tests for clearRegistry in __tests__/modules/registry.test.ts

### Implementation for User Story 1

- [ ] T007 [US1] Implement lib/modules/registry.ts with registerModule, getAllModules, getModuleById, clearRegistry functions

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Access Module via React Context (Priority: P2)

**Goal**: Implement ModuleProvider context for dependency injection exposing modules, activeModule, and setActiveModule

**Independent Test**: Can be fully tested by wrapping a component tree with ModuleProvider and accessing the registry state via hooks

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T008 [P] [US2] Write unit tests for ModuleProvider context in __tests__/lib/context/ModuleProvider.test.tsx
- [ ] T009 [P] [US2] Write unit tests for useModuleContext hook error handling when used outside provider

### Implementation for User Story 2

- [ ] T010 [US2] Implement src/lib/context/ModuleProvider.tsx with ModuleContext, ModuleProvider component, and useModuleContext hook

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Retrieve Specific Module by ID (Priority: P3)

**Goal**: Implement useModule hook that returns a single module by ID or undefined

**Independent Test**: Can be fully tested by using the useModule hook with a valid module ID and receiving the module object

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T011 [P] [US3] Write unit tests for useModule hook returning correct module in __tests__/lib/hooks/useModule.test.ts
- [ ] T012 [P] [US3] Write unit tests for useModule hook returning undefined for invalid ID in __tests__/lib/hooks/useModule.test.ts

### Implementation for User Story 3

- [ ] T013 [US3] Implement src/lib/hooks/useModule.ts with useModule(id: string) hook

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Type checking and final validation

- [ ] T014 Run npx tsc --noEmit and fix any type errors
- [ ] T015 Run npm test to verify all tests pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for registry functions
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US2 for ModuleProvider context

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members once Phase 2 is complete

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Write unit tests for registerModule in __tests__/modules/registry.test.ts"
Task: "Write unit tests for getAllModules in __tests__/modules/registry.test.ts"
Task: "Write unit tests for getModuleById in __tests__/modules/registry.test.ts"
Task: "Write unit tests for clearRegistry in __tests__/modules/registry.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
