# Data Model: WIZIDEE Proxy Client

## Types and Interfaces

### WizideeClient

Main client class for WIZIDEE API interactions.

```typescript
class WizideeClient {
  private token: string | null;
  private tokenExpiry: number | null;
  private refreshPromise: Promise<string> | null;
  
  constructor(config: WizideeConfig);
  
  // Core API methods
  getToken(): Promise<TokenResponse>;
  recognize(file: Blob): Promise<RecognizeResponse>;
  analyze(dbId: string, radId: string, file: Blob): Promise<AnalyzeResponse>;
  consolidate(folderId: string): Promise<ConsolidateResponse>;
  
  // Token management (internal)
  private ensureToken(): Promise<string>;
  private refreshToken(): Promise<string>;
}
```

### Configuration Types

```typescript
interface WizideeConfig {
  baseUrl: string;      // /api/wizidee (Next.js proxy)
  timeout?: number;     // Request timeout in ms (default: 30000)
}

interface TokenState {
  token: string | null;
  expiresAt: number | null;  // Unix timestamp (ms)
  refreshPromise: Promise<string> | null;
}
```

### Request/Response Types

```typescript
// Token endpoint
interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

// Recognize endpoint
interface RecognizeResponse {
  dbId: string;         // Database ID for the document
  radId: string;        // Recognition/analysis document ID
  status: string;
}

// Analyze endpoint
interface AnalyzeResponse {
  dbId: string;
  radId: string;
  fields: Record<string, FieldValue>;
  status: string;
}

interface FieldValue {
  value: string;
  confidence: number;
  type: string;
}

// Consolidate endpoint
interface ConsolidateResponse {
  folderId: string;
  status: string;
  results: unknown;
}
```

### Error Types

```typescript
interface WizideeError {
  code: string;         // 'AUTH_ERROR' | 'NETWORK_ERROR' | 'API_ERROR' | 'TIMEOUT'
  message: string;
  status?: number;      // HTTP status code if applicable
  details?: unknown;    // Additional error context
}

class WizideeAPIError extends Error {
  code: string;
  status?: number;
  details?: unknown;
}
```

### Hook Types

```typescript
interface UseWizideeAPIResult {
  client: WizideeClient | null;
  isLoading: boolean;
  error: WizideeError | null;
  isReady: boolean;
}

interface UseWizideeAPIOptions {
  autoInitialize?: boolean;  // Initialize client on mount (default: true)
  onError?: (error: WizideeError) => void;
}
```

## State Transitions

### Token State Machine

```
[No Token] --getToken()--> [Valid Token]
     |                           |
     |                           |--API call with expired token
     v                           v
[Refreshing] <----refreshToken()---+
     |
     |--success
     v
[Valid Token]
     |
     |--failure
     v
[Error]
```

### Hook State Machine

```
[Uninitialized] --mount--> [Initializing]
                                 |
                                 |--client ready
                                 v
                           [Ready] ----API call----> [Loading]
                                 |                      |
                                 |                      |--success
                                 |                      v
                                 |<-----------------[Success]
                                 |
                                 |                      |--failure
                                 |<-----------------[Error]
```
