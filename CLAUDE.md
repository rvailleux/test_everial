# CLAUDE.md — WIZIDEE Demo App

## Project Overview

A **demonstration web application** showcasing WIZIDEE document capture and recognition APIs (by EVERIAL) in the context of a video call session.

The goal is a readable, well-structured codebase that developers can use as a reference integration for WIZIDEE APIs. Prioritize clarity and simplicity over abstraction.

---

## Tech Stack

- **Framework**: Next.js (App Router)
- **Frontend**: React + TypeScript, modern UI (Tailwind CSS or equivalent)
- **Backend**: Next.js API Routes acting as a secure proxy to WIZIDEE APIs
- **Testing**: Jest + React Testing Library (unit), Chrome DevTools Protocol (visual/E2E)
- **Video**: LiveKit SDK

All WIZIDEE API calls MUST go through the Next.js backend routes — never expose credentials to the browser.

### Single-Page Stateless Video Workflow Principle

The entire application lives on one page: **`/video-call`**. This is the only
user-facing route. All document capture, processing, and result display happen
here without navigation or server-side session state.

**Canonical user workflow (enforced for every module):**
1. User starts a video call on `/video-call`
2. User takes a snapshot from the live video stream
3. User selects a data extraction module and clicks "Process"
4. Extracted data is displayed on the same page, overlaid on or alongside
   the snapshot — the page does NOT navigate away

- `/video-call` is the ONLY user-facing page — no `/session/[id]/` or other routes
- All state (snapshot, selected module, results) is held in React component state
- Page refresh resets all state — intentional and correct
- Modules MUST NOT create additional pages or routes

### Visual Verification Principle

Every frontend feature MUST be verified with **Chrome DevTools Protocol (CDP)**
before the task is considered complete. No task is done without visual proof.

- Each page and critical user flow MUST be tested using Chrome DevTools
  Protocol (via Puppeteer, chrome-remote-interface, or similar CDP client)
- Screenshots MUST be captured at multiple viewport sizes (desktop, tablet, mobile)
- Console errors and network failures MUST be captured and reviewed
- Unit tests alone are insufficient — visual verification in a real browser
  environment is mandatory

### Kernel/Modules Architecture Principle

The **`/video-call` page is the kernel**. All document processing features are
modules that plug into this single page — never standalone pages or separate
workflows.

**Kernel Responsibilities (`/video-call` page):**
- Video session management and peer connection (LiveKit)
- Snapshot capture from the live video stream
- Module registry and lifecycle management
- Shared UI on `/video-call`: module selector, config area, capture/process
  actions, and results display alongside the snapshot

**Module Responsibilities (feature extensions):**
- Each WIZIDEE use case (Identity, RIB, Proof of Address, etc.) is a module
- Modules register themselves with the kernel via a consistent interface
- Modules provide: configuration UI, processing logic (via WIZIDEE APIs),
  and result rendering — all rendered within `/video-call`
- Modules MUST NOT implement their own video handling, snapshot capture,
  page routing, or session state

**Integration Contract (per Single-Page Workflow):**
1. User starts video call on `/video-call`
2. User clicks "Capture" → kernel acquires snapshot from video stream
3. User selects a module → module config UI renders on `/video-call`
4. User clicks "Process" → module calls WIZIDEE via `/api/wizidee/*` routes
5. Results render on `/video-call`, alongside the snapshot — no navigation

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

### Kernel/Modules Structure

The application follows a **kernel/modules architecture** where `/video-call`
is the kernel and each WIZIDEE use case is a pluggable module.
There is only ONE user-facing page — `/video-call`.

```
app/
├── page.tsx                      # Redirect or minimal landing → /video-call
├── video-call/
│   └── page.tsx                  # KERNEL: the only user-facing page
│
├── components/                   # Kernel UI components (all rendered on /video-call)
│   ├── VideoCall.tsx             # LiveKit integration
│   ├── SnapshotCapture.tsx       # Capture frame from video stream
│   ├── SnapshotDisplay.tsx       # Show snapshot + overlaid results
│   ├── ModuleSelector.tsx        # Module selection menu
│   ├── ModuleConfigPanel.tsx     # Active module's configuration UI
│   └── ActionBar.tsx             # Capture + Process buttons
│
├── hooks/
│   ├── useSnapshot.ts            # Video frame capture (kernel)
│   ├── useWizideeAPI.ts          # Typed WIZIDEE client (kernel)
│   └── useModule.ts              # Module registry access (kernel)
│
├── modules/                      # MODULES (one per use case)
│   ├── identity-cni/
│   │   ├── index.ts              # Module descriptor + registration
│   │   ├── ConfigComponent.tsx   # Document type selection
│   │   ├── process.ts            # WIZIDEE API calls
│   │   └── ResultComponent.tsx   # Results rendered on /video-call
│   ├── rib-extraction/
│   ├── proof-address/
│   ├── proof-income/
│   └── [other modules...]
│
└── api/
    ├── wizidee/
    │   ├── recognize/route.ts    # Proxy → WIZIDEE /recognize
    │   ├── analyze/route.ts      # Proxy → WIZIDEE /analyze
    │   └── token/route.ts        # Internal token management
    └── livekit/route.ts          # LiveKit token endpoint

lib/
├── wizidee.ts                    # WIZIDEE API client (server-side only)
├── livekit.ts                    # LiveKit helpers
└── modules/
    ├── registry.ts               # Module registration system
    └── types.ts                  # Module interface definitions
```

