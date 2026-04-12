# Implementation Plan: Auto-Scan Document Detection in Video Stream

**Branch**: `007-auto-scan-document` | **Date**: 2026-04-12 | **Spec**: [spec.md](./spec.md)

## Summary

Add real-time document detection and auto-capture to the `/video-call` kernel. On each animation frame, sample the live video feed on an offscreen canvas, run a lightweight edge-detection + contour algorithm to locate the largest rectangular document, draw a colour-coded overlay (blue = detected, green = ready to capture), and automatically trigger the existing `handleCapture` path when the document is stable, large enough, and fully inside the frame.

## Technical Context

**Language/Version**: TypeScript 5 / React 19 / Next.js 16 (App Router)  
**Primary Dependencies**: None new — uses browser Canvas API + `requestAnimationFrame`; detection algorithm is pure TS  
**Storage**: N/A — detection state is transient React state  
**Testing**: Jest + jsdom (unit tests for detection algorithm); Playwright (visual E2E)  
**Target Platform**: Modern desktop/mobile browser (Chrome 90+, Firefox 90+, Safari 15+)  
**Project Type**: Web application — feature extension to the existing kernel  
**Performance Goals**: ≥ 10 fps detection loop; overlay updates within 300 ms of document appearing  
**Constraints**: Zero new network requests; no new npm packages required; offscreen canvas processing only

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Credentials Never Exposed | ✅ PASS | Detection is 100% client-side; no credentials involved |
| II. Proxy-First Architecture | ✅ PASS | No external API calls introduced |
| III. Demonstrator Clarity | ✅ PASS | Algorithm and hook are small, well-commented, readable |
| IV. Test-First (TDD) | ✅ PASS | `detectDocumentBoundary()` unit-tested; overlay E2E via Playwright |
| V. Modern, Responsive UI | ✅ PASS | Canvas overlay scales with video; green/blue colour feedback |
| VI. Single-Page Stateless Video Workflow | ✅ PASS | All state in React; auto-capture triggers existing `handleCapture` |
| VII. Visual Verification | ✅ PASS | Playwright screenshot of overlay before/after detection |
| VIII. Kernel/Modules Architecture | ✅ PASS | Feature lives in kernel page and new kernel components only |

## Phase 0: Research

### Decision: Detection Algorithm

**Decision**: Pure TypeScript canvas-based edge detection + contour search — no npm dependency.

**Rationale**: 
- OpenCV.js (~7 MB WASM) would be overkill for a demonstrator and hurts load time.
- A simplified Sobel → edge-connected-component → largest-quadrilateral pipeline fits in ~200 lines and is fully readable.
- The Canvas API's `ImageData` access gives direct pixel manipulation at acceptable speeds.

**Algorithm sketch**:
1. Draw video frame to `OffscreenCanvas` (downsampled to 320×240 for speed)
2. Convert to greyscale
3. Apply Sobel edge magnitude: for each pixel, compute `sqrt(Gx²+Gy²)`
4. Threshold to produce a binary edge map
5. Scan edge map for the tightest axis-aligned bounding rectangle enclosing a cluster of edges with a roughly document-like aspect ratio (1.4–2.2 for cards / A4)
6. Return the four corners of that bounding rectangle as `DocumentBoundary`

This is not a full perspective-correct quad detector (no Hough transform) — axis-aligned detection is sufficient for the demo since users hold documents roughly flat.

### Decision: Overlay Rendering

**Decision**: A `<canvas>` element positioned `absolute` and `pointer-events-none` over the video `<div>` container, sized and repositioned via a `ResizeObserver`.

**Rationale**: SVG overlays require DOM mutation per frame; a canvas `clearRect` + `strokeRect` is cheaper and matches the video frame cadence.

### Decision: Frame Loop

**Decision**: `requestAnimationFrame` loop throttled to 15 fps (skip frames using timestamp delta) running only while the kernel is mounted and the call has joined.

**Rationale**: 15 fps is well above the SC-003 threshold of 10 fps and avoids saturating the main thread while still providing responsive feedback.

## Phase 1: Design & Contracts

### Data Model

```typescript
// Four corners of the detected document in video-element pixels
interface DocumentBoundary {
  x: number;      // left edge
  y: number;      // top edge
  width: number;  // bounding box width
  height: number; // bounding box height
}

// Evaluated readiness for auto-capture
type OverlayState = 'none' | 'detected' | 'ready';

// Return value of useDocumentDetector hook
interface DetectorState {
  boundary: DocumentBoundary | null;
  overlayState: OverlayState;
}
```

### Source Code Structure

```text
src/
├── lib/
│   └── detection/
│       └── documentDetector.ts   # Pure TS: detectDocumentBoundary(ImageData, w, h)
│
├── hooks/
│   └── useDocumentDetector.ts    # React hook: frame loop + OverlayState
│
└── components/
    └── DocumentScanOverlay.tsx   # <canvas> overlay, draws boundary + colour

tests/
└── lib/
    └── detection/
        └── documentDetector.test.ts  # Unit tests for algorithm
```

### Integration with VideoCallKernel

`VideoCallKernel` receives two additions:
1. `useDocumentDetector(videoContainerRef, { enabled: hasJoined, onAutoCapture: handleCapture })` hook call
2. `<DocumentScanOverlay>` component rendered inside `videoContainerRef` div

The hook encapsulates the entire frame loop, stability timer, and auto-capture logic. The kernel passes `handleCapture` as `onAutoCapture` — no duplication of capture logic.

### Thresholds (configurable as constants)

```typescript
const MIN_AREA_RATIO = 0.30;    // document must fill ≥ 30% of frame area
const STABILITY_MS   = 500;     // ms of continuous readiness before capture
const COOLDOWN_MS    = 2000;    // ms pause after auto-capture
const TARGET_FPS     = 15;      // detection frame rate
const PROC_WIDTH     = 320;     // offscreen canvas processing width
const PROC_HEIGHT    = 240;     // offscreen canvas processing height
```
