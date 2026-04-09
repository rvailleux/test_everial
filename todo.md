# Todo — WIZIDEE Demo App

## Architecture Overview

This project follows a **Kernel/Modules Architecture** (see Constitution Principle VIII):

- **Kernel**: The video call page (`session/[id]/page.tsx`) provides the foundation with LiveKit integration, snapshot capture, module registry, and shared UI areas (menu, config, results)
- **Modules**: Each use case below is implemented as a pluggable module that registers with the kernel

### Module Integration Contract

Each module MUST implement:

1. **Registration**: Export a module descriptor that registers with the kernel's module registry
2. **Configuration UI**: React component rendered in the kernel's configuration area when selected
3. **Processing Logic**: Handler that receives the snapshot blob and calls WIZIDEE APIs via kernel's proxy routes
4. **Result Rendering**: React component rendered in the kernel's results area after processing

### Module Interface (TypeScript)

```typescript
interface WizideeModule {
  id: string;                    // Unique module identifier (e.g., 'identity-cni')
  name: string;                  // Display name in the kernel menu
  description: string;           // Brief description for tooltips/docs
  icon?: string;                 // Optional icon identifier
  
  // Configuration component - rendered in kernel's config area
  ConfigComponent: React.FC<{
    config: Record<string, any>;
    onConfigChange: (config: Record<string, any>) => void;
  }>;
  
  // Default configuration values
  defaultConfig: Record<string, any>;
  
  // Processing function - called when user clicks "Process"
  process: (
    snapshot: Blob,
    config: Record<string, any>
  ) => Promise<WizideeResult>;
  
  // Result component - rendered in kernel's results area
  ResultComponent: React.FC<{
    result: WizideeResult;
  }>;
}

interface WizideeResult {
  success: boolean;
  data?: any;                    // Extracted document data
  raw?: any;                     // Raw WIZIDEE API response
  error?: string;                // Error message if failed
}
```

### Kernel-Provided Services (Injected)

Modules receive these via context/hooks — they do NOT implement video or networking themselves:

- `useSnapshot()` — Capture frame from active video stream (kernel handles LiveKit)
- `useWizideeAPI()` — Typed client for `/api/wizidee/*` proxy routes
- `useModuleConfig<T>()` — Access/modify module's configuration state
- `useResults()` — Publish results to the shared results area (visible to both call participants)

---

