/**
 * [MODULE_NAME] Module
 *
 * [Brief description of what this module does - e.g., "Extracts identity
 * information from French National ID Cards (CNI) and passports"]
 *
 * @example
 * ```typescript
 * // Register the module by importing it
 * import '@/modules/MODULE_ID';
 *
 * // Or register manually
 * import { MODULE_IDModule } from '@/modules/MODULE_ID';
 * registerModule(MODULE_IDModule);
 * ```
 */

import { WizideeModule, registerModule } from '@/lib/modules';
import { ConfigComponent } from './ConfigComponent';
import type { MODULE_IDConfig } from './ConfigComponent';
import { ResultComponent } from './ResultComponent';
import { processDocument } from './process';

// Re-export types for consumers
export type { MODULE_IDConfig };

/**
 * Module descriptor implementing the WizideeModule interface.
 *
 * This object defines all metadata, UI components, and processing logic
 * required by the kernel to integrate this module into the video call page.
 *
 * Copy-paste this entire file and replace:
 * - MODULE_ID with your kebab-case module ID (e.g., 'identity-cni', 'rib-extraction')
 * - [MODULE_NAME] with your display name
 * - Update defaultConfig to match your ConfigComponent interface
 */
export const MODULE_IDModule: WizideeModule<MODULE_IDConfig> = {
  /** Unique identifier - used in URLs, storage keys, and module selection */
  id: 'MODULE_ID',

  /** Human-readable name displayed in the module selector */
  name: '[Module Display Name]',

  /** Brief description shown as tooltip/subtitle in the UI */
  description: '[Module description explaining what documents it processes]',

  /** Optional: Lucide icon name for visual identification (e.g., 'id-card', 'file-text') */
  icon: 'file-text',

  /** Configuration UI - rendered in the kernel's config panel when selected */
  ConfigComponent,

  /** Results display - rendered in the kernel's results area after processing */
  ResultComponent,

  /** Default configuration values - must match MODULE_IDConfig interface */
  defaultConfig: {
    enabled: true,
    confidenceThreshold: 0.5,
    documentType: '',
    includeRawResponse: false,
  },

  /** Processing function - implements the document analysis pipeline */
  process: processDocument,
};

/**
 * Auto-register the module when this file is imported.
 *
 * This ensures the module appears in the kernel's module selector
 * without requiring manual registration.
 *
 * IMPORTANT: Import this file somewhere in your app initialization:
 *   import '@/modules/MODULE_ID';
 *
 * Or disable auto-registration and register manually if you need
 * conditional module loading.
 */
registerModule(MODULE_IDModule);

// Default export for convenient imports
export default MODULE_IDModule;
