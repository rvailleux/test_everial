/**
 * [MODULE_NAME] Module
 *
 * [Brief description of what this module does]
 */

import { WizideeModule, registerModule } from '@/lib/modules';
import { ConfigComponent, MODULE_IDConfig } from './ConfigComponent';
import { ResultComponent } from './ResultComponent';
import { processDocument } from './process';

export interface MODULE_IDConfig {
  enabled: boolean;
  threshold: number;
  // Add your configuration fields here
}

export const MODULE_IDModule: WizideeModule<MODULE_IDConfig> = {
  id: 'MODULE_ID',
  name: '[Module Display Name]',
  description: '[Module description for users]',
  ConfigComponent,
  ResultComponent,
  defaultConfig: {
    enabled: true,
    threshold: 0.5,
  },
  process: processDocument,
};

// Auto-register when imported
registerModule(MODULE_IDModule);

export default MODULE_IDModule;
