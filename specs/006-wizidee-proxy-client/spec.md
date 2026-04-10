# Feature Specification: WIZIDEE Proxy Client

**Feature Branch**: `006-wizidee-proxy-client`  
**Created**: 2026-04-09  
**Status**: Draft  
**Input**: User description: "Type-safe client for /api/wizidee/* routes. Handle token refresh transparently. Expose via hook useWizideeAPI() for modules."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Type-safe API Client (Priority: P1)

As a module developer, I want a type-safe client to interact with WIZIDEE backend routes so that I can make API calls with proper TypeScript typing and error handling.

**Why this priority**: This is the core capability that enables all WIZIDEE document processing features. Without a proper client, modules cannot communicate with the backend.

**Independent Test**: Can be fully tested by importing the client and making a test call to `/api/wizidee/token` endpoint. The client should return properly typed responses and handle HTTP errors gracefully.

**Acceptance Scenarios**:

1. **Given** a module needs to call a WIZIDEE endpoint, **When** it uses the typed client, **Then** it receives a properly typed response matching the expected interface.
2. **Given** an API call fails, **When** the error response is received, **Then** the client returns a structured error object with status code and message.
3. **Given** the client is configured, **When** making requests to different endpoints (/recognize, /analyze), **Then** all endpoints return correctly typed responses.

---

### User Story 2 - Transparent Token Refresh (Priority: P1)

As a module developer, I want token refresh to happen automatically so that I don't need to handle token expiration manually in every module.

**Why this priority**: Token management is critical for security and usability. Manual token handling in every module would create code duplication and potential security vulnerabilities.

**Independent Test**: Can be fully tested by simulating an expired token scenario and verifying the client automatically refreshes the token and retries the original request without module intervention.

**Acceptance Scenarios**:

1. **Given** an API token is expired, **When** a module makes an API call, **Then** the client automatically refreshes the token and completes the request.
2. **Given** multiple concurrent requests hit an expired token, **When** the refresh happens, **Then** only one refresh request is made (deduplication).
3. **Given** a token refresh fails, **When** the client attempts to recover, **Then** it propagates the authentication error to the caller with clear messaging.

---

### User Story 3 - React Hook Integration (Priority: P2)

As a React module developer, I want a useWizideeAPI() hook so that I can easily access the client within React components with proper state management.

**Why this priority**: This provides a convenient, idiomatic React interface for the client, making module development faster and ensuring consistent patterns across the codebase.

**Independent Test**: Can be fully tested by rendering a component that uses the hook and verifying it returns the client instance along with loading/error states.

**Acceptance Scenarios**:

1. **Given** a React component needs WIZIDEE API access, **When** it calls useWizideeAPI(), **Then** it receives a configured client instance.
2. **Given** the API is processing a request, **When** the hook is used, **Then** it provides an isLoading state that tracks request status.
3. **Given** an API error occurs, **When** the hook receives the error, **Then** it exposes the error state to the component for rendering.

---

### Edge Cases

- What happens when the WIZIDEE API is unreachable (network failure)?
- How does the system handle rate limiting from the WIZIDEE API?
- What happens when token refresh fails repeatedly?
- How does the client handle very large file uploads for document analysis?
- What happens when concurrent requests are made with an expired token?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The client MUST provide type-safe methods for all `/api/wizidee/*` endpoints (token, recognize, analyze, consolidate).
- **FR-002**: The client MUST handle JWT token acquisition and storage securely.
- **FR-003**: The client MUST automatically refresh expired tokens before making API calls.
- **FR-004**: The client MUST implement request deduplication during token refresh to prevent multiple concurrent refresh requests.
- **FR-005**: The client MUST expose a useWizideeAPI() React hook that provides access to the client with loading and error states.
- **FR-006**: The hook MUST handle component unmounting gracefully, canceling in-flight requests to prevent memory leaks.
- **FR-007**: The client MUST provide clear error messages for common failure scenarios (network errors, auth failures, API errors).
- **FR-008**: The client MUST support multipart/form-data uploads for document images.

### Key Entities *(include if feature involves data)*

- **WizideeClient**: The main client class with methods for each API endpoint, handles token management internally.
- **WizideeConfig**: Configuration object containing API URLs, credentials, and client options.
- **WizideeResponse**: Typed response wrapper containing data or error information.
- **TokenState**: Internal state tracking current token, expiration time, and refresh promise.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All API calls complete with properly typed responses within 500ms (excluding network latency).
- **SC-002**: Token refresh happens transparently without requiring any code changes in consuming modules.
- **SC-003**: 100% of API endpoints have corresponding TypeScript types exported for consumer use.
- **SC-004**: Concurrent requests with expired tokens result in exactly one token refresh operation.
- **SC-005**: All errors are captured and exposed with consistent error types that modules can handle programmatically.

## Assumptions

- WIZIDEE API credentials are stored server-side in environment variables and never exposed to the browser.
- The Next.js API routes already exist or will be created separately to proxy to WIZIDEE.
- Token lifetime from WIZIDEE auth endpoint is known and can be used for expiration calculations.
- Modules using the client are React components or hooks that follow standard React patterns.
- Network connectivity to the WIZIDEE API is generally available; offline mode is out of scope.
