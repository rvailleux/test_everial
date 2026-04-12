# Feature Specification: Auto-Scan Document Detection in Video Stream

**Feature Branch**: `007-auto-scan-document`  
**Created**: 2026-04-12  
**Status**: Draft  
**Input**: User description: "add an auto-scan feature on the video streams (should be executed in browser) to detect document in the video stream (mainly rectangle), put a blue shape line around the detected document, and when the document is large enough and complete, automatically take the snapshot"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Document Detection Overlay (Priority: P1)

A user holds a document (e.g. ID card, RIB) up to their camera during a video call. The application continuously analyses the camera feed, detects the rectangular boundary of the document, and draws a blue outline around it in real-time so the user knows the document has been spotted.

**Why this priority**: Visual feedback that the document was detected is the foundation of the entire auto-scan flow — without it, users have no confidence the system is working.

**Independent Test**: Open the video call page with an active camera showing a document; confirm a blue rectangle is drawn around the detected document on every frame.

**Acceptance Scenarios**:

1. **Given** the user is on `/video-call` with an active camera feed, **When** they hold a flat rectangular document within the camera frame, **Then** a blue outline traces the four edges of the document in real-time with no more than 300 ms lag.
2. **Given** the overlay is active, **When** the user moves the document, **Then** the blue outline follows the document position smoothly.
3. **Given** no document is visible in the frame, **Then** no overlay is drawn.

---

### User Story 2 — Automatic Snapshot on Good Capture (Priority: P2)

When the detected document is both large enough (fills a sufficient portion of the frame) and fully within the camera's visible area, the system automatically captures a snapshot — replacing the manual "Capture" button click for document scanning scenarios.

**Why this priority**: The auto-capture removes the single biggest friction point: perfectly timing a manual tap while holding the document still.

**Independent Test**: Present a document that covers at least 30 % of the video frame and is fully inside the frame boundaries; verify that a snapshot is taken automatically within 1 second, without any user interaction.

**Acceptance Scenarios**:

1. **Given** a document is detected, **When** the document area exceeds the size threshold AND all four corners are inside the frame, **Then** the system automatically triggers a snapshot capture after a brief stabilisation delay (≈ 500 ms).
2. **Given** a document is partially outside the camera frame, **Then** no automatic snapshot is taken.
3. **Given** the document is too small (below the area threshold), **Then** no automatic snapshot is taken.
4. **Given** an automatic snapshot has just been taken, **Then** the auto-scan pauses briefly (≈ 2 s) to avoid duplicate captures.

---

### User Story 3 — Capture Guidance Feedback (Priority: P3)

The overlay changes colour to guide the user: blue when detected (not yet ready), green when all conditions are met (about to capture).

**Why this priority**: Colour-coded feedback removes ambiguity about why auto-capture has not yet fired.

**Independent Test**: Observe overlay colour changing from blue → green as document fills the target area and is fully within frame.

**Acceptance Scenarios**:

1. **Given** a document is detected but too small or partially outside the frame, **Then** the outline is blue.
2. **Given** the document meets all capture conditions, **Then** the outline turns green.
3. **Given** the snapshot is triggered, **Then** a brief on-screen confirmation ("Snapshot captured") appears.

---

### Edge Cases

- What happens when multiple rectangular objects are present? → The largest rectangle resembling a document aspect ratio is chosen.
- What happens when camera permissions are denied? → Feature degrades gracefully; manual Capture button remains available.
- What happens on low-end devices where detection is slow? → Detection runs at a reduced frame rate; overlay may lag but no crash or UI freeze.
- What happens if the user clicks "Capture" manually while auto-scan is running? → Auto-scan pauses so both flows co-exist without conflict.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST analyse camera frames in the browser (client-side only, no server calls for detection).
- **FR-002**: The system MUST detect the bounding quadrilateral of rectangular documents in the video stream.
- **FR-003**: The system MUST draw a blue outline overlay on top of the video feed tracking the detected document in real-time.
- **FR-004**: The system MUST automatically trigger a snapshot capture when the document covers ≥ 30 % of the frame area AND all four corners are within the frame.
- **FR-005**: The system MUST wait for the document to be stable for at least 500 ms before auto-triggering the capture.
- **FR-006**: The system MUST pause auto-scan for ≥ 2 s after a capture to prevent duplicate snapshots.
- **FR-007**: The overlay colour MUST indicate readiness: blue for detected (not yet ready), green for ready to capture, absent when no document is found.
- **FR-008**: The auto-scan feature MUST NOT break the existing manual Capture button workflow.
- **FR-009**: Detection MUST run at ≥ 10 frames per second on a modern desktop browser without blocking the UI thread.
- **FR-010**: The feature MUST be part of the kernel (`/video-call` page), not a module.

### Key Entities

- **VideoFrame**: A single decoded frame from the camera stream used as input to the detector.
- **DocumentBoundary**: The four corner coordinates of the detected document rectangle within the video frame.
- **CaptureCondition**: The evaluated result (met / not-met) of size threshold + completeness check for a given boundary.
- **OverlayState**: The current visual state of the detection overlay (none / detecting / ready).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The blue outline appears within 300 ms of a document entering the camera frame on a modern desktop browser.
- **SC-002**: Auto-capture fires within 1 second of all capture conditions being continuously met.
- **SC-003**: Detection runs at ≥ 10 fps without causing visible UI jitter or freezes.
- **SC-004**: Zero unintended snapshots are taken when no document is present.
- **SC-005**: Users can still use the manual Capture button at any time with no degradation.
- **SC-006**: The feature operates entirely client-side — no additional network requests are introduced by detection.

## Assumptions

- The feature is implemented as part of the kernel (the `/video-call` page), not as a per-module feature.
- Detection runs purely in the browser using Canvas / image-processing; no server round-trips are introduced.
- A lightweight, browser-compatible approach is used (canvas-based edge detection or a small WASM lib); no large ML model download is required.
- The camera stream is already available via the existing LiveKit/video integration.
- Mobile support is best-effort; performance targets apply primarily to desktop browsers.
- The existing Capture button remains fully functional as a fallback; auto-scan is an enhancement, not a replacement.
