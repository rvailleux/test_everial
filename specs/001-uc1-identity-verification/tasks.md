# Tasks: UC1 — Identity Verification (CNI / Passport)

**Input**: Design documents from `/specs/001-uc1-identity-verification/`  
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Tests**: Included — Constitution Principle IV mandates TDD for all API routes and document capture/result components.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install missing tooling and configure the test environment before any feature work begins.

- [X] T001 Add Jest, ts-jest, jest-environment-jsdom, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event to devDependencies in `package.json` and run `npm install`
- [X] T002 Create `jest.config.ts` at repo root with two projects: `{ displayName: 'api', testEnvironment: 'node', testMatch: ['**/tests/api/**/*.test.ts'] }` and `{ displayName: 'components', testEnvironment: 'jsdom', testMatch: ['**/tests/components/**/*.test.tsx'] }`
- [X] T003 [P] Create `jest.setup.ts` at repo root importing `@testing-library/jest-dom` for custom matchers; reference it in `jest.config.ts` `setupFilesAfterFramework`
- [X] T004 [P] Verify `.env.local` exists with `WIZIDEE_API_URL`, `WIZIDEE_AUTH_URL`, `WIZIDEE_USER`, `WIZIDEE_PASSWORD`; create `.env.local.example` with placeholder values (safe to commit)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared TypeScript types and the WIZIDEE server-side client that every API route depends on. No user story work can begin until this phase is complete.

**⚠️ CRITICAL**: All proxy routes import from `src/lib/wizidee.ts` — this must exist and be correct before routes are written.

- [X] T005 Create `src/lib/types.ts` with all shared TypeScript types from data-model.md: `DocumentSource`, `DocumentFile`, `RecognizeResponse`, `ExtractionResult`, `ProcessingState`, `ExtractionError`, `TokenCache`
- [X] T006 Write `tests/api/wizidee-client.test.ts` (TDD — write first, run `npm test`, confirm it FAILS): test `getToken()` returns cached token when not expired; test `getToken()` re-acquires when within 60s of expiry; mock `fetch` for auth endpoint responses
- [X] T007 Implement `src/lib/wizidee.ts`: module-level `TokenCache` singleton, `getToken()` with in-memory cache and 60s proactive refresh, `recognizeDocument(file: File)` calling WIZIDEE `/api/v1/recognize`, `analyzeDocument(file: File, dbId: string, radId: string)` calling WIZIDEE `/api/v1/analyze` — all calls include `Authorization: Bearer <token>` header; run T006 tests and confirm they pass

**Checkpoint**: `npm test tests/api/wizidee-client.test.ts` passes — foundation ready for user story work

---

## Phase 3: User Story 1 — CNI Extraction (Priority: P1) 🎯 MVP

**Goal**: A user uploads a French CNI image; the system recognizes it, extracts last name, first name, date of birth, expiry date, and MRZ, and displays them in a card with a raw JSON toggle.

**Independent Test**: Upload any CNI JPEG to `http://localhost:5172/uc1` → extracted fields appear within 10 seconds, raw JSON toggle works, no credentials appear in browser network tab.

### Tests for User Story 1 (TDD — write FIRST, confirm FAIL before implementation)

- [X] T008 [P] [US1] Write `tests/api/recognize.test.ts`: happy path (POST with file → 200 with `{dbId, radId}`), no file → 400, file > 10MB → 413, non-image MIME → 415, WIZIDEE 4xx → 502, auth failure → 503; mock `src/lib/wizidee.ts` recognizeDocument
- [X] T009 [P] [US1] Write `tests/api/analyze.test.ts`: happy path (POST with file + dbId + radId → 200 with `{fields, raw}`), missing dbId → 400, missing radId → 400, no file → 400, WIZIDEE failure → 502; mock `src/lib/wizidee.ts` analyzeDocument
- [X] T010 [P] [US1] Write `tests/components/DocumentCapture.test.tsx`: renders upload button, accepts file via input, shows file name after selection, calls `onCapture` prop with the File object, shows loading state when `isLoading` prop is true
- [X] T011 [P] [US1] Write `tests/components/ExtractionResult.test.tsx`: renders each field from `result.fields` as labeled rows, shows "No data" for null fields, renders raw JSON in a collapsible section, raw JSON toggle shows/hides the `<pre>` block

### Implementation for User Story 1

