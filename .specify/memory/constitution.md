<!--
SYNC IMPACT REPORT
==================
Version change: 1.2.1 → 1.3.0
Modified principles: 1 added
  VIII. Kernel/Modules Architecture (NEW)
Rationale: New architectural principle defining the video call as a kernel
  and document processing features as plug-in modules. Formalizes the
  kernel/modules design pattern for all WIZIDEE feature development.
Added sections: none
Removed sections: none
Templates requiring updates:
  ✅ .specify/templates/plan-template.md — added Principle VIII reference
  ✅ CLAUDE.md — added Kernel/Modules Architecture section
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
- Document capture MUST support both file upload and live camera capture
- UI MUST work at mobile viewport widths (document photos taken on phone)

Rationale: The app is shown to prospects and business stakeholders in the
context of a video call. First impressions matter. A slow or broken UI
undermines confidence in the WIZIDEE product itself.

### VI. Video-First Integration

All WIZIDEE document capture features MUST be built into the video call
interface as synchronous, in-session workflows. Features MUST NOT be
implemented as standalone async file upload pages separate from the video call.

- Document capture happens during the active video session
- Participants see each other while documents are being captured and processed
- Results are displayed in real-time to both parties within the call interface
- The video call is the container; document processing is the feature

Rationale: The core value proposition is "document verification during a
video call" — not "file upload with a separate video feature". Keeping
everything in-session demonstrates the true WIZIDEE integration
value: real-time identity verification with a human in the loop.

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

The video call interface MUST be architected as a **kernel** with pluggable
**modules**. All document processing features are modules that extend the
kernel — never standalone pages or separate workflows.

**Kernel Responsibilities (The Video Call Foundation):**
- Video session management and peer connection (LiveKit)
- Snapshot capture from the video stream (camera or screen share)
- Module registry and lifecycle management
- Shared UI chrome: menu system for module selection, configuration area,
  action triggers, and results display area

**Module Responsibilities (Feature Extensions):**
- Each WIZIDEE use case (Identity, RIB, Proof of Address, etc.) is a module
- Modules register themselves with the kernel via a consistent interface
- Modules provide: configuration UI, processing logic (via WIZIDEE APIs),
  and result rendering components
- Modules MUST NOT implement their own video handling or snapshot capture

**Integration Contract:**
- User selects a module from the kernel's menu → module's config UI renders
- User configures options → clicks "Capture" → kernel acquires snapshot
- User clicks "Process" → module sends snapshot to WIZIDEE via kernel APIs
- Results appear in the shared results area, visible to both call participants

Rationale: This architecture enforces consistency across all use cases,
eliminates duplication of video/snapshot logic, and makes adding new document
types a matter of implementing the module interface. The kernel/modules
pattern ensures that every feature naturally follows the Video-First principle
by design — modules cannot exist outside the video call context.

## Technical Constraints

- **Framework**: Next.js (App Router) with TypeScript
- **Styling**: Tailwind CSS (or equivalent utility-first framework)
- **Video**: LiveKit SDK for in-session document capture flows
- **Testing**: Jest + React Testing Library (unit), Chrome DevTools Protocol (visual/E2E)
- **Git workflow**: Trunk-based development (commit to `main`, short-lived branches < 1 day)
- **Language**: English for code, comments, and commit messages
- **Credentials**: Stored in `.env.local` only — `.env.local` is gitignored

## Use Case Scope

The following 13 use cases are in scope, implemented in priority order:

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

Each use case MUST be implemented as a Kernel Module per Principle VIII.

## Governance

- This constitution supersedes all other practices in case of conflict.
- Amendments require: a written rationale, a version bump per semver rules,
  and an update to this document before the change is implemented.
- All feature plans and specs MUST include a Constitution Check gate that
  validates compliance with Principles I–VIII before implementation begins.
- Principle I (Credentials), Principle VI (Video-First), Principle VII
  (Visual Verification), and Principle VIII (Kernel/Modules) violations
  are blocking and non-negotiable.
- Complexity deviating from Principle III MUST be justified in the
  plan's Complexity Tracking table.

**Version**: 1.3.0 | **Ratified**: 2026-04-08 | **Last Amended**: 2026-04-09
