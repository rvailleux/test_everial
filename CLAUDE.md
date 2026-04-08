# CLAUDE.md — WIZIDEE Demo App

## Project Overview

A **demonstration web application** showcasing WIZIDEE document capture and recognition APIs (by EVERIAL) in the context of a video call session powered by **ApiRTC**.

The goal is a readable, well-structured codebase that developers can use as a reference integration for WIZIDEE APIs. Prioritize clarity and simplicity over abstraction.

---

## Tech Stack

- **Framework**: Next.js (App Router)
- **Frontend**: React + TypeScript, modern UI (Tailwind CSS or equivalent)
- **Backend**: Next.js API Routes acting as a secure proxy to WIZIDEE APIs
- **Testing**: Jest + React Testing Library (TDD approach)
- **Video**: ApiRTC SDK

All WIZIDEE API calls MUST go through the Next.js backend routes — never expose credentials to the browser.

---

## WIZIDEE API Integration

### Authentication

```
POST https://auth.v2.wizidee.com/realms/quota/protocol/openid-connect/token
grant_type=password, client_id=tools, scope=openid
```

Returns a short-lived JWT. The backend handles token acquisition and renewal transparently.

### Core API Endpoints (base: `https://api.v2.wizidee.com`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/recognize` | POST (multipart) | Identify document type → returns `dbId` + `radId` |
| `/api/v1/analyze` | POST (multipart) | Extract data fields from identified document |
| `/api/v1/consolidate` | POST | Apply business rules at folder level |

**Flow**: recognize → analyze → (optional) consolidate

### Credentials

Stored in `.env.local` (never committed):

```env
WIZIDEE_API_URL=https://api.v2.wizidee.com
WIZIDEE_AUTH_URL=https://auth.v2.wizidee.com/realms/quota/protocol/openid-connect/token
WIZIDEE_USER=prod-apizee-poc-prod-radial
WIZIDEE_PASSWORD=0UOSWmS2Vx)a%Y0BTUxL
```

Reference: `everial_docs/prod-apizee-poc-prod-radial_api_test.json`

---

## Use Cases to Implement

Each use case is a self-contained demo scenario triggered during a video call (or standalone):

| # | Use Case | Documents | Key Extracted Data |
|---|----------|-----------|-------------------|
| 1 | **Identity verification (CNI/Passport)** | Carte d'identité, passeport | Nom, prénom, date naissance, expiration, MRZ |
| 2 | **Proof of address** | Facture EDF/eau/télécom, avis d'imposition | Adresse complète |
| 3 | **Proof of income** | Bulletin de salaire, avis d'imposition | Revenus, employeur |
| 4 | **RIB / Bank account** | RIB | IBAN, BIC |
| 5 | **Driver's license** | Permis de conduire | Données permis, catégories |
| 6 | **Health card** | Carte vitale | Numéro sécurité sociale |
| 7 | **Company registration (KBIS)** | Extrait KBIS | SIRET, SIREN, raison sociale |
| 8 | **Residence permit** | Titre de séjour | Identité, validité |
| 9 | **Biometric identity check** | CNI + selfie vidéo | Score de similitude, détection du vivant |
| 10 | **Neurolens (zero-shot extraction)** | Any document | Clés/valeurs auto-détectées |
| 11 | **Incoming mail classification** | Unstructured documents | Type de document |
| 12 | **Signature detection** | Any signed document | Signé / non signé |
| 13 | **Document anonymization** | Any PDF | PDF caviardé |

Start with use cases 1–4 as the core MVP.

---

## Architecture

```
app/
├── (frontend)
│   ├── page.tsx                  # Landing / use case selector
│   ├── session/[id]/page.tsx     # Video call session with document capture
│   └── components/
│       ├── DocumentCapture.tsx   # Upload or camera capture UI
│       ├── ExtractionResult.tsx  # Display extracted fields
│       └── VideoCall.tsx         # ApiRTC integration
│
└── api/
    ├── wizidee/
    │   ├── recognize/route.ts    # Proxy → WIZIDEE /recognize
    │   ├── analyze/route.ts      # Proxy → WIZIDEE /analyze
    │   └── token/route.ts        # Internal token management
    └── session/route.ts          # ApiRTC session management

lib/
├── wizidee.ts                    # WIZIDEE API client (server-side only)
└── apirtc.ts                     # ApiRTC helpers
```

---

## Development Guidelines

### Code Style
- Simple and readable — this is a **demonstrator**, not production code
- No premature abstractions: if logic is used once, keep it inline
- Comments only where the intent isn't obvious
- TypeScript with minimal ceremony (avoid over-typing)
- English for code, comments, and commits

### TDD
- Write tests before implementing each API route and component
- Test the WIZIDEE proxy routes with mocked HTTP responses
- Test React components with React Testing Library

### UI
- Modern, clean, fast to use
- Clear visual feedback during document processing (loading states, results)
- Mobile-friendly (users may capture documents on phone)
- Show raw JSON extraction results alongside a human-readable card view

### Git (Trunk-Based)
- Commit directly to `main` for small changes
- Short-lived feature branches (< 1 day) for larger use cases
- Commit messages: imperative, English, concise (`add RIB extraction route`)

---

## Important Notes

- `everial_docs/` contains sensitive credentials — never commit changes that expose them elsewhere
- `everial_docs/WIZIDEE - Mémoire technico-fonctionnel.md` is the full product documentation — reference it for API behavior details
- The WIZIDEE API returns `dbId` + `radId` from `/recognize` — these MUST be passed to `/analyze`
- Token expiration is handled server-side; clients never see credentials