- [X] T012 [US1] Implement `src/app/api/wizidee/recognize/route.ts`: parse multipart `FormData`, validate file presence + size (≤10MB) + MIME type (image/jpeg, image/png), call `wizidee.recognizeDocument()`, return `{dbId, radId, documentType?}` or typed error response; run T008 tests, confirm pass
- [X] T013 [US1] Implement `src/app/api/wizidee/analyze/route.ts`: parse multipart `FormData`, validate file + dbId + radId presence, call `wizidee.analyzeDocument()`, normalize response fields into `{fields: Record<string, string|null>, raw: unknown}`, return result or typed error; run T009 tests, confirm pass
- [X] T014 [P] [US1] Implement `src/components/DocumentCapture.tsx`: file `<input>` (accept="image/jpeg,image/png"), file name preview after selection, "Analyze" submit button disabled when no file selected, `isLoading` prop shows spinner and disables controls; run T010 tests, confirm pass
- [X] T015 [P] [US1] Implement `src/components/ExtractionResult.tsx`: render `result.fields` as a labeled card (one row per field, skip null values with a dimmed "—" placeholder), collapsible "Raw JSON" section with `<pre>` toggle button; run T011 tests, confirm pass
- [X] T016 [US1] Implement `src/app/uc1/page.tsx`: manage `ProcessingState`, call `/api/wizidee/recognize` then `/api/wizidee/analyze` in sequence using the same file, pass `isLoading` to `DocumentCapture`, pass `ExtractionResult` props; wire recognize → analyze handoff using `dbId` + `radId` from recognize response
- [X] T017 [US1] Update `src/app/page.tsx`: add UC1 entry card ("Vérification d'identité — CNI / Passeport") linking to `/uc1`

**Checkpoint**: `npm test` passes all Phase 3 tests. Manually upload a CNI image at `http://localhost:5172/uc1` and verify fields are extracted and displayed.

---

## Phase 4: User Story 2 — Passport Extraction (Priority: P2)

**Goal**: Same flow as US1 but for a passport. The result card additionally shows nationality and formats the two-line MRZ distinctly. The document type (CNI vs PASSPORT) is visually indicated.

**Independent Test**: Upload a passport image at `http://localhost:5172/uc1` → nationality field appears in the card, MRZ shows both lines, a badge indicates "PASSPORT".

### Tests for User Story 2 (TDD — write FIRST, confirm FAIL before implementation)

- [X] T018 [P] [US2] Extend `tests/components/ExtractionResult.test.tsx`: add cases for `documentType: "PASSPORT"` — badge shows "PASSPORT", nationality field rendered, two-line MRZ displayed with line break, `documentType: "CNI"` badge shows "CNI"
- [X] T019 [P] [US2] Add passport scenario to `tests/api/analyze.test.ts`: mock WIZIDEE response containing `nationality` and two MRZ lines; assert both appear in normalized `fields` response

### Implementation for User Story 2

- [X] T020 [US2] Update `src/components/ExtractionResult.tsx`: add document type badge (`documentType` prop → colored pill "CNI" or "PASSPORT"), render multi-line MRZ with `<pre>` or line breaks, show nationality row when present; run T018 tests, confirm pass
- [X] T021 [US2] Update field normalization in `src/app/api/wizidee/analyze/route.ts`: ensure WIZIDEE nationality and multi-line MRZ fields are correctly mapped to the `fields` record; run T019 tests, confirm pass

**Checkpoint**: `npm test` passes all Phase 4 tests. Upload a passport image at `/uc1` and verify nationality + MRZ + document type badge display correctly.

---

## Phase 5: User Story 3 — Error Handling & Camera Capture (Priority: P3)

**Goal**: Unreadable or unsupported documents surface a clear error with retry. Users on mobile can capture the document live via camera instead of uploading a file.

**Independent Test**: (a) Submit a plain text file → error message appears with retry button, no empty result card. (b) Click "Use Camera" → video preview opens, capture button takes a frame and submits it through the full recognition flow.

### Tests for User Story 3 (TDD — write FIRST, confirm FAIL before implementation)

- [X] T022 [P] [US3] Write `tests/components/DocumentCapture.camera.test.tsx`: "Use Camera" button renders, clicking it calls `getUserMedia` mock, video preview element appears, "Capture" button clicks trigger `onCapture` with a Blob, permission denial shows upload-only fallback without crashing
- [X] T023 [P] [US3] Write error scenario tests in `tests/components/ExtractionResult.error.test.tsx` and `tests/api/recognize.test.ts`: unreadable doc → 502 response → UI shows error message with retry; verify retry resets `ProcessingState` to `idle`

### Implementation for User Story 3

