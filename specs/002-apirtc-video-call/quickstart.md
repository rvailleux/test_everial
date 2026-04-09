# Quickstart: Video Call Feature (002-apirtc-video-call)

## Prerequisites

1. **ApiRTC account** — sign up at `cloud.apirtc.com` and copy your API key.

2. **Add to `.env.local`**:
   ```env
   APIRTC_API_KEY=your_apirtc_api_key_here
   ```

3. **Install ApiRTC SDK**:
   ```bash
   npm install @apirtc/apirtc
   ```

4. **HTTPS required** — `getUserMedia` only works over HTTPS. Next.js dev server supports this:
   ```bash
   # Add to package.json scripts:
   "dev:https": "next dev --experimental-https"
   ```
   Or use a local tunnel (e.g., `ngrok http 3000`) during development.

---

## Run the App

```bash
npm run dev
# Navigate to https://localhost:3000/video-call
```

---

## Test a One-to-One Call

1. Open `https://localhost:3000/video-call` in **two browser tabs** (or two devices on the same network).
2. Enter the **same room name** in both tabs (e.g., `test-room`).
3. Click **Join** in both tabs.
4. Grant camera/microphone permissions when prompted.
5. Both tabs should show each other's live video.

---

## Running Tests

```bash
npm test
# Runs Jest for all test files, including VideoCall component and /api/apirtc/session route
```

---

## Key Files

| File | Purpose |
|------|---------|
| `src/app/video-call/page.tsx` | Video call page (room join form + call UI) |
| `src/components/VideoCall.tsx` | Core video call component (ApiRTC logic) |
| `src/components/CallControls.tsx` | Mute / camera / leave buttons |
| `src/app/api/apirtc/session/route.ts` | Returns ApiRTC API key to client |
| `src/lib/types.ts` | `CallStatus`, `LocalMediaState`, `CallError` types |
| `tests/components/VideoCall.test.tsx` | Component unit tests |
| `tests/api/apirtc-session.test.ts` | API route unit tests |
