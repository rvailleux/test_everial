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

### Video-First Integration Principle

All WIZIDEE document capture features MUST be built into the **video call interface as synchronous, in-session workflows**. Features MUST NOT be implemented as standalone async file upload pages separate from the video call.

- Document capture happens during the active video session
- Participants see each other while documents are being captured and processed
- Results are displayed in real-time to both parties within the call interface
- The video call is the container; document processing is the feature

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

The video call interface MUST be architected as a **kernel** with pluggable
**modules**. All document processing features are modules that extend the
kernel — never standalone pages or separate workflows.

**Kernel Responsibilities (The Video Call Foundation):**
- Video session management and peer connection (LiveKit)
- Snapshot capture from the video stream (camera or screen share)
- Module registry and lifecycle management
- Shared UI chrome: menu system for module selection, configuration area,
  action triggers, and results display area

**Module Responsibilities (Feature Extensions):**
- Each WIZIDEE use case (Identity, RIB, Proof of Address, etc.) is a module
- Modules register themselves with the kernel via a consistent interface
- Modules provide: configuration UI, processing logic (via WIZIDEE APIs),
  and result rendering components
- Modules MUST NOT implement their own video handling or snapshot capture

**Integration Contract:**
- User selects a module from the kernel's menu → module's config UI renders
- User configures options → clicks "Capture" → kernel acquires snapshot
- User clicks "Process" → module sends snapshot to WIZIDEE via kernel APIs
- Results appear in the shared results area, visible to both call participants

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

The application follows a **kernel/modules architecture** where the video call
provides the foundation (kernel) and each WIZIDEE use case is implemented as
a pluggable module.

```
app/
├── (frontend)
│   ├── page.tsx                  # Landing / use case selector
│   ├── session/[id]/             # Video call session (KERNEL)
│   │   ├── page.tsx              # Kernel: video + module integration
│   │   ├── components/
│   │   │   ├── VideoCall.tsx     # LiveKit integration (kernel)
│   │   │   ├── ModuleMenu.tsx    # Module selection menu
│   │   │   ├── ConfigPanel.tsx   # Module configuration area
│   │   │   ├── ActionBar.tsx     # Capture + Process buttons
│   │   │   └── ResultsPanel.tsx  # Shared results display
│   │   └── hooks/
│   │       ├── useSnapshot.ts    # Video frame capture
│   │       ├── useModule.ts      # Module registry access
│   │       └── useWizideeAPI.ts  # Typed WIZIDEE client
│   └──
│
├── modules/                      # MODULES (one per use case)
│   ├── identity-cni/
│   │   ├── index.ts              # Module descriptor + registration
│   │   ├── ConfigComponent.tsx   # Document type selection
│   │   ├── process.ts            # WIZIDEE API calls
│   │   └── ResultComponent.tsx   # Identity card display
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
    └── session/route.ts          # LiveKit session management

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

## Recent Changes
- 001-uc1-identity-verification: Added TypeScript 5 / Node.js (Next.js runtime) + Next.js 16.2.2, React 19, Tailwind CSS 4, Jest + React Testing Library (to be added)
