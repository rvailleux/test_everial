# Contract: GET /api/apirtc/session

**Purpose**: Returns the ApiRTC API key so the browser can initialize the ApiRTC SDK without the key being embedded in the client bundle.

---

## Request

```
GET /api/apirtc/session
```

No body, no authentication required (demo app).

---

## Response — Success (200)

```json
{
  "apiKey": "string"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `apiKey` | string | The ApiRTC API key read from `APIRTC_API_KEY` env var |

---

## Response — Error (500)

```json
{
  "error": "ApiRTC API key not configured"
}
```

Returned when `APIRTC_API_KEY` is not set in the environment.

---

## Environment Variable

| Variable | Required | Description |
|----------|----------|-------------|
| `APIRTC_API_KEY` | Yes | ApiRTC account API key — stored in `.env.local`, never committed |

---

## Usage by the Frontend

```ts
const res = await fetch('/api/apirtc/session');
const { apiKey } = await res.json();
// Then: new UserAgent({ uri: `apiKey:${apiKey}` })
```