---

## Module Registry Usage

The module registry system enables pluggable document processing features.

### Creating a Module

```typescript
// src/modules/my-feature/index.ts
import { WizideeModule, registerModule } from '@/lib/modules';
import { ConfigComponent } from './ConfigComponent';
import { ResultComponent } from './ResultComponent';

export interface MyConfig {
  enabled: boolean;
  threshold: number;
}

export const myModule: WizideeModule<MyConfig> = {
  id: 'my-feature',
  name: 'My Feature',
  description: 'Extracts data from documents',
  ConfigComponent,
  ResultComponent,
  defaultConfig: { enabled: true, threshold: 0.5 },
  process: async (snapshot: Blob, config: MyConfig) => {
    // Process document via WIZIDEE API
    return { success: true, data: { extracted: 'data' } };
  },
};

// Register at app initialization
registerModule(myModule);
```

### Using Modules in Components

```tsx
// In your video call page
import { ModuleProvider } from '@/lib/context/ModuleProvider';
import { ModuleMenu } from '@/components/ModuleMenu';
import { ModuleConfigPanel } from '@/components/ModuleConfigPanel';

export default function VideoCallPage() {
  return (
    <ModuleProvider>
      <div className="grid grid-cols-3 gap-4">
        <ModuleMenu />           {/* Lists all registered modules */}
        <ModuleConfigPanel />     {/* Config + processing UI */}
      </div>
    </ModuleProvider>
  );
}
```

### Module Hooks

```tsx
// Access all modules
const modules = useAllModules();

// Access specific module
const module = useModule('identity-cni');

// Track active module
const { activeModule, setActiveModule } = useActiveModule();

// Manage module configuration
const { config, setConfig, resetConfig } = useModuleConfig<MyConfig>();

// Execute processing
const { result, isProcessing, process } = useModuleProcess();
await process(snapshotBlob);
```

### Test Page

Visit `/test-module-registry` to manually verify the module registry system.

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

## Active Technologies
- TypeScript 5 / Node.js (Next.js runtime) + Next.js 16.2.2, React 19, Tailwind CSS 4, Jest + React Testing Library (to be added) (001-uc1-identity-verification)
- None — extraction results are session-only, held in React state (001-uc1-identity-verification)
- TypeScript 5 / Node.js (Next.js 15 runtime) + Next.js 15 (App Router), React 19, `@livekit/components-react`, Tailwind CSS 4 (002-livekit-video-call)
- N/A — all state is transient (React component state, cleared on call end) (002-apirtc-video-call)
- TypeScript 5 / Node.js (Next.js runtime) + React 19, Next.js 16.2.2 (004-module-registry)
- N/A (in-memory registry, no persistence) (004-module-registry)
- TypeScript 5 / Node.js (Next.js runtime) + Next.js 16.2.2, React 19, React Testing Library, Jest (006-wizidee-proxy-client)
- In-memory token cache (no persistent storage per Constitution) (006-wizidee-proxy-client)
- TypeScript 5 / React 19 / Next.js 16 (App Router) + None new — uses browser Canvas API + `requestAnimationFrame`; detection algorithm is pure TS (007-auto-scan-document)
- N/A — detection state is transient React state (007-auto-scan-document)

## Auto-Scan Document Detection

The kernel includes an **auto-scan feature** that detects documents in the video stream in real-time and automatically captures snapshots when conditions are met.

**How it works:**
1. Frame loop runs at 15 fps using `requestAnimationFrame`
2. Each frame is drawn to an offscreen canvas (320×240 for speed)
3. Pure TypeScript edge detection (Sobel operator) finds document boundaries
4. Blue outline appears when a document is detected
5. Outline turns green when document fills ≥30% of frame and is fully visible
6. After 500ms stability, auto-capture triggers (with 2s cooldown)

**Key files:**
- `src/lib/detection/documentDetector.ts` — Edge detection algorithm
- `src/hooks/useDocumentDetector.ts` — Frame loop and capture logic
- `src/components/DocumentScanOverlay.tsx` — Canvas overlay rendering

**User controls:**
- Auto-scan toggle in bottom-left of video container (on by default)
- Manual Capture button remains available as fallback
- "Snapshot captured" toast appears after auto-capture

**Technical notes:**
- 100% client-side — no server calls, no ML models
- Works with existing manual capture flow
- Can be disabled/enabled without page reload

## Recent Changes
- 001-uc1-identity-verification: Added TypeScript 5 / Node.js (Next.js runtime) + Next.js 16.2.2, React 19, Tailwind CSS 4, Jest + React Testing Library (to be added)
