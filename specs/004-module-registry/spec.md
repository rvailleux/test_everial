# Feature Specification: Module Registry System

**Feature Branch**: `004-module-registry`  
**Created**: 2026-04-09  
**Status**: Draft  
**Input**: Create the kernel module registry system with registration, discovery, and dependency injection infrastructure

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Module Developer Registers a New Module (Priority: P1)

A developer creating a new WIZIDEE data extraction module needs to register it with the kernel so it appears in the application menu and can be selected by users.

**Why this priority**: Without module registration, no modules can exist in the system. This is the foundational infrastructure that enables all document processing features.

**Independent Test**: A developer can create a minimal test module, register it using the registry API, and see it appear in the kernel's module menu without any other kernel features being implemented.

**Acceptance Scenarios**:

1. **Given** a developer has created a module with required interface components, **When** they call `registerModule(moduleDescriptor)`, **Then** the module is stored in the registry and can be retrieved by ID.

2. **Given** multiple modules are registered, **When** the kernel requests the module list, **Then** all registered modules are returned with their metadata (id, name, description, icon).

3. **Given** a module is registered, **When** the kernel requests a specific module by ID, **Then** the complete module descriptor including ConfigComponent and ResultComponent is returned.

---

### User Story 2 — Kernel Accesses Module Configuration (Priority: P2)

The kernel needs to render a module's configuration UI and process user inputs before document capture.

**Why this priority**: Module configuration is required for most document processing workflows (selecting document type, region, etc.).

**Independent Test**: A module's ConfigComponent can be rendered with default configuration, and user changes propagate through the ModuleProvider context.

**Acceptance Scenarios**:

1. **Given** a module is selected from the menu, **When** the kernel renders the config area, **Then** the module's ConfigComponent is displayed with default configuration values.

2. **Given** a user modifies configuration options, **When** changes are made, **Then** the configuration state is updated and accessible via `useModuleConfig()` hook.

3. **Given** configuration state exists for a module, **When** the user clicks "Reset", **Then** configuration reverts to `defaultConfig` values.

---

### User Story 3 — Kernel Executes Module Processing (Priority: P2)

After capturing a document snapshot, the kernel triggers the module's processing logic and displays results.

**Why this priority**: This completes the core kernel-module interaction cycle and enables end-to-end document processing.

**Independent Test**: A module's `process()` function can be called with a Blob and configuration, returning results that can be rendered by the ResultComponent.

**Acceptance Scenarios**:

1. **Given** a snapshot is captured and a module is selected, **When** the user clicks "Process", **Then** the module's `process()` function is called with the snapshot and current configuration.

2. **Given** processing completes successfully, **When** results are returned, **Then** the module's ResultComponent renders the extracted data in both human-readable and JSON formats.

3. **Given** processing fails, **When** an error is returned, **Then** the error is displayed in the results area without crashing the application.

---

### Edge Cases

- What happens when two modules register with the same ID? (Last registration wins with console warning)
- What happens when a module is missing required fields? (Registration fails with descriptive error)
- What happens when the kernel requests a module that doesn't exist? (Returns null/undefined with error logged)
- What happens when a module's process() function throws? (Error is caught and returned as failed result)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a `registerModule()` function that accepts a complete `WizideeModule` descriptor
- **FR-002**: System MUST validate that registered modules have all required fields: `id`, `name`, `ConfigComponent`, `ResultComponent`, `process`, `defaultConfig`
- **FR-003**: System MUST prevent duplicate module IDs (warn and overwrite, or reject)
- **FR-004**: System MUST provide a `getModule(id)` function to retrieve a specific module by ID
- **FR-005**: System MUST provide a `getAllModules()` function to retrieve all registered modules
- **FR-006**: System MUST provide a React context (`ModuleProvider`) that makes module registry available throughout the component tree
- **FR-007**: System MUST provide a `useModule(id)` hook for accessing a specific module
- **FR-008**: System MUST provide a `useAllModules()` hook for accessing the list of all modules
- **FR-009**: System MUST provide a `useModuleConfig<T>()` hook for managing module configuration state
- **FR-010**: System MUST provide a `useActiveModule()` hook for tracking the currently selected module
- **FR-011**: System MUST provide a `setActiveModule(id)` function for changing the active module

### Key Entities

- **WizideeModule**: The interface that all modules must implement
  - `id`: Unique string identifier (kebab-case, e.g., 'identity-cni')
  - `name`: Display name shown in menu
  - `description`: Brief explanation of module purpose
  - `icon`: Optional icon identifier
  - `ConfigComponent`: React component for configuration UI
  - `ResultComponent`: React component for displaying results
  - `process`: Async function that handles document processing
  - `defaultConfig`: Object with default configuration values

- **ModuleRegistry**: The central registry that stores all modules
  - Internal storage: Map<string, WizideeModule>
  - Provides registration and retrieval methods

- **ModuleContext**: React context providing registry access
  - Contains: modules list, active module ID, config state management

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new module can be registered with the kernel in under 5 lines of code
- **SC-002**: Module registration time is under 10ms (synchronous, no I/O)
- **SC-003**: Module list retrieval (getAllModules) completes in under 1ms for up to 50 modules
- **SC-004**: Configuration state updates propagate to components within one React render cycle
- **SC-005**: 100% of registered modules have valid descriptors (enforced at registration time)
- **SC-006**: Hook API is type-safe with TypeScript generics for configuration types

## Assumptions

- Modules are registered at application initialization time (not dynamically loaded)
- Module configuration state is local to the component tree (not persisted across sessions)
- The kernel handles snapshot capture separately from module processing
- Error boundaries in React will catch component rendering errors, but the registry handles processing errors
