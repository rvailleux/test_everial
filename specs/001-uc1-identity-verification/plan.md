# Implementation Plan: UC1 — Identity Verification (CNI / Passport)

**Branch**: `001-uc1-identity-verification` | **Date**: 2026-04-08 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-uc1-identity-verification/spec.md`

## Summary

UC1 adds identity document capture (CNI and passport) with automatic recognition and field extraction via the WIZIDEE API. The user submits a document image (file upload or live camera), the Next.js backend recognizes the document type then extracts fields (name, DOB, expiry, MRZ), and the result is displayed in a human-readable card alongside the raw JSON. All WIZIDEE calls are proxied server-side; credentials never reach the browser.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js (Next.js runtime)  
**Primary Dependencies**: Next.js 16.2.2, React 19, Tailwind CSS 4, Jest + React Testing Library (to be added)  
**Storage**: None — extraction results are session-only, held in React state  
**Testing**: Jest + React Testing Library (not yet in package.json — must be installed)  
**Target Platform**: Web (desktop + mobile browser)  
**Project Type**: Web application (Next.js App Router — frontend + API routes as backend)  
**Performance Goals**: Document recognized and fields extracted within 10 seconds of upload  
**Constraints**: Credentials never in browser; all WIZIDEE calls via `/api/wizidee/*` proxy routes  
**Scale/Scope**: Single-user demo session; no concurrent-user requirements for UC1

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Credentials Never Exposed | **PASS** | Token acquired in `lib/wizidee.ts` (server-side only); credentials from `.env.local`; no token forwarded to browser |
| II. Proxy-First Architecture | **PASS** | Browser calls `/api/wizidee/recognize` and `/api/wizidee/analyze`; Next.js routes proxy to `api.v2.wizidee.com` |
| III. Demonstrator Clarity | **PASS** | Single `lib/wizidee.ts` client; inline logic per route; no abstraction layers |
| IV. Test-First (TDD) | **PASS** | Tests written before implementation for all API routes and UI components |
| V. Modern, Responsive UI | **FLAG → RESOLVED** | Spec assumed camera capture deferred; Constitution says MUST support both upload + camera. Plan includes camera capture (via browser `getUserMedia`) as a required UC1 deliverable, overriding the spec assumption. |

**Result**: All gates pass. Flag on Principle V resolved by including camera capture in scope.

## Project Structure

### Documentation (this feature)

```text
specs/001-uc1-identity-verification/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api.md           # API route contracts
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── page.tsx                        # Landing — use case selector (update existing)
│   ├── layout.tsx                      # (existing)
│   ├── globals.css                     # (existing)
│   ├── uc1/
│   │   └── page.tsx                    # UC1 demo page
│   └── api/
│       └── wizidee/
│           ├── recognize/
│           │   └── route.ts            # Proxy → WIZIDEE /api/v1/recognize
│           └── analyze/
│               └── route.ts            # Proxy → WIZIDEE /api/v1/analyze
├── components/
│   ├── DocumentCapture.tsx             # Upload + live camera capture UI
│   └── ExtractionResult.tsx           # Extracted fields card + raw JSON toggle
└── lib/
    └── wizidee.ts                      # Server-side WIZIDEE API client (token cache + fetch helpers)

tests/
├── api/
│   ├── recognize.test.ts               # Route: happy path, auth failure, unreadable doc
│   └── analyze.test.ts                 # Route: happy path, missing dbId/radId, upstream error
└── components/
    ├── DocumentCapture.test.tsx        # Upload + camera flows, loading state
    └── ExtractionResult.test.tsx       # Card rendering, raw JSON toggle, empty/partial results
```

**Structure Decision**: Next.js App Router web application. API routes under `src/app/api/wizidee/` act as secure proxy. UI components under `src/components/`. Server-only logic in `src/lib/`. Tests mirror source structure under `tests/`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Camera capture in UC1 (spec assumed deferred) | Constitution Principle V mandates both upload + camera | Demo targets mobile users capturing documents on phone; upload-only degrades mobile experience significantly |
