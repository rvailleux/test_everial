# Tasks: Module Registry System

**Input**: Design documents from `/specs/004-module-registry/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, contracts/

**Tests**: Tests are included per Constitution Principle IV (Test-First/TDD).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create directory structure: `src/lib/modules/`, `src/lib/context/`, `src/lib/hooks/`, `components/`, `tests/modules/`, `tests/hooks/`, `tests/components/`
- [x] T002 [P] Create `src/lib/modules/types.ts` with TypeScript interfaces from contracts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core registry infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Write unit test for module validation in `tests/modules/registry.test.ts` (test: validation rejects incomplete modules)
- [x] T004 Write unit test for `registerModule()` in `tests/modules/registry.test.ts` (test: stores module in Map)
- [x] T005 Write unit test for `getModule()` in `tests/modules/registry.test.ts` (test: retrieves by ID)
- [x] T006 Write unit test for `getAllModules()` in `tests/modules/registry.test.ts` (test: returns array)
- [x] T007 Write unit test for duplicate ID handling in `tests/modules/registry.test.ts` (test: warns and overwrites)
- [x] T008 Implement `src/lib/modules/registry.ts` with `createModuleRegistry()`, `registerModule`, `getModule`, `getAllModules`
- [x] T009 [P] Implement module validation in `src/lib/modules/registry.ts` (validates all required fields)
- [x] T010 Create `src/lib/modules/index.ts` to export public API

**Checkpoint**: Foundation ready - registry functions tested and working

---

## Phase 3: User Story 1 — Module Developer Registers a New Module (Priority: P1) 🎯 MVP

**Goal**: Enable developers to register modules and retrieve them by ID or list all modules

**Independent Test**: A test module can be registered and appears in `getAllModules()` and can be retrieved via `getModule(id)`

### Tests for User Story 1 (TDD)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T011 [P] [US1] Create `components/ModuleMenu.tsx` basic structure
- [x] T012 [P] [US1] Write component test in `tests/components/ModuleMenu.test.tsx` (test: renders list of registered modules)
- [x] T013 [P] [US1] Write hook test in `tests/hooks/useAllModules.test.tsx` (test: returns all registered modules)

### Implementation for User Story 1

- [x] T014 [US1] Implement `useAllModules()` hook in `src/src/lib/hooks/useAllModules.ts`
- [x] T015 [US1] Implement `useModule(id)` hook in `src/src/lib/hooks/useModule.ts`
- [x] T016 [US1] Implement `ModuleMenu.tsx` component that lists all modules using `useAllModules()`

**Checkpoint**: At this point, User Story 1 should be fully functional - modules can be registered and displayed in a menu

---

## Phase 4: User Story 2 — Kernel Accesses Module Configuration (Priority: P2)

**Goal**: Enable kernel to render module configuration UI and manage configuration state

**Independent Test**: A module's ConfigComponent renders with default config, and user changes update the config state via `useModuleConfig()`

### Tests for User Story 2 (TDD)

- [x] T017 [P] [US2] Write hook test in `tests/hooks/useModuleConfig.test.tsx` (test: returns default config)
- [x] T018 [P] [US2] Write hook test in `tests/hooks/useModuleConfig.test.tsx` (test: setConfig updates values)
- [x] T019 [P] [US2] Write hook test in `tests/hooks/useModuleConfig.test.tsx` (test: resetConfig restores defaults)
- [x] T020 [P] [US2] Write hook test in `tests/hooks/useActiveModule.test.tsx` (test: tracks active module)
- [x] T021 [P] [US2] Write component test in `tests/components/ModuleConfigPanel.test.tsx` (test: renders ConfigComponent)

### Implementation for User Story 2

- [x] T022 [US2] Create `src/lib/context/ModuleContext.tsx` with context definition and types
- [x] T023 [US2] Implement `ModuleProvider.tsx` with state for `activeModuleId` and `configStates` Map
- [x] T024 [US2] Implement `useActiveModule()` hook in `src/lib/hooks/useActiveModule.ts`
- [x] T025 [P] [US2] Implement `useModuleConfig<T>()` hook in `src/lib/hooks/useModuleConfig.ts`
- [x] T026 [US2] Implement `ModuleConfigPanel.tsx` component that renders active module's config component
- [x] T027 [US2] Update `ModuleMenu.tsx` to call `setActiveModule()` on click

**Checkpoint**: At this point, User Story 2 should be functional - clicking a module shows its config panel with working configuration state

---

## Phase 5: User Story 3 — Kernel Executes Module Processing (Priority: P2)

**Goal**: Enable kernel to trigger module processing and display results

**Independent Test**: Calling `module.process(snapshot, config)` returns a WizideeResult that can be rendered by ResultComponent

### Tests for User Story 3 (TDD)

- [x] T028 [P] [US3] Write integration test in `tests/hooks/useModuleProcess.test.tsx` (test: process function called with correct args)
- [x] T029 [P] [US3] Write component test for result display (test: ResultComponent renders with success result)
- [x] T030 [P] [US3] Write component test for error handling (test: error result displays without crash)

### Implementation for User Story 3

- [x] T031 [US3] Add process execution logic to `ModuleConfigPanel.tsx` (handle process call)
- [x] T032 [US3] Implement `useModuleProcess()` hook for processing state management
- [x] T033 [US3] Implement result rendering in `ModuleConfigPanel.tsx` (render ResultComponent with results)
- [x] T034 [US3] Add error handling wrapper for process() calls

**Checkpoint**: At this point, all user stories should be functional - complete kernel-module interaction cycle works

---

## Phase 6: Visual Verification & Cross-Cutting Concerns

**Purpose**: Visual verification per Constitution Principle VII and final polish

- [x] T035 Create test page `app/test-module-registry/page.tsx` for manual verification
- [x] T036 Write CDP test script to capture screenshots of ModuleMenu at desktop, tablet, mobile viewports
- [x] T037 Write CDP test to verify console has no errors during module registration and selection
- [x] T038 Run all tests and verify 100% pass rate
- [x] T039 [P] Update `CLAUDE.md` with module registry usage example
- [x] T040 Create `templates/module/` directory with example module boilerplate

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
  - Tests T003-T007 must be written before T008-T010 (TDD)
- **User Story 1 (Phase 3)**: Depends on Foundational phase
  - Tests T012-T013 must be written before T014-T016 (TDD)
- **User Story 2 (Phase 4)**: Depends on Foundational + US1
  - Tests T017-T021 must be written before T022-T027 (TDD)
  - US1 provides `useAllModules()` needed for menu
- **User Story 3 (Phase 5)**: Depends on Foundational + US2
  - Tests T028-T030 must be written before T031-T034 (TDD)
  - US2 provides config management needed for processing
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Can start after US1 + Foundational
- **User Story 3 (P2)**: Can start after US2 + Foundational

### Within Each User Story (TDD Order)

1. Write tests first (ensure they FAIL)
2. Implement hooks/components to make tests pass
3. Verify tests pass
4. Story complete

### Parallel Opportunities

With multiple developers:

1. **Phase 1 + Phase 2 tests**: One developer writes all registry tests (T003-T007)
2. **Phase 2 implementation**: Another developer implements registry (T008-T010)
3. **US1 tests + implementation**: Can proceed in parallel after Phase 2
4. **US2 tests + implementation**: Can proceed after US1
5. **US3 tests + implementation**: Can proceed after US2

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test module registration and menu display
5. Demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add Visual Verification → Final polish

---

## Task Summary

| Phase | Tasks | Story |
|-------|-------|-------|
| Setup | 2 | - |
| Foundational | 8 | - |
| US1 (P1) | 6 | Module registration |
| US2 (P2) | 11 | Configuration management |
| US3 (P2) | 7 | Processing execution |
| Polish | 6 | - |
| **Total** | **40** | - |

### Parallel Task Groups

- **Group A (Setup)**: T001, T002
- **Group B (Registry Tests)**: T003-T007
- **Group C (US1 Tests)**: T012, T013
- **Group D (US2 Tests)**: T017-T021
- **Group E (US3 Tests)**: T028-T030
- **Group F (Final Polish)**: T039, T040

---

## Notes

- All file paths follow Next.js App Router conventions
- Tests use Jest + React Testing Library per plan.md
- TDD enforced: tests must be written before implementation and must fail initially
- Visual verification via Chrome DevTools Protocol required per Constitution Principle VII
