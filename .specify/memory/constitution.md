<!--
SYNC IMPACT REPORT
==================
Version change: 1.3.0 → 2.0.0
Modified principles:
  VI. Video-First Integration → Single-Page Stateless Video Workflow
      Backward-incompatible redefinition: single /video-call page, fully
      stateless, snapshot-centric workflow replaces multi-participant
      session model and /session/[id]/ routing.
  VIII. Kernel/Modules Architecture
      Updated: kernel is now strictly /video-call (not session/[id]/);
      results displayed on snapshot page rather than in a separate
      shared results area; modules MUST NOT create additional routes.
Added sections: none
Removed sections: none
Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check updated (VI renamed)
  ✅ CLAUDE.md — Video-First and Kernel/Modules sections rewritten
  ✅ todo.md — Refactoring plan added, kernel tasks updated for /video-call
Deferred TODOs: none
-->

# WIZIDEE Demo App Constitution

## Core Principles

### I. Credentials Never Exposed

WIZIDEE API credentials (username, password, JWT tokens) MUST remain exclusively
server-side. No credential, token, or API key may appear in:
- Frontend source code or browser-accessible bundles
- Git history (use `.env.local`, never committed)
- Client-side state, logs, or API responses forwarded to the browser

Rationale: The Postman collection contains production credentials. A single
accidental exposure would compromise the live WIZIDEE account.

### II. Proxy-First Architecture

All calls to external APIs (WIZIDEE) MUST route through Next.js API
routes (`/api/*`). The frontend MUST NOT call `wizidee.com` endpoints directly.

- Next.js route handles auth token lifecycle (acquire, cache, refresh)
- Frontend sends documents to `/api/wizidee/*`, never to the upstream directly
- Each WIZIDEE flow step (recognize → analyze → consolidate) has its own route

Rationale: Enforces the single security boundary. Simplifies frontend code.
Makes the integration flow explicit and auditable in one place.

### III. Demonstrator Clarity

This codebase is a **reference implementation** that developers will read to
understand WIZIDEE integration. Code MUST be simple and self-explanatory.

- No premature abstractions: logic used once stays inline
- No over-engineering: avoid patterns that obscure the WIZIDEE API flow
- Comments are required only where intent is non-obvious
- A developer unfamiliar with WIZIDEE MUST be able to follow the full
  recognize → analyze flow by reading the code without external docs

Rationale: The primary deliverable is comprehension, not production hardening.
Complexity that aids understanding is welcome; complexity that obscures it is not.

### IV. Test-First (TDD)

Tests MUST be written before implementation for:
- All Next.js API routes (WIZIDEE proxy routes)
- All React components that handle document capture or display results

Red → Green → Refactor cycle is enforced. WIZIDEE HTTP calls are mocked
in tests (no real API calls in the test suite).

Rationale: A demonstrator with broken flows teaches bad practices. TDD ensures
each use case is verifiably functional before it is shown to stakeholders.

### V. Modern, Responsive UI

The user interface MUST be polished, fast, and usable on mobile devices, as
document capture frequently happens on a phone.

- Every async operation MUST have a visible loading state
- Extraction results MUST be shown in both human-readable card format AND
  raw JSON (for developer audience)
- Results MUST be displayed on the snapshot (overlaid or alongside it) on the
  same page — never on a separate page or in a separate route
- UI MUST work at mobile viewport widths (document photos taken on phone)

Rationale: The app is shown to prospects and business stakeholders. First
impressions matter. A slow or broken UI undermines confidence in WIZIDEE.

### VI. Single-Page Stateless Video Workflow

The entire application MUST live on a single page: `/video-call`. This page
is the only user-facing route. All document capture, processing, and result
display happen here without page navigation or server-side session state.

**The canonical user workflow — enforced for every module:**
1. User starts a video call on `/video-call`
2. User takes a snapshot from the live video stream
3. User selects a data extraction module and clicks "Process"
4. Extracted data is displayed on the same page, overlaid on or alongside
   the snapshot — the page does NOT navigate away

**Hard constraints:**
- `/video-call` is the ONLY user-facing page; no `/session/[id]/` or other routes
- All UI state (snapshot, selected module, results) is held in React component
  state — no server-side session, no database, no URL parameters for session
- When the page is refreshed, all state resets — this is intentional and correct
- Modules MUST NOT create additional pages or routes
- Results MUST appear in the same viewport as the snapshot and the video feed

