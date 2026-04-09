# Research: UC1 — Identity Verification (CNI / Passport)

## 1. WIZIDEE API Flow

**Decision**: Two-step flow — recognize then analyze — both via multipart POST.

**Rationale**: The Postman collection confirms the sequence: `recognize` returns `{dbId, radId}` identifying the document model; `analyze` requires `file + dbId + radId` to extract fields. These must not be merged into one call — the `dbId`/`radId` pair is the bridge.

**Auth**: All requests to `api.v2.wizidee.com` include `Authorization: Bearer <access_token>`. Token is obtained from `auth.v2.wizidee.com` via `grant_type=password` (OpenID Connect resource-owner flow), with `client_id=tools` and `scope=openid`.

**Alternatives considered**: None — WIZIDEE API dictates this flow.

---

## 2. Token Lifecycle Management

**Decision**: In-memory module-level cache in `lib/wizidee.ts`. Token is refreshed proactively when it will expire within 60 seconds.

**Rationale**: Simple for a demonstrator. No Redis, no database, no file I/O. Works correctly for a single-process Next.js dev server. JWT expiry is decoded client-side (no introspection call needed) by reading the `exp` claim.

**Implementation**:
```
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt - Date.now() > 60_000) {
    return cachedToken.value;
  }
  // acquire new token, parse exp from JWT payload, set cachedToken
}
```

**Alternatives considered**: Redis (overkill for demo), rotating via cron (unnecessary complexity), re-acquiring on every request (wasteful, risks rate limiting).

---

## 3. Image Transfer: Browser → Next.js Route

**Decision**: Browser sends `FormData` (multipart/form-data) directly to `/api/wizidee/recognize` and `/api/wizidee/analyze`. The Next.js route reads the file via `request.formData()` and re-streams it as multipart to WIZIDEE.

**Rationale**: Keeps the browser side simple (standard `fetch` + `FormData`). Next.js 16 with App Router supports `request.formData()` natively. Re-streaming avoids loading the full file into memory as a string.

**Alternatives considered**: Base64 JSON payload (doubles payload size, breaks streaming), pre-signed upload URL (requires WIZIDEE support — not available).

---

## 4. Camera Capture Implementation

**Decision**: Use the browser's `MediaDevices.getUserMedia` API to open the rear camera on mobile, display a video preview, and capture a frame to a canvas. The canvas blob is sent as the file upload.

**Rationale**: Native browser API — no third-party dependency. Works on all modern mobile browsers. The `facingMode: 'environment'` constraint opens the rear camera by default, which is correct for document capture.

**Key considerations**:
- Must fall back gracefully if camera permission is denied (show upload-only mode).
- HTTPS required for `getUserMedia` in production (Next.js dev server on localhost is exempt).

**Alternatives considered**: Third-party camera libraries (adds bundle size, unnecessary for a demo), file input with `capture="environment"` attribute (simpler but gives no live preview — poor UX for document alignment).

---

## 5. Testing Setup (Jest + React Testing Library)

**Decision**: Add `jest`, `jest-environment-jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `ts-jest` as dev dependencies. Configure `jest.config.ts` with `testEnvironment: 'node'` for API route tests and `testEnvironment: 'jsdom'` for component tests (split via `testPathPattern` or two configs).

**Rationale**: Standard setup for Next.js + TypeScript. API routes run in Node environment; React components in jsdom. WIZIDEE HTTP calls are mocked with `jest.fn()` or `msw` (Mock Service Worker) — no real API calls in tests.

**Alternatives considered**: Vitest (compatible but not the stated tech stack), Playwright for component tests (heavier, not needed at this stage).

---

## 6. Extraction Result Display

**Decision**: Show two views side by side (or tabbed on mobile): a human-readable card with labeled fields, and a raw JSON collapsible section. Use Tailwind CSS for layout.

**Field mapping for CNI**:
| WIZIDEE field key (expected) | Display label |
|------------------------------|---------------|
| `lastName` / `nom`           | Last name     |
| `firstName` / `prenom`       | First name    |
| `dateOfBirth` / `dateNaissance` | Date of birth |
| `expiryDate` / `dateExpiration` | Expiry date |
| `mrz`                        | MRZ           |

**Note**: Exact WIZIDEE response field keys are not documented in the available materials. Field names will be confirmed during implementation by testing against the real API with a sample document. The component should render `key: value` pairs dynamically so it works regardless of exact key names.

**Rationale**: Dynamic rendering avoids brittle hardcoded field mapping. The raw JSON view serves the developer audience.

---

## 7. Error Scenarios and Handling

| Scenario | Backend behavior | Frontend display |
|----------|-----------------|-----------------|
| WIZIDEE returns non-2xx on recognize | Return 502 with `{error: "Recognition failed"}` | "Could not identify document — please retake or re-upload" |
| WIZIDEE returns non-2xx on analyze | Return 502 with `{error: "Extraction failed"}` | "Could not extract fields — please retake or re-upload" |
| File too large (>10MB) | Reject in route with 413 | "File too large — maximum 10 MB" |
| Unsupported MIME type | Reject in route with 415 | "Unsupported format — please use JPEG or PNG" |
| Auth token failure | Retry once, then 503 | "Service unavailable — please try again" |
| Camera permission denied | N/A (frontend only) | Graceful fallback to upload-only mode |

---

## Summary of Decisions

| Topic | Decision |
|-------|----------|
| Token cache | In-memory module singleton in `lib/wizidee.ts` |
| Image transfer | FormData multipart, re-streamed to WIZIDEE |
| Camera capture | Native `getUserMedia`, canvas frame capture, blob upload |
| Test framework | Jest + RTL + ts-jest, node/jsdom split configs |
| Field display | Dynamic key-value card + collapsible raw JSON |
| Error handling | Typed error responses from routes, user-friendly messages in UI |
