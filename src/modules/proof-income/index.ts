/**
 * Proof of Income Module
 *
 * WIZIDEE module for extracting income data from pay slips (bulletins de salaire)
 * and tax notices (avis d'imposition). Extracts: revenus, employeur, periode.
 *
 * @module proof-income
 */

import { WizideeModule, registerModule } from '@/lib/modules';
import { IncomeConfig } from './types';
import { ConfigComponent } from './ConfigComponent';
import { ResultComponent } from './ResultComponent';
import { process } from './process';

export * from './types';
export { ConfigComponent } from './ConfigComponent';
export { ResultComponent } from './ResultComponent';
export { process } from './process';

/**
 * Default configuration for proof of income document processing
 */
export const defaultConfig: IncomeConfig = {
  documentType: 'auto',
  includeRawResponse: false,
};

/**
 * Proof of Income module descriptor
 *
 * This module extracts income information from French pay slips (bulletins de salaire)
 * and tax notices (avis d'imposition) using the WIZIDEE recognize→analyze flow.
 */
export const proofIncomeModule: WizideeModule<IncomeConfig> = {
  id: 'proof-income',
  name: 'Proof of Income',
  description: 'Extract income data from pay slips and tax notices: income amount, employer, and period',
  icon: 'banknote',
  ConfigComponent,
  ResultComponent,
  process,
  defaultConfig,
};

/**
 * Convenience export for module registration
 * Usage: import { proofIncomeModule } from '@/modules/proof-income';
 *        registerModule(proofIncomeModule);
 */
export default proofIncomeModule;

/**
 * Auto-register the module when this file is imported.
 *
 * This ensures the module appears in the kernel's module selector
 * without requiring manual registration.
 */
registerModule(proofIncomeModule);