Rationale: Stateless, single-page design maximises simplicity for a
demonstrator. It eliminates session management complexity and makes the
integration flow immediately legible to any developer reading the code.
Displaying results alongside the snapshot is the literal product value:
"here is the document — here is what WIZIDEE extracted from it."

### VII. Visual Verification via Chrome DevTools

Every frontend feature MUST be verified with Chrome DevTools Protocol (CDP)
before the task is considered complete. Visual verification via browser
automation is not optional — it is a mandatory quality gate.

- Each page and critical user flow MUST be tested using Chrome DevTools
  Protocol (via Puppeteer, chrome-remote-interface, or similar CDP client)
- Screenshots MUST be captured at multiple viewport sizes (desktop, tablet, mobile)
- Console errors and network failures MUST be captured and reviewed
- No task is complete without visual verification — screenshots and console
  logs are the proof that the UI renders correctly in a real browser

Rationale: Unit tests with Jest + jsdom cannot catch CSS regressions, layout
shifts, or browser-specific rendering issues. Chrome DevTools Protocol provides
direct access to the browser's internals for comprehensive verification.

### VIII. Kernel/Modules Architecture

The `/video-call` page is the **kernel**. All document processing features are
**modules** that plug into this single page — never standalone pages or
separate workflows.

**Kernel Responsibilities (the `/video-call` page):**
- Video session management and peer connection (LiveKit)
- Snapshot capture from the live video stream
- Module registry and lifecycle management
- Shared UI areas rendered on `/video-call`: module selector, config area,
  capture/process actions, and results display alongside the snapshot

**Module Responsibilities (feature extensions):**
- Each WIZIDEE use case (Identity, RIB, Proof of Address, etc.) is a module
- Modules register themselves with the kernel via a consistent interface
- Modules provide: configuration UI, processing logic (via WIZIDEE APIs),
  and result rendering — all rendered within `/video-call`
- Modules MUST NOT implement their own video handling, snapshot capture,
  page routing, or session state

**Integration Contract (per the Principle VI workflow):**
1. User starts video call on `/video-call`
2. User clicks "Capture" → kernel acquires snapshot from video stream
3. User selects a module from the kernel's menu → module config UI renders
4. User clicks "Process" → module calls WIZIDEE via `/api/wizidee/*` routes
5. Results render on `/video-call`, alongside the snapshot — no navigation

Rationale: Locking all modules to `/video-call` enforces Principle VI by
design. Modules cannot break the single-page, stateless contract because they
have no mechanism to create routes or persist state. Every new use case
automatically follows the correct workflow.

## Technical Constraints

- **Framework**: Next.js (App Router) with TypeScript
- **Styling**: Tailwind CSS (or equivalent utility-first framework)
- **Video**: LiveKit SDK for live video capture on `/video-call`
- **Testing**: Jest + React Testing Library (unit), Chrome DevTools Protocol (visual/E2E)
- **Git workflow**: Trunk-based development (commit to `main`, short-lived branches < 1 day)
- **Language**: English for code, comments, and commit messages
- **Credentials**: Stored in `.env.local` only — `.env.local` is gitignored
- **State**: React component state only — no server sessions, no database persistence

## Use Case Scope

The following 13 use cases are in scope, implemented in priority order.
Each use case MUST be implemented as a module that plugs into `/video-call`
per Principles VI and VIII.

**MVP (UC1–UC4)**
- UC1: Identity verification — CNI / Passport
- UC2: Proof of address
- UC3: Proof of income
- UC4: RIB / Bank account details

**Extended**
- UC5: Driver's license
- UC6: Health card (Carte vitale)
- UC7: Company registration (KBIS)
- UC8: Residence permit
- UC9: Biometric identity check (CNI + selfie)
- UC10: Neurolens zero-shot extraction
- UC11: Incoming document classification
- UC12: Signature detection
- UC13: Document anonymization

## Governance

- This constitution supersedes all other practices in case of conflict.
- Amendments require: a written rationale, a version bump per semver rules,
  and an update to this document before the change is implemented.
- All feature plans and specs MUST include a Constitution Check gate that
  validates compliance with Principles I–VIII before implementation begins.
- Principle I (Credentials), Principle VI (Single-Page Stateless Workflow),
  Principle VII (Visual Verification), and Principle VIII (Kernel/Modules)
  violations are blocking and non-negotiable.
- Complexity deviating from Principle III MUST be justified in the
  plan's Complexity Tracking table.

**Version**: 2.0.0 | **Ratified**: 2026-04-08 | **Last Amended**: 2026-04-10
