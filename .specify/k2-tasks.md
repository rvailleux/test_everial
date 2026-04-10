# K2 Tasks

## Task 1: Create ModuleSelector Component
**Subject:** Create `src/components/ModuleSelector.tsx`  
**Description:** Create a module selector component that displays registered modules. Can be a wrapper around existing ModuleMenu with enhanced styling/layout. Uses useAllModules and useActiveModule hooks. Shows modules in a selectable list with active highlighting.

**Acceptance:**
- Component renders list of registered modules
- Clicking a module sets it as active
- Active module is visually highlighted
- Empty state shown when no modules
- TypeScript compiles

---

## Task 2: Create ActionBar Component
**Subject:** Create `src/components/ActionBar.tsx`  
**Description:** Create action bar with Capture and Process buttons. Capture button triggers snapshot from video. Process button triggers module.process(). Handles disabled states and loading.

**Props Interface:**
- onCapture: () => void
- onProcess: () => void
- canProcess: boolean
- isProcessing: boolean

**Acceptance:**
- Both buttons render correctly
- Capture button calls onCapture
- Process button calls onProcess when enabled
- Process button disabled when canProcess is false
- Loading state shown when isProcessing
- TypeScript compiles

---

## Task 3: Create VideoCall Component
**Subject:** Create `src/components/VideoCall.tsx`  
**Description:** Unified video component that wraps LiveKitVideoCall and provides snapshot capture capability. Handles room join flow and exposes capture function.

**Props Interface:**
- roomName: string
- onSnapshotCapture?: (blob: Blob) => void

**Acceptance:**
- Integrates LiveKitVideoCall
- Provides snapshot capture from video stream
- Handles room join state
- Calls onSnapshotCapture when frame captured
- TypeScript compiles

---

## Task 4: Update Kernel Page
**Subject:** Update `src/app/video-call/page.tsx`  
**Description:** Refactor kernel page to integrate all components in a cohesive layout. Wrap in ModuleProvider. Layout: video area left, module sidebar + config right. Manage snapshot state. Handle capture and process actions.

**Layout:**
- Left column (2/3): Video call area + ActionBar + Results
- Right column (1/3): ModuleSelector + ModuleConfigPanel

**Acceptance:**
- Page wrapped in ModuleProvider
- Video call component renders
- Module selector shows modules
- Config panel shows active module config
- Action bar provides capture/process
- Results display after processing
- TypeScript compiles

---

## Task 5: Update Home Page Redirect
**Subject:** Update `src/app/page.tsx`  
**Description:** Replace landing page with redirect to /video-call. Use Next.js redirect or useEffect-based redirect.

**Acceptance:**
- / redirects to /video-call
- No landing page content shown
- TypeScript compiles

---

## Task 6: Write Tests
**Subject:** Write unit tests for new components  
**Description:** Create test files for ModuleSelector, ActionBar, VideoCall, and kernel page integration.

**Test Files:**
- tests/components/ModuleSelector.test.tsx
- tests/components/ActionBar.test.tsx
- tests/components/VideoCall.test.tsx

**Acceptance:**
- All tests pass
- Coverage for component rendering
- Coverage for user interactions
- Coverage for props/handlers

---

## Task 7: TypeScript Verification
**Subject:** Run TypeScript checks  
**Description:** Run npx tsc --noEmit to verify no type errors in new files.

**Acceptance:**
- No TypeScript errors in new files
- Existing LiveKit errors are acceptable

---

## Task 8: CDP Screenshot
**Subject:** Capture CDP screenshot  
**Description:** Use Chrome DevTools Protocol to capture screenshot of /video-call page rendering.

**Acceptance:**
- Screenshot shows rendered /video-call page
- Visual verification complete
