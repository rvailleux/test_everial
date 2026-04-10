# WIZIDEE API Contracts

## Overview

These contracts define the interface between the frontend client and the Next.js API proxy routes.

## Endpoints

### POST /api/wizidee/token

Acquires or refreshes the WIZIDEE authentication token.

**Request**: None (credentials handled server-side)

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "expires_in": 300,
  "token_type": "Bearer"
}
```

**Errors**:
- `500`: Server configuration error or upstream auth failure

---

### POST /api/wizidee/recognize

Identifies document type from uploaded image.

**Request**:
- Content-Type: `multipart/form-data`
- Body: `file` (Blob) - Document image

**Response** (200 OK):
```json
{
  "dbId": "doc-12345",
  "radId": "rad-67890",
  "status": "recognized"
}
```

**Errors**:
- `400`: Invalid file format
- `401`: Token expired (client should refresh and retry)
- `413`: File too large

---

### POST /api/wizidee/analyze

Extracts data fields from identified document.

**Request**:
- Content-Type: `multipart/form-data`
- Body:
  - `file` (Blob) - Document image
  - `dbId` (string) - From recognize response
  - `radId` (string) - From recognize response

**Response** (200 OK):
```json
{
  "dbId": "doc-12345",
  "radId": "rad-67890",
  "fields": {
    "lastName": {
      "value": "DUPONT",
      "confidence": 0.98,
      "type": "string"
    },
    "firstName": {
      "value": "JEAN",
      "confidence": 0.97,
      "type": "string"
    }
  },
  "status": "analyzed"
}
```

**Errors**:
- `400`: Missing dbId/radId or invalid file
- `401`: Token expired
- `404`: Document not found (invalid dbId/radId)

---

### POST /api/wizidee/consolidate

Applies business rules at folder level.

**Request**:
- Content-Type: `application/json`
- Body:
```json
{
  "folderId": "folder-12345"
}
```

**Response** (200 OK):
```json
{
  "folderId": "folder-12345",
  "status": "consolidated",
  "results": {
    "documentsProcessed": 3,
    "confidence": 0.95
  }
}
```

**Errors**:
- `400`: Invalid folderId
- `401`: Token expired
- `404`: Folder not found
