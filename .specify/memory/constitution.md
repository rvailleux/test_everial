<!--
SYNC IMPACT REPORT
==================
Version change: (template) → 1.0.0
New principles: 5 (all new — first ratification from blank template)
  I.   Credentials Never Exposed
  II.  Proxy-First Architecture
  III. Demonstrator Clarity
  IV.  Test-First (TDD)
  V.   Modern, Responsive UI
Added sections: Technical Constraints, Use Case Scope
Removed sections: none
Templates checked:
  ✅ .specify/templates/plan-template.md — Constitution Check gates aligned
  ✅ .specify/templates/spec-template.md — no mandatory sections conflict
  ✅ .specify/templates/tasks-template.md — task types align with TDD principle
  ✅ README.md — no outdated references
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

All calls to external APIs (WIZIDEE, ApiRTC) MUST route through Next.js API
routes (`/api/*`). The frontend MUST NOT call `wizidee.com` or `apirtc.io`
endpoints directly.

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

## Technical Constraints

- **Framework**: Next.js (App Router) with TypeScript
- **Styling**: Tailwind CSS (or equivalent utility-first framework)
- **Video**: ApiRTC SDK for in-session document capture flows
- **Testing**: Jest + React Testing Library
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

Each use case MUST be independently demonstrable without requiring others.

## Governance

- This constitution supersedes all other practices in case of conflict.
- Amendments require: a written rationale, a version bump per semver rules,
  and an update to this document before the change is implemented.
- All feature plans and specs MUST include a Constitution Check gate that
  validates compliance with Principles I–V before implementation begins.
- Principle I (Credentials) violations are blocking and non-negotiable.
- Complexity deviating from Principle III MUST be justified in the
  plan's Complexity Tracking table.

**Version**: 1.0.0 | **Ratified**: 2026-04-08 | **Last Amended**: 2026-04-08
