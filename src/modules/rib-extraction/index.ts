/**
 * RIB (Bank Account) Extraction Module
 *
 * WIZIDEE module for extracting banking details from RIB (Relevé d'Identité Bancaire)
 * documents. Extracts: IBAN, BIC, bank name, account holder.
 *
 * @module rib-extraction
 */

import { WizideeModule, registerModule } from '@/lib/modules';
import { RibConfig } from './types';
import { ConfigComponent } from './ConfigComponent';
import { ResultComponent } from './ResultComponent';
import { process } from './process';

export * from './types';
export { ConfigComponent } from './ConfigComponent';
export { ResultComponent } from './ResultComponent';
export { process } from './process';

/**
 * Default configuration for RIB document processing
 */
export const defaultConfig: RibConfig = {
  autoDetect: true,
};

/**
 * RIB Extraction module descriptor
 *
 * This module extracts banking information from French RIB documents
 * using the WIZIDEE recognize→analyze flow.
 */
export const ribExtractionModule: WizideeModule<RibConfig> = {
  id: 'rib-extraction',
  name: 'Bank Account (RIB)',
  description: 'Extract banking details from RIB documents: IBAN (masked), BIC, bank name, and account holder',
  icon: 'building-2',
  ConfigComponent,
  ResultComponent,
  process,
  defaultConfig,
};

/**
 * Convenience export for module registration
 * Usage: import { ribExtractionModule } from '@/modules/rib-extraction';
 *        registerModule(ribExtractionModule);
 */
export default ribExtractionModule;

/**
 * Auto-register the module when this file is imported.
 *
 * This ensures the module appears in the kernel's module selector
 * without requiring manual registration.
 */
registerModule(ribExtractionModule);
