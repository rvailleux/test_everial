# Module Template

This directory contains a boilerplate for creating new WIZIDEE document processing modules.

## Quick Start

1. **Copy the template files** to your new module directory:
   ```bash
   cp -r templates/module src/modules/my-feature/
   ```

2. **Replace placeholders** in all files:
   - `[MODULE_NAME]` → Your module's display name (e.g., "Identity CNI")
   - `MODULE_ID` → Your module's unique ID (e.g., "identity-cni")
   - `[Brief description]` → One-line description of what the module does

3. **Customize the configuration interface** in `ConfigComponent.tsx`

4. **Implement your processing logic** in `process.ts`

5. **Style your result display** in `ResultComponent.tsx`

6. **Register your module** by importing it in your app initialization:
   ```typescript
   import '@/modules/my-feature';
   ```

## Files Overview

| File | Purpose |
|------|---------|
| `index.ts` | Module descriptor with metadata and registration |
| `ConfigComponent.tsx` | UI for configuring options before processing |
| `ResultComponent.tsx` | UI for displaying extraction results |
| `process.ts` | Core processing logic calling WIZIDEE APIs |

## Module Interface

Every module must implement `WizideeModule<TConfig>`:

```typescript
interface WizideeModule<TConfig> {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  description: string;           // User-facing description
  ConfigComponent: FC<ConfigProps<TConfig>>;
  ResultComponent: FC<ResultProps>;
  defaultConfig: TConfig;
  process: (snapshot: Blob, config: TConfig) => Promise<WizideeResult>;
}
```

## Testing

Write tests following the existing patterns:

```typescript
// In tests/modules/my-feature.test.ts
import { myModule } from '@/modules/my-feature';

describe('My Feature Module', () => {
  it('should have correct metadata', () => {
    expect(myModule.id).toBe('my-feature');
    expect(myModule.name).toBe('My Feature');
  });

  it('should process documents', async () => {
    const result = await myModule.process(mockBlob, myModule.defaultConfig);
    expect(result.success).toBe(true);
  });
});
```
