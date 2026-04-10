# Quick Start: WIZIDEE Proxy Client

## Installation

The client is part of the project codebase. Import directly from the hooks and lib modules.

## Usage

### Basic Client Usage

```typescript
import { WizideeClient } from '@/lib/wizidee';

const client = new WizideeClient({
  baseUrl: '/api/wizidee',
});

// Get token (handled automatically in most cases)
const token = await client.getToken();

// Recognize a document
const file = document.getElementById('file-input').files[0];
const recognition = await client.recognize(file);
console.log(recognition.dbId, recognition.radId);

// Analyze the document
const analysis = await client.analyze(recognition.dbId, recognition.radId, file);
console.log(analysis.fields);
```

### React Hook Usage (Recommended for Modules)

```typescript
import { useWizideeAPI } from '@/hooks/useWizideeAPI';

function MyModule() {
  const { client, isLoading, error, isReady } = useWizideeAPI();

  const handleProcess = async (file: File) => {
    if (!client) return;
    
    try {
      const result = await client.recognize(file);
      console.log('Document recognized:', result);
    } catch (err) {
      console.error('Processing failed:', err);
    }
  };

  if (!isReady) return <div>Initializing... ⏳</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <button onClick={() => handleProcess(file)} disabled={isLoading}>
      {isLoading ? 'Processing...' : 'Process Document'}
    </button>
  );
}
```

### Error Handling

```typescript
import { WizideeAPIError } from '@/lib/wizidee';

try {
  const result = await client.recognize(file);
} catch (error) {
  if (error instanceof WizideeAPIError) {
    switch (error.code) {
      case 'AUTH_ERROR':
        // Token refresh failed - re-authenticate
        break;
      case 'NETWORK_ERROR':
        // Check connection
        break;
      case 'API_ERROR':
        // WIZIDEE API returned error
        console.error('Status:', error.status);
        break;
    }
  }
}
```

### Token Refresh Behavior

Token refresh happens automatically:

1. Client detects expired token before API call
2. Single refresh request made (concurrent requests wait on same promise)
3. Original request retries with new token
4. If refresh fails, error propagates to caller

```typescript
// This will transparently refresh if needed
const result = await client.analyze(dbId, radId, file);
// Token was refreshed automatically if expired
```

## Testing

```typescript
// Mock the client in tests
jest.mock('@/lib/wizidee', () => ({
  WizideeClient: jest.fn().mockImplementation(() => ({
    recognize: jest.fn().mockResolvedValue({ dbId: 'test', radId: 'test' }),
    analyze: jest.fn().mockResolvedValue({ fields: {} }),
  })),
}));
```