- [X] T024 [US3] Add camera capture mode to `src/components/DocumentCapture.tsx`: "Use Camera" toggle button, `getUserMedia({ video: { facingMode: 'environment' } })`, live `<video>` preview, "Capture" button draws frame to `<canvas>` and calls `onCapture` with canvas blob; `catch` on `getUserMedia` rejection hides camera toggle and continues in upload-only mode; run T022 tests, confirm pass
- [X] T025 [US3] Add client-side validation to `src/components/DocumentCapture.tsx`: reject files > 10MB before submission with inline error message; reject non-image MIME types with inline error message (prevents unnecessary server round-trip)
- [X] T026 [US3] Add error state handling to `src/app/uc1/page.tsx`: when `ProcessingState` is `'error'`, display the error message from `ExtractionError` mapped to a user-friendly string (per the error table in research.md), show a "Try again" button that resets state to `'idle'`; run T023 tests, confirm pass

**Checkpoint**: `npm test` passes all Phase 5 tests. Verify: (a) plain text upload shows error + retry, (b) camera button opens video preview and frame submission works.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Loading experience, mobile responsiveness, and final validation.

- [X] T027 [P] Add animated loading indicator to `src/app/uc1/page.tsx` during `recognizing` and `analyzing` states — show distinct labels ("Identifying document…" / "Extracting fields…") so the user knows which step is running
- [X] T028 [P] Verify Tailwind CSS breakpoints across all components: `DocumentCapture.tsx`, `ExtractionResult.tsx`, `src/app/uc1/page.tsx` — test at 375px (iPhone SE) and 768px (tablet) widths; fix any overflow or stacking issues
- [X] T029 Run full test suite (`npm test`) — all tests must pass; fix any regressions before marking done
- [X] T030 Follow `quickstart.md` steps from scratch in a clean terminal session; update any inaccurate commands or file paths found

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **User Story 1 (Phase 3)**: Depends on Phase 2 — first to implement
- **User Story 2 (Phase 4)**: Depends on Phase 3 — extends Phase 3 components
- **User Story 3 (Phase 5)**: Depends on Phase 3 — extends `DocumentCapture` and `uc1/page.tsx`
- **Polish (Phase 6)**: Depends on Phases 3–5 complete

### User Story Dependencies

- **US1 (P1)**: Builds the core pipeline — no prior story dependency
- **US2 (P2)**: Extends `ExtractionResult.tsx` and normalize logic from US1 — US1 must be complete
- **US3 (P3)**: Extends `DocumentCapture.tsx` and `uc1/page.tsx` from US1 — US1 must be complete; can run in parallel with US2

### Within Each User Story

1. Write ALL tests for the story → confirm they FAIL
2. Implement route/service tasks
3. Implement component tasks (can be parallel per [P] markers)
4. Run tests → confirm they PASS
5. Manual smoke test before moving to next story

---

## Parallel Opportunities

### Phase 3 — US1 (after T007 passes)

```
Parallel batch A (write tests together):
  T008  tests/api/recognize.test.ts
  T009  tests/api/analyze.test.ts
  T010  tests/components/DocumentCapture.test.tsx
  T011  tests/components/ExtractionResult.test.tsx

Parallel batch B (implement components, after routes are done):
  T014  src/components/DocumentCapture.tsx
  T015  src/components/ExtractionResult.tsx
```

### Phase 4 — US2

```
Parallel batch:
  T018  ExtractionResult passport tests
  T019  analyze.test.ts passport scenario
```

### Phase 5 — US3

```
Parallel batch:
  T022  DocumentCapture.camera.test.tsx
  T023  error scenario tests
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational (T005–T007)
3. Complete Phase 3: User Story 1 (T008–T017)
4. **STOP and VALIDATE**: upload a real CNI, confirm fields extracted and displayed
5. Demo-ready for UC1 CNI flow

### Incremental Delivery

1. Setup + Foundational → WIZIDEE client tested and working
2. User Story 1 → CNI extraction end-to-end ✅ Demo!
3. User Story 2 → Passport support added ✅ Demo!
4. User Story 3 → Camera capture + error handling ✅ Full UC1 complete
5. Polish → Production-quality demo

---

## Notes

- [P] tasks touch different files — safe to run in parallel
- Each US phase is a complete, independently demoed increment
- TDD: every test must be written and confirmed FAILING before the implementation task starts
- WIZIDEE HTTP calls are always mocked in tests — never call the real API in the test suite
- Commit after each checkpoint with a clear message (e.g., `add recognize proxy route with tests`)
- All credentials remain in `.env.local` — never in source files or logs
