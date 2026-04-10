# K2 Specification: `/video-call` Page + Kernel Shell

## Overview
Create the kernel page (`/video-call`) as the single user-facing page for the WIZIDEE demo application. This is the ONLY page users interact with - all document processing happens here.

## Architecture
The kernel follows the Single-Page Stateless Video Workflow principle:
- `/video-call` is the ONLY user-facing page
- All state is React-only (no server-side session state)
- Page refresh resets all state (intentional)
- No navigation to other pages for document processing

## Components to Create/Modify

### 1. `src/app/video-call/page.tsx` (Kernel Page)
**Purpose**: Main entry point - the kernel page integrating all components
**Layout**:
- Header with room name input (pre-join state)
- Video call area (LiveKit integration)
- Module selector sidebar
- Config panel area
- Action bar with Capture + Process buttons
- Results display area
**Integration**:
- Wrapped in ModuleProvider
- Uses existing LiveKitVideoCall component
- Uses ModuleMenu, ModuleConfigPanel components

### 2. `src/components/VideoCall.tsx` (Wrapper Component)
**Purpose**: Re-export/wrapper for LiveKit video functionality
**Note**: May reuse existing LiveKitVideoCall.tsx or provide unified interface
**Requirements**:
- Handle room name state
- Provide snapshot capture capability
- Pass through to LiveKitVideoCall

### 3. `src/components/ModuleSelector.tsx`
**Purpose**: Display registered modules as selectable list
**Props**: None (uses hooks)
**Behavior**:
- Shows all registered modules from useAllModules
- Highlights active module
- Clicking sets active module
- Empty state when no modules

### 4. `src/components/ModuleConfigPanel.tsx`
**Purpose**: Render active module's ConfigComponent and processing UI
**Already exists**: Needs integration with kernel
**Behavior**:
- Shows placeholder when no module selected
- Renders ConfigComponent for active module
- File upload/select for snapshot
- Process button
- Result display

### 5. `src/components/ActionBar.tsx`
**Purpose**: Capture and Process action buttons
**Props**:
- `onCapture`: () => void - Capture snapshot from video
- `onProcess`: () => void - Trigger module processing
- `canProcess`: boolean - Whether processing is available
- `isProcessing`: boolean - Loading state
**Behavior**:
- Capture button triggers video frame capture
- Process button disabled when no module selected or no snapshot
- Shows loading state during processing

### 6. `src/app/page.tsx` (Redirect)
**Purpose**: Redirect `/` to `/video-call`
**Modification**: Replace landing page with redirect

## State Management
All state lives in React components:
- `roomName`: string - Current room name
- `hasJoined`: boolean - Whether user joined the call
- `snapshot`: Blob | null - Captured video frame
- `activeModuleId`: string | null - From ModuleContext
- `config`: T - Module-specific config from ModuleContext

## Module Integration Contract
1. User starts video call on `/video-call`
2. User clicks "Capture" -> kernel acquires snapshot from video stream
3. User selects a module -> module config UI renders
4. User clicks "Process" -> module calls WIZIDEE via `/api/wizidee/*`
5. Results render on same page, alongside snapshot

## Testing Requirements
- Unit tests for each new component
- Tests for redirect behavior
- Tests for integration between components
- CDP screenshot verification

## Acceptance Criteria
- [ ] `/video-call` renders with all components
- [ ] `/` redirects to `/video-call`
- [ ] Module selector shows registered modules
- [ ] Config panel renders active module's ConfigComponent
- [ ] Action bar provides Capture and Process buttons
- [ ] All existing tests pass
- [ ] TypeScript compiles without errors (for new files)
- [ ] CDP screenshot shows rendered page
