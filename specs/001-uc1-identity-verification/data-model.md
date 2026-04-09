# Data Model: UC1 — Identity Verification (CNI / Passport)

> No persistent storage. All types below represent in-memory / in-transit data shapes.

## Core Types

### `DocumentFile`
Represents an image submitted for processing.

```typescript
type DocumentSource = 'upload' | 'camera';

interface DocumentFile {
  file: File;          // The browser File object (JPEG or PNG)
  source: DocumentSource;
  capturedAt: Date;
}
```

---

### `RecognizeResponse`
The result of `POST /api/wizidee/recognize` (proxied from WIZIDEE `/api/v1/recognize`).

```typescript
interface RecognizeResponse {
  dbId: string;          // WIZIDEE document model ID
  radId: string;         // WIZIDEE analysis template ID
  documentType?: string; // e.g. "CNI_FRANCE", "PASSPORT" — if returned by API
}
```

---

### `ExtractionResult`
The result of `POST /api/wizidee/analyze` (proxied from WIZIDEE `/api/v1/analyze`).

```typescript
interface ExtractionResult {
  fields: Record<string, string | null>;  // Extracted field key-value pairs
  raw: unknown;                            // Full WIZIDEE API response (for raw JSON view)
}
```

**Expected fields for a CNI** (exact keys confirmed during implementation):
| Field | Description |
|-------|-------------|
| `lastName` | Surname |
| `firstName` | Given name(s) |
| `dateOfBirth` | Date of birth (ISO 8601 string or raw) |
| `expiryDate` | Document expiry date |
| `mrz` | Raw MRZ string(s) |

**Additional field for Passport**:
| Field | Description |
|-------|-------------|
| `nationality` | Nationality code (3-letter ISO) |

---

### `ProcessingState`
Represents the current status of the capture + extraction pipeline.

```typescript
type ProcessingState =
  | 'idle'         // No document submitted yet
  | 'recognizing'  // Waiting for /recognize response
  | 'analyzing'    // Waiting for /analyze response
  | 'done'         // Extraction complete, result available
  | 'error';       // An error occurred at any step
```

---

### `ExtractionError`
Shape of error responses returned by the backend proxy routes.

```typescript
interface ExtractionError {
  error: string;         // Human-readable error description
  step?: 'recognize' | 'analyze' | 'auth';  // Which step failed
  statusCode?: number;   // Upstream HTTP status (if relevant)
}
```

---

## State Transitions

```
idle
  └─(user submits document)──► recognizing
                                  ├─(success)──► analyzing
                                  │               ├─(success)──► done
                                  │               └─(failure)──► error
                                  └─(failure)──► error

error / done
  └─(user retries / new document)──► idle
```

---

## Server-Side Token Cache (lib/wizidee.ts)

```typescript
interface TokenCache {
  value: string;      // JWT access token
  expiresAt: number;  // Unix timestamp in milliseconds
}
```

> Not exposed to the frontend — internal to `lib/wizidee.ts`.
