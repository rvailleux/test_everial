# Tasks: Auto-Scan Document Detection in Video Stream

**Input**: Design documents from `/specs/007-auto-scan-document/`
**Prerequisites**: plan.md (required), spec.md (required)

**Format**: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create detection library directory structure

- [X] T001 Create `src/lib/detection/` directory for document detection algorithm
- [X] T002 Create `tests/lib/detection/` directory for unit tests

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core detection algorithm that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Implement `detectDocumentBoundary()` in `src/lib/detection/documentDetector.ts` — pure TS edge detection on ImageData
- [X] T004 Implement greyscale conversion helper in `src/lib/detection/documentDetector.ts`
- [X] T005 Implement Sobel edge magnitude computation in `src/lib/detection/documentDetector.ts`
- [X] T006 Implement bounding rectangle + aspect ratio filtering in `src/lib/detection/documentDetector.ts`

**Checkpoint**: Foundation ready — detection algorithm unit-testable

---

## Phase 3: User Story 1 — Document Detection Overlay (Priority: P1) 🎯 MVP

**Goal**: Blue outline tracks document rectangle in real-time on video feed

**Independent Test**: Open video call page with camera showing document; blue rectangle appears around detected document

### Tests for User Story 1

- [X] T007 [P] [US1] Unit test: `detectDocumentBoundary` returns null for blank/edgeless image in `tests/lib/detection/documentDetector.test.ts`
- [X] T008 [P] [US1] Unit test: `detectDocumentBoundary` returns boundary for synthetic rectangle in `tests/lib/detection/documentDetector.test.ts`
- [X] T009 [P] [US1] Visual E2E test: Playwright captures screenshot with blue overlay when document is present in frame

### Implementation for User Story 1

- [X] T010 [US1] Create `DocumentBoundary` type in `src/lib/detection/types.ts`
- [X] T011 [US1] Implement `useDocumentDetector` hook in `src/hooks/useDocumentDetector.ts` — frame loop running at 15 fps
- [X] T012 [US1] Implement `DocumentScanOverlay` component in `src/components/DocumentScanOverlay.tsx` — canvas overlay drawing blue rectangle
- [X] T013 [US1] Integrate overlay into `VideoCallKernel` in `src/app/video-call/page.tsx` — render overlay inside video container
- [X] T014 [US1] Add ResizeObserver to sync overlay canvas size with video element dimensions

**Checkpoint**: US1 complete — blue outline appears when document detected, no outline when none

---

## Phase 4: User Story 2 — Automatic Snapshot on Good Capture (Priority: P2)

**Goal**: Auto-capture when document is large enough, complete, and stable

**Independent Test**: Present large, centered document; verify auto-capture within 1 second without clicking Capture button

### Tests for User Story 2

- [X] T015 [P] [US2] Unit test: `isCaptureReady()` returns false when area < 30% in `tests/lib/detection/documentDetector.test.ts`
- [X] T016 [P] [US2] Unit test: `isCaptureReady()` returns true when area ≥ 30% and fully in frame in `tests/lib/detection/documentDetector.test.ts`
- [X] T017 [US2] E2E test: Playwright verifies snapshot is captured automatically after document conditions met

### Implementation for User Story 2

- [X] T018 [US2] Add `MIN_AREA_RATIO` constant (0.30) and `isDocumentFullyInFrame()` helper in `src/lib/detection/documentDetector.ts`
- [X] T019 [US2] Extend `useDocumentDetector` hook with stability timer logic — track boundary stability over 500ms
- [X] T020 [US2] Extend `useDocumentDetector` hook with cooldown timer — 2s pause after auto-capture
- [X] T021 [US2] Wire `onAutoCapture` callback in `VideoCallKernel` to trigger existing `handleCapture`
- [X] T022 [US2] Add detection enable/disable toggle UI to prevent conflict with manual Capture

**Checkpoint**: US2 complete — auto-capture fires when conditions met; no capture when document small/partial

---

## Phase 5: User Story 3 — Capture Guidance Feedback (Priority: P3)

**Goal**: Colour-coded feedback (blue → green) guides user to optimal capture position

**Independent Test**: Observe overlay change from blue to green as document moves to fill frame

### Tests for User Story 3

- [X] T023 [P] [US3] Unit test: `getOverlayState()` returns 'none' | 'detected' | 'ready' correctly in `tests/lib/detection/documentDetector.test.ts`

### Implementation for User Story 3

- [X] T024 [US3] Add `OverlayState` type and `getOverlayState()` helper in `src/lib/detection/types.ts`
- [X] T025 [US3] Update `DocumentScanOverlay` to accept `overlayState` prop and render different stroke colours:
  - `none`: no rectangle
  - `detected`: blue stroke (#3B82F6)
  - `ready`: green stroke (#22C55E)
- [X] T026 [US3] Add subtle animation/pulse effect when state transitions to 'ready'
- [X] T027 [US3] Display brief "Snapshot captured" toast/confirmation after auto-capture in `VideoCallKernel`

**Checkpoint**: US3 complete — colour feedback guides user; confirmation shown after capture

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final integration and visual verification

- [X] T028 [P] Run `npx tsc --noEmit` and fix any type errors
- [X] T029 [P] Run unit tests: `npx jest --selectProjects modules`
- [X] T030 Run Playwright visual verification — capture screenshots at desktop, tablet, mobile viewports in `tests/e2e/auto-scan-visual.spec.ts`
- [X] T031 Verify manual Capture button still works alongside auto-scan
- [ ] T032 Update CLAUDE.md with auto-scan feature notes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3–5)**: All depend on Foundational phase
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: No dependencies on US2/US3
- **US2 (P2)**: Depends on US1 overlay existing, but auto-capture logic is independent
- **US3 (P3)**: Builds on US1 overlay states and US2 readiness detection

### Parallel Opportunities

- T003–T006 (algorithm components) can be written/tested in parallel
- T007–T009 (tests) can run in parallel
- T015–T016 (capture readiness tests) can run in parallel

---

## Implementation Summary

### Files Created

- `src/lib/detection/types.ts` — Detection types and configuration
- `src/lib/detection/documentDetector.ts` — Pure TS edge detection algorithm
- `src/hooks/useDocumentDetector.ts` — React hook for frame loop and auto-capture
- `src/components/DocumentScanOverlay.tsx` — Canvas overlay component
- `tests/lib/detection/documentDetector.test.ts` — Unit tests (14 tests, all passing)
- `tests/e2e/auto-scan-visual.spec.ts` — Playwright visual E2E tests

### Files Modified

- `src/app/video-call/page.tsx` — Integrated auto-scan into VideoCallKernel
- `jest.config.ts` — Added `lib` test project with jsdom environment
- `jest.setup.ts` — Added ImageData polyfill for tests

### Test Results

- **Lib tests**: 14 passed
- **Modules tests**: 155 passed
- **Playwright E2E**: 4 passed

### Pre-existing TypeScript Errors

The project has some pre-existing TypeScript errors (LiveKit types, CDP tests) unrelated to the auto-scan feature. The auto-scan code itself is type-clean.