## merge-order
lib/modules/*, src/app/api/wizidee/*, src/modules/*

---

## Kernel Tasks

- [ ] **K1 — Module Registry System**
  branch: feat/kernel-registry
  files: lib/modules/registry.ts, lib/modules/types.ts, src/lib/context/
  done-when: npm test passes, npx tsc --noEmit clean
  - Create `lib/modules/registry.ts` with module registration/discovery
  - Implement `ModuleProvider` context for dependency injection
  - Create hook `useModule(id: string)` for module access

- [ ] **K2 — Shared UI Areas**
  branch: feat/kernel-ui
  files: src/components/ModuleMenu.tsx, src/components/ConfigPanel.tsx, src/components/ActionBar.tsx, src/components/ResultsPanel.tsx
  done-when: npm test passes, npx tsc --noEmit clean
  - **Menu Area**: Horizontal or vertical menu showing registered modules
  - **Config Area**: Dynamic container that renders selected module's `ConfigComponent`
  - **Action Area**: Capture button (kernel) + Process button (triggers module.process)
  - **Results Area**: Displays active results from any module, visible to both participants

- [ ] **K3 — Snapshot Capture System**
  branch: feat/kernel-snapshot
  files: src/hooks/useSnapshot.ts, src/components/SnapshotPreview.tsx
  done-when: npm test passes, npx tsc --noEmit clean
  - Integrate with LiveKit stream to capture frames
  - Preview snapshot before processing
  - Store snapshot temporarily (session-only, not persisted)

- [ ] **K4 — WIZIDEE Proxy Client**
  branch: feat/wizidee-proxy
  files: src/app/api/wizidee/, lib/wizidee.ts, src/hooks/useWizideeAPI.ts
  done-when: npm test passes, npx tsc --noEmit clean
  - Type-safe client for `/api/wizidee/*` routes
  - Handle token refresh transparently
  - Expose via hook `useWizideeAPI()` for modules

- [ ] **K5 — Module Template/Scaffold**
  branch: feat/kernel-template
  files: templates/module/
  done-when: npx tsc --noEmit clean (template files compile)
  - Create `templates/module/` with boilerplate for new modules
  - Include example ConfigComponent, ResultComponent, and process function
  - Document module development workflow

---

## Data Extraction Modules

- [ ] **UC1 — Identity Verification Module (`identity-cni`)**
  branch: feat/module-identity-cni
  files: src/modules/identity-cni/
  done-when: npm test passes, npx tsc --noEmit clean
  - **Purpose**: Extract identity data from CNI or passport during video call
  - **Documents**: Carte d'identité, passeport
  - **Extraction**: nom, prénom, date de naissance, date d'expiration, MRZ
  - **Config options**: Document type (CNI/Passport), region (FR/EU/Other)
  - **WIZIDEE flow**: `/recognize` → `/analyze` (dbtype: identity)
  - **Result view**: ID card display with photo placeholder + raw JSON

- [ ] **UC2 — Proof of Address Module (`proof-address`)**
  branch: feat/module-proof-address
  files: src/modules/proof-address/
  done-when: npm test passes, npx tsc --noEmit clean
  - **Purpose**: Verify residence from utility bills or tax notices
  - **Documents**: Facture EDF/eau/télécom, avis d'imposition
  - **Extraction**: adresse complète, émetteur, date du document
  - **Config options**: Document category (utility/tax/telecom)
  - **WIZIDEE flow**: `/recognize` → `/analyze` (dbtype: address_proof)
  - **Result view**: Address block formatted + map link + raw JSON

- [ ] **UC3 — Proof of Income Module (`proof-income`)**
  branch: feat/module-proof-income
  files: src/modules/proof-income/
  done-when: npm test passes, npx tsc --noEmit clean
  - **Purpose**: Verify income from pay slips or tax notices
  - **Documents**: Bulletin de salaire, avis d'imposition
  - **Extraction**: revenus, employeur, période
  - **Config options**: Document type (payslip/tax_notice)
  - **WIZIDEE flow**: `/recognize` → `/analyze` (dbtype: income_proof)
  - **Result view**: Income summary card + employer info + raw JSON

- [ ] **UC4 — Bank Account Module (`rib-extraction`)**
  branch: feat/module-rib-extraction
  files: src/modules/rib-extraction/
  done-when: npm test passes, npx tsc --noEmit clean
  - **Purpose**: Extract banking details from RIB documents
  - **Documents**: RIB (Relevé d'Identité Bancaire)
  - **Extraction**: IBAN, BIC, banque, titulaire
  - **Config options**: None (auto-detect)
  - **WIZIDEE flow**: `/recognize` → `/analyze` (dbtype: rib)
  - **Result view**: Formatted IBAN (masked) + BIC + bank name + raw JSON

- [ ] **UC5 — Driver's License Module (`drivers-license`)**
  branch: feat/module-drivers-license
  files: src/modules/drivers-license/
  done-when: npm test passes, npx tsc --noEmit clean
  - **Purpose**: Extract driver's license information and categories
  - **Documents**: Permis de conduire
  - **Extraction**: données conducteur, catégories, dates d'émission/expiration
  - **Config options**: Country of issuance (FR/EU)
  - **WIZIDEE flow**: `/recognize` → `/analyze` (dbtype: drivers_license)
  - **Result view**: License card format + categories list + raw JSON

- [ ] **UC6 — Health Card Module (`health-card`)**
  branch: feat/module-health-card
  files: src/modules/health-card/
  done-when: npm test passes, npx tsc --noEmit clean
  - **Purpose**: Extract social security number from Carte Vitale
  - **Documents**: Carte vitale
  - **Extraction**: numéro de sécurité sociale, bénéficiaires
  - **Config options**: None (auto-detect)
  - **WIZIDEE flow**: `/recognize` → `/analyze` (dbtype: health_card)
  - **Result view**: NIR formatted + beneficiary list + raw JSON

- [ ] **UC7 — Company Registration Module (`kbis-extraction`)**
  branch: feat/module-kbis-extraction
  files: src/modules/kbis-extraction/
  done-when: npm test passes, npx tsc --noEmit clean
  - **Purpose**: Extract company registration details from KBIS
  - **Documents**: Extrait KBIS
  - **Extraction**: SIRET, SIREN, raison sociale, forme juridique, siège social
  - **Config options**: None (auto-detect)
  - **WIZIDEE flow**: `/recognize` → `/analyze` (dbtype: kbis)
  - **Result view**: Company info card with SIRET/SIREN + address + raw JSON

- [ ] **UC8 — Residence Permit Module (`residence-permit`)**
  branch: feat/module-residence-permit
  files: src/modules/residence-permit/
  done-when: npm test passes, npx tsc --noEmit clean
  - **Purpose**: Verify residence permit validity and holder identity
  - **Documents**: Titre de séjour
  - **Extraction**: identité, dates de validité, type de titre
  - **Config options**: Permit type (titre de séjour/résident longue durée)
  - **WIZIDEE flow**: `/recognize` → `/analyze` (dbtype: residence_permit)
  - **Result view**: Permit card format + validity status + raw JSON

- [ ] **UC9 — Biometric Identity Check Module (`biometric-check`)**
  branch: feat/module-biometric-check
  files: src/modules/biometric-check/
  done-when: npm test passes, npx tsc --noEmit clean
  - **Purpose**: Compare ID document photo with live selfie from video call
  - **Documents**: CNI + selfie vidéo (captured from same stream)
  - **Extraction**: score de similitude, détection du vivant (liveness)
  - **Config options**: Similarity threshold (default: 0.80)
  - **WIZIDEE flow**: `/recognize` (CNI) → `/analyze` (face) → selfie capture → face comparison API
  - **Result view**: Match percentage + liveness indicator + side-by-side photos + raw JSON

- [ ] **UC10 — Neurolens Zero-Shot Module (`neurolens`)**
  branch: feat/module-neurolens
  files: src/modules/neurolens/
  done-when: npm test passes, npx tsc --noEmit clean
  - **Purpose**: Extract arbitrary key/value pairs from any document without prior configuration
  - **Documents**: Any document type
  - **Extraction**: clés/valeurs auto-détectées (key-value pairs)
  - **Config options**: Confidence threshold, max keys to extract
  - **WIZIDEE flow**: `/recognize` → `/analyze` with Neurolens AI
  - **Result view**: Dynamic key-value table + raw JSON

- [ ] **UC11 — Document Classification Module (`doc-classify`)**
  branch: feat/module-doc-classify
  files: src/modules/doc-classify/
  done-when: npm test passes, npx tsc --noEmit clean
  - **Purpose**: Classify incoming unstructured documents by type
  - **Documents**: Courriers, factures, contrats non structurés
  - **Extraction**: type de document détecté, confidence score
  - **Config options**: Classification model version
  - **WIZIDEE flow**: `/recognize` only (returns document type)
  - **Result view**: Document type badge + confidence % + suggested next module + raw JSON

- [ ] **UC12 — Signature Detection Module (`signature-detect`)**
  branch: feat/module-signature-detect
  files: src/modules/signature-detect/
  done-when: npm test passes, npx tsc --noEmit clean
  - **Purpose**: Detect presence and location of signatures on documents
  - **Documents**: Any signed document
  - **Extraction**: signé / non signé, bounding boxes des signatures
  - **Config options**: Minimum signature size, confidence threshold
  - **WIZIDEE flow**: `/recognize` → `/analyze` (signature detection endpoint)
  - **Result view**: Signature count + document preview with bounding boxes + raw JSON

- [ ] **UC13 — Document Anonymization Module (`doc-anonymize`)**
  branch: feat/module-doc-anonymize
  files: src/modules/doc-anonymize/
  done-when: npm test passes, npx tsc --noEmit clean
  - **Purpose**: Generate redacted (caviardé) version of documents
  - **Documents**: Any PDF or image containing PII
  - **Extraction**: PDF caviardé en sortie (redacted document)
  - **Config options**: Fields to redact (auto-suggested from recognition), anonymization level
  - **WIZIDEE flow**: `/recognize` → `/analyze` → `/anonymize` (or consolidate)
  - **Result view**: Side-by-side original/redacted preview + download link + raw metadata
