# Feature Specification: Simple One-to-One Video Call Interface

**Feature Branch**: `002-apirtc-video-call`  
**Created**: 2026-04-08  
**Status**: Draft  
**Input**: User description: "make a simple one to one video call interface based on apirtc. code example can be found on https://github.com/ApiRTC/ApiRTC-ng-demo"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Start a Video Call (Priority: P1)

An agent (or user) opens the application, enters a shared room name, and starts a one-to-one video call with another participant who joins the same room.

**Why this priority**: This is the core value of the feature. Without it nothing else exists.

**Independent Test**: Can be fully tested by opening two browser tabs, entering the same room name in both, and verifying that each tab shows the other participant's live video and audio.

**Acceptance Scenarios**:

1. **Given** a user opens the video call page, **When** they enter a room name and click "Join", **Then** their local camera preview appears and they are connected to the room.
2. **Given** a first user is waiting in a room, **When** a second user joins the same room name, **Then** both participants see each other's video stream in real time.
3. **Given** two participants are in a call, **When** either participant clicks "Leave", **Then** the call ends and the remote video disappears for both participants.

---

### User Story 2 - See Connection Status Feedback (Priority: P2)

A user is informed of the connection state at all times — whether they are connecting, connected, or disconnected — so they are never left wondering if the system is working.

**Why this priority**: Without status feedback, users cannot distinguish between a working call and a failed one. Critical for usability and trust in the demo.

**Independent Test**: Can be tested by loading the page and observing that a status indicator reflects "Connecting…" then "Connected" after joining, and "Disconnected" after leaving.

**Acceptance Scenarios**:

1. **Given** a user clicks "Join", **When** the connection is being established, **Then** a visible status indicator shows "Connecting…".
2. **Given** a connection is established, **When** both streams are active, **Then** the status indicator changes to "Connected".
3. **Given** the remote participant leaves, **When** the stream is removed, **Then** the status indicator updates to reflect the peer disconnection.

---

### User Story 3 - Control Audio and Video (Priority: P3)

A participant can mute their microphone or turn off their camera during a call without ending the session.

**Why this priority**: Basic call controls are expected in any video call interface, even in a demo. They improve professionalism and usability without adding scope complexity.

**Independent Test**: Can be tested by toggling mute/camera controls during an active call and verifying the local stream reflects the change, and the remote participant's view updates accordingly.

**Acceptance Scenarios**:

1. **Given** a user is in an active call, **When** they click the mute button, **Then** their audio is disabled and the button reflects the muted state.
2. **Given** a user is in an active call, **When** they click the camera off button, **Then** their video is disabled and the remote participant sees a placeholder or blank video.
3. **Given** a user has muted their audio, **When** they click the mute button again, **Then** audio is re-enabled.

---

### Edge Cases

- What happens when only one participant joins a room (no peer present)? → The participant waits with their local preview visible; no error is shown.
- What happens when camera or microphone permission is denied by the browser? → The user sees a clear message explaining that camera/microphone access is required.
- What happens if the network disconnects mid-call? → The remote video disappears and the status indicator updates; the session does not crash.
- What happens if a third participant tries to join the same room? → The interface is designed for two participants; a third may still join the conversation but the UI optimizes for the two-person layout.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow a user to enter a room name and join a video call session identified by that room name.
- **FR-002**: The system MUST display the local participant's video preview before and during the call.
- **FR-003**: The system MUST display the remote participant's live video stream when a second user joins the same room.
- **FR-004**: The system MUST provide a "Leave" action that ends the participant's session and releases media resources.
- **FR-005**: The system MUST display a connection status indicator reflecting the current call state (connecting, connected, peer disconnected).
- **FR-006**: The system MUST request camera and microphone permissions from the browser and show a clear message if permissions are denied.
- **FR-007**: The system MUST allow a participant to toggle their microphone on/off during an active call.
- **FR-008**: The system MUST allow a participant to toggle their camera on/off during an active call.
- **FR-009**: The system MUST release all media resources (camera, microphone) when the user leaves the call or closes the page.

### Key Entities

- **Room**: A named shared space identified by a string. Two participants entering the same room name are placed in the same call.
- **Participant**: A user in the call. Has a local media stream (audio + video) and may receive a remote stream.
- **Stream**: A media feed (local or remote). Has an active/inactive state and can be muted independently for audio and video tracks.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Two participants can establish a live video call by entering the same room name within 10 seconds of both joining.
- **SC-002**: The local video preview appears within 3 seconds of the user granting camera/microphone permissions.
- **SC-003**: The connection status indicator updates within 2 seconds of any state change (peer join, peer leave, network drop).
- **SC-004**: Toggling mute or camera controls takes effect within 1 second and is reflected visually in the UI immediately.
- **SC-005**: All media resources are released within 2 seconds of the user clicking "Leave", with no lingering active camera/microphone indicator in the browser.

## Assumptions

- The application is served over HTTPS (required for browser camera/microphone access).
- A valid ApiRTC API key is available and configured in the environment; no authentication of end users is required by the demo.
- The target scenario is exactly two participants per room (one-to-one). A third participant joining is technically allowed but not a primary scenario.
- Room names are user-chosen free-text strings; no room management (creation, listing, password protection) is in scope.
- No persistent storage is needed — call history, user profiles, and chat logs are out of scope.
- The interface must work on modern desktop browsers (Chrome, Firefox, Edge). Mobile support is a bonus, not a requirement.
- The existing Next.js application structure (App Router) and component patterns from the project will be followed.
