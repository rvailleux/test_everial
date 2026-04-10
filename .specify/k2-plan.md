# K2 Implementation Plan

## Phase 1: Setup & Analysis
1. Review existing components (ModuleMenu, ModuleConfigPanel exist)
2. Understand ModuleProvider integration
3. Check existing LiveKit integration

## Phase 2: Component Implementation

### Task 1: Create ModuleSelector.tsx
- Wrapper/alias for existing ModuleMenu or enhanced version
- Uses useAllModules and useActiveModule hooks
- Shows registered modules in selectable list
- Highlights active module

### Task 2: Create ActionBar.tsx
- Capture button (triggers snapshot capture)
- Process button (triggers module.process)
- Handles disabled states
- Shows loading state

### Task 3: Create VideoCall.tsx
- Unified video component interface
- Integrates LiveKitVideoCall
- Provides snapshot capture capability
- Handles room join flow

### Task 4: Update video-call/page.tsx (Kernel)
- Integrate all components
- Layout: Video area | Module sidebar + Config panel
- State management for snapshot
- Action handlers

### Task 5: Update page.tsx (Redirect)
- Replace landing with redirect to /video-call

## Phase 3: Testing

### Task 6: Write Unit Tests
- ModuleSelector.test.tsx
- ActionBar.test.tsx
- VideoCall.test.tsx
- Kernel page integration tests

### Task 7: TypeScript Verification
- Run npx tsc --noEmit
- Fix any type errors in new files

### Task 8: CDP Screenshot
- Capture /video-call page rendering
- Verify visual layout

## File Mapping

| Component | Status | Path |
|-----------|--------|------|
| ModuleSelector | NEW | src/components/ModuleSelector.tsx |
| ActionBar | NEW | src/components/ActionBar.tsx |
| VideoCall | NEW | src/components/VideoCall.tsx |
| Kernel Page | MODIFY | src/app/video-call/page.tsx |
| Home Page | MODIFY | src/app/page.tsx |

## Dependencies
- ModuleProvider (exists)
- ModuleMenu (exists - use as basis for ModuleSelector)
- ModuleConfigPanel (exists)
- LiveKitVideoCall (exists)
- useAllModules, useActiveModule, useModuleConfig, useModuleProcess (exist)
