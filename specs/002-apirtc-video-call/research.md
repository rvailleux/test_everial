# Research: Simple One-to-One Video Call Interface (ApiRTC)

**Feature**: 002-apirtc-video-call  
**Date**: 2026-04-08

---

## Decision 1: ApiRTC SDK Integration in Next.js (App Router)

**Decision**: Import `@apirtc/apirtc` as a client-only module using a dynamic import with `ssr: false` (or within a `'use client'` component guarded by a `useEffect` to ensure it only runs in the browser).

**Rationale**: The ApiRTC SDK calls browser APIs (`navigator.mediaDevices.getUserMedia`, WebRTC `RTCPeerConnection`) that do not exist in the Node.js runtime used by Next.js SSR. Attempting to import it at module level causes SSR build failures.

**Alternatives considered**:
- Static import with `typeof window !== 'undefined'` guards — fragile and error-prone across React lifecycle
- Separate WebRTC microservice — overkill for a demo

---

## Decision 2: API Key Exposure Strategy

**Decision**: The ApiRTC API key is stored in `.env.local` as `NEXT_PUBLIC_APIRTC_API_KEY`. The session route (`/api/apirtc/session`) returns it to the client on demand.

**Wait — is `NEXT_PUBLIC_` appropriate?** After research: ApiRTC API keys are semi-public identifiers (like Google Maps API keys) tied to a paid account but not secret in the same sense as passwords. They are visible in browser network requests by design. However, to comply with **Constitution Principle II** (Proxy-First), the key is NOT embedded in the frontend bundle at build time. Instead:
- Stored as `APIRTC_API_KEY` (no `NEXT_PUBLIC_` prefix → server-side only)
- Served on demand by `GET /api/apirtc/session` → `{ apiKey: string }`
- Frontend fetches this once on mount before initializing the SDK

**Rationale**: Keeps credentials out of client bundles and follows the proxy-first pattern established for WIZIDEE. The session route can later add rate-limiting or JWT verification if needed.

**Alternatives considered**:
- Hardcoding the demo API key in source — violates Principle I
- `NEXT_PUBLIC_APIRTC_API_KEY` — visible in bundle, violates proxy-first principle

---

## Decision 3: ApiRTC Call Flow

**Decision**: Use ApiRTC's **Conversation** model (room-based) rather than direct peer-to-peer call signaling.

**Flow**:
1. Frontend calls `GET /api/apirtc/session` → gets `{ apiKey }`
2. Creates `UserAgent` with `uri: 'apiKey:<apiKey>'`
3. Calls `userAgent.register()` → `Session`
4. Calls `session.getOrCreateConversation(roomName)` → `Conversation`
5. Sets up event listeners on `Conversation` (streamListChanged, streamAdded, contactJoined, contactLeft)
6. Calls `conversation.join()`
7. Creates local stream: `userAgent.createStream({ constraints: { audio: true, video: true } })`
8. Publishes: `conversation.publish(localStream)`
9. On `streamListChanged` (added): calls `conversation.subscribeToStream(streamId)`
10. On `streamAdded`: attaches stream to `<video>` element via `stream.attachToElement(videoEl)`

**On leave / unmount cleanup order**:
1. Unpublish all streams: `conversation.unpublish(localStream)`
2. Release local stream: `localStream.release()`
3. Leave conversation: `conversation.leave()`
4. Destroy conversation: `conversation.destroy()`

**Rationale**: Conversation model is the simplest and most idiomatic ApiRTC pattern. Both participants join by room name — no invite/signaling needed.

**Alternatives considered**:
- Direct call (`session.call(contactId)`) — requires knowing the remote contact ID ahead of time, adds complexity

---

## Decision 4: Mute / Camera Toggle

**Decision**: Use `localStream.disableAudio()` / `localStream.enableAudio()` and `localStream.disableVideo()` / `localStream.enableVideo()` on the published stream. The ApiRTC `Stream` API provides these helpers that toggle native MediaStreamTrack enabled state.

**Rationale**: Toggling at the stream level (not unpublishing) keeps the WebRTC channel open and avoids renegotiation, giving instant response.

---

## Decision 5: Testing Strategy for WebRTC Components

**Decision**: Mock the entire `@apirtc/apirtc` module in Jest using `jest.mock('@apirtc/apirtc')`. Test component state transitions (joining → waiting → connected → left) by simulating the mock's event emissions.

**Rationale**: Jest runs in Node.js (jsdom) where WebRTC APIs are unavailable. Mocking at the module level allows testing all UI states and event handlers without real network calls.

**Pattern**:
```ts
jest.mock('@apirtc/apirtc', () => ({
  UserAgent: jest.fn().mockImplementation(() => ({
    register: jest.fn().mockResolvedValue({
      getOrCreateConversation: jest.fn().mockReturnValue(mockConversation),
    }),
    createStream: jest.fn().mockResolvedValue(mockStream),
  })),
}));
```

---

## Decision 6: Route for the Video Call Page

**Decision**: Place the video call page at `src/app/video-call/page.tsx`.

**Rationale**: The feature is a standalone UI page. Naming `video-call` is clear and distinct from the WIZIDEE use-case pages (`/uc1`, etc.). In future, sessions with video + document capture will live at `src/app/session/[id]/page.tsx` (as planned in CLAUDE.md), but that is out of scope for this feature.

---

## Resolved Unknowns

| Unknown | Resolution |
|---------|------------|
| ApiRTC in SSR context | Client-only dynamic import or `useEffect` initialization |
| API key exposure | Server-side env var, served by `/api/apirtc/session` |
| Mute/camera implementation | `stream.enableAudio/disableAudio/enableVideo/disableVideo` |
| Test strategy | Mock `@apirtc/apirtc` module in Jest |
| Page URL | `/video-call` |
