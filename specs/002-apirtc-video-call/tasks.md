# Tasks: Simple One-to-One Video Call Interface

**Input**: Design documents from `/specs/002-apirtc-video-call/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: Included — required by Constitution Principle IV (TDD for all API routes and React components).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- TDD order: write test → confirm it fails → implement → confirm it passes

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and add shared types that all user stories depend on.

- [X] T001 Install `@apirtc/apirtc` npm package (run: `npm install @apirtc/apirtc`)
- [X] T002 [P] Add `APIRTC_API_KEY=your_key_here` to `.env.local.example` with a comment explaining it is required for the video call feature
- [X] T003 [P] Add `CallStatus`, `LocalMediaState`, and `CallError` types to `src/lib/types.ts` (see data-model.md for definitions)

**Checkpoint**: Dependencies installed, types available — ready to write tests and implement

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No additional foundational work beyond Phase 1 — the API route and component are implemented directly inside their respective user story phases.

*(No tasks — Phase 1 provides everything needed to begin user story implementation.)*

---

## Phase 3: User Story 1 — Start a Video Call (Priority: P1) 🎯 MVP

**Goal**: Two participants enter the same room name and see each other's live video stream. Either participant can leave.

**Independent Test**: Open two browser tabs at `/video-call`, enter the same room name in both, click Join in both — each tab must show the other's video. Click Leave — remote video must disappear.

### Tests for User Story 1 ⚠️ Write FIRST — confirm they FAIL before implementing

- [X] T004 [US1] Write failing test for `GET /api/apirtc/session` route: 200 with `{ apiKey }` when env var set, 500 when missing — in `tests/api/apirtc-session.test.ts`
- [X] T005 [P] [US1] Write failing tests for `VideoCall` component covering: renders join form in idle state, transitions to joining on submit, displays local video element after joining, renders remote video element when `streamAdded` fires, returns to idle on leave — in `tests/components/VideoCall.test.tsx` (mock `@apirtc/apirtc`)

### Implementation for User Story 1

- [X] T006 [US1] Implement `GET /api/apirtc/session` route in `src/app/api/apirtc/session/route.ts` — reads `APIRTC_API_KEY` from env, returns `{ apiKey }` or 500; run T004 tests and confirm they pass
- [X] T007 [US1] Implement `VideoCall` component in `src/components/VideoCall.tsx` — fetches API key from `/api/apirtc/session`, initializes ApiRTC `UserAgent` in `useEffect` (client-side only), handles join → publish local stream → subscribe to remote stream → leave with full cleanup (unpublish → release → leave → destroy); run T005 tests and confirm they pass
- [X] T008 [US1] Create video call page in `src/app/video-call/page.tsx` — room name input form, renders `<VideoCall roomName={...} />` once submitted

**Checkpoint**: User Story 1 fully functional — two tabs can video call each other independently of all other stories

---

## Phase 4: User Story 2 — Connection Status Feedback (Priority: P2)

**Goal**: A status indicator shows the current call state at all times (Connecting…, Waiting for peer…, Connected, Peer left, Disconnected).

**Independent Test**: Load `/video-call`, join a room — observe status changes from "Connecting…" to "Waiting for peer…". Open second tab and join same room — first tab status updates to "Connected". Second tab leaves — first tab status reverts to "Waiting for peer…".

### Tests for User Story 2 ⚠️ Write FIRST — confirm they FAIL before implementing

- [X] T009 [US2] Add status indicator tests to `tests/components/VideoCall.test.tsx`: assert status text renders as "Connecting…" during `joining`, "Waiting for peer…" during `waiting`, "Connected" when remote stream active, "Waiting for peer…" again when remote stream removed

### Implementation for User Story 2

- [X] T010 [US2] Add a visible status indicator element to `src/components/VideoCall.tsx` — renders appropriate text for each `CallStatus` value; run T009 tests and confirm they pass

**Checkpoint**: Status indicator independently verifiable — does not depend on US3 controls

---

## Phase 5: User Story 3 — Audio/Video Controls (Priority: P3)

**Goal**: Participants can mute their microphone or turn off their camera during an active call without ending the session.

**Independent Test**: Join a call. Click Mute — button reflects muted state, audio track disabled. Click Mute again — audio re-enabled. Click Camera Off — video disabled. Click Camera On — video re-enabled. All controls work independently of Leave.

### Tests for User Story 3 ⚠️ Write FIRST — confirm they FAIL before implementing

- [X] T011 [US3] Write failing tests for `CallControls` component in `tests/components/CallControls.test.tsx`: renders Mute, Camera, and Leave buttons; clicking Mute calls `onToggleAudio`; clicking Camera calls `onToggleVideo`; clicking Leave calls `onLeave`; Mute button reflects `audioEnabled` prop; Camera button reflects `videoEnabled` prop
- [X] T012 [P] [US3] Add tests to `tests/components/VideoCall.test.tsx` for controls integration: `CallControls` appears when status is `connected` or `waiting`; toggling audio calls `localStream.disableAudio()` / `enableAudio()`; toggling video calls `localStream.disableVideo()` / `enableVideo()`

### Implementation for User Story 3

- [X] T013 [US3] Implement `CallControls` component in `src/components/CallControls.tsx` — props: `audioEnabled`, `videoEnabled`, `onToggleAudio`, `onToggleVideo`, `onLeave`; styled buttons with clear active/inactive state; run T011 tests and confirm they pass
- [X] T014 [US3] Integrate `CallControls` into `src/components/VideoCall.tsx` — track `LocalMediaState` in component state; call `localStream.disableAudio/enableAudio/disableVideo/enableVideo` on toggle; render `<CallControls />` when status is `waiting` or `connected`; run T012 tests and confirm they pass

**Checkpoint**: All three user stories independently functional — full video call feature complete

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Navigation, UX polish, and manual validation.

- [X] T015 [P] Add a "Video Call" link or card to the landing page in `src/app/page.tsx` so the feature is reachable from the home screen
- [X] T016 Run the manual validation from `specs/002-apirtc-video-call/quickstart.md` — two browser tabs, same room name, verify video, controls, and leave all work end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **User Stories (Phases 3–5)**: All depend on Phase 1 completion (types, package installed)
  - Stories can proceed in priority order (P1 → P2 → P3) or in parallel if staffed
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Only depends on Phase 1 — no dependency on US2 or US3
- **User Story 2 (P2)**: Only depends on Phase 1 — integrates into existing `VideoCall.tsx` from US1 but is independently testable
- **User Story 3 (P3)**: Only depends on Phase 1 — integrates into existing `VideoCall.tsx` but callable independently via mocked props

### Within Each User Story

1. Write tests → confirm they FAIL (red)
2. Implement → confirm tests PASS (green)
3. Refactor if needed (refactor)
4. Commit before moving to next story

### Parallel Opportunities

- T002 and T003 can run in parallel with each other (different files)
- T004 and T005 can run in parallel (different test files)
- T011 and T012 can run in parallel (different test files)
- T015 is independent of T016 and can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch test writing tasks in parallel:
Task T004: "Write failing test for GET /api/apirtc/session in tests/api/apirtc-session.test.ts"
Task T005: "Write failing tests for VideoCall component in tests/components/VideoCall.test.tsx"

# Then implement sequentially (each test file gates its implementation):
Task T006: Implement route (T004 must pass)
Task T007: Implement VideoCall component (T005 must pass)
Task T008: Create page (depends on T007)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 3: User Story 1 (T004–T008)
3. **STOP and VALIDATE**: Open two browser tabs, test the call end-to-end
4. Demo if ready — US2 and US3 are additive enhancements

### Incremental Delivery

1. Setup (T001–T003) → Foundation ready
2. User Story 1 (T004–T008) → MVP: working video call
3. User Story 2 (T009–T010) → Enhanced: status feedback visible
4. User Story 3 (T011–T014) → Full: mute/camera controls
5. Polish (T015–T016) → Production-ready demo

---

## Notes

- [P] tasks = different files, no shared state dependencies
- [Story] label maps each task to its user story for traceability
- TDD is mandatory per Constitution Principle IV — always write tests first
- The `@apirtc/apirtc` SDK must be mocked in Jest (`jest.mock('@apirtc/apirtc')`) — WebRTC unavailable in jsdom
- ApiRTC `UserAgent` initialization must be inside `useEffect` (browser-only) — see research.md Decision 1
- `APIRTC_API_KEY` in `.env.local` only — never commit the actual key
- Commit after each task or logical group
