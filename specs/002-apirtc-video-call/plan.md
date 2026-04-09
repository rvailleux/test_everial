# Implementation Plan: Simple One-to-One Video Call Interface

**Branch**: `002-apirtc-video-call` | **Date**: 2026-04-08 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-apirtc-video-call/spec.md`

## Summary

Build a simple one-to-one video call interface using the ApiRTC SDK. Two participants join a named room and see each other's live video stream. The feature includes a session-credentials API route (proxy pattern), a `VideoCall` React component with connection status and mute/camera controls, and full TDD coverage with a mocked ApiRTC SDK.

## Technical Context

**Language/Version**: TypeScript 5 / Node.js (Next.js 15 runtime)  
**Primary Dependencies**: Next.js 15 (App Router), React 19, `@apirtc/apirtc` SDK, Tailwind CSS 4  
**Storage**: N/A — all state is transient (React component state, cleared on call end)  
**Testing**: Jest + React Testing Library (mock `@apirtc/apirtc` module)  
**Target Platform**: Modern desktop browsers over HTTPS (Chrome, Firefox, Edge)  
**Project Type**: Web application (Next.js full-stack)  
**Performance Goals**: Call established within 10 s of both joining; controls respond within 1 s  
**Constraints**: HTTPS required for `getUserMedia`; ApiRTC SDK must be client-side only (no SSR)  
**Scale/Scope**: Demo app — single named room, two participants, no persistence

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Credentials Never Exposed | ✅ PASS | `APIRTC_API_KEY` stored in `.env.local`; served by `/api/apirtc/session`, never in client bundle |
| II. Proxy-First Architecture | ✅ PASS | Session credentials fetched from `/api/apirtc/session`. ApiRTC SDK WebRTC media connections are inherently browser-side (unavoidable by nature of WebRTC); documented in Complexity Tracking |
| III. Demonstrator Clarity | ✅ PASS | Inline logic in `VideoCall.tsx`, no premature abstractions |
| IV. Test-First (TDD) | ✅ PASS | Tests for `/api/apirtc/session` route and `VideoCall` component written before implementation |
| V. Modern, Responsive UI | ✅ PASS | Loading/connecting states, status indicator, mute/camera controls, responsive layout |
| VI. Video-First Integration | ✅ PASS | Video call interface is the foundation; document capture features to be built in-session (not async file upload) |

## Project Structure

### Documentation (this feature)

```text
specs/002-apirtc-video-call/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api-apirtc-session.md  # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code

```text
src/
├── app/
│   ├── video-call/
│   │   └── page.tsx                      # NEW: Video call page (room join form)
│   └── api/
│       └── apirtc/
│           └── session/
│               └── route.ts              # NEW: Returns APIRTC_API_KEY to client
├── components/
│   ├── VideoCall.tsx                     # NEW: Core video call component
│   └── CallControls.tsx                  # NEW: Mute / camera / leave buttons
└── lib/
    └── types.ts                          # MODIFIED: Add CallStatus, LocalMediaState, CallError

tests/
├── components/
│   └── VideoCall.test.tsx                # NEW: Component unit tests
└── api/
    └── apirtc-session.test.ts            # NEW: API route unit tests
```

**Structure Decision**: Follows the existing project layout (`src/app/`, `src/components/`, `src/lib/`, `tests/`). The video call page at `/video-call` is a standalone route separate from the WIZIDEE use-case pages (`/uc1`, etc.).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| ApiRTC SDK runs directly in the browser (not proxied) | WebRTC media streams require direct browser-to-ApiRTC-cloud connections; WebRTC cannot be proxied through a server for media data | Server-side WebRTC proxying would require a media relay (e.g., TURN server) — massively out of scope for a demonstrator; the proxy-first principle is satisfied for credential/session acquisition |
