/**
 * Identity CNI/Passport Module
 *
 * WIZIDEE module for extracting data from identity documents (CNI and Passport).
 * Extracts: nom, prénom, date de naissance, date d'expiration, MRZ
 *
 * @module identity-cni
 */

import { WizideeModule, registerModule } from '@/lib/modules';
import { IdentityConfig } from './types';
import { ConfigComponent } from './ConfigComponent';
import { ResultComponent } from './ResultComponent';
import { process } from './process';

export * from './types';
export { ConfigComponent } from './ConfigComponent';
export { ResultComponent } from './ResultComponent';
export { process } from './process';

/**
 * Default configuration for identity document processing
 */
export const defaultConfig: IdentityConfig = {
  documentType: 'cni',
  region: 'FR',
};

/**
 * Identity CNI/Passport module descriptor
 *
 * This module extracts identity information from French CNI and passports
 * using the WIZIDEE recognize→analyze flow.
 */
export const identityCniModule: WizideeModule<IdentityConfig> = {
  id: 'identity-cni',
  name: 'Identity Document (CNI/Passport)',
  description: 'Extract identity data from CNI or Passport: name, birth date, expiration date, and MRZ',
  icon: 'id-card',
  ConfigComponent,
  ResultComponent,
  process,
  defaultConfig,
};

/**
 * Convenience export for module registration
 * Usage: import { identityCniModule } from '@/modules/identity-cni';
 *        registerModule(identityCniModule);
 */
export default identityCniModule;

/**
 * Auto-register the module when this file is imported.
 *
 * This ensures the module appears in the kernel's module selector
 * without requiring manual registration.
 */
registerModule(identityCniModule);
