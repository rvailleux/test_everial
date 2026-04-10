/**
 * Proof of Address Module
 *
 * WIZIDEE module for extracting address data from utility bills, tax notices,
 * and telecom bills. Extracts: adresse complète, émetteur, date du document.
 *
 * @module proof-address
 */

import { WizideeModule, registerModule } from '@/lib/modules';
import { AddressConfig } from './types';
import { ConfigComponent } from './ConfigComponent';
import { ResultComponent } from './ResultComponent';
import { process } from './process';

export * from './types';
export { ConfigComponent } from './ConfigComponent';
export { ResultComponent } from './ResultComponent';
export { process } from './process';

/**
 * Default configuration for proof of address document processing
 */
export const defaultConfig: AddressConfig = {
  documentCategory: 'auto',
  includeRawResponse: false,
};

/**
 * Proof of Address module descriptor
 *
 * This module extracts address information from French utility bills,
 * tax notices (avis d'imposition), and telecom bills using the
 * WIZIDEE recognize→analyze flow.
 */
export const proofAddressModule: WizideeModule<AddressConfig> = {
  id: 'proof-address',
  name: 'Proof of Address',
  description: 'Extract address data from utility bills, tax notices, and telecom bills: full address, issuer, and document date',
  icon: 'home',
  ConfigComponent,
  ResultComponent,
  process,
  defaultConfig,
};

/**
 * Convenience export for module registration
 * Usage: import { proofAddressModule } from '@/modules/proof-address';
 *        registerModule(proofAddressModule);
 */
export default proofAddressModule;

/**
 * Auto-register the module when this file is imported.
 *
 * This ensures the module appears in the kernel's module selector
 * without requiring manual registration.
 */
registerModule(proofAddressModule);
