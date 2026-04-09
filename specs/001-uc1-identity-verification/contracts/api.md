# API Contracts: UC1 — Identity Verification

These are the Next.js API routes exposed by the application. They act as a secure proxy to the WIZIDEE API. The browser never communicates with WIZIDEE directly.

---

## POST /api/wizidee/recognize

**Purpose**: Submit a document image to identify its type.  
**Called by**: Browser (via `DocumentCapture` component)  
**Proxies to**: `POST https://api.v2.wizidee.com/api/v1/recognize`

### Request

```
Content-Type: multipart/form-data

Fields:
  file    (required) — Image file. Accepted MIME types: image/jpeg, image/png
```

### Response — Success `200`

```json
{
  "dbId": "string",
  "radId": "string",
  "documentType": "string | undefined"
}
```

### Response — Errors

| Status | Body | When |
|--------|------|------|
| `400` | `{"error": "No file provided"}` | Request has no file field |
| `413` | `{"error": "File too large — maximum 10 MB"}` | File exceeds 10 MB |
| `415` | `{"error": "Unsupported format — use JPEG or PNG"}` | Non-image MIME type |
| `502` | `{"error": "Recognition failed", "step": "recognize"}` | WIZIDEE returns non-2xx |
| `503` | `{"error": "Service unavailable", "step": "auth"}` | Token acquisition fails |

---

## POST /api/wizidee/analyze

**Purpose**: Extract identity fields from a previously recognized document.  
**Called by**: Browser, immediately after a successful `/recognize` call  
**Proxies to**: `POST https://api.v2.wizidee.com/api/v1/analyze`

### Request

```
Content-Type: multipart/form-data

Fields:
  file    (required) — Same image file used in /recognize
  dbId    (required) — Value returned by /recognize
  radId   (required) — Value returned by /recognize
```

### Response — Success `200`

```json
{
  "fields": {
    "lastName": "DUPONT",
    "firstName": "JEAN",
    "dateOfBirth": "1985-06-15",
    "expiryDate": "2030-03-22",
    "mrz": "IDFRADUPONT<<JEAN<<<<<<<<<<<<<<<\n....",
    "nationality": "FRA"
  },
  "raw": { /* full WIZIDEE API response object */ }
}
```

> Field keys in `fields` are normalized by the proxy. The `raw` property contains the unmodified upstream response.

### Response — Errors

| Status | Body | When |
|--------|------|------|
| `400` | `{"error": "Missing required fields: dbId, radId"}` | `dbId` or `radId` absent |
| `400` | `{"error": "No file provided"}` | Request has no file field |
| `413` | `{"error": "File too large — maximum 10 MB"}` | File exceeds 10 MB |
| `502` | `{"error": "Extraction failed", "step": "analyze"}` | WIZIDEE returns non-2xx |
| `503` | `{"error": "Service unavailable", "step": "auth"}` | Token acquisition fails |

---

## Internal: Token Management (lib/wizidee.ts)

Token acquisition is **not** exposed as an API route. It is an internal server-side function called by the proxy routes.

**Token endpoint**: `POST https://auth.v2.wizidee.com/realms/quota/protocol/openid-connect/token`

```
Content-Type: application/x-www-form-urlencoded

grant_type=password
client_id=tools
scope=openid
username=${WIZIDEE_USER}
password=${WIZIDEE_PASSWORD}
```

**Response**: `{ "access_token": "...", "expires_in": 300, ... }`

Token is cached in-process and refreshed automatically when within 60 seconds of expiry. The `access_token` is added as `Authorization: Bearer <token>` to all outgoing WIZIDEE requests.
