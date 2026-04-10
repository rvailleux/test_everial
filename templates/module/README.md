# Module Template

This directory contains a boilerplate for creating new WIZIDEE document processing modules.

## Quick Start

### 1. Copy the Template

```bash
# Copy template files to your new module directory
cp -r templates/module src/modules/my-feature/

# Or use a more specific name for your use case
cp -r templates/module src/modules/identity-cni/
cp -r templates/module src/modules/rib-extraction/
```

### 2. Replace Placeholders

Update all files with your module's information:

| Placeholder | Replace With | Example |
|-------------|--------------|---------|
| `MODULE_ID` | Unique kebab-case ID | `identity-cni`, `rib-extraction` |
| `[MODULE_NAME]` | Display name | `"Identity CNI"`, `"RIB Extraction"` |
| `[Brief description]` | What the module does | `"Extracts identity data from French ID cards"` |

### 3. Customize Configuration

Edit `ConfigComponent.tsx` to define your module's options:

```typescript
export interface MyModuleConfig {
  enabled: boolean;
  confidenceThreshold: number;
  // Add your custom options
  documentSubtype: 'cni' | 'passport' | 'auto';
  extractPhoto: boolean;
}
```

### 4. Implement Processing Logic

Update `process.ts` to handle your document type:

```typescript
// Customize the data extraction logic
const analysis = await analyzeResponse.json();

return {
  success: true,
  data: {
    // Transform WIZIDEE response to your data structure
    firstName: analysis.firstName?.value,
    lastName: analysis.lastName?.value,
    documentNumber: analysis.documentNumber?.value,
  },
  raw: config.includeRawResponse ? analysis : undefined,
};
```

### 5. Style Result Display

Update `ResultComponent.tsx` to show your extracted data:

```typescript
// Replace the generic dl with your specific fields
<dl className="space-y-2">
  <div className="flex justify-between">
    <dt>First Name:</dt>
    <dd>{data.firstName}</dd>
  </div>
  <div className="flex justify-between">
    <dt>Last Name:</dt>
    <dd>{data.lastName}</dd>
  </div>
</dl>
```

### 6. Register the Module

Import the module in your app initialization (e.g., `src/app/layout.tsx` or `src/lib/modules/index.ts`):

```typescript
// This auto-registers the module via the registerModule() call in index.ts
import '@/modules/my-feature';
```

## Files Overview

| File | Purpose | Key Exports |
|------|---------|-------------|
| `index.ts` | Module descriptor | `MODULE_IDModule`, `MODULE_IDConfig` |
| `ConfigComponent.tsx` | Configuration UI | `ConfigComponent`, `MODULE_IDConfig` interface |
| `ResultComponent.tsx` | Results display | `ResultComponent`, `MODULE_IDData` interface |
| `process.ts` | Processing logic | `processDocument()` function |

## Module Interface

Every module must implement `WizideeModule<TConfig>`:

```typescript
interface WizideeModule<TConfig> {
  id: string;                    // Unique kebab-case identifier
  name: string;                  // Display name in UI
  description: string;           // Tooltip/subtitle text
  icon?: string;                 // Lucide icon name (optional)
  ConfigComponent: FC<ConfigProps<TConfig>>;  // Config UI
  ResultComponent: FC<ResultProps>;           // Results UI
  defaultConfig: TConfig;        // Default configuration values
  process: (snapshot: Blob, config: TConfig) => Promise<WizideeResult>;
}
```

## Configuration Interface

The config interface defines user-configurable options:

```typescript
export interface MODULE_IDConfig {
  enabled: boolean;              // Master toggle
  confidenceThreshold: number;   // Minimum confidence (0-1)
  documentType: string;          // Subtype filter
  includeRawResponse: boolean;   // Include API raw response
}
```

## Processing Function

The process function implements the WIZIDEE workflow:

```typescript
export async function processDocument(
  snapshot: Blob,
  config: MODULE_IDConfig
): Promise<WizideeResult> {
  // 1. Validate configuration
  if (!config.enabled) {
    return { success: false, error: 'Processing disabled' };
  }

  // 2. Call /recognize to identify document
  const recognition = await callRecognize(snapshot);

  // 3. Call /analyze to extract data
  const analysis = await callAnalyze(snapshot, recognition.dbId, recognition.radId);

  // 4. Return result
  return {
    success: true,
    data: transformData(analysis),
    raw: config.includeRawResponse ? { recognition, analysis } : undefined,
  };
}
```

