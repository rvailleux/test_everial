# Data Model: Simple One-to-One Video Call Interface

**Feature**: 002-apirtc-video-call  
**Date**: 2026-04-08

---

## Types (additions to `src/lib/types.ts`)

### `CallStatus`

Represents the current state of the video call from the local participant's perspective.

```ts
export type CallStatus =
  | 'idle'        // Not joined — showing the room-name input form
  | 'joining'     // Connecting to ApiRTC (fetching API key, registering UserAgent)
  | 'waiting'     // Joined but no remote peer yet
  | 'connected'   // Remote peer stream received and active
  | 'error'       // Connection or permission failure
  | 'left';       // User clicked Leave; resources released
```

### `LocalMediaState`

Tracks mute/camera toggle state independently of the WebRTC stream.

```ts
export interface LocalMediaState {
  audioEnabled: boolean;
  videoEnabled: boolean;
}
```

### `CallError`

Structured error reported to the UI layer.

```ts
export interface CallError {
  message: string;
  cause?: 'permission-denied' | 'connection-failed' | 'session-fetch-failed';
}
```

---

## State Transitions

```
idle
 └─(user clicks Join)──► joining
                           ├─(error)──► error
                           │              └─(retry)──► idle
                           └─(success)──► waiting
                                           ├─(peer joins)──► connected
                                           │                    └─(peer leaves)──► waiting
                                           └─(user clicks Leave)──► left
                                                                       └─(rejoin)──► idle
```

---

## Key Runtime Objects (ApiRTC SDK — not persisted)

These objects live in React state/refs and are discarded when the call ends:

| Object | Type | Lifecycle |
|--------|------|-----------|
| `userAgent` | ApiRTC `UserAgent` | Created on join, destroyed on leave |
| `session` | ApiRTC `Session` | Obtained from `userAgent.register()` |
| `conversation` | ApiRTC `Conversation` | Obtained from `session.getOrCreateConversation(room)` |
| `localStream` | ApiRTC `Stream` | Created, published, released on leave |
| `remoteStream` | ApiRTC `Stream` | Received via `streamAdded` event, displayed |

---

## Notes

- No data is persisted. All state is held in React component state and cleared on leave or page unload.
- The `room` name (string) is the only user input and serves as the ApiRTC Conversation identifier.
- `LocalMediaState` is tracked separately from the ApiRTC stream so the UI can update immediately (optimistic) before the SDK call completes.
