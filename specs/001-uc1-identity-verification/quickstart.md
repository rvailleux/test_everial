# Quickstart: UC1 — Identity Verification

## Prerequisites

- Node.js 20+
- `.env.local` at repo root with WIZIDEE credentials (see CLAUDE.md)

## Setup

```bash
# Install dependencies (includes Jest + RTL)
npm install

# Copy env template and fill in credentials
cp .env.local.example .env.local
# Edit .env.local with WIZIDEE_USER, WIZIDEE_PASSWORD, WIZIDEE_API_URL, WIZIDEE_AUTH_URL
```

## Running the app

```bash
npm run dev
# App available at http://localhost:5172
# Navigate to http://localhost:5172/uc1 for the identity verification demo
```

## Running tests

```bash
npm test                  # Run all tests
npm test -- tests/api/    # API route tests only
npm test -- tests/components/  # Component tests only
```

## Testing UC1 manually

1. Open `http://localhost:5172/uc1`
2. Either upload a CNI/passport image or click "Use Camera"
3. Click "Analyze"
4. Review the extracted fields card and raw JSON

## Key files

| File | Purpose |
|------|---------|
| `src/lib/wizidee.ts` | Server-side WIZIDEE client (token cache, recognize, analyze) |
| `src/app/api/wizidee/recognize/route.ts` | Proxy route for document recognition |
| `src/app/api/wizidee/analyze/route.ts` | Proxy route for field extraction |
| `src/components/DocumentCapture.tsx` | Upload + camera capture UI |
| `src/components/ExtractionResult.tsx` | Results card + raw JSON |
| `src/app/uc1/page.tsx` | UC1 demo page (orchestrates the flow) |

## Environment variables

```env
WIZIDEE_API_URL=https://api.v2.wizidee.com
WIZIDEE_AUTH_URL=https://auth.v2.wizidee.com/realms/quota/protocol/openid-connect/token
WIZIDEE_USER=prod-apizee-poc-prod-radial
WIZIDEE_PASSWORD=<see everial_docs/prod-apizee-poc-prod-radial_api_test.json>
```