## WIZIDEE API Flow

The standard processing flow uses two API calls:

```
┌─────────────────┐     POST /api/wizidee/recognize     ┌─────────────────┐
│   Blob/File     │ ──────────────────────────────────▶ │   WIZIDEE API   │
│   (snapshot)    │                                     │   /recognize    │
└─────────────────┘ ◀────────────────────────────────── └─────────────────┘
                                                          │
                                                          │ Returns:
                                                          │   dbId, radId
                                                          ▼
┌─────────────────┐     POST /api/wizidee/analyze       ┌─────────────────┐
│   Blob/File     │ ──────────────────────────────────▶ │   WIZIDEE API   │
│   (snapshot)    │   + dbId, radId                     │   /analyze      │
└─────────────────┘ ◀────────────────────────────────── └─────────────────┘
                                                          │
                                                          │ Returns:
                                                          │   extracted data
                                                          ▼
                                                  ┌─────────────────┐
                                                  │  WizideeResult  │
                                                  │  { success,     │
                                                  │    data, raw }  │
                                                  └─────────────────┘
```

## Error Handling

Always return a `WizideeResult` - never throw:

```typescript
// Good - returns structured error
try {
  // ... processing
} catch (error) {
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error',
  };
}

// Bad - throws unhandled exception
try {
  // ... processing
} catch (error) {
  throw error;  // ❌ Don't do this!
}
```

## Testing

Write tests following the existing patterns:

```typescript
// In tests/modules/my-feature.test.ts
import { myModule } from '@/modules/my-feature';
import { processDocument } from '@/modules/my-feature/process';

describe('My Feature Module', () => {
  describe('metadata', () => {
    it('should have correct id and name', () => {
      expect(myModule.id).toBe('my-feature');
      expect(myModule.name).toBe('My Feature');
    });

    it('should have valid default config', () => {
      expect(myModule.defaultConfig.enabled).toBe(true);
      expect(myModule.defaultConfig.confidenceThreshold).toBeGreaterThan(0);
    });
  });

  describe('processing', () => {
    it('should return error when disabled', async () => {
      const result = await processDocument(mockBlob, { enabled: false });
      expect(result.success).toBe(false);
      expect(result.error).toContain('disabled');
    });

    it('should process valid document', async () => {
      // Mock the fetch calls or use MSW
      const result = await processDocument(mockBlob, myModule.defaultConfig);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });
});
```

## Best Practices

1. **Keep config simple** - Only expose options users need to change
2. **Handle all errors** - Always return `WizideeResult`, never throw
3. **Include confidence** - Show confidence scores in results UI
4. **Support raw response** - Allow debugging via raw API response toggle
5. **Type everything** - Define interfaces for config and result data
6. **Document fields** - Add JSDoc comments to explain each config option
7. **Follow naming** - Use kebab-case for IDs, PascalCase for components
8. **Auto-register** - Call `registerModule()` in index.ts for discoverability

## Example: Identity CNI Module

Here's a complete example of an identity module:

```typescript
// src/modules/identity-cni/index.ts
import { WizideeModule, registerModule } from '@/lib/modules';
import { ConfigComponent, IdentityCNIConfig } from './ConfigComponent';
import { ResultComponent } from './ResultComponent';
import { processDocument } from './process';

export const identityCNIModule: WizideeModule<IdentityCNIConfig> = {
  id: 'identity-cni',
  name: 'Identity Document',
  description: 'Extract identity data from CNI, passports, and residence permits',
  icon: 'id-card',
  ConfigComponent,
  ResultComponent,
  defaultConfig: {
    enabled: true,
    confidenceThreshold: 0.7,
    documentType: '',  // auto-detect
    includeRawResponse: false,
    extractPhoto: true,
  },
  process: processDocument,
};

registerModule(identityCNIModule);
export default identityCNIModule;
```

## Troubleshooting

### Module not appearing in selector
- Ensure you've imported the module file somewhere in your app
- Check browser console for registration errors
- Verify `registerModule()` is called in your index.ts

### TypeScript errors
- Run `npx tsc --noEmit` to check for type errors
- Ensure config interface matches defaultConfig structure
- Check that imports use correct path aliases (`@/lib/modules`)

### Processing fails
- Check browser Network tab for API errors
- Verify snapshot Blob is valid (not empty)
- Ensure WIZIDEE credentials are configured in `.env.local`
